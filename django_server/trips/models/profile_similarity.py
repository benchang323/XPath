# Path: trips/models/profile_similarity.py
from django.db import models
from user_account.models import User

class ProfileSimilarityScore(models.Model):
    profile_1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile_similarities_1', db_column='profile_1')
    profile_2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile_similarities_2', db_column='profile_2')
    similarity_score = models.FloatField()

    def __str__(self):
        return f"Similarity between profile {self.profile_1.id} and {self.profile_2.id}: {self.similarity_score}"
