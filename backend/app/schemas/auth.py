from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str
    role: Literal["learner", "instructor"] = "learner"  # "learner" or "instructor"
    referral_code: Optional[str] = None

    @field_validator('password')
    @classmethod
    def password_bytes(cls, value):
        if len(value.encode('utf-8')) > 72:
            raise ValueError('Password must be at most 72 UTF-8 bytes.')
        return value

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

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    skills_interested: Optional[List[str]] = None
    business_name: Optional[str] = None
    merchant_description: Optional[str] = None
    paypal_receiver_email: Optional[str] = None



class LearnerPreferencesUpdate(BaseModel):
    format: Literal["Live & Self-paced", "Live", "Self-paced"] | None = None
    level: Literal["Beginner", "Intermediate", "Advanced"] | None = None
    time: Literal["1 – 3 hours", "4 – 6 hours", "7+ hours"] | None = None
    interests: list[str] | None = Field(default=None, max_length=30)


class LearnerSettingsUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    location: str | None = Field(default=None, max_length=160)
    photo: str | None = Field(default=None, max_length=256_000)
    preferences: LearnerPreferencesUpdate | None = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value):
        if value is not None:
            value = value.strip()
            if not value:
                raise ValueError("Full name is required.")
        return value

    @field_validator("photo")
    @classmethod
    def validate_photo(cls, value):
        import base64
        import binascii

        if value:
            prefix = "data:image/jpeg;base64,"
            if not value.startswith(prefix):
                raise ValueError("Profile photo must be a JPEG data URL.")
            try:
                image = base64.b64decode(value[len(prefix):], validate=True)
            except binascii.Error as exc:
                raise ValueError("Invalid profile photo encoding.") from exc
            if not image.startswith(b"\xff\xd8\xff") or not image.endswith(b"\xff\xd9"):
                raise ValueError("Invalid JPEG profile photo.")
        return value

class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=72)
    new_password: str = Field(min_length=8, max_length=72)

    @field_validator("current_password", "new_password")
    @classmethod
    def validate_password_bytes(cls, value):
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes.")
        return value
