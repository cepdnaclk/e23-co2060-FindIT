from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- IMPORT THIS
from auth import router as auth_router

app = FastAPI()

# <--- ADD THIS BLOCK --->
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # The URL of your React App
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (POST, GET, etc.)
    allow_headers=["*"], # Allow all headers
)

app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "FindIT Backend is Running!"}