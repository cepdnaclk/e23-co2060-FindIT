import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, models, schemas
from matching import find_matches
from fastapi import status 
from security import decrypt_phone, encrypt_phone
from vision_service import analyze_item_image, generate_smart_keywords
from fastapi import APIRouter, BackgroundTasks
from email_service import send_match_notification_email # Import your new function

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
    # Encrypt the contact number before saving to the database
    encrypted_contact = encrypt_phone(item.contact_number)

    # Generate the hidden smart tags using Gemini
    smart_tags = generate_smart_keywords(item.title, item.description, item.category)

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
    frontend_url = os.getenv("FRONTEND_URL", "https://findit-pdn.vercel.app")
    
    
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
                    match_link=f"{frontend_url}/dashboard/matches/{matched_db_item.id}"
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
                    match_link=f"{frontend_url}/dashboard/matches/{new_item.id}"
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
def verify_claim(claim: schemas.ClaimRequest, db: Session = Depends(database.get_db)):
    # 1. Fetch the item
    db_item = db.query(models.Item).filter(models.Item.id == claim.item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # 2. ADMIN LOCKOUT CHECK: See if this user is already locked out
    alert = db.query(models.AdminAlert).filter(
        models.AdminAlert.found_item_id == claim.item_id,
        models.AdminAlert.claimer_email == claim.user_email 
    ).first()

    if alert and alert.failed_attempts >= 2 and not alert.is_resolved:
        raise HTTPException(status_code=403, detail="Account locked for this item. An admin has been notified.")

    # 3. VERIFY ANSWER
    if db_item.secret_answer.strip().lower() == claim.user_answer.strip().lower():
        # SUCCESS: Decrypt the phone number and return it
        decrypted_phone = decrypt_phone(db_item.contact_number)
        return {
            "status": "success",
            "message": "Verification successful!",
            "phone_number": decrypted_phone 
        }
    else:
        # FAILED: Increment the tracker
        if not alert:
            # First time failing
            alert = models.AdminAlert(found_item_id=claim.item_id, claimer_email=claim.user_email, failed_attempts=1)
            db.add(alert)
        else:
            # Failed again
            alert.failed_attempts += 1
        
        db.commit()

        # Check if this failure just locked them out
        if alert.failed_attempts >= 2:
            raise HTTPException(status_code=403, detail="Maximum attempts reached. Account locked for this item. An admin has been notified.")

        # Otherwise, tell them they failed but have tries left
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Security answer is incorrect. You have {2 - alert.failed_attempts} attempt(s) left."
        )


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
                    "contact_number": notif.matched_item.contact_number
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

