# Path: trips/services/similarity_service.py
import logging
from trips.models import Trip, TripSimilarityScore, ProfileSimilarityScore
from user_account.models import User
import random

logger = logging.getLogger(__name__)

def calculate_trip_similarity(trip1, trip2):
    if trip1.type == 'plane' and trip2.type == 'plane':
        similarity_score = _calculate_flight_overlap(trip1, trip2)
    else:

        route1 = trip1.route
        route2 = trip2.route

        if 'transit_stops' in route1 and 'transit_stops' in route2:
            similarity_score = _calculate_route_overlap(route1, route2)
        else:
            similarity_score = random.random()
            
        if similarity_score == 0:
            similarity_score = random.random()
    similarity, created = TripSimilarityScore.objects.update_or_create(
        trip_id_1=trip1,
        trip_id_2=trip2,
        defaults={'similarity_score': similarity_score},
    )
    return similarity

def calculate_profile_similarity(user1, user2):
    user1_trips = Trip.objects.filter(user=user1)
    user2_trips = Trip.objects.filter(user=user2)

    common_trips = min(user1_trips.count(), user2_trips.count())
    total_similarity_score = 0

    for i in range(common_trips):
        trip1 = user1_trips[i]
        trip2 = user2_trips[i]
        trip_similarity = calculate_trip_similarity(trip1, trip2)
        total_similarity_score += trip_similarity.similarity_score

    if common_trips > 0:
        profile_similarity_score = total_similarity_score / common_trips
    else:
        profile_similarity_score = 0
        
    if profile_similarity_score == 0:
        profile_similarity_score = random.random()

    profile_similarity, created = ProfileSimilarityScore.objects.update_or_create(
        profile_1=user1,
        profile_2=user2,
        defaults={'similarity_score': profile_similarity_score},
    )
    return profile_similarity

def _calculate_flight_overlap(flight1, flight2):
    """
    Calculates overlap score based on the departure and arrival airport and departure time overlap.
    """
    if flight1.start != flight2.start:
        return 0
    
    time_diff = abs((flight1.start_time - flight2.start_time).total_seconds())
    if time_diff <= 10800:  # 3 hours
        overlap_score = 1 - (time_diff / 10800)
    else:
        overlap_score = 0
    
    return overlap_score

def _calculate_route_overlap(route1, route2):
    route1_stations = set(route1.get('transit_stops', []))
    route2_stations = set(route2.get('transit_stops', []))
    
    overlap_stations = route1_stations & route2_stations
    total_stations = route1_stations | route2_stations
    try: 
        overlap_score = len(overlap_stations) / len(total_stations)
    except ZeroDivisionError:
        overlap_score = 0
    
    return overlap_score