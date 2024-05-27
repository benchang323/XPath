# Path: trips/api/urls.py
from django.urls import path
from .views import trip_views, similarity_views, itinerary_views

app_name = "trips"

urlpatterns = [
    path('create/', trip_views.CreateTripAPIView.as_view(), name='create_trip'),
    path('<int:trip_id>/', trip_views.TripDetailAPIView.as_view(), name='get_trip'),
    path('<int:trip_id>/update/', trip_views.TripDetailAPIView.as_view(), name='update_trip'),
    path('<int:trip_id>/delete', trip_views.TripDetailAPIView.as_view(), name='delete_trip'),
    path('', trip_views.ListTripsForUserAPIView.as_view(), name='list_trips_for_user'),
    path('multiple-itineraries/create/', itinerary_views.CreateMultipleItineraryAPIView.as_view(), name='create_multiple_itinerary'),
    path('multiple-itineraries/<int:itinerary_id>/', itinerary_views.MultipleItineraryDetailAPIView.as_view(), name='get_multiple_itinerary'),
    path('multiple-itineraries/', itinerary_views.ListMultipleItinerariesAPIView.as_view(), name='list_multiple_itineraries'),
    path('multiple-itineraries/<int:itinerary_id>/delete', itinerary_views.MultipleItineraryDetailAPIView.as_view(), name='delete_multiple_itinerary'),
    path('<int:trip_id_1>/<int:trip_id_2>/calculate_similarity/', similarity_views.CalculateTripSimilarityAPIView.as_view(), name='calculate_trip_similarity'),
    path('<int:user_id_1>/<int:user_id_2>/calculate_profile_similarity/', similarity_views.CalculateProfileSimilarityAPIView.as_view(), name='calculate_profile_similarity'),
]