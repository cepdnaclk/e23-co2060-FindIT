from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# --- 1. User Model ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True) 
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String(6), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    items = relationship("Item", back_populates="reporter")

# --- 2. Item Model ---
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(String(1000))
    category = Column(String(100))
    location = Column(String(255))
    date = Column(String(50))
    time = Column(String(50))
    item_type = Column(String(50))
    image_url = Column(String(500), nullable=True) 
    owner_email = Column(String(255), ForeignKey("users.email"))
    reporter = relationship("User", back_populates="items")
    secret_question = Column(String(255), nullable=True)
    secret_answer = Column(String(255), nullable=True)
    contact_number = Column(String(500), nullable=True)
    owner_email = Column(String(255), ForeignKey("users.email"))
    reporter = relationship("User", back_populates="items")