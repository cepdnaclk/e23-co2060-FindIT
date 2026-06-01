from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import database, models, schemas
from database import get_db
from utils import send_email
from security import decrypt_phone

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/items")
def get_all_reports(db: Session = Depends(get_db)):
    """Fetch all system reports for the admin dashboard."""
    return db.query(models.Item).order_by(models.Item.id.desc()).all()

@router.delete("/items/{item_id}")
def delete_report(item_id: int, db: Session = Depends(get_db)):
    """Admin override to delete any report."""
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
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
        
        results.append({
            "alert_id": alert.id,
            "found_item": found_item,
            "lost_item": lost_item,
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