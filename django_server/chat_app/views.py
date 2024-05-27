from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
from rest_framework.exceptions import  AuthenticationFailed
from django.views.decorators.csrf import csrf_exempt

from user_account.repository import user_auth_repository
from matching.repository import profile_repository
from rest_framework.authentication import get_authorization_header
from user_account.authentication import decode_access_token
from .service import stream_chat_service
import logging


logger = logging.getLogger(__name__)
class GetStreamChatDetails(APIView):
    # Get stream chat details for the user
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        token = auth[1].decode('utf-8')
        id = decode_access_token(token)
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)
                profile_repo_obj = profile_repository.ProfileRepository()

                # Get the user profile
                profile = profile_repo_obj.get_profile_by_user_id(user) 
                profile_token = profile_repo_obj.get_Profiletoken_by_profile(profile)

                # return response with details
                return JsonResponse({
                    'profileId': profile.profile_id,
                    'streamChatToken': profile_token.streamChatToken,
                    'name': profile.preferred_name
                })
            except KeyError as e:
                # Return error response for missing required field
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
                # Return error response for any unexpected exception
                logger.error(e)
                return JsonResponse({'error': f'Error fetching user: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')
class OtherUserInChat(APIView):
    # Get stream chat details for the user using channel ID from the URL
    def get(self, request, connectionID):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)

                profile_repo_obj = profile_repository.ProfileRepository()
                profile = profile_repo_obj.get_profile_by_user_id(user)
                
                # Use the connectionID as the channel ID
                channel = connectionID
                if channel:
                    split = channel.split("-")
                    user_one = int(split[2])
                    user_two = int(split[3])
                    other_user_id = user_two if user_one == profile.profile_id else user_one
                    return JsonResponse({'ret': other_user_id})
                else:
                    return JsonResponse({'error': 'Channel ID is required'})

            except KeyError as e:
                # Return error response for missing required field
                return JsonResponse({'error': f'Missing required field: {str(e)}'})
            except Exception as e:
                # Return error response for any unexpected exception
                return JsonResponse({'error': f'Error getting other user: {str(e)}'})
        else:
            raise AuthenticationFailed('Authentication required')

import openai
from rest_framework.response import Response

class ChatBot(APIView):
    @csrf_exempt
    def post(self, request):
        channel_id = request.headers.get("channel_id")
        message = request.data.get("message")
        history = request.data.get("history")

        # Set up OpenAI API key
        openai.api_key = "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"

        # Prepare the prompt for the OpenAI API
        prompt = f"{history}\nUser: {message}\nAssistant:"

        # Call the OpenAI API to generate a response
        response = openai.Completion.create(
            engine="davinci",
            prompt=prompt,
            max_tokens=100,
            n=1,
            stop=None,
            temperature=0.7,
        )

        # Extract the generated response from the API result
        chatbot_response = response.choices[0].text.strip()

        # Send the chatbot response to the Stream Chat channel
        stream_chat_service_obj = stream_chat_service.StreamChatService()
        stream_chat_service_obj.send_message(channel_id, chatbot_response)

        return Response({"message": chatbot_response})