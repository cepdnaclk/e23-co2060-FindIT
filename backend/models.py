from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
import enum
from database import Base
from datetime import datetime

class ItemType(str, enum.Enum):
    LOST = "Lost"
    FOUND = "Found"

# --- 1. The User class MUST come first or be clearly visible ---
class User(Base):
    __tablename__ = "users" # This must match the name in your ForeignKey

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True) 
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String(6), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to items
    items = relationship("Item", back_populates="reporter")

# --- 2. Then define the Item class ---
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)
    item_type = Column(Enum(ItemType), nullable=False)
    
    # Ensure this string 'users.email' exactly matches __tablename__ and column name
    owner_email = Column(String(255), ForeignKey("users.email"))

    # Relationship back to User
    reporter = relationship("User", back_populates="items")