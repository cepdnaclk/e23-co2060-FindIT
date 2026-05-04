import os
from google import genai
import requests
from google.genai import types
from dotenv import load_dotenv

# Load your GEMINI_API_KEY from .env
load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options={'api_version': 'v1'} 
)

def quick_test():
    test_url = "https://res.cloudinary.com/dyulw7nfz/image/upload/v1777457867/e9tmfhj1ilcmubcu83tl.jpg"
    
    print(f"--- Starting AI Test ---")
    try:
        image_response = requests.get(test_url)
        image_response.raise_for_status()
        response = client.models.generate_content(
            model="gemini-2.5-flash",            contents=["What is in this image?", types.Part.from_bytes(
                    data=image_response.content,
                    mime_type="image/jpeg")] # Simple test
        )
        print(f"AI Response: {response.text}")
    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    quick_test()