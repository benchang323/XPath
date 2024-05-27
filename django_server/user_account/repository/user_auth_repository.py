from ..models import User
from rest_framework.authentication import get_authorization_header
from ..authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
class UserAuthRepository:
    def get_user_by_email(self, email):
        user = User.objects.filter(email=email).first()
        return user
    def save_user_auth(self,user_auth):
        return user_auth.save()
    def save_verified_user_auth(self,user_auth):
        user_auth.isVerified = True
        return user_auth.save()
    def get_user_by_id(self, id):
        user = User.objects.filter(pk=id).first()
        return user
    # def get_user(self, request):
    #     auth = get_authorization_header(request).split()

    #     if auth and len(auth) == 2:
    #         token = auth[1].decode('utf-8')
    #         id = decode_access_token(token)

    #         user = User.objects.filter(pk=id).first()
    #         return user