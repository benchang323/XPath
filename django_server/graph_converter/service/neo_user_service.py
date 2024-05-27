from ..repository import neo_user_repo
from . import neo_profile_service
class Neo4jUserService:
    def create_user_service(self, username, password, email, phoneNumber, id):
        neo4j_repo_obj = neo_user_repo.Neo4jUserRepo()
        neo4j_repo_obj.create_user(username, password, email, phoneNumber, id)
    def edit_user_service(self, username, password, id):
        neo4j_repo_obj = neo_user_repo.Neo4jUserRepo()
        neo4j_repo_obj.edit_user(username, password, id)
    def delete_user_service(self, id):
        neo4j_user_repo_obj = neo_user_repo.Neo4jUserRepo()
        neo4j_profile_obj = neo_profile_service.Neo4jProfileService()
        neo4j_profile_obj.delete_profile(id)
        neo4j_user_repo_obj.delete_user(id)
        