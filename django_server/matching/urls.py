from django.urls import path
from matching import views
from .views import HandleProfileAPIView,GetAvatarAPIView,GetProfilePicAPIView,GetAllProfileForMatching, GetAllMatchesAndNonMatches, AllProfiles, CSVFile, UndoDelete, BlockReportMatchAPIView, MatchRecommendations, GetAvatarURLAPIView, GetProfileURLAPIView, IncomingRequests

urlpatterns = [
    path('profile', HandleProfileAPIView.as_view(),name="profile"),
    path('profile/profilePic', GetProfilePicAPIView.as_view(),name="profilePic"),
    path('profile/avatarPic', GetAvatarAPIView.as_view(),name="avatarPic"),
    path('profile/profilePicUrl', GetProfileURLAPIView.as_view(),name="profilePicUrl"),
    path('profile/avatarPicUrl', GetAvatarURLAPIView.as_view(),name="avatarPicUrl"),
    path('profile/otherUsers', GetAllProfileForMatching.as_view(),name="profileMatches"),
    path('profile/matches', GetAllMatchesAndNonMatches.as_view(),name="matches"),
    path('profile/allProfiles', AllProfiles.as_view(),name="allProfiles"),
    path('profile/undoDelete', UndoDelete.as_view(),name="undoDelete"),
    path('profile/convertToCsv', CSVFile.as_view()),
    path('profile/recommendations', MatchRecommendations.as_view()),
    path('profile/block_report', BlockReportMatchAPIView.as_view(),name="blockReport"),
    path('profile/requests', IncomingRequests.as_view()),
]
