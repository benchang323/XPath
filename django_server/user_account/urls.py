from django.urls import path
from . import views  # Import the views module from the user_account directory
from .views import RegisterAPIView, LoginAPIView, UserAPIView, RefreshAPIView, LogoutAPIView, ChangePasswordAPIView, DeleteAccountAPIView, GenerateOTPAPIView, ValidateOTPAPIView, CheckVerifiedStatus, SosAPIView, ChangeRPasswordAPIView

urlpatterns = [
    # Endpoint for creating a new user account
    path('register', RegisterAPIView.as_view(),name='register'),
    path('login', LoginAPIView.as_view(),name='login'),
    path('user', UserAPIView.as_view(),name='user'),
    path('refresh', RefreshAPIView.as_view(),name='refresh'),
    path('logout', LogoutAPIView.as_view(),name='logout'),
    path('changePassword', ChangePasswordAPIView.as_view(),name='changePassword'),
    path('deleteAccount', DeleteAccountAPIView.as_view(),name='deleteAccount'),
    path('generateOTP', GenerateOTPAPIView.as_view(),name='generateOTP'),
    path('validateOTP', ValidateOTPAPIView.as_view(),name='validateOTP'),
    path('isUserVerified', CheckVerifiedStatus.as_view(),name='isUserVerified'),
    path('sos', SosAPIView.as_view(), name='sos'),
    path('changeRPassword', ChangeRPasswordAPIView.as_view(),name='changeRPassword'),

    # # Endpoint for user login
    # path('login/', views.login, name='login'),

    # # Endpoint for refreshing the access token
    # path('refresh_access_token/', views.refresh_access_token, name='refresh_access_token'),

    # # Endpoint for deleting a user account
    # path('delete_account/', views.delete_account, name='delete_account'),

    # # Endpoint for finding authenticated user
    # path('find_user/', views.find_user, name='find_user'),

    # # Endpoint for getting all user accounts
    # path('get_all_users/', views.get_all_users, name='get_all_users'),

    # # Endpoint for changing user password
    # path('change_password/', views.change_password, name='change_password'),
]
