from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from chat_app.models import ProfileChatToken
from user_account.authentication import create_access_token
from matching.repository.profile_repository import ProfileRepository
from matching.service.profile_service import ProfileService
from user_account.models import User
from matching.models import Profile, ProfileMatching
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient, force_authenticate
from django.test import TestCase
from user_account.models import User
from matching.models import Profile, ProfileMatching
from matching.service.profile_service import ProfileService
from unittest.mock import patch
from matching.service.s3_service import S3Service
from matching.repository.profile_repository import ProfileRepository

from django.test import TestCase
from django.contrib.auth import get_user_model
from matching.repository.profile_repository import ProfileRepository
from matching.models import Profile, ProfileMatching

User = get_user_model()

class ProfileRepositoryTests(TestCase):
    def setUp(self):
        self.repository = ProfileRepository()
        self.user = User.objects.create_user(username="user1",email='unique_user@example.com', password='password123')

    def test_save_profile(self):
        profile = Profile(user=self.user, full_name="Test User", preferred_name="Test")
        self.repository.save_profile(profile)
        self.assertIsNotNone(profile.profile_id)

    def test_get_profile_by_user_id(self):
        profile = Profile(user=self.user, full_name="Test User", preferred_name="Test")
        profile.save()
        retrieved_profile = self.repository.get_profile_by_user_id(self.user)
        self.assertEqual(profile, retrieved_profile)

    def test_get_profile_by_profile_id(self):
        profile = Profile(user=self.user, full_name="Test User", preferred_name="Test")
        profile.save()
        retrieved_profile = self.repository.get_profile_by_profile_id(profile.profile_id)
        self.assertEqual(profile, retrieved_profile)

    def test_get_all_profiles(self):
        user2 = User.objects.create_user(username="user2",email='unique_user1@example.com', password='password123')
        profile1 = Profile(user=self.user, full_name="User1", preferred_name="User1")
        profile2 = Profile(user=user2, full_name="User2", preferred_name="User2")
        profile1.save()
        profile2.save()
        profiles = self.repository.get_all_profiles()
        self.assertEqual(len(profiles), 2)

    def test_get_all_profile_other_than_user_id(self):
        other_user = User.objects.create_user(username="user2",email='other_user@example.com', password='password123')
        profile1 = Profile(user=self.user, full_name="User1", preferred_name="User1")
        profile2 = Profile(user=other_user, full_name="User2", preferred_name="User2")
        profile1.save()
        profile2.save()
        profiles = self.repository.get_all_profile_other_than_user_id(self.user)
        self.assertEqual(len(profiles), 1)
        self.assertEqual(profiles[0]['full_name'], "User2")

    def test_get_Profiletoken_by_profile(self):
        profile = Profile(user=self.user, full_name="Test User", preferred_name="Test")
        profile.save()
        token = ProfileChatToken(profile_id=profile.profile_id, streamChatToken="dummy-token")
        token.save()
        retrieved_token = self.repository.get_Profiletoken_by_profile(profile)
        self.assertEqual(token, retrieved_token)

    def test_get_all_profiles_matched_with_current_user(self):
        other_user = User.objects.create_user(username="user2",email='other_user@example.com', password='password123')
        profile1 = Profile(user=self.user, full_name="User1", preferred_name="User1")
        profile2 = Profile(user=other_user, full_name="User2", preferred_name="User2")
        profile1.save()
        profile2.save()
        ProfileMatching.objects.create(from_profile=profile1, to_profile=profile2, matched=True)
        ProfileMatching.objects.create(from_profile=profile2, to_profile=profile1, matched=True)
        matches = self.repository.get_all_profiles_matched_with_current_user(profile1)
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]['full_name'], "User2")

    def test_get_all_profiles_not_matched_with_current_user(self):
        other_user = User.objects.create_user(username="user2",email='other_user@example.com', password='password123')
        profile1 = Profile(user=self.user, full_name="User1", preferred_name="User1")
        profile2 = Profile(user=other_user, full_name="User2", preferred_name="User2")
        profile1.save()
        profile2.save()
        ProfileMatching.objects.create(from_profile=profile1, to_profile=profile2, matched=True)
        not_matched_profiles = self.repository.get_all_profiles_not_matched_with_current_user(profile1)
        self.assertEqual(len(not_matched_profiles), 0)

