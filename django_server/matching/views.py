from django.shortcuts import render
import json
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse,QueryDict,HttpResponse
from django.http.multipartparser import MultiPartParser
from django.forms.models import model_to_dict
from rest_framework.exceptions import APIException, AuthenticationFailed
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.response import Response
from rest_framework import status
from chat_app.service import stream_chat_service
from user_account.repository import user_auth_repository
from matching.repository import profile_repository
from .service import profile_service,s3_service
import logging
from user_account.models import User
from user_account.serializers import UserSerializer
from rest_framework.authentication import get_authorization_header
from user_account.authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from rest_framework.parsers import MultiPartParser, FormParser
import csv
import os
from django.conf import settings
import pandas as pd
from graph_converter.views import profile_creation, profile_deletion, profile_update, request_match, reject_match, undo_reject, get_match_recommendations, get_incoming_requests, add_ignore
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated




# To facilitate report or block
from matching.service.profile_service import ProfileService

logger = logging.getLogger(__name__)
# Create your views here.



# Handle user block request 
class BlockReportMatchAPIView(APIView):
    @csrf_exempt
    def post(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                profile = profile_repo_obj.get_profile_by_user_id(user)
                from_profile_id = profile.profile_id
                to_profile_id = request.data.get('to_profile_id')
                action = request.data.get('action')

                if not all([to_profile_id, action]):
                    return Response({'error': 'Missing required fields'}, status=400)

                profile_service = ProfileService()

                if action == 'block':
                    success = profile_service.block_match(to_profile_id)
                elif action == 'report':
                    success = profile_service.report_match(to_profile_id)
                else:
                    return Response({'error': 'Invalid action specified'}, status=400)

                if success:
                    return Response({'message': f'Successfully {action}ed the match'})
                else:
                    return Response({'error': 'Match not found or could not be processed'}, status=404)
            except KeyError as e:
            # Return error response for missing required field
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
            # Return error response for any unexpected exception
                logger.error(e)
                return JsonResponse({'error': f'Error creating user: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')


# Handle requests for creating, deleting and updating profile
class HandleProfileAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    @csrf_exempt
    def get(self, request): 
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                profile = profile_repo_obj.get_profile_by_user_id(user)
                if profile:
                    return JsonResponse({'message': 'Successfully fetched user','profile':model_to_dict(profile)})
                else:
                    return JsonResponse({'error': f'Error fetching profile for user: {user.email})'}, status=404)
            except KeyError as e:
                # Return error response for missing required field
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
                # Return error response for any unexpected exception
                logger.error(e)
                return JsonResponse({'error': f'Error fetching user: {str()}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
 
    # Creating profile
    @csrf_exempt
    def post(self, request):
        auth = get_authorization_header(request).split()
        body = request.POST
        if auth and len(auth) == 2:
            try: 
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_service_obj = profile_service.ProfileService()
                action = profile_service_obj.create_profile(body, request.FILES.getlist('profilePic'),user)
                if action:
                    profile_repo_obj = profile_repository.ProfileRepository()
                    profile_id = profile_repo_obj.get_profile_by_user_id(user)
                    fullName = body["full_name"]
                    preferredName = body["preferred_name"]
                    gender = body["gender"]
                    zodiacSign = body["zodiacSign"]
                    birthdate = body["birthdate"]
                    city = body["city"]
                    state = body["state"]
                    country = body["country"]
                    zipcode = body["zipcode"]
                    hobbies = body["hobbies"]
                    interests = body["interests"]
                    languages = body["languages"]
                    ethnicity = body["ethnicity"]
                    occupation = body["occupation"]
                    favoriteAnimal = body["favoriteAnimal"]
                    mostSpontaneous = body["mostSpontaneous"]
                    favoriteMoviesTvShows = body["favoriteMoviesTvShows"]
                    favoriteMusic = body["favoriteMusic"]
                    favoriteFood = body["favoriteFood"]
                    favoriteColor = body["favoriteColor"]
                    superpowerChoice = body["superpowerChoice"]
                    favoriteCartoonCharacter = body["favoriteCartoonCharacter"]

                    bio = f"Hello there! My name is {fullName}, but you can call me {preferredName}. I identify as {gender}. I was born under the sign of {zodiacSign} on {birthdate}. Currently, I reside in {city}, {state}, {country}, with the zip code {zipcode}. In my free time, I enjoy {hobbies}, and I'm particularly passionate about {interests}. I speak {languages}, and my ethnicity is {ethnicity}. Professionally, I work as a {occupation}. I'm known for my love of {favoriteAnimal}, and I'm often described as {mostSpontaneous}. When it comes to entertainment, I'm a big fan of {favoriteMoviesTvShows} and {favoriteMusic}. My favorite food is {favoriteFood}, and my favorite color is {favoriteColor}. If I could have any superpower, I would choose {superpowerChoice}. My all-time favorite cartoon character is {favoriteCartoonCharacter}. Feel free to reach out and connect with me!"

                    profile_creation(bio, profile_id.profile_id, user.id)
                    return JsonResponse({f'message' : 'Successfully created profile for user: {user}'})
                else:
                    return JsonResponse({'error': f'Error creating user: {user.email}'}, status=500)  
            except KeyError as e:
            # Return error response for missing required field
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
            # Return error response for any unexpected exception
                logger.error(e)
                return JsonResponse({'error': f'Error creating user: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
        
    # Updating profile
    @csrf_exempt
    def put(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                user_id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user_auth = user_auth_repository_obj.get_user_by_id(user_id)

                # Extract profile and avatar files from the request
                profile_file = request.FILES.get('profilePic')
                # avatar_file = request.FILES.get('avatarPic')

                profile_service_obj = profile_service.ProfileService()
                # Pass all required parameters to the update_profile method
                action = profile_service_obj.update_profile(request.data, profile_file, user_auth)
                body = request.data

                if action:
                    profile_repo_obj = profile_repository.ProfileRepository()
                    profile_id = profile_repo_obj.get_profile_by_user_id(user_auth)
                    bio = f"Hello there! My name is {body['full_name']}, but you can call me {body['preferredName']}. I identify as {body['gender']}. I was born under the sign of {body['zodiacSign']} on {body['birthdate']}. Currently, I reside in {body['city']}, {body['state']}, {body['country']}, with the zip code {body['zipcode']}. In my free time, I enjoy {body['hobbies']}, and I'm particularly passionate about {body['interests']}. I speak {body['languages']}, and my ethnicity is {body['ethnicity']}. Professionally, I work as a {body['occupation']}. I'm known for my love of {body['favoriteAnimal']}, and I'm often described as {body['mostSpontaneous']}. When it comes to entertainment, I'm a big fan of {body['favoriteMoviesTvShows']} and {body['favoriteMusic']}. My favorite food is {body['favoriteFood']}, and my favorite color is {body['favoriteColor']}. If I could have any superpower, I would choose {body['superpowerChoice']}. My all-time favorite cartoon character is {body['favoriteCartoonCharacter']}. Feel free to reach out and connect with me!"
                    profile_update(bio, profile_id.profile_id, user_auth.id)
                    return JsonResponse({'message': 'Successfully updated user'})
                else:
                    return JsonResponse({'error': 'Error updating user'}, status=500)
            except KeyError as e:
                # Return error response for missing required field
                logger.error(e)
                return JsonResponse({'error': str(e)}, status=400)
            except Exception as e:
                # Return error response for any unexpected exception
                logger.error(e)
                return JsonResponse({'error': str(e)}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')

    # Deleting profile
    @csrf_exempt
    def delete(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                # get the user using repository method
                profile_service_obj = profile_service.ProfileService()
                profile_deletion(id)
                action = profile_service_obj.delete_profile(user)    
                if action:
                    return JsonResponse({'message': f'Successfully deleted user : {user.email}'})
                else:
                    return JsonResponse({'error': f'Error deleting user: {user.email}'}, status=500)
            except KeyError as e:
                # Return error response for missing required field
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
                # Return error response for any unexpected exception
                logger.error(e)
                return JsonResponse({'error': f'Error deleting user: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')

class GetProfilePicAPIView(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(id)
            profile_repo_obj = profile_repository.ProfileRepository()
            profile = profile_repo_obj.get_profile_by_user_id(user)
            print(profile)
            if profile:
                s3_service_obj = s3_service.S3Service()
                file = s3_service_obj.download_object(profile.profile_photo_key)
                return HttpResponse(file, content_type='image/jpg')
            else:
                return JsonResponse({'error': f'Error fetching profile picture for: {user.email}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')

class GetAvatarAPIView(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(id)
            profile_repo_obj = profile_repository.ProfileRepository()
            profile = profile_repo_obj.get_profile_by_user_id(user)
            print(profile)
            if profile:
                s3_service_obj = s3_service.S3Service()
                file = s3_service_obj.download_object(profile.avatar_bucket_key)
                return HttpResponse(file, content_type='image/jpeg')
            else:
                return JsonResponse({'error': f'Error fetching avatar for: {user.email}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
class GetAvatarURLAPIView(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(id)
            profile_repo_obj = profile_repository.ProfileRepository()
            profile = profile_repo_obj.get_profile_by_user_id(user)
            print(profile)
            if profile:
                s3_service_obj = s3_service.S3Service()
                url = s3_service_obj.get_presigned_url(profile.avatar_bucket_key)
                return JsonResponse({'url': f'{url}'}, status=200)
            else:
                return JsonResponse({'error': f'Error fetching avatar for: {user.email}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
class GetProfileURLAPIView(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(id)
            profile_repo_obj = profile_repository.ProfileRepository()
            profile = profile_repo_obj.get_profile_by_user_id(user)
            print(profile)
            if profile:
                key = f"{profile.profile_photo_key}0.jpeg"
                s3_service_obj = s3_service.S3Service()
                url = s3_service_obj.get_presigned_url(key)
                return JsonResponse({'url': f'{url}'}, status=200)
            else:
                return JsonResponse({'error': f'Error fetching avatar for: {user.email}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
class GetAllProfileForMatching(APIView):
    @csrf_exempt
    def get(self, request): 
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                # TODO: Implement matching logic to get matches based on preference 
                matches = profile_repo_obj.get_all_profile_other_than_user_id(user)
                if matches:
                    return JsonResponse({'message': 'Successfully fetched Matches','matches':list(matches)})
                else:
                    return JsonResponse({'error': f'Error fetching matches for user: {user.email}'}, status=404)
            except KeyError as e:
                # Return error response for missing required field
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
                # Return error response for any unexpected exception
                logger.error(e)
                return JsonResponse({'error': f'Error fetching user: {str()}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
class AllProfiles(APIView):
    @csrf_exempt
    def get(self, request):
            profiles = profile_repository.ProfileRepository().get_all_profiles()
            if profiles:
                return JsonResponse({'profiles': list(profiles)})
            else:
                return JsonResponse({'error': 'No users to fetch/ error'}, status=400)
class GetAllMatchesAndNonMatches(APIView):
    # get all matches and non-matches
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        token = auth[1].decode('utf-8')
        id = decode_access_token(token)
        if auth and len(auth) == 2:
            # try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()

                # Get the user profile
                profile = profile_repo_obj.get_profile_by_user_id(user) 
                # Get all matches
                matches = profile_repo_obj.get_all_profiles_matched_with_current_user(profile)
                profile_service_obj = profile_service.ProfileService()
                match_list = profile_service_obj.get_list_of_incoming_requests(list(matches))
                    
                # Get all profiles that are not matches yet
                not_matches = profile_repo_obj.get_all_profiles_not_matched_with_current_user(profile)
                # get all profiles that user has matched w but they haven't matched back
                in_progress_matches = profile_repo_obj.get_in_progress_matches(profile)
                
                # get all profiles the user has rejected
                rejected_users = profile_repo_obj.get_all_profiles_rejected_by_current_user(profile) 

                return JsonResponse({
                    # 'message': 'Successfully fetched Matches and Not-Matches',
                    'matches': match_list,
                    'in_progress_matches': list(in_progress_matches),
                    'not_matches': list(not_matches),
                    'rejects': list(rejected_users)
                })
            # except KeyError as e:
            #     # Return error response for missing required field
            #     logger.error(e)
            #     return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            # except Exception as e:
            #     # Return error response for any unexpected exception
            #     logger.error(e)
            #     return JsonResponse({'error': f'Error fetching user: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
    # add match
    @csrf_exempt
    def post(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                # Assuming 'from_user_id' and 'to_user_id' are provided in the request data
                from_user_id = user.id
                to_user_id = request.data.get('to_user_id')

                # Fetch user profiles
                from_user_profile = profile_repo_obj.get_profile_by_user_id(from_user_id)
                to_user_profile = profile_repo_obj.get_profile_by_user_id(to_user_id)
                
                request_match(from_user_profile.profile_id, to_user_profile.profile_id)
                profile_service_obj = profile_service.ProfileService()

                # Add match
                action = profile_service_obj.add_match(from_user_profile, to_user_profile)
                profiles_matched = profile_repo_obj.get_all_profile_ids_matched_with_current_user(to_user_profile)
                # Add Channel between two matches to create channel on stream chat
                action_chat = False

                if from_user_profile.profile_id in list(profiles_matched):
                    stream_chat_service_obj = stream_chat_service.StreamChatService()
                    action_chat = stream_chat_service_obj.create_channel(from_user_profile,to_user_profile)

                if action:
                    return JsonResponse({'message': 'Match added successfully'})
                else:
                    return JsonResponse({'error': f'The profile you are trying to match with does not exist.: {str(e)}'}, status=400)
            except Exception as e:
                # Handle any exceptions
                logger.error(e)
                return JsonResponse({'error': f'Error adding match: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
    # remove match
    @csrf_exempt
    def delete(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                # Assuming 'from_user_id' and 'to_user_id' are provided in the request data
                from_user_id = user.id
                to_user_id = request.data.get('to_user_id')

                # Fetch user profiles
                from_user_profile = profile_repo_obj.get_profile_by_user_id(from_user_id)
                to_user_profile = profile_repo_obj.get_profile_by_user_id(to_user_id)
                reject_match(from_user_profile.profile_id, to_user_profile.profile_id)
                profile_service_obj = profile_service.ProfileService()

                profiles_matched = profile_repo_obj.get_all_profile_ids_matched_with_current_user(to_user_profile)
                # Delete Channel between two matches to on stream chat
                action_chat = False

                if from_user_profile.profile_id in list(profiles_matched):
                    stream_chat_service_obj = stream_chat_service.StreamChatService()
                    action_chat = stream_chat_service_obj.delete_channel(from_user_profile,to_user_profile)
                # Delete match
                profile_service_obj.delete_or_reject_match(from_user_profile, to_user_profile)
                return JsonResponse({'message': 'Match deleted successfully'})
            except Exception as e:
                # Handle any exceptions
                logger.error(e)
                return JsonResponse({'error': f'Error deleting match: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
class UndoDelete(APIView):
    # remove match
    @csrf_exempt
    def put(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                # Assuming 'from_user_id' and 'to_user_id' are provided in the request data
                from_user_id = user.id
                to_user_id = request.data.get('to_user_id')

                # Fetch user profiles
                from_user_profile = profile_repo_obj.get_profile_by_user_id(from_user_id)
                to_user_profile = profile_repo_obj.get_profile_by_user_id(to_user_id)
                undo_reject(from_user_profile.profile_id, to_user_profile.profile_id)
                profile_service_obj = profile_service.ProfileService()

                # Delete match
                profile_service_obj.undo_delete_match(from_user_profile, to_user_profile)
                # Recreate Channel between two matches to create channel on stream chat
                stream_chat_service_obj = stream_chat_service.StreamChatService()
                action_chat = stream_chat_service_obj.create_channel(from_user_profile,to_user_profile)
                return JsonResponse({'message': 'Match deletion undone successfully'})
            except Exception as e:
                # Handle any exceptions
                logger.error(e)
                return JsonResponse({'error': f'Error deleting match: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
class MatchRecommendations(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                user_id = user.id
                user_profile = profile_repo_obj.get_profile_by_user_id(user_id)
                result= get_match_recommendations(user_profile.profile_id)
                profile_service_obj = profile_service.ProfileService()
                ret = profile_service_obj.generate_recommendation(result)
                # logger.error(ret)
                return JsonResponse(ret, safe=False)
            except Exception as e:
                # Handle any exceptions
                logger.error(e)
                return JsonResponse({'error': f'Error fetching match recommendations: {str(e)}'}, status=500)   
        else:
            raise AuthenticationFailed('unauthenticated') 
class IncomingRequests(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                user_id = user.id
                user_profile = profile_repo_obj.get_profile_by_user_id(user_id)
                result= get_incoming_requests(user_profile.profile_id)
                profile_service_obj = profile_service.ProfileService()
                ret = profile_service_obj.get_list_of_incoming_requests(result)
                return JsonResponse(ret, safe=False)
            except Exception as e:
                # Handle any exceptions
                logger.error(e)
    @csrf_exempt
    def post(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()
                to_user_id = request.data.get('to_user_id')
                to_profile_id = profile_repo_obj.get_profile_by_user_id(to_user_id).profile_id
                user_id = user.id
                user_profile = profile_repo_obj.get_profile_by_user_id(user_id)
                add_ignore(user_profile.profile_id, to_profile_id)
                return JsonResponse({'message' : 'successfully ignored request'}, safe=False, status=200)
            except Exception as e:
                return JsonResponse({'message' : f'{e}'}, status=500)
                # Handle any exceptions
                logger.error(e)
                
class CSVFile(APIView):
    @csrf_exempt
    def get(self, request):
        all_profiles_view = GetAllMatchesAndNonMatches()
        response = all_profiles_view.get(request)
        json_response = response.content.decode('utf-8')
        content= json.loads(json_response)
        logger.error(type(content.values()))
        return Response(content.values())
        matches, in_progress, non_matches, rejects = content.get('matches'), content.get('in_progress_matches'), content.get('not_matches'), content.get('rejects')
        all_data = matches + in_progress + non_matches + rejects
        file_path = 'profiles.csv'
         # Write the data to a CSV file
        with open(file_path, 'w', newline='') as csvfile:
            fieldnames = all_data[0].keys() if all_data else []  # Use keys from the first item
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for row in all_data:
                writer.writerow(row)

        return JsonResponse({'message': 'CSV file created successfully', 'csv_file_path': file_path})
        not_matches = self.convert_to_csv(response['non_matches'])
        # Convert not_matches to CSV
        # return JsonResponse({
        #     'message': 'Successfully fetched Not-Matches in CSV format',
        #     'csv_file_path': list(response)
        # })
        matches = response['matches']
        return {'matches': matches}
        in_progress_matches = response['in_progress_matches']
        non_matches = response['not_matches']
        rejects = response['rejects']
        
        # Create a new JSON response
        json_response = {
            'matches': matches,
            'in_progress_matches': in_progress_matches,
            'not_matches': non_matches,
            'rejects': rejects
        }
        
        return JsonResponse(json_response)


    def convert_to_csv(self, data):
        file_name = 'not_matches.csv'
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)
        with open(file_path, 'w', newline='') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(data[0].keys())
            for item in data:
                writer.writerow(item.values())
        return file_path
