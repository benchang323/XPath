from matching.service import s3_service
import logging

logger = logging.getLogger(__name__)

class CompatibilityService:
    def store_embeddings_csv(self,embeddings_file, file_name):
        try:
            embeddings_csv_file_path = "csv_stores/"+str(file_name)+".csv"
            # handle posting to s3
            s3_client_obj = s3_service.S3Service()
            # store embeddings to s3
            s3_client_obj.store_object_in_non_file_format(embeddings_file,embeddings_csv_file_path)
            logger.error('saved')
            return True
        except Exception as e:
            logger.error(e)
            return False