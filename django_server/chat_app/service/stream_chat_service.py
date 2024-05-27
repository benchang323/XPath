from stream_chat import StreamChat
from django.conf import settings
from matching.repository import profile_repository
from ..models import ProfileChatToken
import logging


logger = logging.getLogger(__name__)
class StreamChatService:
    def __init__(self):
        self.client = StreamChat(api_key=settings.STREAM_API_KEY, api_secret=settings.STREAM_API_SECRET)

    
    # Creates user account in stream chat
    def create_user(self,profile):
        try:
            
            # User details
            # user_data = {
            #     "id": str(profile.profile_id),
            #     "name": profile.preferred_name,
            #     "image": url
            # }
            # Generate a token for the user
            token = self.client.create_token(str(profile.profile_id))

            profile_repository_obj = profile_repository.ProfileRepository()
            # save user
            profile_chat_token_instance = ProfileChatToken(profile=profile, streamChatToken=token)
            profile_repository_obj.save_profile_token(profile_chat_token_instance)

            print(f"User ID: {profile.full_name}")
            print(f"Token: {token}")
            logger.error(f"User created with Token: {token} {profile.preferred_name}")

            return True
        except Exception as e:
            return False
        
    def create_channel(self,profile_1,profile_2):
        try:

            # Generate a unique channel ID for the one-on-one chat
            channel_id = ""

            # Create or get the one-on-one chat channel
            if profile_1.profile_id < profile_2.profile_id:
                channel_id = "chat-channel-"+str(profile_1.profile_id)+"-"+str(profile_2.profile_id)
            else:
                channel_id = "chat-channel-"+str(profile_2.profile_id)+"-"+str(profile_1.profile_id)
            # Create the channel if it doesn't exist
            channel = self.client.channel("messaging", channel_id, {
                    "members": [str(profile_1.profile_id), str(profile_2.profile_id)]
                })
            channel.create(str(profile_1.profile_id))

            logger.info(f"Channel created with ID: {channel_id}")

            return True
        except Exception as e:
            return False 
    def delete_channel(self,profile_1,profile_2):
        try:
            channel_id=""
            if profile_1.profile_id < profile_2.profile_id:
                channel_id = "chat-channel-"+str(profile_1.profile_id)+"-"+str(profile_2.profile_id)
            else:
                channel_id = "chat-channel-"+str(profile_2.profile_id)+"-"+str(profile_1.profile_id)
            channel = self.client.channel("messaging", channel_id)
            response = channel.delete()
            return True
        except Exception as e:
            return False    
        
    # Creates chatbot in stream chat
    # def create_chatbot(self):
    #     try:
    #         # Generate a token for the chatbot
    #         token = self.client.create_token("chatbot")
    #         return True
    #     except Exception as e:
    #         return False
    
    def create_chat_with_chatbot(self, profile):
        try:
            # # Check if the "chatbot" user exists
            # chatbot_user = self.client.get_user("chatbot")
            # if not chatbot_user:
            #     self.client.update_user({"id": "chatbot", "name": "Chatbot"})
            channel_id = f"chatbot_{profile.profile_id}"  
            channel = self.client.channel("messaging", channel_id, { # create channel with chatbot 
                "members": [str(profile.profile_id), "chatbot"], "image": "https://www.svgrepo.com/show/417180/travel-holiday-vacation-8.svg"
            })
            channel.create(str(profile.profile_id))
            logger.error(f"Channel created with ID: {channel_id}")

            return True
        except Exception as e: # there isn't a get_user function so have to do try catch block
            if "but don't exist: [chatbot]" in str(e):
                self.client.update_user({"id": "chatbot", "name": "Chatbot"})
                channel_id = f"chatbot_{profile.profile_id}"  
                channel = self.client.channel("messaging", channel_id, {
                "members": [str(profile.profile_id), "chatbot"], "image": "https://www.svgrepo.com/show/417180/travel-holiday-vacation-8.svg"
                })
                channel.create(str(profile.profile_id))
                logger.error(f"Channel created with ID: {channel_id}")
                return True
            else:
                logger.error(f"Error creating channel: {str(e)}")
                return False
    def chatbot_response(self,channel_id, request):
        try:
            # get the message from the request
            message = request.data.get("message")
            history = request.data.get("history")
            
            
            
            
        except Exception as e:
            return f"Error getting chatbot response: {str(e)}"
    