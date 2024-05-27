from ..repository import neo_match_repo

class Neo4JMatchingService:
    def request_match(self, from_profile, to_profile):
        repo_obj = neo_match_repo.Neo4jMatchRepo()
        repo_obj.add_request(from_profile, to_profile)
    def add_rejection(self, from_profile, to_profile):
        repo_obj = neo_match_repo.Neo4jMatchRepo()
        repo_obj.add_rejection(from_profile, to_profile)
    def add_ignore(self, from_profile, to_profile):
        repo_obj = neo_match_repo.Neo4jMatchRepo()
        repo_obj.add_ignore(from_profile, to_profile)
    def undo_rejection(self, from_profile, to_profile):
        repo_obj = neo_match_repo.Neo4jMatchRepo()
        repo_obj.undo_rejection(from_profile, to_profile)
    def get_match_recommendations (self, profile_id):
        repo_obj = neo_match_repo.Neo4jMatchRepo()
        return repo_obj.get_match_recommendations(profile_id)
    def get_incoming_requests(self, profile_id):
        repo_obj = neo_match_repo.Neo4jMatchRepo()
        return repo_obj.get_incoming_requests(profile_id)