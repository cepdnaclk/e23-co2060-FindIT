from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, models, schemas
from matching import find_matches
from fastapi import status 
from security import decrypt_phone, encrypt_phone

router = APIRouter(prefix="/items", tags=["Items"])

@router.post("/", response_model=schemas.ItemResponse)
def create_item(item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    # Encrypt the contact number before saving to the database
    encrypted_contact = encrypt_phone(item.contact_number)
    # 1. Create the database record
    new_item = models.Item(
        title=item.title,           # Added to match Frontend
        description=item.description,
        category=item.category,
        location=item.location,     # Added to match Frontend
        item_type=item.item_type,
        date=item.date, 
        time=item.time,
        image_url=item.image_url,   # The Firebase link we planned
        secret_question=item.secret_question, 
        secret_answer=item.secret_answer,
        contact_number=encrypted_contact,
        owner_email=item.owner_email
    )
    
    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # 2. Call Member 2's Matching Engine
    # This searches the DB for opposite types (e.g., if this is LOST, it looks for FOUND)
    match_results = find_matches(
        new_item_text=new_item.description,
        category=new_item.category,
        item_type=new_item.item_type,
        db_session=db
    )
    
    for match in match_results:
        matched_db_item = db.query(models.Item).filter(models.Item.id == match["id"]).first()
        if matched_db_item:
            # 1. Notify the person who is submitting right now
            new_notif = models.Notification(
                user_email=item.owner_email, 
                message=f"A potential match was found for your {item.title}!",
                matched_item_id=matched_db_item.id
            )
            db.add(new_notif)
            
            # 2. Notify the person who submitted the old matching item
            if matched_db_item.owner_email:
                other_notif = models.Notification(
                    user_email=matched_db_item.owner_email,
                    message=f"Someone just reported an item that matches your {matched_db_item.title}!",
                    matched_item_id=new_item.id
                )
                db.add(other_notif)
           
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
    # 1. Database Querying: Fetch the item by ID
    db_item = db.query(models.Item).filter(models.Item.id == claim.item_id).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # 2. The "Match" Logic: Simple string comparison
    if db_item.secret_answer.strip().lower() != claim.user_answer.strip().lower():
        # 3. Failure Route: 403 Forbidden
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Security answer is incorrect. Access denied."
        )

    # 4. Success Route: Integrate BE2 Decryption Logic
    # We decrypt the scrambled contact number stored in the database
    decrypted_phone = decrypt_phone(db_item.contact_number)
    
    return {
        "status": "success",
        "message": "Verification successful!",
        "phone_number": decrypted_phone  # Returning the decrypted, readable number
    }


@router.get("/notifications/{email}")
def get_notifications(email: str, db: Session = Depends(database.get_db)):
    # Fetch all unread notifications for this specific user
    notifications = db.query(models.Notification).filter(
        models.Notification.user_email == email,
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