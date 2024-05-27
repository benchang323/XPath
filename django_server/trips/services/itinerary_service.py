# Path: trips/services/itinerary_service.py
from trips.models import Itinerary

def create_itinerary(user, request):
    body = request.data 
    trip_ids = body["trip_ids"]
    initial_location = body["initial_location"]
    final_location = body["final_location"]
    mode_of_transportation = body["mode_of_transportation"]
    
    itinerary = Itinerary(
        user=user,
        trip_ids=trip_ids,
        initial_location=initial_location,
        final_location=final_location,
        mode_of_transportation=mode_of_transportation
    )
    itinerary.save()
    return itinerary


def get_itinerary(itinerary_id):
    try:
        return Itinerary.objects.get(id=itinerary_id)
    except Itinerary.DoesNotExist:
        return None
    
def delete_itinerary(itinerary_id, user):
    try:
        itinerary = Itinerary.objects.get(id=itinerary_id, user=user)
        itinerary.delete()
        return True
    except Itinerary.DoesNotExist:
        return False


def list_itineraries_for_user(user):
    return Itinerary.objects.filter(user=user)