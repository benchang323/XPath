from django.db import models

class Profile(models.Model):
    full_name = models.CharField(max_length=100,null=True)
    preferred_name = models.TextField(null=True)
    profile_id = models.AutoField(primary_key=True)
    user = models.ForeignKey("user_account.User", on_delete=models.CASCADE,unique=True)
    gender = models.CharField(max_length=50,null=True)
    avatar_bucket_key = models.TextField(null=True)
    profile_photo_key = models.TextField(null=True)
    birthdate = models.TextField(null= True)
    languages = models.TextField(null=True)
    ethnicity = models.TextField(null=True)
    occupation = models.TextField(null=True)
    hobbies = models.TextField(null=True)
    interests = models.TextField(null=True)
    country = models.TextField(null=True)
    state = models.TextField(null=True)
    city = models.TextField(null=True)
    zipcode = models.TextField(null=True)
    favoriteAnimal = models.TextField(null=True)
    mostSpontaneous = models.TextField(null=True)
    favoriteMoviesTvShows = models.TextField(null=True)
    favoriteMusic = models.TextField(null=True)
    favoriteFood = models.TextField(null=True)
    zodiacSign = models.TextField(null=True)
    favoriteCartoonCharacter = models.TextField(null=True)
    superpowerChoice = models.TextField(null=True)
    favoriteColor = models.TextField(null=True)
    # liked_trips = models.TextField(null=True, blank=True, default='[]') 

    
    def __str__(self):
        return "{}".format(self.full_name)

class ProfileMatching(models.Model):
    from_profile = models.ForeignKey(Profile, to_field = 'profile_id', on_delete = models.CASCADE)
    to_profile = models.ForeignKey(Profile, to_field = 'profile_id', related_name='to_profile', on_delete=models.CASCADE)
    matched = models.BooleanField(default=False)


    # additional fields 
    # combined field for block/report
    blocked_reported = models.BooleanField(default=False)  # Indicates if the match is blocked or reported

    def block_report(self):
        self.matched = False  # Deactivating the match
        self.blocked_reported = True  # Indicating that the match is blocked or reported
        self.save()

    def __str__(self):
        return f'{self.from_profile.full_name} matched with {self.to_profile.full_name}'

