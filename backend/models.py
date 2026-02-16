from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True) 
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String(6), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # This allows us to see all items reported by this user
    items = relationship("Item", back_populates="reporter")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    item_type = Column(String(50), nullable=False) 
    
    # We link to the User table using the email as a Foreign Key
    reported_by_email = Column(String(255), ForeignKey("users.email"))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # This allows us to access user info (like name) directly from an item object
    reporter = relationship("User", back_populates="items")