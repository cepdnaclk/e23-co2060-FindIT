import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, models, schemas
from matching import find_matches
from utils import send_email, ADMIN_EMAILS
from fastapi import status 
from security import decrypt_phone, encrypt_phone
from vision_service import analyze_item_image, generate_smart_keywords
from fastapi import APIRouter, BackgroundTasks
from email_service import send_match_notification_email 
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
from vision_service import get_or_create_analysis

router = APIRouter(prefix="/items", tags=["Items"])

@router.post("/analyze-found-item")
async def analyze_found_item(request: schemas.ImageAnalysisRequest):
    try:
        ai_suggestions = analyze_item_image(request.image_url)
        return ai_suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI Analysis failed.")

# 1. WE ADDED `background_tasks: BackgroundTasks` TO THE PARAMETERS HERE
@router.post("/", response_model=schemas.ItemResponse)
def create_item(
    item: schemas.ItemCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(database.get_db)
):
    print(f"DEBUG: Checking image_url: {item.image_url}", flush=True)
    if item.image_url:
        print("DEBUG: Entering AI Analysis block...", flush=True)
    

    # --- NEW: AI ANALYSIS AND CACHING LOGIC ---
    ai_data = {"title": item.title, "category": item.category, "description": item.description}
    
    if item.image_url:
        try:
            # This calls vision_service, which checks the DB cache first
            ai_data = get_or_create_analysis(item.image_url, db)
            
            # Auto-fill fields if the user left them empty
            if not item.title: item.title = ai_data.get("title", "Unknown Item")
            if not item.category: item.category = ai_data.get("category", "Other")
            if not item.description: item.description = ai_data.get("description", "")
        except Exception as e:
            print(f"AI Analysis skipped or failed: {e}")

    # Encrypt the contact number before saving to the database
    encrypted_contact = encrypt_phone(item.contact_number)

    # Generate the hidden smart tags using Gemini
    smart_tags = generate_smart_keywords(item.title, item.description, item.category,db)

    print(f"\n🧠 AI GENERATED TAGS FOR {item.title}: {smart_tags}\n")
    
    # 1. Create the database record
    new_item = models.Item(
        title=item.title,
        description=item.description,
        category=item.category,
        location=item.location,     
        item_type=item.item_type,
        date=item.date, 
        time=item.time,
        image_url=item.image_url,   
        secret_question=item.secret_question, 
        secret_answer=item.secret_answer,
        contact_number=encrypted_contact,
        owner_email=item.owner_email,
        search_keywords=smart_tags
    )
    
    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # 2. Call the Matching Engine
    match_results = find_matches(
        new_item_keywords=smart_tags,
        category=new_item.category,
        item_type=new_item.item_type,
        db_session=db
    )
    # This will use your local URL while testing, but gracefully fall back to the live URL in production!
    frontend_url = os.getenv("FRONTEND_URL", "https://findit-frontend-e350.onrender.com")    
    
    for match in match_results:
        matched_db_item = db.query(models.Item).filter(models.Item.id == match["id"]).first()
        if matched_db_item:
            
            # --- NOTIFY SUBMITTER ---
            if item.owner_email:
                # App Notification
                new_notif = models.Notification(
                    user_email=item.owner_email, 
                    message=f"A potential match was found for your {item.title}!",
                    matched_item_id=matched_db_item.id
                )
                db.add(new_notif)
                
                # Email Notification (Sent in Background)
                background_tasks.add_task(
                    send_match_notification_email,
                    receiver_email=item.owner_email,
                    item_name=item.title,
                    match_link=frontend_url # <-- Just the base URL!

                )
                
            # --- NOTIFY ORIGINAL ITEM OWNER ---
            if matched_db_item.owner_email:
                # App Notification
                other_notif = models.Notification(
                    user_email=matched_db_item.owner_email,
                    message=f"Someone just reported an item that matches your {matched_db_item.title}!",
                    matched_item_id=new_item.id
                )
                db.add(other_notif)
                
                # Email Notification (Sent in Background)
                background_tasks.add_task(
                    send_match_notification_email,
                    receiver_email=matched_db_item.owner_email,
                    item_name=matched_db_item.title,
                    match_link=frontend_url # <-- Just the base URL!
                )
            
            db.commit()

    # 3. Return the saved item and the potential matches
    return {
        "id": new_item.id,
        "title": new_item.title,
        "description": new_item.description,
        "category": new_item.category,
        "location": new_item.location,
        "item_type": new_item.item_type,
        "date": new_item.date,
        "time": new_item.time,
        "image_url": new_item.image_url,
        "secret_question": new_item.secret_question,
        "matches": match_results
    }

