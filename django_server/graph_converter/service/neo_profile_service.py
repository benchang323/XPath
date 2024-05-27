from ..repository import neo_profile_repo

class Neo4jProfileService:
    def create_profile(self, bio, profile_id, user_id):
        profile_repo_obj = neo_profile_repo.Neo4jProfileRepo()
        profile_repo_obj.create_profile(bio, profile_id, user_id)
    def delete_profile(self, user_id):
        profile_repo_obj = neo_profile_repo.Neo4jProfileRepo()
        profile_repo_obj.delete_profile(user_id)
    def update_profile(self, bio, profile_id, user_id):
        profile_repo_obj = neo_profile_repo.Neo4jProfileRepo()
        profile_repo_obj.update_profile(bio, profile_id, user_id)