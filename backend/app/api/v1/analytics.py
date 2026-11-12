from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.entities import (
    LearningDemand, DemandCluster, Workshop, 
    Reservation, RewardRedemption, PaymentCapture, PaymentOrder, User
)
from app.schemas.analytics import AnalyticsOverview, DemandTrendItem, PaymentTransactionItem
from app.api.deps import get_current_instructor

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])

@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(user: User = Depends(get_current_instructor), db: AsyncSession = Depends(get_db)):
    """
    Authoritative metrics derived strictly from persisted PostgreSQL records.
    Never presents fabricated or hardcoded metrics.
    """
    demands_count = (await db.execute(select(func.count(LearningDemand.id)))).scalar() or 0
    clusters_count = (await db.execute(select(func.count(DemandCluster.id)))).scalar() or 0
    
    scope = select(Workshop.id)
    if user.role != "admin":
        scope = scope.where(Workshop.merchant_id == (user.merchant_profile.id if user.merchant_profile else ""))
    workshops_count = (await db.execute(select(func.count(Workshop.id)).where(Workshop.id.in_(scope), Workshop.is_published == True))).scalar() or 0
    total_res = (await db.execute(select(func.count(Reservation.id)).where(Reservation.workshop_id.in_(scope)))).scalar() or 0
    confirmed_res = (await db.execute(select(func.count(Reservation.id)).where(Reservation.workshop_id.in_(scope), Reservation.status == "confirmed"))).scalar() or 0
    total_rev = (await db.execute(select(func.sum(Reservation.final_amount_cents)).where(Reservation.workshop_id.in_(scope), Reservation.status == "confirmed"))).scalar() or 0
    total_rewards = (await db.execute(select(func.sum(RewardRedemption.amount_applied_cents)).where(
        RewardRedemption.reservation_id.in_(select(Reservation.id).where(Reservation.workshop_id.in_(scope)))))).scalar() or 0

    conv_rate = (confirmed_res / total_res * 100.0) if total_res > 0 else 0.0
    
    return AnalyticsOverview(
        total_demands=demands_count,
        active_clusters=clusters_count,
        published_workshops=workshops_count,
        total_reservations=total_res,
        confirmed_reservations=confirmed_res,
        total_revenue_cents=total_rev,
        total_rewards_redeemed_cents=total_rewards,
        conversion_rate_percentage=round(conv_rate, 1)
    )

@router.get("/demands", response_model=List[DemandTrendItem])
async def get_demand_trends(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(
            LearningDemand.topic,
            func.count(LearningDemand.id).label("count"),
            func.avg(LearningDemand.max_budget_cents).label("avg_budget")
        )
        .group_by(LearningDemand.topic)
        .order_by(desc("count"))
    )
    res = await db.execute(stmt)
    rows = res.all()
    
    return [
        DemandTrendItem(
            topic=r[0],
            count=r[1],
            avg_budget_cents=int(r[2] or 0)
        )
        for r in rows
    ]

def capture_time(capture: PaymentCapture | None) -> datetime | None:
    if capture is None:
        return None
    for unit in (capture.raw_response or {}).get("purchase_units", []):
        for item in unit.get("payments", {}).get("captures", []):
            if item.get("id") == capture.paypal_capture_id and isinstance(item.get("create_time"), str):
                try:
                    timestamp = datetime.fromisoformat(item["create_time"])
                    if timestamp.tzinfo is not None:
                        return timestamp
                except ValueError:
                    pass
    return capture.created_at


@router.get("/payments", response_model=List[PaymentTransactionItem])
async def list_payment_transactions(
    user: User = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
    include_uncaptured: bool = False
):
    """
    Returns verified PayPal Sandbox transactions with local order ID,
    PayPal Order ID, Capture ID, amount, and status.
    """
    stmt = (
        select(Reservation, PaymentCapture, PaymentOrder.status)
        .outerjoin(PaymentOrder, Reservation.paypal_order_id == PaymentOrder.paypal_order_id)
        .outerjoin(PaymentCapture, Reservation.paypal_capture_id == PaymentCapture.paypal_capture_id)
        .options(selectinload(Reservation.user), selectinload(Reservation.workshop))
        .order_by(desc(func.coalesce(Reservation.confirmed_at, Reservation.created_at)))
    )
    if include_uncaptured:
        stmt = stmt.where(Reservation.paypal_order_id.is_not(None) | Reservation.paypal_capture_id.is_not(None))
    else:
        stmt = stmt.where(Reservation.paypal_capture_id.is_not(None))
    if user.role != "admin":
        stmt = stmt.join(Workshop, Reservation.workshop_id == Workshop.id).where(
            Workshop.merchant_id == (user.merchant_profile.id if user.merchant_profile else ""))
    result = await db.execute(stmt)
    reservations = result.all()
    
    return [
        PaymentTransactionItem(
            id=r.id,
            paypal_order_id=r.paypal_order_id,
            paypal_capture_id=r.paypal_capture_id,
            buyer_name=r.user.full_name,
            workshop_id=r.workshop_id,
            workshop_title=r.workshop.title if r.workshop else "NUVENDRY Session",
            amount_cents=r.final_amount_cents,
            currency=r.currency,
            status=order_status if include_uncaptured and not r.paypal_capture_id and order_status == "failed" else r.status,
            created_at=capture_time(capture) or r.confirmed_at or (r.created_at if include_uncaptured else None)
        )
        for r, capture, order_status in reservations
    ]

