# Path: trips/services/trip_service.py
from django.utils import timezone
from trips.models import Trip
from ..utils import get_commute_route
from django.http import JsonResponse
import logging
import timeit

logger = logging.getLogger(__name__)


def create_trip(user, body):
    start = body.data["start"]
    end = body.data["end"]
    type = body.data["type"]
    start_time = body.data["start_time"]


    commute_info = get_commute_route(start, end, type, start_time)
 
    if not commute_info:
        return None


    trip = Trip.objects.create(
        user=user,
        type=type,
        start=start,
        end=end,
        start_time=start_time,
        route=commute_info
    )
    return trip

def get_trip(trip_id):
    try:
        trip = Trip.objects.get(id=trip_id)
        return trip
    except Trip.DoesNotExist:
        return None

def update_trip(trip_id, user, body):
    try:
        trip = Trip.objects.get(id=trip_id, user=user)
        update_route = False
        start = body.data.get("start")
        end = body.data.get("end")
        type = body.data.get("type")
        start_time = body.data.get("start_time")

        if start and trip.start != start:
            trip.start = start
            update_route = True
        if end and trip.end != end:
            trip.end = end
            update_route = True
        if type and trip.type != type:
            trip.type = type

        if start_time:
            trip.start_time = start_time

        if update_route:

            

            commute_info = get_commute_route(start, end, type, start_time)

            if not commute_info:
                return None

            trip.route = commute_info

        trip.save()
        return trip
    except Trip.DoesNotExist:
        return None

def delete_trip(trip_id, user):
    try:
        trip = Trip.objects.get(id=trip_id, user=user)
        trip.delete()
    except Trip.DoesNotExist:
        pass

def list_trips_for_user(user):
    trips_queryset = Trip.objects.filter(user=user)

    trips_list = [
        [trip.id, trip.start, trip.end, trip.user.username, trip.get_type_display(), trip.start_time.strftime('%Y-%m-%d %H:%M:%S')]
        for trip in trips_queryset
    ]

    return JsonResponse(trips_list, safe=False)