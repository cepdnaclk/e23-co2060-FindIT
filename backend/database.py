import os
import ssl
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Force load the .env file
load_dotenv()

# 2. Grab the URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# --- DEBUG BLOCK: This will print in your terminal ---
if SQLALCHEMY_DATABASE_URL is None:
    print("❌ ERROR: DATABASE_URL not found in .env file!")
else:
    print(f"✅ SUCCESS: Loaded URL starting with: {SQLALCHEMY_DATABASE_URL[:10]}...")
# ---------------------------------------------------

# 3. Setup SSL for Aiven
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 4. Create the Engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"ssl": ctx}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()