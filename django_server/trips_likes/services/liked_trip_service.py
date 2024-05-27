from trips_likes.models import LikeDestinations
from matching.repository import profile_repository
import logging
import json
from graph_converter.views import get_all_destinations_liked_by_profile


logger = logging.getLogger(__name__)

class LikedDestinationsService:
    def like_destination_for_user(self, user_auth, destination_name):
        profile_repository_obj = profile_repository.ProfileRepository()
        profile = profile_repository_obj.get_profile_by_user_id(user_auth)

        if profile is None:
            logger.error(f"No profile found for user_auth: {user_auth}")
            return False


        like_destinations, _ = LikeDestinations.objects.get_or_create(profile=profile)
        like_destinations.like_destination(destination_name)
        return True

    def unlike_destination_for_user(self, user_auth, destination_name):
        profile_repository_obj = profile_repository.ProfileRepository()
        profile = profile_repository_obj.get_profile_by_user_id(user_auth)
        
        if profile is None:
            logger.error(f"No profile found for user_auth: {user_auth}")
            return False

        try:
            like_destinations = LikeDestinations.objects.get(profile=profile)

        except LikeDestinations.DoesNotExist:
            logger.error("No like records found for profile: %s", profile)
            return False
        
        like_destinations.unlike_destination(destination_name)
        return True

    def is_destination_liked_by_user(self, user_auth, destination_name):

        try:
            profile_repository_obj = profile_repository.ProfileRepository()
            profile = profile_repository_obj.get_profile_by_user_id(user_auth)
            
            if profile is None:
                logger.error(f"No profile found for user_auth: {user_auth}")
                return False
            

            like_destinations = LikeDestinations.objects.get(profile=profile)
            return destination_name in like_destinations.liked_destinations
        
        except LikeDestinations.DoesNotExist:
            return False


    def get_all_liked_destinations_for_user(self, destinations):
        ret = []
        for dest in destinations:
            ret.append({'destination': dest})