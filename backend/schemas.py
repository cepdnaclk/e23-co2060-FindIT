from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- Phase 1: Authentication Schemas ---
# Added these to fix the ImportError in auth.py
class EmailRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

# --- Phase 2: Item Schemas (Infrastructure Builder Tasks) ---
# What the user sends to us when reporting an item
class ItemCreate(BaseModel):
    description: str
    category: str
    item_type: str # Must be "Lost" or "Found"

# What the fuzzy engine (Member 2) sends back to the user
class MatchResponse(BaseModel):
    id: int
    description: str
    reported_by: str
    confidence: int

# The complete doorway for data to enter and leave the API
class ItemResponse(BaseModel):
    id: int
    description: str
    category: str
    item_type: str
    matches: List[MatchResponse] = []

    class Config:
        from_attributes = True