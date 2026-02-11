from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional

# This is what the user sends when they register
class UserCreate(BaseModel):
    email: EmailStr

    # Custom Validator: This is your "Constraint Implementation"
    @field_validator('email')
    @classmethod
    def university_email_only(cls, v: str):
        if not v.endswith('@eng.pdn.ac.lk'):
            raise ValueError('Registration restricted to @eng.pdn.ac.lk domains only')
        return v

# This is what the API sends back to the user (notice we can hide things here)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True