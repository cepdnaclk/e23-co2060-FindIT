import os
from dotenv import load_dotenv
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

# Load variables from .env file
load_dotenv()

# CONFIGURATION
# 1. Get your API Key from Brevo: SMTP & API -> API Keys
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")

# 2. This MUST be a verified sender in your Brevo dashboard (Senders & IP -> Senders)
SENDER_EMAIL = "finditsystem4@gmail.com" 
SENDER_NAME = "FindIT"

def send_email(recipient_email: str, otp_code: str):
    # Setup Brevo Configuration
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = BREVO_API_KEY

    # Initialize the API client
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    # 1. Define the Email Content
    subject = "Your FindIT Login Code"
    html_content = f"""
    <html>
        <body style="font-family: sans-serif;">
            <h2 style="color: #003366;">Welcome to FindIT</h2>
            <p>Your verification code is:</p>
            <h1 style="background-color: #f0f0f0; padding: 10px; display: inline-block; letter-spacing: 2px;">
                {otp_code}
            </h1>
            <p>This code expires in 5 minutes.</p>
            <p><i>If you did not request this, please ignore this email.</i></p>
        </body>
    </html>
    """

    # 2. Create the SendSmtpEmail object
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": recipient_email}],
        sender={"name": SENDER_NAME, "email": SENDER_EMAIL},
        subject=subject,
        html_content=html_content
    )

    try:
        print(f"🔄 Connecting to Brevo to send to {recipient_email}...")
        
        # 3. Send the email via API
        api_response = api_instance.send_transac_email(send_smtp_email)
        
        print(f"✅ Email sent successfully! Message ID: {api_response.message_id}")
        return True

    except ApiException as e:
        print(f"❌ Brevo API error: {e}")
        return False
    except Exception as e:
        print(f"❌ General error: {e}")
        return False