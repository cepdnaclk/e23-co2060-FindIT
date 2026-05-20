import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

def send_match_notification_email(receiver_email: str, item_name: str, match_link: str):
    # 1. Grab the API key that we know works (from your .env)
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = "finditsystem4@gmail.com" # Matching what you have in utils.py

    if not api_key:
        print("❌ ERROR: BREVO_API_KEY not found in environment variables.")
        return

    # 2. Setup the official Brevo SDK connection
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = api_key
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    # 3. Create the clean HTML email template
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">Great news from FindIT!</h2>
        <p>We think we might have found a match for your reported item: <strong>{item_name}</strong>.</p>
        <p>Please log in to the platform to review the match and verify ownership securely.</p>
        <br>
        <a href="{match_link}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          View Match Details
        </a>
        <br><br>
        <p style="font-size: 12px; color: #777;">If the button doesn't work, copy and paste this link into your browser: {match_link}</p>
        <p style="font-size: 12px; color: #777;">Stay secure. FindIT will never ask for your password via email.</p>
      </body>
    </html>
    """

    # 4. Package the email request
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": receiver_email}],
        sender={"name": "FindIT Matches", "email": sender_email},
        subject=f"🎉 Match Found: {item_name} | FindIT",
        html_content=html_content
    )

    # 5. Send it!
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Match email sent successfully to {receiver_email}! ID: {api_response.message_id}")
    except ApiException as e:
        print(f"❌ Brevo API error when sending to {receiver_email}: {e}")
    except Exception as e:
        print(f"❌ General error sending to {receiver_email}: {e}")