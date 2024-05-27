# Path: trips/api/views/itinerary_views.py
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from ..serializers import ItinerarySerializer
from ...services import itinerary_service
from user_account.repository import user_auth_repository
from user_account.models import User
from django.http import JsonResponse
from user_account.authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from rest_framework.authentication import get_authorization_header
import logging

logger = logging.getLogger(__name__)

class CreateMultipleItineraryAPIView(APIView):
    def post(self, request, *args, **kwargs):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)

                if not user or not user.is_authenticated:
                    return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

                action = itinerary_service.create_itinerary(user, request)
                if action:
                    response_data = {
                        'id': action.id,
                        'user_id': action.user.id,
                        'trip_ids': action.trip_ids,
                        'initial_location': action.initial_location,
                        'final_location': action.final_location,
                        'mode_of_transportation': action.mode_of_transportation,
                    }
                    return JsonResponse(response_data, status=status.HTTP_201_CREATED)
                else:
                    return JsonResponse({'error': 'Error creating trip'}, status=status.HTTP_400_BAD_REQUEST)

            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(e)
                return JsonResponse({'error': f'Error creating user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            raise AuthenticationFailed('unauthenticated')

class MultipleItineraryDetailAPIView(APIView):
    def delete(self, request, itinerary_id):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                user_id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(user_id)

                if not user or not user.is_authenticated:
                    return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

                try:
                    itinerary = itinerary_service.get_itinerary(itinerary_id)
                    if itinerary.user != user:
                        return JsonResponse({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
                    itinerary.delete()
                    return JsonResponse({}, status=status.HTTP_204_NO_CONTENT)
                except itinerary_service.Itinerary.DoesNotExist:
                    return JsonResponse({'error': 'Itinerary not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(e)
                return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
    def get(self, itinerary_id):
        try:
            itinerary = itinerary_service.get_itinerary(itinerary_id)
            if itinerary:
                return JsonResponse(ItinerarySerializer(itinerary).data, safe=False, status=status.HTTP_200_OK)
            else:
                return JsonResponse({'error': 'Itinerary not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f'Error fetching itinerary: {e}')
            return JsonResponse({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListMultipleItinerariesAPIView(APIView):
    def get(self, request, *args, **kwargs):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                user_id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(user_id)

                if not user or not user.is_authenticated:
                    return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

                itineraries = itinerary_service.list_itineraries_for_user(user)
                if itineraries.exists():
                    serializer = ItinerarySerializer(itineraries, many=True)
                    return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
                else:
                    return JsonResponse({'error': 'No itineraries found for user'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(e)
                return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)