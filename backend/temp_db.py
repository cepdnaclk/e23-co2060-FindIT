# temp_db.py

# This dictionary acts as your "OTP Table"
# Key = Email, Value = OTP Code
fake_otp_storage = {}

# This list acts as your "Users Table"
fake_users_db = []

def save_otp(email: str, otp: str):
    fake_otp_storage[email] = otp
    print(f"DEBUG (DB): Saved OTP {otp} for {email}")

def get_otp(email: str):
    return fake_otp_storage.get(email)

def save_user(email: str):
    fake_users_db.append({"email": email, "verified": True})
    print(f"DEBUG (DB): User {email} registered successfully!")