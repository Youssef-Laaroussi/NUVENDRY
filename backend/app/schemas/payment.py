from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class PayPalConfigResponse(BaseModel):
    client_id: str
    environment: str
    currency: str = "USD"

class PayPalOrderCreate(BaseModel):
    reservation_id: str

class PayPalOrderResponse(BaseModel):
    paypal_order_id: str
    status: str
    amount_cents: int
    currency: str
    approval_url: Optional[str] = None

class PayPalCaptureRequest(BaseModel):
    paypal_order_id: str

class PayPalCaptureResponse(BaseModel):
    reservation_id: str
    paypal_order_id: str
    paypal_capture_id: str
    status: str
    amount_cents: int
    currency: str
    confirmed_at: datetime

class WebhookVerificationResult(BaseModel):
    verified: bool
    event_type: str
    event_id: str

