# backend/matching/repository/profile_repository.py
from ..models import Profile,ProfileMatching
from chat_app.models import ProfileChatToken
class ProfileRepository:
    # saves profile
    def save_profile(self,profile):
        return profile.save()
    #gets profile by user auth
    def get_profile_by_user_id(self,user_auth):
        return Profile.objects.filter(user=user_auth).first()
    def get_profile_by_profile_id(self,profile_id):
        return Profile.objects.filter(profile_id=profile_id).first()
    #gets all profiles
    def get_all_profiles(self):
       return Profile.objects.values()
    # returns all profiles except given user
    def get_all_profile_other_than_user_id(self,user_auth):
        return Profile.objects.exclude(user=user_auth).values()
    def get_Profiletoken_by_profile(self,profile):
        return ProfileChatToken.objects.filter(profile=profile).first()
    def save_profile_token(self,profile_token):
        return profile_token.save()

    
    #returns all profiles matched with given user
    def get_all_profiles_matched_with_current_user(self, user_auth):
    # Get the list of user profiles that have a match with the current user (from to_user)
        matches_to_user = ProfileMatching.objects.filter(from_profile=user_auth, matched=True).values('to_profile')
        # Get the list of user profiles that have a match with the current user (from from_user)
        matches_from_user = ProfileMatching.objects.filter(to_profile=user_auth, matched=True).values('from_profile')
        # get profile IDs from both match directions
        to_user_profile_ids = set([match['to_profile'] for match in matches_to_user])
        from_user_profile_ids = set([match['from_profile'] for match in matches_from_user])
        mutual_matches = mutual_matches = to_user_profile_ids & from_user_profile_ids
        # return profile objects that are mutuals (basically both users have had to have matched with each other)
        matched_profiles = Profile.objects.filter(pk__in=mutual_matches).values()

        return matched_profiles
        #returns all profiles matched with given user
    def get_all_profile_ids_matched_with_current_user(self, profile):
    # Get the list of user profiles that have a match with the current user (from to_user)
        matches_to_user = ProfileMatching.objects.filter(from_profile=profile, matched=True).values('to_profile')
        # Get the list of user profiles that have a match with the current user (from from_user)
        matches_from_user = ProfileMatching.objects.filter(to_profile=profile, matched=True).values('from_profile')
        # get profile IDs from both match directions
        to_user_profile_ids = set([match['to_profile'] for match in matches_to_user])
        from_user_profile_ids = set([match['from_profile'] for match in matches_from_user])
        mutual_matches = mutual_matches = to_user_profile_ids & from_user_profile_ids
        # return profile objects that are mutuals (basically both users have had to have matched with each other)
        matched_profiles = Profile.objects.filter(pk__in=mutual_matches).values_list('profile_id', flat=True)

        return matched_profiles
    
    def get_in_progress_matches(self, user_auth):
        # Get the list of user profiles that have a match with the current user (from to_user)
        matches_to_user = ProfileMatching.objects.filter(from_profile=user_auth, matched=True).values('to_profile')
        # Get the list of user profiles that have a match with the current user (from from_user)
        matches_from_user = ProfileMatching.objects.filter(to_profile=user_auth, matched=True).values('from_profile')
        # get profile IDs from both match directions
        to_user_profile_ids = [match['to_profile'] for match in matches_to_user]
        from_user_profile_ids = [match['from_profile'] for match in matches_from_user]
        # common profile IDs where the match is one-sided
        in_progress_match_ids = set(to_user_profile_ids) - set(from_user_profile_ids)
        # return only the matches the user has matched w but those profiles haven't matched back (or rejected)
        in_progress_matches = Profile.objects.filter(pk__in=in_progress_match_ids).values()

        return in_progress_matches
    
    #returns all profiles that are NOT currently matched with given user
    def get_all_profiles_not_matched_with_current_user(self, user_auth):
        # Get the list of user profiles that have a match with the current user
        matched_profiles = ProfileMatching.objects.filter(from_profile=user_auth).values('to_profile')
        # Extract the profile IDs from the matched_profiles queryset
        profile_ids = [matched_profile['to_profile'] for matched_profile in matched_profiles]
        # Exclude the profiles that are already matched with the current user
        not_matched_profiles = Profile.objects.exclude(pk__in=profile_ids).exclude(pk=user_auth.profile_id).values()
        return not_matched_profiles
    
    def get_all_profiles_rejected_by_current_user(self, user_auth):
        # get all matches that were rejected by user
        matched_profiles = ProfileMatching.objects.filter(from_profile=user_auth, matched=False).values('to_profile')
        profile_ids = [matched_profile['to_profile'] for matched_profile in matched_profiles]
        return Profile.objects.filter(pk__in=profile_ids).values()
    def get_list_of_incoming_requests(self, profile_id_list):
        return Profile.objects.filter(pk__in=profile_id_list).values()