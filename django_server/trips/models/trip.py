# Path: trips/models/trip.py
from django.db import models
from django.conf import settings
from django.db.models import JSONField

class Trip(models.Model):
    TRANSPORTATION_CHOICES = [
        ('train', 'Train'),
        ('bus', 'Bus'),
        ('plane', 'Plane'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trips')
    type = models.CharField(max_length=10, choices=TRANSPORTATION_CHOICES, null=True, blank=True)
    start = models.CharField(max_length=255, null=True, blank=True)
    end = models.CharField(max_length=255, null=True, blank=True)
    start_time = models.DateTimeField(null=True)
    route = JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s trip from {self.start} to {self.end} by {self.get_type_display()} at {self.start_time}"

    def to_list(self):
        return [
            self.id,
            self.start,
            self.end,
            self.user.username,
            self.get_type_display(),
            self.start_time
        ]