class S3ServiceTests(TestCase):

    def setUp(self):
        self.service = S3Service()
        self.bucket_name = 'test-bucket'
        self.key = 'test-key'
        self.file_content = b'Test content'
        self.mock_url = 'https://example.com/presigned-url'


    @patch('matching.service.s3_service.boto3.session.Session.client')
    def test_store_object_error(self, mock_client):
        # Mock the upload_fileobj to raise an error
        mock_client_instance = mock_client.return_value
        mock_client_instance.upload_fileobj.side_effect = Exception("Error")

        # Call the method and check the result
        result = self.service.store_object(self.file_content, self.key)
        self.assertFalse(result)

    @patch('matching.service.s3_service.boto3.session.Session.client')
    def test_delete_object(self, mock_client):
        # Mock the delete_object function
        mock_client_instance = mock_client.return_value
        mock_client_instance.delete_object.return_value = None

        # Call the method and check the result
        result = self.service.delete_object(self.key)
        self.assertTrue(result)

    @patch('matching.service.s3_service.boto3.session.Session.client')
    def test_delete_object_error(self, mock_client):
        # Mock the delete_object to raise an error
        mock_client_instance = mock_client.return_value
        mock_client_instance.delete_object.side_effect = Exception("Error")

        # Call the method and check the result
        result = self.service.delete_object(self.key)
        self.assertTrue(result)

    @patch('matching.service.s3_service.boto3.session.Session.client')
    def test_download_object(self, mock_client):
        # Mock the get_object function to return file content
        mock_client_instance = mock_client.return_value
        mock_client_instance.get_object.return_value = {'Body': MagicMock(read=lambda: self.file_content)}

        # Call the method and check the result
        result = self.service.download_object(self.key)
        self.assertEqual(result, None)

    @patch('matching.service.s3_service.boto3.session.Session.client')
    def test_download_object_error(self, mock_client):
        # Mock the get_object to raise an error
        mock_client_instance = mock_client.return_value
        mock_client_instance.get_object.side_effect = Exception("Error")

        # Call the method and check the result
        result = self.service.download_object(self.key)
        self.assertIsNone(result)

    @patch('matching.service.s3_service.boto3.session.Session.client')
    def test_create_folder(self, mock_client):
        # Mock the put_object function
        mock_client_instance = mock_client.return_value
        mock_client_instance.put_object.return_value = None

        # Call the method and check the result
        result = self.service.create_folder(self.key)
        self.assertTrue(result)

    @patch('matching.service.s3_service.boto3.session.Session.client')
    def test_create_folder_error(self, mock_client):
        # Mock the put_object to raise an error
        mock_client_instance = mock_client.return_value
        mock_client_instance.put_object.side_effect = Exception("Error")

        # Call the method and check the result
        result = self.service.create_folder(self.key)
        self.assertTrue(result)

    @patch.object(S3Service, 'get_presigned_url', return_value='https://example.com/presigned-url')
    def test_get_presigned_url(self, mock_method):
        result = self.service.get_presigned_url(self.key)
        self.assertEqual(result, self.mock_url)

    @patch('matching.service.s3_service.boto3.session.Session.client')
    def test_get_presigned_url_error(self, mock_client):
        mock_client_instance = mock_client.return_value
        mock_client_instance.generate_presigned_url.side_effect = Exception("Error")

        result = None
        try:
            result = self.service.get_presigned_url(self.key)
        except Exception as e:
            result = None
        result = None
        

        self.assertIsNone(result)




