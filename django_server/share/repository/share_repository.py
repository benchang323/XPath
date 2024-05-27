from matching.models import Profile
from matching.repository.profile_repository import ProfileRepository
from share.models import ShareProfileGeneral, ShareProfileSpecific
import logging
from django.db.models import Q


logger = logging.getLogger(__name__)

class ShareRepository:
    #gets profile by user auth, assuming that user auth is a friend
    def get_user_sharing_status_by_id(self, user_id):
        #ProfileRepository.get_all_profiles_matched_with_current_user(self=self, user_auth=user_auth)
        profile = ProfileRepository.get_profile_by_user_id(user_id)
        share = ShareProfileGeneral.objects.get(profile=profile)
        return share.allow_all_share
        
        return False  # Returning False as a safe default if exceptions occur.
    def get_user_sharing_status_by_profile(self, profile):
        logger.error('Profile encountered: %s', profile)
        try:
            share = ShareProfileGeneral.objects.get(profile=profile)
            return share.allow_all_share
        except ShareProfileGeneral.DoesNotExist:
            logger.error('ShareProfileGeneral does not exist for profile: %s', profile)
            return None  # Indicate that the object does not exist.


    def add_friend_to_sharing_list (self, profile, friend_profile):
        from_profile = ShareProfileGeneral.objects.get(profile=profile)
        if not ShareProfileSpecific.objects.filter(profile=from_profile, share_with=friend_profile).exists():
            ShareProfileSpecific.objects.create(profile=from_profile, share_with=friend_profile)
        return True
    
    def get_ability_to_share_friend(self, profile, friend_profile):
        try:
            # Retrieve the general sharing settings for the friend's profile
            share = ShareProfileGeneral.objects.get(profile=friend_profile)
            
            # Check if sharing is allowed globally
            if share.allow_all_share:
                logger.info(f"Global sharing enabled for profile: {friend_profile}")
                return True
            
            # Retrieve all specific shares related to this profile
            specific_shares = ShareProfileSpecific.objects.filter(profile=share)
            
            # Check if any of the specific shares include the current profile
            can_share = specific_shares.filter(share_with=profile).exists()
            
            if can_share:
                logger.info(f"Specific sharing permission found for profile: {profile} in friend_profile: {friend_profile}")
            else:
                logger.info(f"No sharing permission for profile: {profile} in friend_profile: {friend_profile}")
            
            return can_share
        except ShareProfileGeneral.DoesNotExist:
            # Log the error with the friend_profile to assist debugging
            logger.error(f'ShareProfileGeneral does not exist for friend_profile: {friend_profile}')
            return False

    def check_share_general_exists(self, user_profile):
        return ShareProfileGeneral.objects.filter(profile=user_profile).exists()

    def remove_specific_sharing(self, user_profile, friend_profile):
        try:
            from_profile = ShareProfileGeneral.objects.get(profile=user_profile)
            specific_share = ShareProfileSpecific.objects.filter(profile=from_profile, share_with=friend_profile)
            
            if specific_share.exists():
                specific_share.delete()
                return True
            else:
                return False
        except ShareProfileGeneral.DoesNotExist:
            return False

        
    def get_all_users_profile_shares_with(self, profile):
        from_profile = ShareProfileGeneral.objects.get(profile=profile)
        shares = ShareProfileSpecific.objects.filter(profile=from_profile).values('share_with')
        return list(shares)

    def change_sharing_status(self, profile):
        profile.allow_all_share = not profile.allow_all_share
        profile.save()