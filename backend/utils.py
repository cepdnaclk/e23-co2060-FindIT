# utils.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# CONFIGURATION (Ideally, move these to a .env file later)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "finditsystem4@gmail.com" # <--- PUT YOUR GMAIL HERE
SENDER_PASSWORD = "makp qxlm kzcs ebpf" # <--- PUT YOUR 16-CHAR APP PASSWORD HERE

def send_email(recipient_email: str, otp_code: str):
    try:
        # 1. Setup the Email Structure
        msg = MIMEMultipart()
        msg['From'] = f"FindIT <{SENDER_EMAIL}>"
        msg['To'] = recipient_email
        msg['Subject'] = "Your FindIT Login Code"

        # 2. The Email Body (HTML makes it look professional)
        body = f"""
        <html>
            <body>
                <h2 style="color: #003366;">Welcome to FindIT</h2>
                <p>Your verification code is:</p>
                <h1 style="background-color: #f0f0f0; padding: 10px; display: inline-block;">{otp_code}</h1>
                <p>This code expires in 5 minutes.</p>
                <p><i>If you did not request this, please ignore this email.</i></p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        # 3. Connect to Gmail Server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls() # Secure the connection
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # 4. Send and Close
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email sent successfully to {recipient_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False