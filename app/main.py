from fastapi import FastAPI
from .database import engine
from . import models, schemas 

# This creates the tables in MySQL
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "FindIT Backend is running!"}

@app.post("/test-registration")
def test_registration(user: schemas.UserCreate):
    return {"message": f"Verified! {user.email} is allowed."}