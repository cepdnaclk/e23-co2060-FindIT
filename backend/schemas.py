from pydantic import BaseModel, EmailStr, field_validator

class EmailRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    def validate_domain(cls, v):
        if not v.endswith("@eng.pdn.ac.lk"):
            raise ValueError("Access Denied: Must use an @eng.pdn.ac.lk email.")
        return v

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str