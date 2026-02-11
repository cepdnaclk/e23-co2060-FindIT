# auth.py
from fastapi import APIRouter, HTTPException
from schemas import EmailRequest, OTPVerifyRequest
import temp_db  # Using fake DB for now
import random

# --- IMPORT THE REAL EMAIL FUNCTION ---
from utils import send_email 

router = APIRouter()

# --- UTILITY FUNCTIONS ---
def generate_otp():
    return str(random.randint(100000, 999999))

# --- API ENDPOINTS ---

@router.post("/send-otp")
def send_otp_endpoint(request: EmailRequest):
    # 1. Generate Code
    otp = generate_otp()
    
    # 2. Save to Fake DB
    temp_db.save_otp(request.email, otp)
    
    # 3. SEND REAL EMAIL
    # We call the function from utils.py. It returns True if successful.
    email_status = send_email(request.email, otp)
    
    if not email_status:
        # If sending fails (e.g., wrong password), tell the frontend
        raise HTTPException(status_code=500, detail="Failed to send email. Check server logs.")
    
    return {"message": f"OTP sent successfully to {request.email}"}

@router.post("/verify-otp")
def verify_otp_endpoint(request: OTPVerifyRequest):
    # 1. Get stored OTP
    stored_otp = temp_db.get_otp(request.email)
    
    # 2. Check if it matches
    if not stored_otp:
        raise HTTPException(status_code=400, detail="OTP not sent or expired")
    
    if stored_otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # 3. Success! Register user in Fake DB
    temp_db.save_user(request.email)
    
    return {"message": "Login Successful!", "token": "fake-jwt-token-123"}