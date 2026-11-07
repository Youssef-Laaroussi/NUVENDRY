from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "learner"  # "learner" or "instructor"
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    full_name: str
    email: str

class TokenData(BaseModel):
    sub: Optional[str] = None

class UserProfileSchema(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    skills_interested: List[str] = []

class MerchantProfileSchema(BaseModel):
    business_name: str
    description: Optional[str] = None
    paypal_receiver_email: Optional[str] = None
    is_verified: bool = True
    rating: float = 5.0

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    referral_code: Optional[str] = None
    created_at: datetime
    profile: Optional[UserProfileSchema] = None
    merchant_profile: Optional[MerchantProfileSchema] = None

    class Config:
        from_attributes = True