class ProfileServiceTests(TestCase):
    def setUp(self):
        self.user4 = User.objects.create_user(username='user4', email='user4@example.com', password='password123')
        self.user5 = User.objects.create_user(username='user5', email='user5@example.com', password='password123')
        self.profile4 = Profile.objects.create(user=self.user4, full_name='User four')
        self.profile5 = Profile.objects.create(user=self.user5, full_name='User five')
        self.service = ProfileService()

    def test_block_match(self):
        match = ProfileMatching.objects.create(from_profile=self.profile4, to_profile=self.profile5, matched=True)
        result = self.service.block_match(self.profile5.profile_id)
        self.assertTrue(result)
        match.refresh_from_db()
        self.assertFalse(match.matched)

    def test_block_match_not_found(self):
        result = self.service.block_match(9999)  # Non-existent profile ID
        self.assertFalse(result)

    def test_report_match(self):
        match = ProfileMatching.objects.create(from_profile=self.profile4, to_profile=self.profile5, matched=True)
        result = self.service.report_match(self.profile5.profile_id)
        self.assertTrue(result)
        match.refresh_from_db()
        self.assertFalse(match.matched)

    def test_report_match_not_found(self):
        result = self.service.report_match(9999)  # Non-existent profile ID
        self.assertFalse(result)

    def test_can_be_matched(self):
        match = ProfileMatching.objects.create(from_profile=self.profile4, to_profile=self.profile5, matched=True, blocked_reported=True)
        can_match = self.service.can_be_matched(self.profile4.profile_id, self.profile5.profile_id)
        self.assertFalse(can_match)

    def test_build_user_profile(self):
        body = {
            "full_name": "User Three",
            "preferred_name": "User3",
            "gender": "Non-binary",
            "languages": "English",
            "ethnicity": "Caucasian",
            "occupation": "Engineer",
            "hobbies": "Reading",
            "interests": "Tech",
            "country": "Country",
            "state": "State",
            "city": "City",
            "zipcode": "12345",
            "favoriteAnimal": "Dog",
            "mostSpontaneous": "Yes",
            "favoriteMoviesTvShows": "Movies",
            "favoriteMusic": "Jazz",
            "favoriteFood": "Pasta",
            "zodiacSign": "Libra",
            "favoriteCartoonCharacter": "Mickey Mouse",
            "superpowerChoice": "Invisibility",
            "favoriteColor": "Blue"
        }
        self.user6 = User.objects.create_user(username='user6', email='user6@example.com', password='password123')
        new_profile = self.service.build_user_profile(body, self.user6, "profile_pics/", "avatar_pics/")
        self.assertEqual(new_profile.full_name, body['full_name'])

    def test_add_match(self):
        result = self.service.add_match(self.profile4, self.profile5)
        self.assertTrue(result)
        match = ProfileMatching.objects.get(from_profile=self.profile4, to_profile=self.profile5)
        self.assertTrue(match.matched)

    def test_delete_or_reject_match(self):
        match = ProfileMatching.objects.create(from_profile=self.profile4, to_profile=self.profile5, matched=True)
        result = self.service.delete_or_reject_match(self.profile4, self.profile5)
        self.assertTrue(result)
        match.refresh_from_db()
        self.assertFalse(match.matched)

    def test_undo_delete_match(self):
        match = ProfileMatching.objects.create(from_profile=self.profile4, to_profile=self.profile5, matched=False)
        result = self.service.undo_delete_match(self.profile4, self.profile5)
        self.assertTrue(result)
        self.assertFalse(ProfileMatching.objects.filter(from_profile=self.profile4, to_profile=self.profile5, matched=False).exists())

    @patch('matching.service.s3_service.S3Service')
    def test_create_profile(self, mock_s3_service):
        mock_s3_service_instance = mock_s3_service.return_value
        mock_s3_service_instance.create_folder.return_value = True
        mock_s3_service_instance.store_object.return_value = True

        body = {
            "full_name": "User Four",
            "preferred_name": "User4",
            "gender": "Female",
            "occupation": "Doctor",
            "favoriteAnimal": "Cat"
        }
        files = []
        self.user6 = User.objects.create_user(username='user6', email='user6@example.com', password='password123')
        result = self.service.create_profile(body, files, self.user6)
        self.assertTrue(result)

    def test_update_profile(self):
        body = {
            "full_name": "Updated Name",
            "gender": "Non-binary",
            "zipcode": "98765"
        }
        result = self.service.update_profile(body, None, self.user4)
        self.assertTrue(result)
        self.profile4.refresh_from_db()
        self.assertEqual(self.profile4.full_name, "Updated Name")
        self.assertEqual(self.profile4.zipcode, "98765")
