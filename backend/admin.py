from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from utils import send_email

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
    return db.query(models.AdminAlert).filter(models.AdminAlert.is_resolved == False).all()

@router.post("/force-match")
def force_approve_match(request: schemas.ForceMatchRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Admin overrides the security question and connects the users."""
    
    found_item = db.query(models.Item).filter(models.Item.id == request.found_item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # 1. Resolve the alert
    alert = db.query(models.AdminAlert).filter(
        models.AdminAlert.found_item_id == request.found_item_id,
        models.AdminAlert.claimer_email == request.claimer_email
    ).first()
    
    if alert:
        alert.is_resolved = True

    # 2. Create the success notification for the claimer (containing the phone number)
    new_message = f"ADMIN OVERRIDE: Your claim for '{found_item.title}' was approved! Contact the founder at {found_item.contact_number}."
    
    notification = models.Notification(
        user_email=request.claimer_email,
        matched_item_id=found_item.id,
        message=new_message,
        is_read=False
    )
    db.add(notification)

    # 3. Queue the Email Notification
    # Note: This requires your send_email function in utils.py to handle body text
    email_body = f"Admin has approved your claim for '{found_item.title}'. You can now view the founder's contact details in the app."
    background_tasks.add_task(send_email, request.claimer_email, email_body)

    # 4. Final Commit
    db.commit()

    return {"message": "Match successfully forced. Users notified via App and Email."}