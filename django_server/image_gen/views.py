from rest_framework.views import APIView
from openai import OpenAI
from matching.service.s3_service import S3Service
from django.http import JsonResponse
from django.conf import settings
import logging
import requests

client = OpenAI(api_key=settings.OPENAI_KEY)
logger = logging.getLogger(__name__)


def generateImage(prompt, type, userId):
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        file_name = image_url.split('/')[-1]
        image_response = requests.get(image_url)
        if image_response.status_code != 200:
            return JsonResponse({"message": "Failed to download image"}, status=500)
        file_path=f"{type}/{userId}.jpeg"
        s3_obj = S3Service()
        # Extracting file name from the URL to be used in storage
        s3_obj.store_object_in_non_file_format(image_response.content, file_path)
        return JsonResponse({"message": "success", "image_url": f"{file_path}"})
    except Exception as e:
        # Logging the error
        logger.error(e)
        return JsonResponse({"message": "failure"}, status=500)
    
class CreateImage(APIView):
    def post(self, request):
        prompt = request.data.get("prompt")
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            image_url = response.data[0].url
            file_name = image_url.split('/')[-1]
            image_response = requests.get(image_url)
            if image_response.status_code != 200:
                return JsonResponse({"message": "Failed to download image"}, status=500)
            file_path=f"website_pictures/{file_name}.png"
            s3_obj = S3Service()
            # Extracting file name from the URL to be used in storage
            s3_obj.store_object_in_non_file_format(image_response.content, file_path)
            return JsonResponse({"message": "success", "image_url": f"{file_path}"})
        except Exception as e:
            # Logging the error
            logger.error(e)
            return JsonResponse({"message": "failure"}, status=500)