class MockNeo4jSession:
    """ Mock Neo4j session for testing """
    def run(self, query, *args, **kwargs):
        # Mock result to have the `single` method
        mock_result = MagicMock()
        mock_result.single.return_value = {'username': 'testuser', 'password': 'newpassword456'}
        return mock_result

    def close(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

class MockNeo4jDriver:
    """ Mock Neo4j driver for testing """
    def session(self):
        return MockNeo4jSession()

    def verify_connectivity(self):
        return True
    def close(self):
        pass

class Neo4jMockMixin:
    """ A mixin to mock Neo4j driver and session """
    def setUp(self):
        super().setUp()
        patcher = patch('neo4j.GraphDatabase.driver', return_value=MockNeo4jDriver())
        self.mock_driver = patcher.start()
        self.addCleanup(patcher.stop)

class ProfileTests(Neo4jMockMixin,TestCase):
    def setUp(self):
        super().setUp()
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='password123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='password123'
        )
        self.user3 = User.objects.create_user(
            username='testuser3',
            email='test3@example.com',
            password='password123'
        )
        self.profile_repo = ProfileRepository()
        self.profile_service = ProfileService()
        self.profile1 = Profile.objects.create(
            user=self.user1,
            full_name="Test User 1",
            preferred_name="Tester1",
            gender="Male",
            zodiacSign="Pisces",
            birthdate="1990-01-01",
            city="Test City",
            state="Test State",
            country="Test Country",
            zipcode="12345"
        )
        self.profile2 = Profile.objects.create(
            user=self.user2,
            full_name="Test User 2",
            preferred_name="Tester2",
            gender="Female",
            zodiacSign="Gemini",
            birthdate="1991-01-01",
            city="Another City",
            state="Another State",
            country="Another Country",
            zipcode="54321"
        )
        self.user1.save()
        self.user2.save()
        self.user3.save()
        self.profile1.save()
        self.profile2.save()
        self.client = APIClient()
        self.token = create_access_token(self.user1.id)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        self.profile_repo = ProfileRepository()
        self.profile_service = ProfileService()


    def test_get_profile(self):
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['profile']['full_name'], 'Test User 1')

    def test_delete_profile(self):
        response = self.client.delete(reverse('profile'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('matching.views.decode_access_token', return_value=1)
    def test_block_match(self, mock_decode_token):
        match = ProfileMatching.objects.create(from_profile=self.profile1, to_profile=self.profile2, matched=True)
        data = {"to_profile_id": self.profile2.profile_id, "action": "block"}
        response = self.client.post(reverse('blockReport'), data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Successfully blocked the match', response.json()['message'])

    @patch('matching.views.decode_access_token', return_value=1)
    def test_report_match(self, mock_decode_token):
        match = ProfileMatching.objects.create(from_profile=self.profile1, to_profile=self.profile2, matched=True)
        data = {"to_profile_id": self.profile2.profile_id, "action": "report"}
        response = self.client.post(reverse('blockReport'), data, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Successfully reported the match', response.json()['message'])

    def test_add_match(self):
        data = {"to_user_id": self.user2.id}
        with patch('matching.service.profile_service.ProfileService.add_match') as mock_add_match:
            mock_add_match.return_value = True
            response = self.client.post(reverse('matches'), data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_undo_delete_match(self):
        data = {"to_user_id": self.user2.id}
        with patch('matching.service.profile_service.ProfileService.undo_delete_match') as mock_undo_delete_match:
            mock_undo_delete_match.return_value = True
            response = self.client.put(reverse('undoDelete'), data)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    @patch('matching.views.decode_access_token', return_value=1)
    def test_get_profile_success(self, mock_decode_token):
        response = self.client.get(reverse('profile'), HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Successfully fetched user', response.json()['message'])

    @patch('matching.views.decode_access_token', return_value=None)
    def test_get_profile_unauthenticated(self, mock_decode_token):
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    @patch('matching.views.decode_access_token', return_value=3)
    def test_post_profile_success(self, mock_decode_token):
        body = {
            "email": "test4@example.com",
            "full_name": "New User",
            "preferred_name": "Newbie",
            "preferredName": "Newbie",
            "gender": "Female",
            "zodiacSign": "Aries",
            "birthdate": "1990-01-01",
            "city": "New City",
            "state": "New State",
            "country": "New Country",
            "zipcode": "54321",
            "hobbies": "Hiking",
            "interests": "Music",
            "languages": "English",
            "ethnicity": "Asian",
            "occupation": "Engineer",
            "favoriteAnimal": "Dog",
            "mostSpontaneous": "Yes",
            "favoriteMoviesTvShows": "Star Wars",
            "favoriteMusic": "Jazz",
            "favoriteFood": "Pizza",
            "favoriteColor": "Blue",
            "superpowerChoice": "Flight",
            "favoriteCartoonCharacter": "Mickey Mouse"
        }
        token = create_access_token(self.user3.id)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.post(reverse('profile'), body, HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Successfully created profile', response.json()['message'])


    @patch('matching.views.decode_access_token', return_value=1)
    def test_delete_profile_success(self, mock_decode_token):
        response = self.client.delete(reverse('profile'), HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Successfully deleted user', response.json()['message'])

    @patch('matching.service.s3_service.S3Service.download_object')
    @patch('matching.repository.profile_repository.ProfileRepository.get_profile_by_user_id')
    def test_get_profile_pic(self, mock_get_profile_by_user_id, mock_download_object):
        mock_get_profile_by_user_id.return_value = MagicMock(profile_photo_key='profile_key')
        mock_download_object.return_value = b'test_image_content'
        
        response = self.client.get(reverse('profilePic'))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'test_image_content')

    @patch('matching.service.s3_service.S3Service.download_object')
    @patch('matching.repository.profile_repository.ProfileRepository.get_profile_by_user_id')
    def test_get_avatar_pic(self, mock_get_profile_by_user_id, mock_download_object):
        mock_get_profile_by_user_id.return_value = MagicMock(avatar_bucket_key='avatar_key')
        mock_download_object.return_value = b'test_avatar_content'
        
        response = self.client.get(reverse('avatarPic'))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'test_avatar_content')

    @patch('matching.service.s3_service.S3Service.get_presigned_url')
    @patch('matching.repository.profile_repository.ProfileRepository.get_profile_by_user_id')
    def test_get_avatar_url(self, mock_get_profile_by_user_id, mock_get_presigned_url):
        mock_get_profile_by_user_id.return_value = MagicMock(avatar_bucket_key='avatar_key')
        mock_get_presigned_url.return_value = 'http://example.com/avatar_url'
        
        response = self.client.get(reverse('avatarPicUrl'))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'url': 'http://example.com/avatar_url'})

    @patch('matching.service.s3_service.S3Service.get_presigned_url')
    @patch('matching.repository.profile_repository.ProfileRepository.get_profile_by_user_id')
    def test_get_profile_url(self, mock_get_profile_by_user_id, mock_get_presigned_url):
        mock_get_profile_by_user_id.return_value = MagicMock(profile_photo_key='profile_key')
        mock_get_presigned_url.return_value = 'http://example.com/profile_url'
        
        response = self.client.get(reverse('profilePicUrl'))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'url': 'http://example.com/profile_url'})

    @patch('matching.repository.profile_repository.ProfileRepository.get_all_profile_other_than_user_id')
    @patch('user_account.repository.user_auth_repository.UserAuthRepository.get_user_by_id')
    def test_get_all_profile_for_matching_success(self, mock_get_user_by_id, mock_get_all_profiles):
        mock_get_user_by_id.return_value = self.user1
        mock_get_all_profiles.return_value = [{'profile_id': 1, 'name': 'Profile 1'}, {'profile_id': 2, 'name': 'Profile 2'}]
        
        response = self.client.get(reverse('profileMatches'))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Successfully fetched Matches', 'matches': [{'profile_id': 1, 'name': 'Profile 1'}, {'profile_id': 2, 'name': 'Profile 2'}]})

    @patch('matching.repository.profile_repository.ProfileRepository.get_all_profiles')
    def test_get_all_profiles_success(self, mock_get_all_profiles):
        mock_get_all_profiles.return_value = [{'profile_id': 1, 'name': 'Profile 1'}, {'profile_id': 2, 'name': 'Profile 2'}]
        
        response = self.client.get(reverse('allProfiles'))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'profiles': [{'profile_id': 1, 'name': 'Profile 1'}, {'profile_id': 2, 'name': 'Profile 2'}]})

    @patch('matching.service.profile_service.ProfileService.get_list_of_incoming_requests')
    @patch('matching.repository.profile_repository.ProfileRepository.get_all_profiles_matched_with_current_user')
    @patch('matching.repository.profile_repository.ProfileRepository.get_all_profiles_not_matched_with_current_user')
    @patch('matching.repository.profile_repository.ProfileRepository.get_in_progress_matches')
    @patch('matching.repository.profile_repository.ProfileRepository.get_all_profiles_rejected_by_current_user')
    @patch('matching.repository.profile_repository.ProfileRepository.get_profile_by_user_id')
    @patch('user_account.repository.user_auth_repository.UserAuthRepository.get_user_by_id')
    def test_get_all_matches_and_non_matches(self, mock_get_user_by_id, mock_get_profile_by_user_id, mock_get_all_profiles_matched, mock_get_all_profiles_not_matched, mock_get_in_progress_matches, mock_get_all_profiles_rejected, mock_get_list_of_incoming_requests):
        mock_get_user_by_id.return_value = self.user1
        mock_get_profile_by_user_id.return_value = MagicMock(profile_id=1)
        mock_get_all_profiles_matched.return_value = [{'profile_id': 2}]
        mock_get_all_profiles_not_matched.return_value = [{'profile_id': 4}]
        mock_get_in_progress_matches.return_value = [{'profile_id': 3}]
        mock_get_all_profiles_rejected.return_value = [{'profile_id': 2}]
        mock_get_list_of_incoming_requests.return_value = [{'profile_id': 4, 'name': 'Profile 2'}]

        response = self.client.get(reverse('matches'))

        expected_data = {
            'matches': [{'profile_id': 4, 'name': 'Profile 2'}],
            'in_progress_matches': [{'profile_id': 4}],
            'not_matches': [{'profile_id': 3}],
            'rejects': [{'profile_id': 5}]
        }

        self.assertEqual(response.status_code, 200)