from thefuzz import fuzz
import models

# Notice I changed the parameters to accept `new_item_keywords` directly
def find_matches(new_item_keywords: str, category: str, item_type: str, db_session):
    target_type = "Found" if item_type == "Lost" else "Lost"
    
    query_results = db_session.query(models.Item).filter(
        models.Item.category == category,
        models.Item.item_type == target_type
    ).all()
    
    potential_matches = []
    for db_item in query_results:
        # Safety check for exact category match
        if db_item.category != category:
            continue
            
        # Ensure the DB item has keywords (fallback to title if it's an old record)
        db_keywords = db_item.search_keywords if db_item.search_keywords else db_item.title
            
        # THE SMART MATCH: Compare the AI-generated keyword sets!
        confidence_score = fuzz.token_set_ratio(new_item_keywords, db_keywords)
        
        # Lower threshold because the keywords are highly specific
        if confidence_score >= 65:
            user_name = "Anonymous"
            if db_item.reporter and db_item.reporter.full_name:
                user_name = db_item.reporter.full_name
                        
            potential_matches.append({
                "id": db_item.id,
                "title": db_item.title or "Untitled",
                "description": db_item.description or "",
                "location": db_item.location or "Unknown",
                "date": db_item.date or "N/A",
                "time": db_item.time or "N/A",
                "secret_question": db_item.secret_question or "No question set",
                "reported_by": user_name,
                "confidence": confidence_score
            })

    potential_matches.sort(key=lambda x: x["confidence"], reverse=True)
    return potential_matches