from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import database, models, schemas
from database import get_db
from utils import send_email
from security import decrypt_phone

router = APIRouter(prefix="/admin", tags=["Admin"])

def serialize_item_with_decrypted_phone(item: models.Item) -> dict:
    if not item:
        return None
    item_dict = {c.name: getattr(item, c.name) for c in item.__table__.columns}
    if item_dict.get("contact_number"):
        try:
            item_dict["contact_number"] = decrypt_phone(item_dict["contact_number"])
        except Exception:
            pass
    return item_dict

@router.get("/items")
def get_all_reports(db: Session = Depends(get_db)):
    """Fetch all system reports for the admin dashboard."""
    items = db.query(models.Item).order_by(models.Item.id.desc()).all()
    return [serialize_item_with_decrypted_phone(item) for item in items]

@router.delete("/items/{item_id}")
def delete_report(item_id: int, db: Session = Depends(get_db)):
    """Admin override to delete any report."""
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Clean up dependent notifications and admin alerts to avoid foreign key constraint errors
    db.query(models.Notification).filter(models.Notification.matched_item_id == item_id).delete(synchronize_session=False)
    db.query(models.AdminAlert).filter(
        (models.AdminAlert.found_item_id == item_id) | (models.AdminAlert.lost_item_id == item_id)
    ).delete(synchronize_session=False)

    db.delete(item)
    db.commit()
    return {"message": "Report permanently deleted"}


@router.get("/alerts")
def get_active_alerts(db: Session = Depends(get_db)):
    """Fetch all locked items requiring admin review."""
    alerts = db.query(models.AdminAlert).filter(models.AdminAlert.is_resolved == False).all()
    
    results = []
    for alert in alerts:
        # Fetch both full item objects
        found_item = db.query(models.Item).filter(models.Item.id == alert.found_item_id).first()
        lost_item = db.query(models.Item).filter(models.Item.id == alert.lost_item_id).first()
        
        # DYNAMIC FALLBACK: If lost_item_id is not set, resolve it on-the-fly!
        if not lost_item and alert.claimer_email and found_item:
            lost_items = db.query(models.Item).filter(
                models.Item.owner_email == alert.claimer_email,
                models.Item.item_type == "Lost"
            ).all()
            if lost_items:
                # 1. Match via Notification message
                notif = db.query(models.Notification).filter(
                    models.Notification.user_email == alert.claimer_email,
                    models.Notification.matched_item_id == alert.found_item_id
                ).first()
                if notif and notif.message:
                    for item in lost_items:
                        if item.title and item.title in notif.message:
                            lost_item = item
                            break
                
                # 2. Fallback to fuzzy matching
                if not lost_item:
                    from thefuzz import fuzz
                    best_score = -1
                    for item in lost_items:
                        keywords_a = item.search_keywords if item.search_keywords else item.title
                        keywords_b = found_item.search_keywords if found_item.search_keywords else found_item.title
                        score = fuzz.token_set_ratio(keywords_a, keywords_b)
                        if score > best_score:
                            best_score = score
                            lost_item = item
                
                # Persist the resolved link to the database
                if lost_item:
                    alert.lost_item_id = lost_item.id
                    db.commit()
        
        results.append({
            "alert_id": alert.id,
            "found_item": serialize_item_with_decrypted_phone(found_item),
            "lost_item": serialize_item_with_decrypted_phone(lost_item),
            "claimer_email": alert.claimer_email
        })
    return results

@router.post("/force-match")
def force_match(request: schemas.ForceMatchRequest, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    # 1. Resolve the alert
    alert = db.query(models.AdminAlert).filter(
        models.AdminAlert.found_item_id == request.found_item_id,
        models.AdminAlert.claimer_email == request.claimer_email
    ).first()
    
    if alert:
        alert.is_resolved = True
        db.commit()

    # 2. Fetch the item to get the phone number
    found_item = db.query(models.Item).filter(models.Item.id == request.found_item_id).first()

    # 3. Send Notification to User
    message = f"Admin Override: Your claim for '{found_item.title}' was approved. Click to view details."
    
    # Create a notification object so it appears in their bell icon
    new_notif = models.Notification(
        user_email=request.claimer_email,
        message=message,
        matched_item_id=found_item.id
    )
    db.add(new_notif)
    db.commit()

    # 4. Trigger Email
    background_tasks.add_task(send_email, request.claimer_email, message, "Claim Approved by Admin")
    
    return {"status": "success", "message": "Override applied and user notified."}

@router.post("/match-reports")
def match_reports(request: schemas.ManualMatchRequest, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    """Admin manual override to match a lost item with a found item and notify both reporters."""
    lost_item = db.query(models.Item).filter(models.Item.id == request.lost_item_id).first()
    found_item = db.query(models.Item).filter(models.Item.id == request.found_item_id).first()

    if not lost_item or not found_item:
        raise HTTPException(status_code=404, detail="One or both items were not found")

    import os
    from email_service import send_match_notification_email
    frontend_url = os.getenv("FRONTEND_URL", "https://findit-frontend-e350.onrender.com")

    # 1. Notify Lost Item Owner
    if lost_item.owner_email:
        notif_lost = models.Notification(
            user_email=lost_item.owner_email,
            message=f"Admin match: A potential match was paired with your lost item '{lost_item.title}'!",
            matched_item_id=found_item.id
        )
        db.add(notif_lost)
        background_tasks.add_task(
            send_match_notification_email,
            receiver_email=lost_item.owner_email,
            item_name=lost_item.title,
            match_link=frontend_url
        )

    # 2. Notify Found Item Owner
    if found_item.owner_email:
        notif_found = models.Notification(
            user_email=found_item.owner_email,
            message=f"Admin match: Someone's lost item '{lost_item.title}' was matched with your found report!",
            matched_item_id=lost_item.id
        )
        db.add(notif_found)
        background_tasks.add_task(
            send_match_notification_email,
            receiver_email=found_item.owner_email,
            item_name=found_item.title,
            match_link=frontend_url
        )

    db.commit()
    return {"status": "success", "message": "Manual match created and both reporters notified."}