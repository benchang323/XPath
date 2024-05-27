from rest_framework import serializers
from .models import LikeDestinations,Destination

class LikeDestinationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikeDestinations
        fields = ['profile', 'liked_destinations']

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = ['id', 'name', 'image_url','profile']