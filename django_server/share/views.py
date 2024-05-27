
from django.shortcuts import render
import json
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
from rest_framework.exceptions import APIException, AuthenticationFailed
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from user_account.repository import user_auth_repository
import logging
from user_account.models import User
from rest_framework.authentication import get_authorization_header
from user_account.authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from matching.models import Profile
from matching.repository.profile_repository import ProfileRepository
from .repository.share_repository import ShareRepository
from .service.share_service import ShareService
# Create your views here.

# Check if repo creation has been selected here, and update if needed
# Put if the user changes the information

# For add user to can share, do in repository layer

logger = logging.getLogger(__name__)

class SharingAbilityAPIView(APIView):
    @csrf_exempt
    def post(self, request): 
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                sharing_status = request.data.get('can_share_profile')
                profile_repo_obj = ProfileRepository()
                profile = profile_repo_obj.get_profile_by_user_id(user)
                # Get or create the Share instance for the user's profile
                logger.error('ID encountered: %s',id)
                logger.error('user encountered: %s',user)
                logger.error('Sharing status encountered: %s',sharing_status)
                share_service = ShareService()
                share_service.create_sharing_profile(profile=profile, allow_all_share=sharing_status)
                return JsonResponse({'message': 'Profile added to sharing'})
            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': 'Missing required field'}, status=400)
            except Exception as e:
                logger.error(e)
                return JsonResponse({'error': 'An error occurred'}, status=500)
        else:
            raise AuthenticationFailed('Authentication failed, token missing or invalid')
        
    @csrf_exempt
    def put(self, request): 
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = ProfileRepository()
                logger.error('ID encountered: %s',id)
                logger.error('user encountered: %s',user)
                profile = profile_repo_obj.get_profile_by_user_id(user)
                logger.error('Profile encountered: %s',profile)
                # Get or create the Share instance for the user's profile
                share_service = ShareService()
                share_service.change_sharing_status(profile=profile)
                return JsonResponse({'message': 'Profile sharing status changed'})
            except KeyError as e:
                logger.error('KeyError encountered: %s', e)
                return JsonResponse({'error': 'Missing required field'}, status=400)
            except Exception as e:
                logger.error('Exception encountered: %s',e)
                return JsonResponse({'error': 'An error occurred'}, status=500)
        else:
            raise AuthenticationFailed('Authentication failed, token missing or invalid')

    @csrf_exempt
    def get(self, request): 
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                share_repo = ShareRepository()
                profile_repo_obj = ProfileRepository()
                logger.error('ID encountered: %s',id)
                logger.error('user encountered: %s',user)
                profile = profile_repo_obj.get_profile_by_user_id(user)
                logger.error('Profile encountered: %s',profile)               
                sharing_status = share_repo.get_user_sharing_status_by_profile(profile=profile)
                return JsonResponse({'message': sharing_status}, status=200) # print true or false based on if sharing is allowed or not
            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': 'Missing required field'}, status=400)
            except Exception as e:
                logger.error('Exception encountered: %s',e)
                return JsonResponse({'error': f'An error occurred: {e})'}, status=404)
        else:
            raise AuthenticationFailed('Authentication failed, token missing or invalid')
        
class ShareProfileAPIView(APIView):
    @csrf_exempt
    def post(self, request): 
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = ProfileRepository()
                sharing_service = ShareService()

                logger.error('ID encountered: %s',id)
                logger.error('user encountered: %s',user)

                profile = profile_repo_obj.get_profile_by_user_id(user)
                friend_profile_id = request.data.get('friend_profile_id')

                logger.error('Friend Profile ID encountered: %s',friend_profile_id)
                if not friend_profile_id:
                    logger.error('Friend Profile ID is missing')
                    return JsonResponse({'error': 'Friend Profile ID is required'}, status=400)



                # friend = user_auth_repository_obj.get_user_by_id(friend_profile_id)
                friend_profile = profile_repo_obj.get_profile_by_profile_id(friend_profile_id)
                
                
                # logger.error('Friend User encountered: %s',friend)
                logger.error('Friend Profile encountered: %s',friend_profile)

                # friend_share_status = share_repo.get_user_sharing_status_by_profile(profile=friend_profile)
                # logger.error({friend_share_status})
                # Get or create the Share instance for the user's profile
                action = sharing_service.add_sharing_profile(profile=profile, friend_profile=friend_profile)
                if action:
                    return JsonResponse({'message': 'Profile added to sharing list successfully'}, status=200)
                else:
                    return JsonResponse({'error': 'Profile was not added'}, status=400)
                
            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': 'Missing required field'}, status=400)
            except Exception as e:
                logger.error('Exception encountered: %s',e)
                return JsonResponse({'error': 'An error occurred'}, status=500)
        else:
            raise AuthenticationFailed('Authentication failed, token missing or invalid')
        
    @csrf_exempt
    def delete(self, request): 
        # Authentication check
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = ProfileRepository()
                share_service = ShareService()
                
                friend_profile_id = request.data.get('friend_profile_id')
                logger.error('Friend Profile ID encountered: %s',friend_profile_id)
                if not friend_profile_id:
                    return JsonResponse({'error': 'Missing friend profile ID'}, status=400)

                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                logger.error('ID encountered: %s',id)
                logger.error('user encountered: %s',user)


                user_profile = profile_repo_obj.get_profile_by_user_id(id)
                friend_profile = profile_repo_obj.get_profile_by_profile_id(friend_profile_id)

                logger.error(f"Attempting to remove sharing permissions for friend ID: {friend_profile_id}")

                action = share_service.remove_sharing_profile(user_profile=user_profile, friend_profile=friend_profile)
                
                if action:
                    return JsonResponse({'message': 'Friend removed from sharing list successfully'}, status=200)
                else:
                    return JsonResponse({'error': 'Failed to remove friend from sharing list'}, status=400)

            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': 'Missing required field'}, status=400)
            except Exception as e:
                logger.error(f'Exception encountered: {e}')
                return JsonResponse({'error': 'An error occurred'}, status=500)
        else:
            return JsonResponse({'error': 'Authentication failed, token missing or invalid'}, status=401)

        
        
class GetProfileAPIView(APIView):
    @csrf_exempt
    def get(self, request, friend_user_id): 
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:

                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = ProfileRepository()
                sharing_service = ShareService()
                share_repo = ShareRepository()

                logger.error('ID encountered: %s',id)
                logger.error('user encountered: %s',user)

                profile = profile_repo_obj.get_profile_by_user_id(user)

                logger.error('Friend ID encountered: %s',friend_user_id)

                friend = user_auth_repository_obj.get_user_by_id(friend_user_id)
                friend_profile = profile_repo_obj.get_profile_by_user_id(friend)
                
                logger.error('Friend User encountered: %s',friend)
                logger.error('Friend Profile encountered: %s',friend_profile)
                # Get or create the Share instance for the user's profile
                sharing_status = sharing_service.is_in_shared_list(profile=profile, friend=friend_profile)
                if sharing_status:
                    return JsonResponse({'message': 'Successfully fetched status and profile',
                                         'can_share_profile_to_friend':sharing_status, 
                                         'friend_profile':friend_profile.full_name}, status=200)
                else:
                    return JsonResponse({'message': f'not allowed to share profile for {friend_profile.preferred_name}'}, status=500)
            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': 'Missing required field'}, status=400)
            except Exception as e:
                logger.error(e)
                return JsonResponse({'error': 'An error occurred'}, status=500)
        else:
            raise AuthenticationFailed('Authentication failed, token missing or invalid')