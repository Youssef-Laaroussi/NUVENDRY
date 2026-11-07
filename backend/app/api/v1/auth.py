import uuid
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models.entities import User, UserProfile, MerchantProfile, ReferralEvent, StoreCredit, AuditLog
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
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
