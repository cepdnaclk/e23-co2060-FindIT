import os
from dotenv import load_dotenv
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

# Load variables from .env file
load_dotenv()

# CONFIGURATION
# 1. Get your API Key from Brevo: SMTP & API -> API Keys
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")

# 2. This can be loaded dynamically from the environment, defaulting to the verified sender
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "finditsystem4@gmail.com")
SENDER_NAME = "FindIT"

# 3. Load admin emails (comma-separated list)
ADMIN_EMAILS = [
    email.strip()
    for email in os.environ.get("ADMIN_EMAILS", "lilly.manu94@gmail.com").split(",")
    if email.strip()
]

def send_email(recipient_email:str, content: str, subject: str = "Your FindIT Update"):
    # Setup Brevo Configuration
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = BREVO_API_KEY

    # Initialize the API client
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    # Detect if content is an OTP (6 digits) to keep the old styling, 
    # otherwise treat it as a standard message.
    is_otp = len(content) == 6 and content.isdigit()
    
    if is_otp:
        # --- THE ORIGINAL OTP TEMPLATE ---
        email_subject = "Your FindIT Login Code"
        html_content = f"""
        <html>
            <body style="font-family: sans-serif;">
                <h2 style="color: #003366;">Welcome to FindIT</h2>
                <p>Your verification code is:</p>
                <h1 style="background-color: #f0f0f0; padding: 10px; display: inline-block; letter-spacing: 2px;">
                    {content}
                </h1>
                <p>This code expires in 5 minutes.</p>
                <p><i>If you did not request this, please ignore this email.</i></p>
            </body>
        </html>
        """
    else:
        # --- THE ADMIN NOTIFICATION TEMPLATE ---
        email_subject = subject
        html_content = f"""
        <html>
            <body style="font-family: sans-serif;">
                <h2 style="color: #003366;">FindIT Notification</h2>
                <p style="font-size: 16px; line-height: 1.5;">{content}</p>
                <p><i>Please log in to the app to view the details.</i></p>
            </body>
        </html>
        """

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": recipient_email}],
        sender={"name": SENDER_NAME, "email": SENDER_EMAIL},
        subject=subject,
        html_content=html_content
    )

    try:
        print(f"🔄 Connecting to Brevo to send to {recipient_email}...")
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Email sent successfully! ID: {api_response.message_id}")
        return True
    except ApiException as e:
        print(f"❌ Brevo API error: {e}")
        return False
    except Exception as e:
        print(f"❌ General error: {e}")
        return False