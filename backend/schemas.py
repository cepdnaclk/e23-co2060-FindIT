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
    date: str          
    time: str          
    owner_email: str
    image_url: Optional[str] = None
    secret_question: str
    secret_answer: str
    contact_number: str
    owner_email: EmailStr


# What the fuzzy engine (Member 2) sends back
class MatchResponse(BaseModel):
    id: int
    title: str          # Added: Users need to see what the match is called
    description: str 
    location: str       
    date: str             # Added for accuracy
    time: str             # Added for accuracy
    secret_question: str  # Added so frontend can show the challenge
    reported_by: str
    confidence: int

# The complete doorway for data to leave the API
class ItemResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    item_type: Optional[str] = None
    date: Optional[str] = None      # Added for accuracy
    time: Optional[str] = None      # Added for accuracy
    image_url: Optional[str] = None
    secret_question: Optional[str] = None # Added for notification flow
    # matches should stay as a list, but we make the list itself optional
    matches: Optional[List[MatchResponse]] = []


    class Config:
        from_attributes = True

# --- Phase 3: Security Verification Schema) ---
class ClaimRequest(BaseModel):
    """Used when a user tries to answer a secret question to claim an item"""
    item_id: int
    user_answer: str