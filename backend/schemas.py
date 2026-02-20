from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- Phase 1: Authentication Schemas ---
class EmailRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

# --- Phase 2: Item Schemas ---
class ItemCreate(BaseModel):
    title: str
    description: str
    category: str
    location: str
    item_type: str
    image_url: Optional[str] = None

# What the fuzzy engine (Member 2) sends back
class MatchResponse(BaseModel):
    id: int
    title: str          # Added: Users need to see what the match is called
    description: str
    location: str       # Added: Users need to know where it was found
    reported_by: str
    confidence: int

# The complete doorway for data to leave the API
class ItemResponse(BaseModel):
    id: int
    title: str          # Added to match Database/Frontend
    description: str
    category: str
    location: str       # Added to match Database/Frontend
    item_type: str
    image_url: Optional[str] = None # Added so frontend can show the image
    matches: List[MatchResponse] = []

    class Config:
        from_attributes = True