from django.shortcuts import render
from .service import neo_user_service, neo_profile_service, neo_matching_service, neo_bucketlist_service

# User 
def user_creation(username, password, email, phoneNumber, id):
    service_obj = neo_user_service.Neo4jUserService()
    service_obj.create_user_service(username, password, email, phoneNumber, id)
def user_edit(username, password, id):
    service_obj = neo_user_service.Neo4jUserService()
    service_obj.edit_user_service(username, password, id)
def user_deletion(id):
    service_obj = neo_user_service.Neo4jUserService()
    service_obj.delete_user_service(id)
    
# Profile
def profile_creation(bio, profile_id, user_id):
    service_obj = neo_profile_service.Neo4jProfileService()
    service_obj.create_profile(bio, profile_id, user_id)
def profile_deletion(user_id):
    service_obj = neo_profile_service.Neo4jProfileService()
    service_obj.delete_profile(user_id)
def profile_update(full_name, gender, languages, ethnicity, user_bio, current_address, work_address, hometown, interests, preferred_commute_times, profile_id, user_id):
    service_obj = neo_profile_service.Neo4jProfileService()
    service_obj.update_profile(full_name, gender, languages, ethnicity, user_bio, current_address, work_address, hometown, interests, preferred_commute_times, profile_id, user_id)
    
# Match
def request_match(from_profile, to_profile):
    service_obj = neo_matching_service.Neo4JMatchingService()
    service_obj.request_match(from_profile, to_profile)
def reject_match(from_profile, to_profile):
    service_obj = neo_matching_service.Neo4JMatchingService()
    service_obj.add_rejection(from_profile, to_profile)
def undo_reject(from_profile, to_profile):
    service_obj = neo_matching_service.Neo4JMatchingService()
    service_obj.undo_rejection(from_profile, to_profile)
def add_ignore(from_profile, to_profile):
    service_obj = neo_matching_service.Neo4JMatchingService()
    service_obj.add_ignore(from_profile, to_profile)
def get_match_recommendations (profile_id):
    service_obj = neo_matching_service.Neo4JMatchingService()
    ret = service_obj.get_match_recommendations(profile_id)
    return ret

def get_incoming_requests (profile_id):
    service_obj = neo_matching_service.Neo4JMatchingService()
    ret = service_obj.get_incoming_requests(profile_id)
    return ret

#Trip Bucket List

def add_to_bucketlist(user_profile, location):
    service_obj = neo_bucketlist_service.Neo4JBucketListService()
    service_obj.add_to_bucketlist(user_profile, location)
def update_bucketlist_entry(user_profile, old_location, new_location):
    service_obj = neo_bucketlist_service.Neo4JBucketListService()
    service_obj.edit_destination_in_bucketlist(user_profile, old_location, new_location)
def delete_from_bucketlist(user_profile, location):
    service_obj = neo_bucketlist_service.Neo4JBucketListService()
    service_obj.delete_from_bucketlist(user_profile, location)
def get_all_destinations_liked_by_profile(profile):
    service_obj = neo_bucketlist_service.Neo4JBucketListService()
    return service_obj.get_all_destinations_liked_by_profile(profile)

