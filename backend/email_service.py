import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

def send_match_notification_email(receiver_email: str, item_name: str, match_link: str):
    # 1. Grab the API key that we know works (from your .env)
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("SENDER_EMAIL", "finditsystem4@gmail.com") # Matching what you have in utils.py

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
        <p>Please log in to the platform and <strong>click the Notification Bell</strong> in the top right to review the match and verify ownership securely.</p>
        <br>
        <a href="{match_link}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Open FindIT Dashboard
        </a>
        <br><br>
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

def send_retention_warning_email(receiver_email: str, item_name: str, extend_link: str):
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("SENDER_EMAIL", "finditsystem4@gmail.com")

    if not api_key:
        return

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = api_key
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #F59E0B;">Did you find your {item_name} yet?</h2>
        <p>Your lost item report has been active for 5 days. To keep our system clean, your report will be <strong>automatically deleted in 2 days</strong>.</p>
        <p>If you haven't found your item yet and want us to keep searching, just click the button below to keep your report active for another week!</p>
        <br>
        <a href="{extend_link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          I wish to keep my report active
        </a>
        <br><br>
        <p style="font-size: 12px; color: #777;">If you already found it, you can ignore this email. The report will safely delete itself.</p>
      </body>
    </html>
    """

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": receiver_email}],
        sender={"name": "FindIT Cleanup", "email": sender_email},
        subject=f"Action Required: Keep your report for {item_name}?",
        html_content=html_content
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Retention warning sent to {receiver_email}!")
    except Exception as e:
        print(f"❌ Error sending retention warning: {e}")