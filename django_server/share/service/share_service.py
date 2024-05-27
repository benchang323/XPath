from ..models import ShareProfileSpecific, ShareProfileGeneral
import logging
from django.db.models import Q
from image_gen.views import generateImage
from django.core.exceptions import ObjectDoesNotExist
from ..repository import share_repository

logger = logging.getLogger(__name__)
class ShareService:

    def create_sharing_profile(self, profile, allow_all_share):
        # Try to get an existing match that might not be active, blocked, or reported\
        try:
            ShareProfileGeneral.objects.get_or_create(
                profile=profile, 
                allow_all_share=allow_all_share,
            )
            return True
        except Exception as e:
            return False 
    def change_sharing_status(self, profile):
        share_profile = ShareProfileGeneral.objects.get(profile=profile)
        if share_profile: 
            share_repo_obj = share_repository.ShareRepository()
            if share_repo_obj.change_sharing_status(share_profile):
                return True
        return False

    def add_sharing_profile(self, profile, friend_profile):
        share_repo_obj = share_repository.ShareRepository()
        result = share_repo_obj.add_friend_to_sharing_list(profile, friend_profile)
        if result is None:
            # Handle case where ShareProfileGeneral or ShareProfileSpecific does not exist
            logger.error("Attempt to add to sharing list failed because one of the profiles doesn't exist.")
            return False
        return True
    def remove_sharing_profile(self, user_profile, friend_profile):
        share_repo = share_repository.ShareRepository()  # Initialize the ShareRepository
        
        try:
            # Use ShareRepository to check if general sharing settings exist for the user
            share_general_exists = share_repo.check_share_general_exists(user_profile)
            
            if not share_general_exists:
                # If no general sharing settings found, log and return False
                logger.error(f"No general sharing settings found for user profile: {user_profile}")
                return False
            
            # Use ShareRepository to remove the specific sharing permission
            removal_success = share_repo.remove_specific_sharing(user_profile, friend_profile)
            
            if removal_success:
                logger.info(f"Successfully removed sharing permission for friend profile: {friend_profile}")
                return True
            else:
                logger.info(f"No specific sharing permission found for friend profile: {friend_profile} to remove")
                return False

        except Exception as e:
            # Log any unexpected errors
            logger.error(f"Error occurred while removing sharing permission: {e}")
            return False



    def get_all_shared_with(self, profile):
       share_repo_obj = share_repository.ShareRepository() 
       return share_repo_obj.get_all_users_profile_shares_with(profile)
   
    def is_in_shared_list(self, profile, friend):
      share_repo_obj = share_repository.ShareRepository()  
      return share_repo_obj.get_ability_to_share_friend(profile=profile, friend_profile=friend)
      