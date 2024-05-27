from graph_converter.repository import neo_bucketlist_repo
class Neo4JBucketListService:
    def add_to_bucketlist(self, profile, location):
        repo_obj = neo_bucketlist_repo.Neo4jBucketListRepo()
        repo_obj.add_to_bucketlist(profile, location) 
    # def edit_destination_in_bucketlist(self, profile, original_location, new_location):
    #     repo_obj = neo_bucketlist_repo.Neo4jBucketListRepo()
    #     repo_obj.edit_destination_in_bucketlist(profile, original_location, new_location)
    def delete_from_bucketlist(self, profile, location):
        repo_obj = neo_bucketlist_repo.Neo4jBucketListRepo()
        repo_obj.delete_from_bucketlist(profile, location)
    def get_all_destinations_liked_by_profile(self, profile):
        repo_obj = neo_bucketlist_repo.Neo4jBucketListRepo()
        return repo_obj.get_all_destinations_liked_by_profile(profile)
    
    