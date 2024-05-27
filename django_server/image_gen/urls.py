from django.urls import path
from matching import views
from .views import CreateImage
urlpatterns = [
    path('createPicture', CreateImage.as_view(),name='createPicture'),
]