
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import DestinationisLiked, SimilarityView,LikeDestination,DestinationListCreate,DestinationDelete,add_update_recommendation,get_recommendations
from django.http import HttpResponse

urlpatterns = [
    path('trip/<str:destination_name>/isLiked/', DestinationisLiked.as_view(), name='destination_is_liked'),
    path('trip/<str:destination_name>/', LikeDestination.as_view(), name='like_unlike_destination'),
    path('destination/', DestinationListCreate.as_view(), name='destination-list-create'),
    path('destination/delete/<str:name>/', DestinationDelete.as_view(), name='destination-delete'),
    path('recommendations/add/', add_update_recommendation, name='add_update_recommendation'),
    path('recommendations/', get_recommendations, name='get_recommendations'),
    path('similarity/', SimilarityView.as_view(), name='similarity'),
    path('test/', csrf_exempt(lambda request: HttpResponse("Test URL works!"))),
]

