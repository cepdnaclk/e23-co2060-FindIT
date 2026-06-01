import os
import json
import requests
import models
from google import genai
from google.genai import types

# Define prioritized models
VISION_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"]
TEXT_MODELS = [ "gemini-2.5-flash", "gemini-2.0-flash"]

# Initialize the client (automatically uses GEMINI_API_KEY from your .env)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_or_create_analysis(image_url: str, db):
    # 1. CHECK CACHE FIRST
    cached = db.query(models.AnalysisCache).filter(models.AnalysisCache.input_key == image_url).first()
    if cached:
        return cached.result_json

    # 2. IF NOT CACHED, CALL AI
    result = analyze_item_image(image_url)
    
    # 3. SAVE TO CACHE
    if result.get("title") and result.get("title") != "":
        new_cache = models.AnalysisCache(input_key=image_url, result_json=result)
        db.add(new_cache)
        db.commit()
    return result

def analyze_item_image(image_url: str):
    """
    Downloads an image from a URL and uses Gemini to extract 
    Lost & Found metadata in JSON format.
    """
    try:
        # 1. Fetch the image bytes from the Cloudinary URL
        img_response = requests.get(image_url, timeout=10)
        img_response.raise_for_status()
        
        # 2. Define the exact JSON structure FindIT needs
        prompt = """
        Analyze this image for a University Lost and Found system. 
        Return a JSON object with strictly these keys: 
        "title": (A short, concise name for the item), 
        "category": (Must be one of: Electronics, IDs/Documents, Keys, Wallets/Bags, Books/Stationary, Other), 
        "description": (Specific details like color, brand, or visible text), 
        "secret_question": (A simple, obvious security question that the owner could answer from memory. DO NOT ask the user to count tiny details like vents or stitches. Ask things like 'What is the brand name on the lid?', 'What color is the phone case?', 'Is there a sticker on the back?', or 'What is the wallpaper on the screen?'), 
        "secret_answer": (The short answer to that secret question).
        """

        # Rotate through models
        for model in VISION_MODELS:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=[prompt, types.Part.from_bytes(data=img_response.content, mime_type="image/jpeg")],
                    config=types.GenerateContentConfig(response_mime_type="application/json"),
                )
                return json.loads(response.text)
            except Exception as e:
                # If rate limited (429), try next model. If other error, log and try next.
                print(f"Model {model} failed: {e}")
                continue 

    except Exception as e:
        print(f"DEBUG BACKEND ERROR: {e}")

    # Fallback if all models fail
    return {
        "title": "",
        "category": "Other",
        "description": "AI analysis unavailable.",
        "secret_question": "",
        "secret_answer": ""
    }

# Add this at the bottom of vision_service.py
def generate_smart_keywords(title: str, description: str, category: str,db) -> str:
    """
    Uses Gemini to translate Singlish and expand abbreviations into a clean keyword list.
    """
    cache_key = f"{title}-{category}"
    
    # 1. CHECK CACHE
    cached = db.query(models.AnalysisCache).filter(models.AnalysisCache.input_key == cache_key).first()
    if cached: 
        return cached.result_json
    
    prompt = f"""
        Extract standard English keywords from this lost/found item report.
        - Translate any Sri Lankan/Singlish words (e.g., 'kudaya' -> 'umbrella', 'potha' -> 'book').
        - Expand abbreviations (e.g., 'Uni ID' -> 'University Identity Card').
        - Include the category and key features (colors, brands).
        
        Return ONLY a lowercase, space-separated list of keywords. No punctuation.
        
        Title: {title}
        Description: {description}
        Category: {category}
        """
        
    for model in TEXT_MODELS:
        try:
            response = client.models.generate_content(model=model, contents=prompt)
            result = response.text.strip().lower()
            
            # Save to cache
            db.add(models.AnalysisCache(input_key=cache_key, result_json=result))
            db.commit()
            return result
        except:
            continue

    #Fallback       
    return f"{title} {category}".lower()
  