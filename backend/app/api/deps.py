from typing import Optional, AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.entities import User

security_scheme = HTTPBearer(auto_error=False)

async def get_current_user_optional(
    token_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token_auth:
        return None
    token = token_auth.credentials
    user_id = decode_access_token(token)
    if not user_id:
        return None
    
    stmt = (
        select(User)
        .options(selectinload(User.profile), selectinload(User.merchant_profile))
        .where(User.id == user_id, User.is_active == True)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_instructor(
    user: User = Depends(get_current_user)
) -> User:
    if user.role not in ("instructor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructor or Admin access required"
        )
    return user

async def get_current_admin(
    user: User = Depends(get_current_user)
) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

