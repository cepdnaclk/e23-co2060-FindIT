import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load the variables from your .env file
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Since running on Render, we need to handle SSL without a file
connect_args = {}
if "aivencloud.com" in SQLALCHEMY_DATABASE_URL:
    connect_args = {
        "ssl": {
            "check_hostname": False,
            "verify_mode": "cert_none"
        }
    }

# The engine is the actual bridge to the database
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Each time we talk to the DB, we create a 'Session'
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is the base class that our models (User, Item) will inherit from
Base = declarative_base()

# This helper function opens a connection and closes it when done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()