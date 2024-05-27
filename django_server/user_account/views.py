# user account_view.py
from rest_framework.views import APIView
from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework.authentication import get_authorization_header
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from .models import User
from .authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from django.views.decorators.csrf import csrf_exempt
from .repository import user_auth_repository
from .service import twilio_service
from .utils import user_utils
import json
from django.http import JsonResponse
from .utils.user_utils import send_sos_email
from .models import User
from rest_framework.permissions import AllowAny
from graph_converter.views import user_creation, user_edit, user_deletion
from django.utils.dateparse import parse_date
from django.shortcuts import get_object_or_404
import logging
from rest_framework import status


logger = logging.getLogger(__name__) 
class SosAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        sender_email = request.data.get('sender_email')
        recipient_email = request.data.get('recipient_email')
        message = request.data.get('message')

        if not sender_email or not recipient_email or not message:
            return JsonResponse({"error": "Sender's email, recipient's email, and message are required."}, status=400)

        try:
            sender = User.objects.get(email=sender_email)
            sender_first_name = sender.first_name
            sender_last_name = sender.last_name
        except User.DoesNotExist:
            return JsonResponse({"error": "Sender with the provided email address does not exist."}, status=400)

        if sender_first_name and sender_last_name:
            subject = f"SOS Alert from {sender_first_name} {sender_last_name}!"
        else:
            subject = f"SOS Alert from {sender_email}"
        
        email_message = f"{message} Your immediate help is requested by the owner of {sender_email}"

        try:
            # Send the SOS email
            response_status = send_sos_email(recipient_email, subject, email_message)
            
            if response_status == 202:  # 202 Accepted
                return JsonResponse({"message": "SOS alert sent successfully."}, status=200)
            else:
                return JsonResponse({"error": "Failed to send SOS alert."}, status=500)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


class RegisterAPIView(APIView):
    # @csrf_exempt
    def post(self,request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"user":(serializer.data)})

# Log into account- returns JWT Token used to access account.
class LoginAPIView(APIView):
    @csrf_exempt
    def post(self, request):

        user = User.objects.filter(email=request.data['email']).first()

        if not user:
            raise APIException('Invalid email!')

        if not user.check_password(request.data['password']):
            raise APIException('Invalid password!')

        user_creation(user.username, user.password, user.email, user.phoneNumber, user.id)
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        response = Response()

        response.set_cookie(key='refreshToken', value=refresh_token, httponly=True)
        response.data = {
            'token': access_token
        }
        logger.error('Message encountered: %s',access_token)


        return response
    
# Allows access to user account
class UserAPIView(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)
            user = User.objects.filter(pk=id).first()
            logger.error('ID encountered: %s',id)
            logger.error('user encountered: %s',user)



            return Response(UserSerializer(user).data)

        raise AuthenticationFailed('unauthenticated')

# Change password
class ChangePasswordAPIView(APIView):
    @csrf_exempt
    def post(self, request):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)

            user = User.objects.filter(pk=id).first()
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')

             # Check the old password
            if not user.check_password(current_password):
                return Response({'error': 'Invalid current password'}, status=400)

            # Set the new password
            user.set_password(new_password)
            user.save()
            user_edit(user.username, user.password, user.id)
            return Response({'message': 'Password changed successfully'})
        raise AuthenticationFailed('unauthenticated')
    
class ChangeRPasswordAPIView(APIView):
    @csrf_exempt
    def post(self, request):
        email = request.data.get('emailAddress')

        user = User.objects.filter(email=email).first()
        
        if user is None:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        new_password = request.data.get('password')
        
        user.set_password(new_password)
        user.save()
        user_edit(user.username, user.password, user.id)

        return Response({'message': 'Password changed successfully'})


# Delete account
class DeleteAccountAPIView(APIView):
    @csrf_exempt
    def delete(self, request):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)

            user = User.objects.filter(pk=id).first()
            password = request.data.get('password')

             # Check the old password
            if not user.check_password(password):
                return Response({'error': 'Invalid current password'}, status=400)

            # Set the new password
            user_deletion(user.id)
            user.delete()
            return Response({'message': 'Account deleted successfully'})
        raise AuthenticationFailed('unauthenticated')

# Handle POST request for sending otp to user via email.
class GenerateOTPAPIView(APIView):
    @csrf_exempt 
    def post(self, request):
        try:
                body = json.loads(request.body)
                email_id = body["emailAddress"]
                # get the user using repository method
                user_auth_repository_var = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_var.get_user_by_email(email_id)
                if not user:
                    return JsonResponse({'error': f'Error user email: {str(email_id)} not found'}, status=400)
                # generate a random top
                otp = user_utils.generate_otp()
                user.otp = otp
                user_auth_repository_var.save_user_auth(user)
                # call twilio service to send the otp
                twilio_service_var  = twilio_service.TwilioService()
                otpSuccess = twilio_service_var.send_otp(user,otp)
                if otpSuccess:
                    return JsonResponse({'message': f'Otp generated'}, status=200)
                else:
                    return JsonResponse({'error': f'Incorrect otp - Authorization failed: {str(e)}'}, status=401)
        except KeyError as e:
                # Return error response for missing required field
            return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
        except Exception as e:
                # Return error response for any unexpected exception
            return JsonResponse({'error': f'Error generating otp: {str(e)}'}, status=500)
        else:
            # Return error response for invalid request method
            return JsonResponse({'error': 'Invalid request method'}, status=405)
# Handle POST request for sending otp to user via email
class ValidateOTPAPIView(APIView):
    def post(self, request):
        try:
                body = json.loads(request.body)
                email_id = body["emailAddress"]
                otp = body["otp"]
                # get the user using repository method
                user_auth_repository_var = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_var.get_user_by_email(email_id)
                if not user:
                    return JsonResponse({'error': f'Error user email: {str(email_id)} not found'}, status=400)
                # If the otp verified, else send unauthorized request
                if user.otp == otp:
                    user_auth_repository_var.save_verified_user_auth(user)
                    return JsonResponse({'message': f'Otp verified successfully'}, status=200)
                else:
                    return JsonResponse({'error': f'Incorrect otp'}, status=401)
        except KeyError as e:
                # Return error response for missing required field
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
        except Exception as e:
                # Return error response for any unexpected exception
                return JsonResponse({'error': f'Error validating otp: {str(e)}'}, status=500)
    
# If user is not verified, they must be led to create their profile.
class CheckVerifiedStatus(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)

            user = User.objects.filter(pk=id).first()

            return JsonResponse({'isVerified': UserSerializer(user).data.get('isVerified')},  status=200)


        raise AuthenticationFailed('unauthenticated')
        
class RefreshAPIView(APIView):
    @csrf_exempt
    def post(self, request):
        refresh_token = request.COOKIES.get('refreshToken')
        id = decode_refresh_token(refresh_token)
        access_token = create_access_token(id)
        return Response({
            'token': access_token
        })

# Clear token
class LogoutAPIView(APIView):
    @csrf_exempt
    def post(self, _):
        response = Response()
        response.delete_cookie(key="refreshToken")
        response.data = {
            'message': 'success'
        }
        return response
