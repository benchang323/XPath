from rest_framework import serializers
from .models import Profile
from user_account.models import User  # Assuming the User model is defined in user_account app

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['full_name', 'preferred_name', 'profile_id', 'user', 'gender', 
                  'avatar_bucket_key', 'profile_photo_key', 'birthdate', 'languages', 
                  'ethnicity', 'occupation', 'hobbies', 'interests', 'country', 
                  'state', 'city', 'zipcode', 'favoriteAnimal', 'mostSpontaneous', 
                  'favoriteMoviesTvShows', 'favoriteMusic', 'favoriteFood', 
                  'zodiacSign', 'favoriteCartoonCharacter', 'superpowerChoice', 
                  'favoriteColor']

