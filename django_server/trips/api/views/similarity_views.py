# Path: trips/api/views/similarity_views.py
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from trips.models.trip import Trip
from trips.models.trip_similarity import TripSimilarityScore
from trips.models.profile_similarity import ProfileSimilarityScore
from user_account.models import User
from trips.services import similarity_service
import logging

logger = logging.getLogger(__name__)

class CalculateTripSimilarityAPIView(APIView):
    def post(self, request, trip_id_1, trip_id_2):
        try:
            trip1 = Trip.objects.get(id=trip_id_1)
            trip2 = Trip.objects.get(id=trip_id_2)
            similarity_service.calculate_trip_similarity(trip1, trip2)
            return Response({'message': 'Similarity calculation initiated/updated'}, status=status.HTTP_200_OK)
        except Trip.DoesNotExist:
            return JsonResponse({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

class CalculateProfileSimilarityAPIView(APIView):
    def post(self, request, user_id_1, user_id_2):
        try:
            user1 = User.objects.get(id=user_id_1)
            user2 = User.objects.get(id=user_id_2)
            similarity_service.calculate_profile_similarity(user1, user2)
            return Response({'message': 'Profile similarity calculation initiated/updated'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
