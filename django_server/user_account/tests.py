from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from unittest.mock import patch, MagicMock
from django.conf import settings
from .utils import user_utils
from .repository import user_auth_repository
from .service.twilio_service import TwilioService
from user_account.authentication import create_access_token

User = get_user_model()

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

class TwilioServiceTests(TestCase):
    def test_send_otp_success(self):
        user = User(email='test@example.com')
        otp = '123456'
        
        with patch('user_account.service.twilio_service.SendGridAPIClient') as mock_sendgrid:
            mock_send = MagicMock(return_value=MagicMock(status_code=202))
            mock_sendgrid.return_value.send = mock_send
            
            service = TwilioService()
            success = service.send_otp(user, otp)
            
            self.assertTrue(success)
            mock_sendgrid.assert_called_once_with(settings.SEND_GRID_API_KEY)
            mock_send.assert_called_once()

    def test_send_otp_failure(self):
        user = User(email='test@example.com')
        otp = '123456'
        
        with patch('user_account.service.twilio_service.SendGridAPIClient') as mock_sendgrid:
            mock_send = MagicMock(side_effect=Exception('Error'))
            mock_sendgrid.return_value.send = mock_send
            
            service = TwilioService()
            success = service.send_otp(user, otp)
            
            self.assertFalse(success)
            mock_sendgrid.assert_called_once_with(settings.SEND_GRID_API_KEY)
            mock_send.assert_called_once()


class UserAuthRepositoryTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        self.repo = user_auth_repository.UserAuthRepository()
    
    def test_get_user_by_email(self):
        user = self.repo.get_user_by_email('test@example.com')
        self.assertEqual(user, self.user)

    def test_get_user_by_id(self):
        user = self.repo.get_user_by_id(self.user.id)
        self.assertEqual(user, self.user)

    def test_save_user_auth(self):
        self.user.username = 'new_username'
        self.repo.save_user_auth(self.user)
        updated_user = User.objects.get(pk=self.user.id)
        self.assertEqual(updated_user.username, 'new_username')

    def test_save_verified_user_auth(self):
        self.repo.save_verified_user_auth(self.user)
        updated_user = User.objects.get(pk=self.user.id)
        self.assertTrue(updated_user.isVerified)

class APITests(Neo4jMockMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        self.token = Token.objects.create(user=self.user)
        self.user.save()
        self.token = create_access_token(self.user.id)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def test_register_user(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123',
            'phoneNumber': '1234567890',  # Ensure phoneNumber is sent as a string
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_login_user(self):
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('token' in response.data)

    def test_generate_otp(self):
        url = reverse('generateOTP')
        data = {
            'emailAddress': 'test@example.com'
        }
        with patch('user_account.service.twilio_service.TwilioService.send_otp', return_value=True):
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_validate_otp(self):
        self.user.otp = '123456'
        self.user.save()
        url = reverse('validateOTP')
        data = {
            'emailAddress': 'test@example.com',
            'otp': '123456'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.isVerified)
    
    def test_change_password_success(self):
        url = reverse('changePassword')
        data = {
            'current_password': 'testpassword123',
            'new_password': 'newpassword456'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_invalid_current_password(self):
        url = reverse('changePassword')
        data = {
            'current_password': 'wrongpassword',
            'new_password': 'newpassword456'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_account_success(self):
        url = reverse('deleteAccount')
        data = {
            'password': 'testpassword123'
        }
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # user is not verified so it should be false
        self.assertFalse(User.objects.filter(email='test@example.com').exists())

    def test_delete_account_invalid_password(self):
        url = reverse('deleteAccount')
        data = {
            'password': 'wrongpassword'
        }
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_check_verified_status(self):
        url = reverse('isUserVerified')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json().get('isVerified'))

    def test_logout(self):
        url = reverse('logout')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cookie = response.cookies.get('refreshToken')
    
        # Check that the cookie is set to expire
        self.assertIsNotNone(cookie)
        self.assertEqual(cookie.value, '')
        self.assertTrue('expires' in cookie or 'max-age' in cookie)
