# In backend/reset_db.py
from database import engine, Base
import models # This imports your models so SQLAlchemy knows about them

print("🗑️  Dropping outdated tables...")
Base.metadata.drop_all(bind=engine)

print("✨ Recreating tables with new columns...")
Base.metadata.create_all(bind=engine)

print("✅ Database reset complete! You can delete this file now.")