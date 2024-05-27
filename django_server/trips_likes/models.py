from django.db import models
import json
from matching.models import Profile
import uuid
from django.core.exceptions import ValidationError
from random import randint
from django.conf import settings
from django.contrib.auth import get_user_model



class Destination(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # trip_id = models.IntegerField(unique=False)
    name = models.CharField(max_length=255)
    image_url = models.URLField(default='https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, related_name='destinations')
    
    def __str__(self):
        return self.name

class Recommendation(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='recommendations')
    # user = models.ForeignKey("user_account.User", on_delete=models.CASCADE)
    # user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    # profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='recommended_destinations')
    city_name = models.CharField(max_length=100)
    count = models.IntegerField(default=1)

    class Meta:
        unique_together = ('user', 'city_name')


class LikeDestinations(models.Model):
    # Use Profile 
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='liked_destinations')
    liked_destinations = models.TextField(null=True, blank=True, default='[]')
    #stores a list of liked destinations

    def like_destination(self, destination_name):
        
        if not self.liked_destinations:
            self.liked_destinations = json.dumps([])
        liked_destinations_list = json.loads(self.liked_destinations)

       
        if destination_name not in liked_destinations_list:
            liked_destinations_list.append(destination_name)
            self.liked_destinations = json.dumps(liked_destinations_list)   
            self.save()

        pass
    def unlike_destination(self, destination_name):
        
        # Proceed only if liked_destinations is initialized
        if not self.liked_destinations:
            return
        liked_destinations_list = json.loads(self.liked_destinations)

        # Remove destination_name if present
        if destination_name in liked_destinations_list:
            liked_destinations_list.remove(destination_name)
            self.liked_destinations = json.dumps(liked_destinations_list)
            self.save()

        pass

    class Meta:
        app_label = 'trips_likes'
