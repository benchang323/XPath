# backend/matching/service/s3_service.py
from django.conf import settings
import boto3

class S3Service:
    def __init__(self):
        self.session = boto3.session.Session()
        self.client = self.session.client('s3',
                        region_name='nyc3',
                        endpoint_url=settings.DGO_BUCKET_URL,
                        aws_access_key_id=settings.DGO_SPACES_ACCESS_KEY,
                        aws_secret_access_key=settings.DGO_SPACES_SECRET_KEY)

    # Stores or updates object in digital ocean spaces
    def store_object(self,file,path):
        try:
            self.client.upload_fileobj(file, settings.DGO_BUCKET_NAME, path)
            return True
        except Exception as e:
            return False
    
    # Deletes object from digital ocean spaces
    def delete_object(self,path):
        try:
            self.client.delete_object(Bucket=settings.DGO_BUCKET_NAME,Key=path)
            return True
        except Exception as e:
            return False
    
    # Download object from digital ocean spaces
    def download_object(self,path):
        try:
            response = self.client.get_object(Bucket=settings.DGO_BUCKET_NAME,Key=path)
            file_contents = response['Body'].read()
            return file_contents
        except Exception as e:
            return None