from thefuzz import fuzz
import models

def find_matches(new_item_text: str, category: str, item_type: str, db_session):
    # 1. Flip the target: If I lost something, show me what people found
    target_type = "Found" if item_type == "Lost" else "Lost"
    
    # 2. Query only matching categories and opposite types
    query_results = db_session.query(models.Item).filter(
        models.Item.category == category,
        models.Item.item_type == target_type
    ).all()
    
    potential_matches = []

    for db_item in query_results:
        # Safety check for exact category match
        if db_item.category != category:
            continue

        # 3. Fuzzy match scoring (Token Set Ratio handles word reordering well)
        score = fuzz.token_set_ratio(new_item_text.lower(), db_item.description.lower())

        if score >= 70:
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
                "date": db_item.lost_date or "N/A",
                "time": db_item.lost_time or "N/A",
                "secret_question": db_item.secret_question or "No question set",
                "reported_by": user_name, # This is now guaranteed to be a string
                "confidence": score
            })

    # 6. Sort by highest confidence first
    potential_matches.sort(key=lambda x: x["confidence"], reverse=True)
    return potential_matches