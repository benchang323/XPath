# Path: trips/api/serializers.py
from rest_framework import serializers
from trips.models import Trip, TripSimilarityScore, Itinerary, ProfileSimilarityScore  # Resolved import line
from user_account.models import User

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['id', 'type', 'start', 'end', 'start_time', 'route', 'user']
        
class ProfileSimilaritySerializer(serializers.ModelSerializer):  # Keep this class from iteration-3
    class Meta:
        model = ProfileSimilarityScore
        fields = ['id', 'profile_1', 'profile_2', 'similarity_score']

class SimilaritySerializer(serializers.ModelSerializer):
    class Meta:
        model = TripSimilarityScore
        fields = ['id', 'trip_id_1', 'trip_id_2', 'similarity_score']

class ItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Itinerary
        fields = ['id', 'user', 'trip_ids', 'initial_location', 'final_location', 'mode_of_transportation']