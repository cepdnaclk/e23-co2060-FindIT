from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

# Step 1: The user requests an OTP
class EmailRequest(BaseModel):
    email: EmailStr

    # University Email Validator
    @field_validator('email')
    @classmethod
    def university_email_only(cls, v: str):
        if not v.endswith('@eng.pdn.ac.lk'):
            raise ValueError('Registration restricted to @eng.pdn.ac.lk domains only')
        return v

# Step 2: The user submits the OTP
class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

# This is what the API sends back to the user 
class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True