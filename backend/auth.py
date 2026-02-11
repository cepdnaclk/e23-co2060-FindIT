from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from schemas import EmailRequest, OTPVerifyRequest
import models
from database import get_db
import random
from utils import send_email


router = APIRouter()

# --- UTILITY FUNCTIONS ---
def generate_otp():
    return str(random.randint(100000, 999999))

# --- API ENDPOINTS ---
@router.post("/send-otp")
def send_otp_endpoint(
    request: EmailRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db) # <--- Opens DB Connection
):
      
    # 1. Generate Code
    otp = generate_otp()
    
    # 1. Search for the user in MySQL
    db_user = db.query(models.User).filter(models.User.email == request.email).first()
    
    if not db_user:
        # Create a new user record if they don't exist
        db_user = models.User(email=request.email, otp_code=otp)
        db.add(db_user)
    else:
        # Update OTP for existing user
        db_user.otp_code = otp
        
    db.commit() # Save changes to MySQL
    
    # 2. Queue the email to send in the background
    background_tasks.add_task(send_email, request.email, otp)
    
    return {"message": f"OTP is being sent to {request.email}"}

@router.post("/verify-otp")
def verify_otp_endpoint(
    request: OTPVerifyRequest, 
    db: Session = Depends(get_db) # <--- Opens DB Connection
):
    # 1. Find user in MySQL
    db_user = db.query(models.User).filter(models.User.email == request.email).first()
    
    # 2. Validation Checks
    if not db_user or not db_user.otp_code:
        raise HTTPException(status_code=400, detail="OTP not requested or expired")
    
    if db_user.otp_code != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # 3. Success! Mark as verified and destroy the OTP code for security
    db_user.is_verified = True
    db_user.otp_code = None 
    db.commit() # Save changes to MySQL
    
    return {"message": "Login Successful!", "token": "fake-jwt-token-123"}