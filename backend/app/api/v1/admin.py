from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.entities import User, AuditLog
from app.schemas.auth import UserResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Administrator Workspace"])

@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.profile), selectinload(User.merchant_profile))
        .order_by(desc(User.created_at))
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/audit")
async def list_audit_logs(
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit)
    result = await db.execute(stmt)
    logs = result.scalars().all()
    
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at
        }
        for l in logs
    ]

