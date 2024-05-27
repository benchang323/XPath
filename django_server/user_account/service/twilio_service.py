# backend/user_account/service/twilio_service.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings
class TwilioService:
    def send_otp(self,user,otp):
        message = Mail(
        from_email='xpath.inc@gmail.com',
        to_emails=user.email,
        subject='XPath',
        html_content='<strong>OTP: {}</strong>'.format(otp))
        try:
            sg = SendGridAPIClient(settings.SEND_GRID_API_KEY)
            response = sg.send(message)
            return True
        except Exception as e:
            print(e)
            return False






