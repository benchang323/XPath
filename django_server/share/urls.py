from django.urls import path
from .views import SharingAbilityAPIView, ShareProfileAPIView, GetProfileAPIView

urlpatterns = [
    path('sharingstatus/', SharingAbilityAPIView.as_view(), name='sharingstatus'),
    path('shareprofile/', ShareProfileAPIView.as_view(), name='shareprofile'),
    path('getprofile/<int:friend_profile_id>/', GetProfileAPIView.as_view(), name='getprofile'),
]
