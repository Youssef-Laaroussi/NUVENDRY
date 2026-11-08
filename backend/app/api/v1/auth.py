import uuid
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models.entities import User, UserProfile, MerchantProfile, ReferralEvent, StoreCredit, AuditLog, Notification
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, UserProfileUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(req: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check existing user
    stmt = select(User).where(User.email == req.email)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
        
    user_id = str(uuid.uuid4())
    my_referral_code = f"NV-{uuid.uuid4().hex[:6].upper()}"
    
    new_user = User(
        id=user_id,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        role=req.role if req.role in ("learner", "instructor", "admin") else "learner",
        referral_code=my_referral_code
    )
    db.add(new_user)
    
    # Create profile
    profile = UserProfile(
        user_id=user_id,
        bio=f"Learner and builder on NUVENDRY.",
        skills_interested=[]
    )
    db.add(profile)
    
    # If instructor, create merchant profile
    if req.role == "instructor":
        merchant = MerchantProfile(
            user_id=user_id,
            business_name=f"{req.full_name}'s Academy",
            description="Verified AI & Engineering Educator on NUVENDRY.",
            paypal_receiver_email=req.email
        )
        db.add(merchant)
        
    # Initial store credit record
    store_credit = StoreCredit(
        user_id=user_id,
        balance_cents=0,
        currency="USD"
    )
    db.add(store_credit)
    
    # Process referral code if provided
    if req.referral_code:
        ref_stmt = select(User).where(User.referral_code == req.referral_code.strip())
        referrer = (await db.execute(ref_stmt)).scalar_one_or_none()
        if referrer and referrer.id != user_id:
            ref_event = ReferralEvent(
                referrer_id=referrer.id,
                referee_id=user_id,
                status="pending",
                reward_amount_cents=1000  # $10.00 credit upon first purchase
            )
            db.add(ref_event)
            
    # Audit log
    db.add(AuditLog(
        user_id=user_id,
        action="USER_REGISTERED",
        resource_type="User",
        resource_id=user_id,
        details={"role": new_user.role, "email": new_user.email}
    ))
    
    await db.commit()
    await db.refresh(new_user)
    
    access_token = create_access_token(
        subject=new_user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=new_user.id,
        role=new_user.role,
        full_name=new_user.full_name,
        email=new_user.email
    )

@router.post("/login", response_model=Token)
async def login_user(req: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email)
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )
        
    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        email=user.email
    )

from sqlalchemy.orm import selectinload

@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Refresh relations eagerly
    stmt = (
        select(User)
        .options(selectinload(User.profile), selectinload(User.merchant_profile))
        .where(User.id == user.id)
    )
    res = await db.execute(stmt)
    u = res.scalar_one()
    return u

@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out."}

@router.patch("/me", response_model=UserResponse)
async def update_me(
    req: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.profile), selectinload(User.merchant_profile))
        .where(User.id == user.id)
    )
    u = (await db.execute(stmt)).scalar_one()

    if req.full_name is not None and req.full_name.strip():
        u.full_name = req.full_name.strip()

    if not u.profile:
        u.profile = UserProfile(user_id=u.id, skills_interested=[])
        db.add(u.profile)

    if req.bio is not None:
        u.profile.bio = req.bio
    if req.phone is not None:
        u.profile.phone = req.phone
    if req.skills_interested is not None:
        u.profile.skills_interested = req.skills_interested

    if u.merchant_profile:
        if req.business_name is not None and req.business_name.strip():
            u.merchant_profile.business_name = req.business_name.strip()
        if req.merchant_description is not None:
            u.merchant_profile.description = req.merchant_description
        if req.paypal_receiver_email is not None and req.paypal_receiver_email.strip():
            u.merchant_profile.paypal_receiver_email = req.paypal_receiver_email.strip()

    db.add(AuditLog(
        user_id=u.id,
        action="USER_PROFILE_UPDATED",
        resource_type="User",
        resource_id=u.id,
        details={"full_name": u.full_name}
    ))
    await db.commit()

    refreshed = (await db.execute(stmt)).scalar_one()
    return refreshed

@router.get("/notifications")
async def list_my_notifications(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import desc
    stmt = (
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(desc(Notification.created_at))
        .limit(30)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "link": n.link,
            "is_read": n.is_read,
            "created_at": n.created_at,
        }
        for n in items
    ]

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user.id
    )
    notif = (await db.execute(stmt)).scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.is_read = True
    await db.commit()
    return {"id": notif.id, "is_read": True}

