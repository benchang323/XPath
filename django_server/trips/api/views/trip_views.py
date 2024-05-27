# Path: django_server/trips/api/views/trip_views.py
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from ..serializers import TripSerializer
from trips.models.trip import Trip
from trips.services import trip_service
from user_account.repository import user_auth_repository
from django.http import JsonResponse
from user_account.models import User
from user_account.authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from rest_framework.authentication import get_authorization_header
import logging

logger = logging.getLogger(__name__)

class CreateTripAPIView(APIView):

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

                action = trip_service.create_trip(user, request)
                if action:
                    response_data = {
                        'id': action.id,
                        'user_id': action.user.id,
                        'type': action.type,
                        'start': action.start,
                        'end': action.end,
                        'start_time': action.start_time  
                    }
                    return JsonResponse(response_data, status=status.HTTP_201_CREATED)
                else:
                    return JsonResponse({'error': 'Error creating trip'}, status=status.HTTP_400_BAD_REQUEST)

            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
                logger.error(e)
                return JsonResponse({'error': f'Error creating user: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated')

class ListTripsForUserAPIView(APIView):
    def get(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try: 
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)

                if not user or not user.is_authenticated: 
                    return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
                action = trip_service.list_trips_for_user(user)
                if action:
                    return action
                else:
                    return JsonResponse({'error': 'No trips found for user'}, status=status.HTTP_404_NOT_FOUND)
            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
                logger.error(e)
                return JsonResponse({'error': f'Error creating user: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated') 

class TripDetailAPIView(APIView):
    def get(self, request, trip_id):
        try:
            trip = Trip.objects.get(id=trip_id)
            return JsonResponse(TripSerializer(trip).data)
        except Trip.DoesNotExist:
            return JsonResponse({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, trip_id):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try: 
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)

                if not user or not user.is_authenticated: 
                    return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
                
                action = trip_service.update_trip(trip_id, user, request)
                if action:
                    response_data = {
                        'id': action.id,
                        'user_id': action.user.id,
                        'type': action.type,
                        'start': action.start,
                        'end': action.end,
                        'start_time': action.start_time.isoformat() if action.start_time else None,
                    }
                    return JsonResponse(response_data, status=status.HTTP_200_OK)
                else:
                    return JsonResponse({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
            except KeyError as e:
                logger.error(e)
                return JsonResponse({'error': f'Missing required field: {e}'}, status=400)
            except Exception as e:
                logger.error(e)
                return JsonResponse({'error': f'Error creating user: {str(e)}'}, status=500)
        else:
            raise AuthenticationFailed('unauthenticated') 

    def delete(self, request, trip_id):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(id)

                if not user or not user.is_authenticated: 
                    return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
                try:
                    trip = Trip.objects.get(id=trip_id, user=user)
                    trip.delete()
                    return JsonResponse({}, status=status.HTTP_204_NO_CONTENT)
                except Trip.DoesNotExist:
                    return JsonResponse({}, status=status.HTTP_204_NO_CONTENT)

            except KeyError as e:
                logger.error(f"Missing required field: {e}")
                return JsonResponse({'error': 'Missing required field'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                return JsonResponse({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
