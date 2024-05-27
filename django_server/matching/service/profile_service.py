# backend/matching/service/profile_service.py
from matching.models import Profile, ProfileMatching
from matching.repository import profile_repository
from matching.service import s3_service
import logging


logger = logging.getLogger(__name__)
class ProfileService:
    
    def build_user_profile(self,body,user_auth,profile_path,avatar_path):
            
            new_profile = Profile.objects.create(
            full_name = body["fullName"],
            gender = body["gender"],
            avatar_bucket_key = avatar_path,
            profile_photo_key = profile_path,
            languages = body["languages"],
            ethnicity = body["ethnicity"],
            user_bio = body["bio"],
            current_address = body["currentAddress"],
            work_address = body["workAddress"],
            hometown = body["hometown"],
            interests = body["interests"],
            preferred_commute_times = body["preferredCommuteTimes"],
            user = user_auth)
            return new_profile
    
    def perform_update_user_profile(self,body,user_auth):         
        profile_repository_obj = profile_repository.ProfileRepository()
        profile = profile_repository_obj.get_profile_by_user_id(user_auth)
        profile.full_name = body["fullName"]
        profile.gender = body["gender"]
        profile.languages = body["languages"]
        profile.ethnicity = body["ethnicity"]
        profile.user_bio = body["bio"]
        profile.current_address = body["currentAddress"]
        profile.work_address = body["workAddress"]
        profile.hometown = body["hometown"]
        profile.interests = body["interests"]
        profile.preferred_commute_times = body["preferredCommuteTimes"]
        profile = profile.save()
        return profile

    # creates a new profile for user
    def create_profile(self,body,profile_file,avatar_file,user_auth):
        try:
            profile_pic_path = "profile_pictures/"+str(user_auth.username)+".jpg"
            avatar_pic_path = "avatars/"+str(user_auth.username)+".jpg"
            profile = self.build_user_profile(body,user_auth,profile_pic_path,avatar_pic_path)
            # handle posting to s3
            s3_client_obj = s3_service.S3Service()
            # store both profile picture and avatar to s3
            s3_client_obj.store_object(profile_file,profile_pic_path)
            s3_client_obj.store_object(avatar_file,avatar_pic_path)
            return True
        except Exception as e:
            logger.error(e)
            return False
    
    # updates user profile for user
    def update_profile(self,body,profile_file,avatar_file,user_auth):
        try:
            profile_pic_path = "profile_pictures/"+str(user_auth.username)+".jpg"
            avatar_pic_path = "avatars/"+str(user_auth.username)+".jpg"
            profile = self.perform_update_user_profile(body,user_auth)
            # handle posting to s3
            s3_client_obj = s3_service.S3Service()
            # update both profile picture and avatar to s3 if newly sent via front end
            if profile_file:
                s3_client_obj.store_object(profile_file,profile_pic_path)
            if avatar_file:
                s3_client_obj.store_object(avatar_file,avatar_pic_path)
            return True
        except Exception as e:
            logger.error(e)
            return False
    # delete user profile
    def delete_profile(self,user_auth):
        try:
            profile_pic_path = "profile_pictures/"+str(user_auth.username)+".jpg"
            avatar_pic_path = "avatars/"+str(user_auth.username)+".jpg"
            profile_repository_obj = profile_repository.ProfileRepository()
            profile = profile_repository_obj.get_profile_by_user_id(user_auth).delete()
            # handle deleting  s3 objs
            s3_client_obj = s3_service.S3Service()
            # delete both profile picture and avatar from s3
            s3_client_obj.delete_object(profile_pic_path)
            s3_client_obj.delete_object(avatar_pic_path)
            return True
        except Exception as e:
            print(e)
            return False
        
    # add a match between two profiles
    def add_match(self, from_profile, to_profile):
        try:
            match, created = ProfileMatching.objects.get_or_create(from_profile=from_profile, to_profile=to_profile)
            if not created:
                match.matched = True
                match.save()
            return True
        except Exception as e:
            return False
    
    def delete_or_reject_match(self, from_profile, to_profile):
        try:
            # Check if the match exists
            # match_exists = ProfileMatching.objects.filter(from_profile=from_profile, to_profile=to_profile, matched=True).exists()

            # if match_existss
                match, created = ProfileMatching.objects.get_or_create(from_profile=from_profile, to_profile=to_profile)
                if not created:
                    match.matched = False
                    match.save()
                    return True
                if created:
                    created.matched = False
                    created.save()
                    return True  # Indicate successful deletion
        except Exception as e:
            return False  # Indicate that the match doesn't exist