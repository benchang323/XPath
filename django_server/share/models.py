from django.db import models
from matching.models import Profile


class ShareProfileGeneral(models.Model):
    profile = models.ForeignKey(Profile, to_field='profile_id', on_delete=models.CASCADE, unique=True)
    allow_all_share = models.BooleanField(default=False)

class ShareProfileSpecific(models.Model):
    profile = models.ForeignKey(ShareProfileGeneral, to_field='profile', on_delete=models.CASCADE)
    share_with = models.ForeignKey(Profile, to_field='profile_id', on_delete=models.CASCADE)

    def __str__(self):
        return f'Share settings for {self.profile.full_name}'