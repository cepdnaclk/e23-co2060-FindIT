import os
import json
import requests
from google import genai
from google.genai import types

# Initialize the client (automatically uses GEMINI_API_KEY from your .env)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

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

        # 3. Generate Content using the working 2.5 model
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=img_response.content, 
                    mime_type="image/jpeg" 
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json", # Forces the AI to output valid JSON
            ),
        )

        # 4. Parse the JSON string into a Python dictionary for FastAPI to use
        return json.loads(response.text)

    except Exception as e:
        print(f"DEBUG BACKEND ERROR: {e}")
        # 5. Graceful Fallback: If anything fails, return empty fields so the frontend form still works
        return {
            "title": "",
            "category": "Other",
            "description": "AI analysis unavailable. Please fill manually.",
            "secret_question": "",
            "secret_answer": ""
        }