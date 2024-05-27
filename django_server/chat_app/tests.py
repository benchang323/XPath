from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from user_account.models import User
from matching.models import Profile
from chat_app.models import ProfileChatToken
from user_account.authentication import create_access_token
import json

class StreamChatDetailsTests(APITestCase):
    def setUp(self):
        # Creating mock users and profiles
        self.user = User.objects.create(id=1,username='testuser', password='password')
        self.profile = Profile.objects.create(user=self.user, preferred_name="Test User", profile_id=1)
        self.profilechattoken = ProfileChatToken.objects.create(id=1,streamChatToken='test',profile_id=1)
        self.user.save()
        self.profile.save()
        self.profilechattoken.save()
        self.token = create_access_token(self.user.id)

        self.client = APIClient()

    def test_get_stream_chat_details_authenticated(self):
        # This is assuming your token encoding and header setup works as expected
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        url = reverse('getUser')  # make sure to have named your URL pattern

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['profileId'], self.profile.profile_id)

    def test_get_stream_chat_details_invalid_user(self):
        fake_token = create_access_token(999)  # Assuming 999 does not correspond to any user
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + fake_token)
        url = reverse('getUser')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


class OtherUserInChatTests(APITestCase):
    def setUp(self):
        # Mocking user and profile objects for test
        self.user1 = User.objects.create(id=2,username='user1',email="user1@test.com", password='password1')
        self.user2 = User.objects.create(id=3,username='user2', password='password2',email="user2@test.com")
        self.user1.save()
        self.user2.save()
        self.profile1 = Profile.objects.create(user=self.user1, profile_id=212)
        self.profile2 = Profile.objects.create(user=self.user2, profile_id=314)
        self.profile1.save()
        self.profile2.save()
        self.token1 = create_access_token(self.user1.id)

        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)

    # Holding off this until alex is done with his part
    # def test_get_other_user_in_chat(self):
    #     url = reverse('get_other_user') 
    #     channel = f"chat-channel-{self.profile1.profile_id}-{self.profile2.profile_id}"
    #     headers = {'Content-Type': 'application/json'}
    #     data = {'channel':channel}
    #     response = self.client.get(url,data,headers=headers)
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(response.data['ret'], self.profile2.profile_id)

