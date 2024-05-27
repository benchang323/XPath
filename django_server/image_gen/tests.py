from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch, MagicMock
from rest_framework import status
from rest_framework.test import APIClient, force_authenticate
from user_account.models import User
from user_account.authentication import create_access_token

class CreateImageTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        self.token = create_access_token(self.user.id)

        # Create the APIClient
        self.client = APIClient()

        # Authenticate the client using force_authenticate
        force_authenticate(self.client, user=self.user, token=self.token)

        self.url = reverse('createPicture')

    @patch('image_gen.views.S3Service')
    @patch('image_gen.views.requests.get')
    @patch('image_gen.views.client.images.generate')
    def test_create_image_success(self, mock_generate, mock_requests_get, mock_s3_service):
        # Mock OpenAI response to have the correct URL structure
        mock_image = MagicMock()
        mock_image.url = 'https://example.com/image.jpg'
        mock_generate.return_value.data = [mock_image]

        
        # Mock split to return the expected file name
        mock_image.split.return_value = ['https://example.com', 'image.jpg']
        mock_generate.return_value.data = [mock_image]

        # Mock the requests.get call to download the image
        mock_image_response = MagicMock()
        mock_image_response.status_code = 200
        mock_image_response.content = b'fake_image_content'
        mock_requests_get.return_value = mock_image_response

        # Mock S3Service
        mock_s3_instance = mock_s3_service.return_value
        mock_s3_instance.store_object_in_non_file_format.return_value = None

        data = {"prompt": "A beautiful sunset"}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("success", response.json()['message'])

        # Assertions to verify that the mocks were called correctly
        mock_generate.assert_called_once_with(
            model="dall-e-3",
            prompt="A beautiful sunset",
            size="1024x1024",
            quality="standard",
            n=1
        )
        mock_requests_get.assert_called_once_with('https://example.com/image.jpg')
        mock_s3_instance.store_object_in_non_file_format.assert_called_once_with(
            b'fake_image_content', 'website_pictures/image.jpg.png'
        )

    @patch('image_gen.views.S3Service')
    @patch('image_gen.views.requests.get')
    @patch('image_gen.views.client.images.generate')
    def test_create_image_download_failure(self, mock_generate, mock_requests_get, mock_s3_service):
        # Mock OpenAI response to have the correct URL structure
        mock_image = MagicMock()
        mock_image.url = 'https://example.com/image.jpg'
        mock_generate.return_value.data = [mock_image]

        # Mock the requests.get call to download the image
        mock_image_response = MagicMock()
        mock_image_response.url = 'https://example.com/image.jpg'
        mock_image_response.status_code = 404
        mock_requests_get.return_value = mock_image_response

        data = {"prompt": "A beautiful sunset"}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("Failed", response.json()['message'])

        # Assertions to verify that the mocks were called correctly
        mock_generate.assert_called_once_with(
            model="dall-e-3",
            prompt="A beautiful sunset",
            size="1024x1024",
            quality="standard",
            n=1
        )
        mock_requests_get.assert_called_once_with('https://example.com/image.jpg')
        mock_s3_service.return_value.store_object_in_non_file_format.assert_not_called()
