# backend/user_account/utils/user_utils.py
import random, os
import string
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings

def send_sos_email(to_email, subject, message):
    try:
        sendgrid_api_key = settings.SEND_GRID_API_KEY
        if not sendgrid_api_key:
            raise ValueError('SendGrid API key not found in environment variables.')

        # Initialize SendGrid client
        sg = SendGridAPIClient(sendgrid_api_key)

        from_email = settings.FROM_EMAIL
        email = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=subject,
            html_content=message
        )

        response = sg.send(email)
        return response.status_code
    except Exception as e:
        print(e)
        return None

# Generates a 6 character otp with 6 random numbers
def generate_otp():
    otp = ''.join(random.choices(string.digits, k=6))
    return otp

