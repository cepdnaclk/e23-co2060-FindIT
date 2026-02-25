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
        "secret_question": new_item.secret_question, # Added
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