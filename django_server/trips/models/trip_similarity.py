# Path: trips/models/trip_similarity.py
from django.db import models
from .trip import Trip
class TripSimilarityScore(models.Model):
    trip_id_1 = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='trip_similarities_1', db_column='trip_id_1')
    trip_id_2 = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='trip_similarities_2', db_column='trip_id_2')
    similarity_score = models.FloatField(default=0.5)
    def __str__(self):
        return f"Similarity between trip {self.trip_id_1.id} and {self.trip_id_2.id}: {self.similarity_score}"
