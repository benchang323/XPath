from django.db import models
from matching.models import Profile
# Create your models here.
class ProfileChatToken(models.Model):
    profile = models.ForeignKey(Profile, to_field = 'profile_id', on_delete = models.CASCADE)
    streamChatToken = models.TextField(null=True)