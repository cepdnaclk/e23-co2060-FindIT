from thefuzz import fuzz
import models

def find_matches(new_item_title: str, new_item_desc: str, category: str, item_type: str, db_session):
    # 1. Flip the target: If I lost something, show me what people found
    target_type = "Found" if item_type == "Lost" else "Lost"
    
    # 2. Query only matching categories and opposite types
    query_results = db_session.query(models.Item).filter(
        models.Item.category == category,
        models.Item.item_type == target_type
    ).all()
    
    potential_matches = []

    for db_item in query_results:
        # Safety check for exact category match (STAGE 1)
        if db_item.category != category:
            continue

        # Higher threshold (70+) ensures Laptop != Earphone
        title_score = fuzz.token_sort_ratio(new_item_title.lower(), db_item.title.lower())
        
        if title_score < 70:
            continue # If the titles don't represent the same object, skip

        # STAGE 3: Check the Description (The Detail Gate)
        # Now we only look for details like color, brand, or stickers
        desc_score = fuzz.token_set_ratio(new_item_desc.lower(), db_item.description.lower())

        if desc_score >= 60:
            # 4. Pull reporter name using the User relationship
            user_name = "Anonymous" # Default value
            if db_item.reporter and db_item.reporter.full_name:
                user_name = db_item.reporter.full_name
            
            # 5. NEW IMPLEMENTATIONS: Adding metadata and Secret Question for the notification flow
            potential_matches.append({
                "id": db_item.id,
                "title": db_item.title or "Untitled", # Ensure no None values
                "description": db_item.description or "",
                "location": db_item.location or "Unknown",
                "date": db_item.date or "N/A",
                "time": db_item.time or "N/A",
                "secret_question": db_item.secret_question or "No question set",
                "reported_by": user_name, # This is now guaranteed to be a string
                "confidence": desc_score
            })

    # 6. Sort by highest confidence first
    potential_matches.sort(key=lambda x: x["confidence"], reverse=True)
    return potential_matches