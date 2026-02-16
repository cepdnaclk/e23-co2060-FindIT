from thefuzz import fuzz
import models

def find_matches(new_item_text: str, category: str, item_type: str, db_session):
    target_type = "Found" if item_type == "Lost" else "Lost"
    
    # Pull items and the user info linked to them
    query_results = db_session.query(models.Item).filter(
        models.Item.category == category,
        models.Item.item_type == target_type
    ).all()
    
    potential_matches = []

    for db_item in query_results:
        # Safety check to ensure categories match exactly (helps during testing/mocking)
        if db_item.category != category:
            continue

        score = fuzz.token_set_ratio(new_item_text.lower(), db_item.description.lower())

        if score >= 70:
            # Here is the magic: we pull the name from the linked User table
            user_name = db_item.reporter.full_name if db_item.reporter else "Anonymous"
            
            potential_matches.append({
                "id": db_item.id,
                "description": db_item.description,
                "reported_by": user_name, 
                "confidence": score
            })

    potential_matches.sort(key=lambda x: x["confidence"], reverse=True)
    return potential_matches