from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, models, schemas
from matching import find_matches # Importing Member 2's logic

router = APIRouter(prefix="/items", tags=["Items"])

@router.post("/", response_model=schemas.ItemResponse)
def create_item(item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    # 1. Create the database record
    new_item = models.Item(
        description=item.description,
        category=item.category,
        item_type=item.item_type,
        owner_email="student@eng.pdn.ac.lk" # Temporary placeholder until Auth integration
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
        "description": new_item.description,
        "category": new_item.category,
        "item_type": new_item.item_type,
        "matches": match_results
    }