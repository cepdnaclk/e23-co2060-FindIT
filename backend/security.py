import os
from dotenv import load_dotenv
from cryptography.fernet import Fernet

# Load variables from the .env file
load_dotenv()

# Grab the key and initialize the Fernet engine
SECRET_KEY = os.getenv("ENCRYPTION_KEY")

if not SECRET_KEY:
    raise ValueError("No ENCRYPTION_KEY found in .env file!")

# Fernet requires the key to be in bytes
fernet_engine = Fernet(SECRET_KEY.encode())

def encrypt_phone(raw_phone_number: str) -> str:
    """Takes a raw string, encrypts it, and returns the scrambled string."""
    if not raw_phone_number:
        return None
        
    # 1. Convert the string to bytes
    phone_bytes = raw_phone_number.encode('utf-8')
    
    # 2. Encrypt the bytes
    encrypted_bytes = fernet_engine.encrypt(phone_bytes)
    
    # 3. Convert back to a string so it can be saved in MySQL
    return encrypted_bytes.decode('utf-8')

def decrypt_phone(encrypted_phone_string: str) -> str:
    """Takes a scrambled string from the DB, unlocks it, and returns the raw number."""
    if not encrypted_phone_string:
        return None
        
    try:
        # 1. Convert the scrambled string back to bytes
        encrypted_bytes = encrypted_phone_string.encode('utf-8')
        
        # 2. Decrypt it back to raw bytes
        decrypted_bytes = fernet_engine.decrypt(encrypted_bytes)
        
        # 3. Convert back to a normal readable string
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        print(f"Decryption failed: {e}")
        return "Decryption Error"
    

#---TESTING--

if __name__ == "__main__":
    print("🔒 Starting Security Test...\n")
    
    # 1. The fake phone number we want to protect
    test_number = "0771234567"
    print(f"1. Original Input:    {test_number}")
    
    # 2. Test the Encryption (What goes INTO the database)
    scrambled_data = encrypt_phone(test_number)
    print(f"2. Encrypted (DB):    {scrambled_data}")
    
    # 3. Test the Decryption (What comes OUT of the database)
    unlocked_data = decrypt_phone(scrambled_data)
    print(f"3. Decrypted Output:  {unlocked_data}")
    
    # 4. The Final Verification
    if test_number == unlocked_data:
        print("\n✅ SUCCESS: Encryption and Decryption are working perfectly!")
    else:
        print("\n❌ ERROR: The unlocked data does not match the original!")