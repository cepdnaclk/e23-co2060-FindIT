from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
import items  # Import your new items router
from database import engine
from auth import router as auth_router

# Creates the MySQL tables automatically on startup
# This will now create the 'items' table as well
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allows React Frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*",
                   "https://findit-foe.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach the existing auth endpoints
app.include_router(auth_router)

# NEW: Attach the items endpoints you are building
app.include_router(items.router)

@app.get("/")
def home():
    return {"message": "FindIT Backend is Running with MySQL and Items Logic!"}