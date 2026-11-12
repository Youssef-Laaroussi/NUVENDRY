import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, 
    Text, Numeric, JSON, Enum, UniqueConstraint, Index, LargeBinary
)
from sqlalchemy.orm import relationship, deferred
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# ----------------- USERS & PROFILES -----------------
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="learner")  # learner, instructor, admin
    is_active = Column(Boolean, default=True, nullable=False)
    referral_code = Column(String(50), unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    merchant_profile = relationship("MerchantProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    demands = relationship("LearningDemand", back_populates="user")
    reservations = relationship("Reservation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    store_credit = relationship("StoreCredit", back_populates="user", uselist=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    skills_interested = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    user = relationship("User", back_populates="profile")

class MerchantProfile(Base):
    __tablename__ = "merchant_profiles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    paypal_receiver_email = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)
    rating = Column(Numeric(3, 2), default=5.00, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    user = relationship("User", back_populates="merchant_profile")
    workshops = relationship("Workshop", back_populates="merchant")
    reward_campaigns = relationship("RewardCampaign", back_populates="merchant")

# ----------------- DEMAND & AI CLUSTERS -----------------
class LearningDemand(Base):
    __tablename__ = "learning_demands"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    raw_prompt = Column(Text, nullable=False)
    topic = Column(String(255), nullable=False, index=True)
    related_skills = Column(JSON, default=list)
    objective = Column(Text, nullable=True)
    preferred_difficulty = Column(String(50), default="intermediate")  # beginner, intermediate, advanced
    preferred_duration_hours = Column(Integer, default=2)
    language = Column(String(50), default="English")
    max_budget_cents = Column(Integer, default=5000)  # in integer minor units (e.g. $50.00 = 5000)
    currency = Column(String(10), default="USD")
    preferred_schedule = Column(String(100), default="Flexible")
    delivery_format = Column(String(50), default="live_interactive")
    confidence_score = Column(Numeric(4, 3), default=0.920)
    status = Column(String(50), default="pending", index=True)  # pending, clustered, offered
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    user = relationship("User", back_populates="demands")
    cluster_memberships = relationship("ClusterMembership", back_populates="demand")

class DemandCluster(Base):
    __tablename__ = "demand_clusters"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    member_count = Column(Integer, default=1)
    avg_budget_cents = Column(Integer, default=4500)
    currency = Column(String(10), default="USD")
    difficulty = Column(String(50), default="intermediate")
    status = Column(String(50), default="active")  # active, offer_generated, archived
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    memberships = relationship("ClusterMembership", back_populates="cluster")
    offer_proposals = relationship("OfferProposal", back_populates="cluster")

class ClusterMembership(Base):
    __tablename__ = "cluster_memberships"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    cluster_id = Column(String, ForeignKey("demand_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    demand_id = Column(String, ForeignKey("learning_demands.id", ondelete="CASCADE"), nullable=False, index=True)
    similarity_score = Column(Numeric(4, 3), default=0.880)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    cluster = relationship("DemandCluster", back_populates="memberships")
    demand = relationship("LearningDemand", back_populates="cluster_memberships")

# ----------------- OFFERS & WORKSHOPS -----------------
class OfferProposal(Base):
    __tablename__ = "offer_proposals"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    cluster_id = Column(String, ForeignKey("demand_clusters.id", ondelete="SET NULL"), nullable=True, index=True)
    merchant_id = Column(String, ForeignKey("merchant_profiles.id", ondelete="CASCADE"), nullable=True)
    suggested_title = Column(String(255), nullable=False)
    skills_covered = Column(JSON, default=list)
    learning_outcomes = Column(JSON, default=list)
    session_outline = Column(JSON, default=list)
    suggested_duration_hours = Column(Integer, default=2)
    suggested_level = Column(String(50), default="intermediate")
    suggested_price_cents = Column(Integer, default=3900)
    currency = Column(String(10), default="USD")
    evidence_summary = Column(Text, nullable=False)
    constraints_summary = Column(Text, nullable=True)
    status = Column(String(50), default="draft")  # draft, approved, rejected, published
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    cluster = relationship("DemandCluster", back_populates="offer_proposals")
    workshops = relationship("Workshop", back_populates="offer_proposal")

class Workshop(Base):
    __tablename__ = "workshops"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    merchant_id = Column(String, ForeignKey("merchant_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    offer_id = Column(String, ForeignKey("offer_proposals.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="AI Engineering", index=True)
    difficulty = Column(String(50), default="intermediate")
    duration_hours = Column(Integer, default=2)
    price_cents = Column(Integer, nullable=False)  # in integer minor units
    currency = Column(String(10), default="USD", nullable=False)
    total_seats = Column(Integer, nullable=False)
    remaining_seats = Column(Integer, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    is_published = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    merchant = relationship("MerchantProfile", back_populates="workshops")
    offer_proposal = relationship("OfferProposal", back_populates="workshops")
    reservations = relationship("Reservation", back_populates="workshop")
    holds = relationship("ReservationHold", back_populates="workshop")
    sessions = relationship("WorkshopSession", back_populates="workshop")

    details = relationship("WorkshopDetails", uselist=False, lazy="selectin", cascade="all, delete-orphan")

    @property
    def image_url(self):
        return f"/api/v1/workshops/{self.id}/image" if self.details and self.details.image_type else None

    @property
    def language(self):
        return self.details.language if self.details else None

    @property
    def delivery_format(self):
        return self.details.delivery_format if self.details else None


class WorkshopDetails(Base):
    __tablename__ = "workshop_details"

    workshop_id = Column(String, ForeignKey("workshops.id", ondelete="CASCADE"), primary_key=True)
    language = Column(String(50))
    delivery_format = Column(String(40))
    image_type = Column(String(20))
    image_bytes = deferred(Column(LargeBinary))


class WorkshopSession(Base):
    __tablename__ = "workshop_sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    workshop_id = Column(String, ForeignKey("workshops.id", ondelete="CASCADE"), nullable=False)
    session_date = Column(DateTime(timezone=True), nullable=False)
    meeting_url = Column(String(500), nullable=True)
    status = Column(String(50), default="scheduled")
    
    workshop = relationship("Workshop", back_populates="sessions")

# ----------------- RESERVATIONS & PAYMENTS -----------------
class ReservationHold(Base):
    __tablename__ = "reservation_holds"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    workshop_id = Column(String, ForeignKey("workshops.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), default="active")  # active, expired, consumed, released
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    workshop = relationship("Workshop", back_populates="holds")

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    workshop_id = Column(String, ForeignKey("workshops.id", ondelete="RESTRICT"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    final_amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    status = Column(String(50), default="pending_payment", index=True)  # pending_payment, confirmed, cancelled, refunded
    paypal_order_id = Column(String(255), unique=True, nullable=True, index=True)
    paypal_capture_id = Column(String(255), unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    
    workshop = relationship("Workshop", back_populates="reservations")
    user = relationship("User", back_populates="reservations")
    payment_orders = relationship("PaymentOrder", back_populates="reservation")
    reward_redemptions = relationship("RewardRedemption", back_populates="reservation")
    attendance = relationship("AttendanceRecord", back_populates="reservation", uselist=False)


class WorkshopReview(Base):
    __tablename__ = "workshop_reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    reservation_id = Column(String, ForeignKey("reservations.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    workshop_id = Column(String, ForeignKey("workshops.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class PaymentOrder(Base):
    __tablename__ = "payment_orders"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    reservation_id = Column(String, ForeignKey("reservations.id", ondelete="CASCADE"), nullable=False)
    paypal_order_id = Column(String(255), unique=True, nullable=False, index=True)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    status = Column(String(50), default="created")  # created, approved, captured, failed
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    reservation = relationship("Reservation", back_populates="payment_orders")
    captures = relationship("PaymentCapture", back_populates="payment_order")

class PaymentCapture(Base):
    __tablename__ = "payment_captures"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    payment_order_id = Column(String, ForeignKey("payment_orders.id", ondelete="CASCADE"), nullable=False)
    paypal_capture_id = Column(String(255), unique=True, nullable=False, index=True)
    capture_status = Column(String(50), default="COMPLETED")
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    payment_order = relationship("PaymentOrder", back_populates="captures")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String(255), unique=True, nullable=False, index=True)
    event_type = Column(String(255), nullable=False)
    resource_id = Column(String(255), nullable=True)
    payload = Column(JSON, nullable=False)
    status = Column(String(50), default="received")  # received, processed, ignored
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

# ----------------- 6 REWARD MECHANISMS -----------------
class RewardCampaign(Base):
    __tablename__ = "reward_campaigns"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    merchant_id = Column(String, ForeignKey("merchant_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    campaign_type = Column(String(50), nullable=False)  # welcome, early_bird, store_credit, digital_gift, referral, badge
    discount_amount_cents = Column(Integer, default=0)
    discount_percentage = Column(Integer, default=0)
    min_spend_cents = Column(Integer, default=0)
    total_budget_cents = Column(Integer, default=50000)
    remaining_budget_cents = Column(Integer, default=50000)
    max_per_user = Column(Integer, default=1)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    merchant = relationship("MerchantProfile", back_populates="reward_campaigns")
    redemptions = relationship("RewardRedemption", back_populates="campaign")

class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    campaign_id = Column(String, ForeignKey("reward_campaigns.id", ondelete="RESTRICT"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    reservation_id = Column(String, ForeignKey("reservations.id", ondelete="CASCADE"), nullable=False)
    amount_applied_cents = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    campaign = relationship("RewardCampaign", back_populates="redemptions")
    reservation = relationship("Reservation", back_populates="reward_redemptions")

class StoreCredit(Base):
    __tablename__ = "store_credits"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    balance_cents = Column(Integer, default=0, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    user = relationship("User", back_populates="store_credit")

class RewardLedger(Base):
    __tablename__ = "reward_ledger"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_type = Column(String(50), nullable=False)  # credit, debit
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class DigitalGift(Base):
    __tablename__ = "digital_gifts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    campaign_id = Column(String, ForeignKey("reward_campaigns.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    download_url = Column(String(500), nullable=True)
    access_code = Column(String(100), nullable=True)
    redeemed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class ReferralEvent(Base):
    __tablename__ = "referral_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    referrer_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    referee_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reservation_id = Column(String, ForeignKey("reservations.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="pending")  # pending, rewarded, invalid
    reward_amount_cents = Column(Integer, default=1000)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    reservation_id = Column(String, ForeignKey("reservations.id", ondelete="CASCADE"), unique=True, nullable=False)
    workshop_id = Column(String, ForeignKey("workshops.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    attended = Column(Boolean, default=False)
    marked_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    reservation = relationship("Reservation", back_populates="attendance")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    user = relationship("User", back_populates="notifications")

# ----------------- RESEARCH & AUDIT -----------------
class ResearchExperiment(Base):
    __tablename__ = "research_experiments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    experiment_name = Column(String(255), nullable=False)
    baseline_name = Column(String(255), nullable=False)
    dataset_size = Column(Integer, default=100)
    metric_purity = Column(Numeric(5, 4), default=0.0)
    metric_ari = Column(Numeric(5, 4), default=0.0)
    metric_constraint_violation_rate = Column(Numeric(5, 4), default=0.0)
    latency_ms = Column(Numeric(8, 2), default=0.0)
    status = Column(String(50), default="completed")
    details = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True, index=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class WorkspaceSettings(Base):
    __tablename__ = "workspace_settings"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    data = Column(JSON, nullable=False, default=dict)


class ReservationReschedule(Base):
    __tablename__ = "reservation_reschedules"

    reservation_id = Column(String, ForeignKey("reservations.id", ondelete="CASCADE"), primary_key=True)
    requested_session_id = Column(String, ForeignKey("workshop_sessions.id", ondelete="SET NULL"), nullable=True)
    approved_session_id = Column(String, ForeignKey("workshop_sessions.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class WorkshopBookmark(Base):
    __tablename__ = "workshop_bookmarks"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    workshop_id = Column(String, ForeignKey("workshops.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class AdvisorTurn(Base):
    __tablename__ = "advisor_turns"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(JSON, nullable=False)
    mode = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
