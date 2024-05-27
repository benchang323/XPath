# backend/matching/urls.py
from django.urls import path
from matching import views
from .views import LangChainPartOne, Movie, MovieTwo
from . import embedding, similarity

urlpatterns = [
    path('fruit', LangChainPartOne.fruit_langchain_tutorial),
    path('surfer', LangChainPartOne.as_view()),
    path('movie', Movie.as_view()),
    path('movie2', MovieTwo.as_view()),
    path('createEmbedding', embedding.generate_embeddings_req),
    path('getSimilarUsers', similarity.similarity_search),
    path('cypherQuery', similarity.cypher_query),
    path('actualCypherQuery', similarity.actual_cypher_query)
]
