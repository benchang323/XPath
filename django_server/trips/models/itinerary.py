# Path: trips/models/itinerary.py
from django.db import models
from django.contrib.auth import get_user_model

class Itinerary(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='itineraries')
    trip_ids = models.TextField()
    initial_location = models.CharField(max_length=255)
    final_location = models.CharField(max_length=255)
    mode_of_transportation = models.CharField(max_length=255)

    def __str__(self):
        return f"Itinerary {self.id} for {self.user}"