@router.post("/verify-claim")
def verify_claim(claim: schemas.ClaimRequest,background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    # 1. Fetch the item
    db_item = db.query(models.Item).filter(models.Item.id == claim.item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # 2. ADMIN LOCKOUT CHECK: See if this user is already locked out
    from sqlalchemy import or_
    alert = db.query(models.AdminAlert).filter(
        or_(
            models.AdminAlert.found_item_id == claim.item_id,
            models.AdminAlert.lost_item_id == claim.item_id
        ),
        models.AdminAlert.claimer_email == claim.user_email,
        models.AdminAlert.is_resolved == False
    ).first()

    if alert and alert.failed_attempts >= 2:
        raise HTTPException(status_code=403, detail="Account locked for this item. An admin has been notified.")

    # 3. VERIFY ANSWER
    if db_item.secret_answer.strip().lower() == claim.user_answer.strip().lower():
        # SUCCESS: Decrypt the phone number and return it
        decrypted_phone = decrypt_phone(db_item.contact_number)
        
        # Mark matching notification as read so it disappears from user's tray
        notif = db.query(models.Notification).filter(
            models.Notification.user_email == claim.user_email,
            models.Notification.matched_item_id == claim.item_id
        ).first()
        if notif:
            notif.is_read = True
            db.commit()
            
        return {
            "status": "success",
            "message": "Verification successful!",
            "phone_number": decrypted_phone 
        }
    else:
        if not alert:
            # First time failing: Resolve both lost and found item IDs
            item_a_type = (db_item.item_type or "").lower()
            resolved_item_id = None
            
            # Find matching item of opposite type owned by the claimant
            target_type = "Found" if item_a_type == "lost" else "Lost"
            opposite_items = db.query(models.Item).filter(
                models.Item.owner_email == claim.user_email,
                models.Item.item_type == target_type
            ).all()
            
            if opposite_items:
                notif = db.query(models.Notification).filter(
                    models.Notification.user_email == claim.user_email,
                    models.Notification.matched_item_id == claim.item_id
                ).first()
                if notif and notif.message:
                    for item in opposite_items:
                        if item.title and item.title in notif.message:
                            resolved_item_id = item.id
                            break
                if not resolved_item_id:
                    from thefuzz import fuzz
                    best_score = -1
                    for item in opposite_items:
                        keywords_a = item.search_keywords if item.search_keywords else item.title
                        keywords_b = db_item.search_keywords if db_item.search_keywords else db_item.title
                        score = fuzz.token_set_ratio(keywords_a, keywords_b)
                        if score > best_score:
                            best_score = score
                            resolved_item_id = item.id
            
            # Assign correctly based on types
            if item_a_type == "lost":
                lost_item_id = db_item.id
                found_item_id = resolved_item_id
            else:
                found_item_id = db_item.id
                lost_item_id = resolved_item_id
                
            alert = models.AdminAlert(
                found_item_id=found_item_id,
                lost_item_id=lost_item_id,
                claimer_email=claim.user_email,
                failed_attempts=1
            )
            db.add(alert)
        else:
            # Failed again
            alert.failed_attempts += 1
        
        db.commit()

        if alert.failed_attempts == 2:
            for admin_email in ADMIN_EMAILS:
                send_email(admin_email, f"User {claim.user_email} locked out on item #{claim.item_id}", "🚨 Security Alert")
            raise HTTPException(status_code=403, detail="Account locked. Admin notified.")

        raise HTTPException(status_code=403, detail=f"Incorrect. {2 - alert.failed_attempts} attempts left.")
    

@router.get("/notifications/{email}")
def get_notifications(email: str, db: Session = Depends(database.get_db)):
    # Fetch only UNREAD notifications for this specific user
    notifications = db.query(models.Notification).filter(
        models.Notification.user_email == email,
        models.Notification.is_read == False  # Only fetch unread
    ).all()
    
    result = []
    for notif in notifications:
        if notif.matched_item:
            raw_contact = notif.matched_item.contact_number
            msg = notif.message.lower() if notif.message else ""
            
            print(f"DEBUG: Processing Notif {notif.id}. Msg: {msg}", flush=True)
            print(f"DEBUG: Raw contact in DB: {raw_contact}", flush=True)

            if "admin override" in msg:
                display_phone = decrypt_phone(raw_contact)
                print(f"DEBUG: Result of decryption: {display_phone}", flush=True)
            else:
                display_phone = raw_contact
    
            # Package the data exactly how the React frontend expects it
            result.append({
                "id": notif.id,
                "message": notif.message,
                "item": {
                    "id": notif.matched_item.id,
                    "title": notif.matched_item.title,
                    "secret_question": notif.matched_item.secret_question,
                    "secret_answer": notif.matched_item.secret_answer,
                    "description": notif.matched_item.description,
                    "location": notif.matched_item.location,
                    "category": notif.matched_item.category,
                    "image_url": notif.matched_item.image_url,
                    "owner_email": notif.matched_item.owner_email,
                    "contact_number": display_phone
                }
            })
    return result


@router.patch("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(database.get_db)):
    """Mark a single notification as read so it no longer appears in the bell icon."""
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.get("/")
def get_all_items(db: Session = Depends(database.get_db)):
    """Fetch all reported items from the database."""
    items = db.query(models.Item).all()
    return items

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(database.get_db)):
    # 1. Find the item
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # 2. Delete any notifications linked to this item (prevents MySQL foreign key crash)
    db.query(models.Notification).filter(models.Notification.matched_item_id == item_id).delete()
    
    # 3. Delete the actual item
    db.delete(db_item)
    db.commit()
    
    return {"message": "Item deleted successfully!"}

@router.get("/extend/{item_id}")
def extend_item_retention(item_id: int, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    
    frontend_url = os.getenv("FRONTEND_URL", "https://findit-frontend-e350.onrender.com")

    if not db_item:
        # If they click the link after it was already deleted
        return RedirectResponse(url=f"{frontend_url}?message=expired")

    # Add 7 days from right now, and reset the warning flag!
    db_item.expires_at = datetime.utcnow() + timedelta(days=7)
    db_item.warning_sent = False
    db.commit()

    # Redirect them straight to the frontend dashboard
    return RedirectResponse(url=f"{frontend_url}?message=extended")
