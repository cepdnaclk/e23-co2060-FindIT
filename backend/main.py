from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from auth import router as auth_router


# Creates the MySQL tables automatically on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allows React Frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*",
                   "https://findit-foe.onrender.com"], # The URL of your React App
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (POST, GET, etc.)
    allow_headers=["*"], # Allow all headers
)

# Attach the auth endpoints
app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "FindIT Backend is Running with MySQL!"}