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
    
    # Modify existing object    
    def put_object(self, file, path):
        try:
            self.client.put_object(Bucket=settings.DGO_BUCKET_NAME, Key=path, Body=file)
            return True
        except Exception as e:
            print(f"Error storing object: {e}")
            return False
        
    # store object that doesn't necessarily have file properties
    def store_object_in_non_file_format(self, file_content, path):
        try:
            self.client.put_object(Bucket=settings.DGO_BUCKET_NAME, Key=path, Body=file_content)
            return True
        except Exception as e:
            return False

    def create_folder(self, folder_name):
        try:
            # Append a slash at the end of the folder name to indicate it's a folder
            folder_path = f"{folder_name}/"
            # Create an empty object with the folder name as the key
            self.client.put_object(Bucket=settings.DGO_BUCKET_NAME, Key=folder_path, Body=b'')
            return True
        except Exception as e:
            print(f"Error creating folder: {e}")
            return False
    def delete_folder(self, folder_name):
        try:
            # Append a slash at the end of the folder name to indicate it's a folder
            folder_path = f"{folder_name}/"
            # Create an empty object with the folder name as the key
            self.client.delete_object(Bucket=settings.DGO_BUCKET_NAME, Key=folder_path, Body=b'')
            return True
        except Exception as e:
            print(f"Error deleting folder: {e}")
            return False
        
    def get_presigned_url(self, path, expiration=36000):
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.DGO_BUCKET_NAME, 'Key': path},
                ExpiresIn=expiration
            )
            return url
        except Exception as e:
            print(f"Error generating pre-signed URL: {e}")
            return None
        
    def get_presigned_url_for_folder(self, path, expiration=36000):
        try:
            urls = []
            objects = self.client.list_objects_v2(
                Bucket=settings.DGO_BUCKET_NAME,
                Prefix=path
            )
            for obj in objects.get('Contents', []):
                if obj['Key'].endswith(('.jpg', '.jpeg', '.png')): #accept different formats of images
                    url = self.client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': settings.DGO_BUCKET_NAME, 'Key': obj['Key']},
                        ExpiresIn=expiration
                    )
                    urls.append(url)
            return urls
        except Exception as e:
            print(f"Error generating pre-signed URLs: {e}")
            return []