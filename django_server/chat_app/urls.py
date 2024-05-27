from django.urls import path
from .views import GetStreamChatDetails, OtherUserInChat, ChatBot
urlpatterns = [
    path('user', GetStreamChatDetails.as_view(),name='getUser'),
    path('otherUser/<str:connectionID>/', OtherUserInChat.as_view(),name='getOtherUser'),
    path('history', ChatBot.as_view()),
    # path('chatbot', ChatbotView.as_view()),
    # path('streamlit-app', StreamlitAppView.as_view()),
]
