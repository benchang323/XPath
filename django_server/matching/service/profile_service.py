# backend/matching/service/profile_service.py
from matching.models import Profile, ProfileMatching
from matching.repository import profile_repository
from matching.service import s3_service
from chat_app.service import stream_chat_service
import logging
from django.db.models import Q
from .. import serializer
from image_gen.views import generateImage
from django.core.exceptions import ObjectDoesNotExist

logger = logging.getLogger(__name__)
class ProfileService:
    def block_match(self, to_profile_id):
        try:
            match = ProfileMatching.objects.get(to_profile=to_profile_id)
            match.block_report()
            # Unmatch the profiles after blocking
            self.delete_or_reject_match(match.from_profile, to_profile_id)
            return True
        except ProfileMatching.DoesNotExist:
            return False

    def report_match(self, to_profile_id):
        try:
            match = ProfileMatching.objects.get(to_profile=to_profile_id)
            match.block_report()
            # Unmatch the profiles after reporting
            self.delete_or_reject_match(match.from_profile, to_profile_id)
            return True
        except ProfileMatching.DoesNotExist:
            return False

    # This method checks if there's a block or report status between the two profiles
    def can_be_matched(self, from_profile_id, to_profile_id):
        existing_matches = ProfileMatching.objects.filter(
            ((Q(from_profile_id=from_profile_id) & Q(to_profile_id=to_profile_id)) |
            (Q(from_profile_id=to_profile_id) & Q(to_profile_id=from_profile_id))) &
            (Q(blocked_reported=True))
        )
        return not existing_matches.exists()

    

    def build_user_profile(self,body,user_auth,profile_path,avatar_path):
        new_profile = Profile.objects.create(
        full_name=body.get("full_name"),
        preferred_name=body.get("preferred_name"),
        gender=body.get("gender"),
        avatar_bucket_key=avatar_path,
        profile_photo_key=profile_path,
        languages=body.get("languages"),
        ethnicity=body.get("ethnicity"),
        occupation=body.get("occupation"),
        hobbies=body.get("hobbies"),
        interests=body.get("interests"),
        country=body.get("country"),
        state=body.get("state"),
        city=body.get("city"),
        zipcode=body.get("zipcode"),
        favoriteAnimal=body.get("favoriteAnimal"),
        mostSpontaneous=body.get("mostSpontaneous"),
        favoriteMoviesTvShows=body.get("favoriteMoviesTvShows"),
        favoriteMusic=body.get("favoriteMusic"),
        favoriteFood=body.get("favoriteFood"),
        zodiacSign=body.get("zodiacSign"),
        favoriteCartoonCharacter=body.get("favoriteCartoonCharacter"),
        superpowerChoice=body.get("superpowerChoice"),
        favoriteColor=body.get("favoriteColor"),
        birthdate = '2000-03-20', # random doesnt matter
        user=user_auth
        )
        return new_profile
    
    def perform_update_user_profile(self,body,user_auth):         
        profile_repository_obj = profile_repository.ProfileRepository()
        profile = profile_repository_obj.get_profile_by_user_id(user_auth)
        profile.full_name = body.get("full_name")
        profile.preferred_name = body.get("preferred_name")
        profile.gender = body.get("gender")
        profile.languages = body.get("languages")
        profile.ethnicity = body.get("ethnicity")
        profile.hobbies = body.get("hobbies")
        profile.interests=body.get("interests")
        profile.occupation = body.get("occupation")
        profile.country = body.get("country")
        profile.state = body.get("state")
        profile.city = body.get("city")
        profile.zipcode = body.get("zipcode")
        profile.favoriteAnimal = body.get("favoriteAnimal")
        profile.mostSpontaneous = body.get("mostSpontaneous")
        profile.favoriteMoviesTvShows = body.get("favoriteMoviesTvShows")
        profile.favoriteMusic = body.get("favoriteMusic")
        profile.favoriteFood = body.get("favoriteFood")
        profile.zodiacSign = body.get("zodiacSign")
        profile.favoriteCartoonCharacter = body.get("favoriteCartoonCharacter")
        profile.superpowerChoice = body.get("superpowerChoice")
        profile.favoriteColor = body.get("favoriteColor")
        profile.birthdate = '2000-03-20' #body.get("birthdate")

        profile = profile.save()
        return profile

    # creates a new profile for user
    def create_profile(self, body, profile_files, user_auth):
        try:
            profile_pics_path = f"profile_pictures/{user_auth.id}/"
            # Check if the folder exists in DigitalOcean Spaces
            s3_client_obj = s3_service.S3Service()
            s3_client_obj.create_folder(profile_pics_path)
            animal = body["favoriteAnimal"]
            occupation = body["occupation"]
            prompt = f"Funny cartoon art vaporstyle of one {occupation} {animal}. There not be any text accompanying it AT ALL. Make it look like it's from a kid's cartoon TV show like Arthur, Word Girl, Curious George, Dinosaur Train etc. It should be wholesome yet still be a {occupation} {animal}. Again, there should be no text."
            generateImage(prompt, "avatars", user_auth.id)
            avatar_pic_path = f"avatars/{user_auth.id}.jpeg"
            profile = self.build_user_profile(body, user_auth, profile_pics_path, avatar_pic_path)

            for index, profile_file in enumerate(profile_files):
                profile_pic_path = f"{profile_pics_path}{index}.jpeg"
                # handle posting to s3
                s3_client_obj = s3_service.S3Service()
                # store both profile picture and avatar to s3
                s3_client_obj.store_object(profile_file, profile_pic_path)
            # Add code to call the stream chat service to create account for user there
            stream_chat_service_obj = stream_chat_service.StreamChatService()
            stream_chat_service_obj.create_user(profile)
            stream_chat_service_obj.create_chat_with_chatbot(profile)

            return True
        except Exception as e:
            logger.error(e)
            return False

    
    # updates user profile for user
    def update_profile(self,body,profile_file,user_auth):
        try:
            profile_pic_path = "profile_pictures/"+str(user_auth.id)+"/0.jpeg"
            # avatar_pic_path = "avatars/"+str(user_auth.id)+".jpeg"
            profile = self.perform_update_user_profile(body,user_auth)
            # handle posting to s3
            s3_client_obj = s3_service.S3Service()
            # update both profile picture and avatar to s3 if newly sent via front end
            if profile_file:
                s3_client_obj.store_object(profile_file,profile_pic_path)
            # if avatar_file:
            #     s3_client_obj.store_object(avatar_file,avatar_pic_path)
            return True
        except Exception as e:
            logger.error(e)
            return False
    # delete user profile
    def delete_profile(self, user_auth):
        try:
            # Construct path for the folder containing profile and avatar pictures
            folder_path = f"profile_pictures/{user_auth.id}/"
            avatar_path = f"avatars/{user_auth.id}.jpeg"
            # Delete the profile object
            profile_repository_obj = profile_repository.ProfileRepository()
            profile = profile_repository_obj.get_profile_by_user_id(user_auth)
            # s3_client_obj = s3_service.S3Service()
            # s3_client_obj.delete_object(avatar_path)
            if profile:
                profile.delete()

            # Handle deleting the entire folder from DigitalOcean Spaces
            s3_client_obj = s3_service.S3Service()
            s3_client_obj.delete_folder(folder_path)
            s3_client_obj.delete_object(avatar_path)
            return True
        except Exception as e:
            logger.error(e)
            return False

        
    # add a match between two profiles
    # def add_match(self, from_profile, to_profile):
    #     try:
    #         match, created = ProfileMatching.objects.get_or_create(from_profile=from_profile, to_profile=to_profile)
    #         if not created:
    #             match.matched = True
    #             match.save()
    #         return True
    #     except Exception as e:
    #         return False
        
    def add_match(self, from_profile, to_profile):
            if self.can_be_matched(from_profile.profile_id, to_profile.profile_id):
                try:
                    # Try to get an existing match that might not be active, blocked, or reported
                    match, created = ProfileMatching.objects.get_or_create(
                        from_profile=from_profile, 
                        to_profile=to_profile,
                        defaults={'matched': True, 'blocked_reported': False}
                    )
                    if not created:
                        # If the match exists but was not created this time, we may need to update its status
                        # This section might need customization based on how you want to handle existing but inactive matches
                        if not match.blocked_reported:
                            match.matched = True
                            match.save()
                    return True
                except Exception as e:
                    logger.error(f"Failed to add match due to an error: {e}")
                    return False
            else:
                logger.info("Cannot create a match due to a previous block/report status.")
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
    def undo_delete_match(self, from_profile, to_profile):
        try:
            # Retrieve the match
            match = ProfileMatching.objects.get(from_profile=from_profile, to_profile=to_profile, matched=False)
            
            # Delete the match record
            match.delete()
            
            return True  # Indicate successful undo
        except ProfileMatching.DoesNotExist:
            # If the match doesn't exist or already reverted, return False
            logger.warning("Match not found or already reverted")
            return False
        except Exception as e:
            logger.error(e)
            return False  # Indicate failure to undo deletion
    def generate_recommendation(self, recommendations):
        profile_repository_obj = profile_repository.ProfileRepository()
        ret = []
        for rec in recommendations:
            profile_id = rec["profile_id"]
            profile = profile_repository_obj.get_profile_by_profile_id(profile_id)
            profile_serializer = serializer.ProfileSerializer(profile)
            serialized_profile = profile_serializer.data
            s3_service_obj = s3_service.S3Service()
            avatar_pic_url = s3_service_obj.get_presigned_url(profile_serializer.data['avatar_bucket_key'])
            profile_key = f"{profile_serializer.data['profile_photo_key']}0.jpeg"
            profile_pic_url = s3_service_obj.get_presigned_url(profile_key)
            ret.append({'profile': serialized_profile, 'avatar': avatar_pic_url, 'profile_pic': profile_pic_url, 'similarity_score': rec["score"]})
        return ret
    def get_list_of_incoming_requests(self, profile_id_list):
        profile_repository_obj = profile_repository.ProfileRepository()
        ret = []
        for profile_dict in profile_id_list:
            profile_id = profile_dict["profile_id"]
            profile = profile_repository_obj.get_profile_by_profile_id(profile_id)
            profile_serializer = serializer.ProfileSerializer(profile)
            serialized_profile = profile_serializer.data
            s3_service_obj = s3_service.S3Service()
            avatar_pic_url = s3_service_obj.get_presigned_url(profile_serializer.data['avatar_bucket_key'])
            profile_key = f"{profile_serializer.data['profile_photo_key']}0.jpeg"
            profile_pic_url = s3_service_obj.get_presigned_url(profile_key)
            ret.append({'profile': serialized_profile, 'avatar': avatar_pic_url, 'profile_pic': profile_pic_url})
        return ret
    