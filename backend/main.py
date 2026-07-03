from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
import items  # Import your new items router
import admin
from database import engine
from auth import router as auth_router
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from database import SessionLocal
import models
from email_service import send_retention_warning_email
import os

models.Base.metadata.create_all(bind=engine)

# --- BACKGROUND SCHEDULER ---
def run_daily_cleanup():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        # CHANGE THIS LINE: Make sure to put your actual Render URL here!
        backend_url = os.getenv("BACKEND_URL", "https://your-actual-backend-url.onrender.com")
        
        # 1. SEND 5-DAY WARNINGS
        # Find items that expire in less than 2 days, where we haven't sent a warning yet
        two_days_from_now = now + timedelta(days=2)
        warning_items = db.query(models.Item).filter(
            models.Item.expires_at <= two_days_from_now,
            models.Item.warning_sent == False
        ).all()

        for item in warning_items:
            extend_link = f"{backend_url}/items/extend/{item.id}"
            send_retention_warning_email(item.owner_email, item.title, extend_link)
            item.warning_sent = True
        db.commit()

        # 2. DELETE EXPIRED ITEMS (Day 7+)
        # Find items where the expiration date has passed
        expired_items = db.query(models.Item).filter(models.Item.expires_at < now).all()
        for item in expired_items:
            # Delete associated notifications first to prevent foreign key errors
            db.query(models.Notification).filter(models.Notification.matched_item_id == item.id).delete()
            db.delete(item)
        
        db.commit()
        print(f"🧹 Cleanup Job Ran: Warned {len(warning_items)} users, Deleted {len(expired_items)} expired items.")
    finally:
        db.close()

# ----------------------------

app = FastAPI()

# Allows React Frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://localhost:5174", 
                   "https://findit-frontend-e350.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach the existing auth endpoints
app.include_router(auth_router)

# Attach the items endpoints you are building
app.include_router(items.router)
app.include_router(admin.router)

@app.get("/")
def home():
    return {
        "status": "online",
        "message": "FindIT Backend is Running!",
        "version": "2.0.0-FreshStart" 
    }

# --- START THE SCHEDULER (Only ONCE!) ---
scheduler = BackgroundScheduler()

# Force it to run instantly on boot, then start the 24-hour timer!
scheduler.add_job(
    run_daily_cleanup, 
    'interval', 
    hours=24,
    next_run_time=datetime.now()
) 
scheduler.start()