from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .services.liked_trip_service import LikedDestinationsService
from rest_framework.response import Response
from rest_framework.authentication import get_authorization_header
from user_account.authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from user_account.repository import user_auth_repository
from rest_framework import status
from .models import Destination
from .serializer import DestinationSerializer
from urllib.parse import unquote
from graph_converter.views import add_to_bucketlist, delete_from_bucketlist, get_all_destinations_liked_by_profile
from matching.repository import profile_repository
from rest_framework.exceptions import APIException

from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Recommendation
from django.db.models import F

from django.db.models import Q
from .models import Profile, LikeDestinations
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated



class DestinationListCreate(APIView):
    #uses the django's ORM to get all destinations from table
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            user_id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(user_id)
            profile_repo_obj = profile_repository.ProfileRepository()
            profile = profile_repo_obj.get_profile_by_user_id(user_id)
            Destinations = Destination.objects.filter(profile=profile)
            serializer = DestinationSerializer(Destinations, many=True)
            return Response(serializer.data)
    
    @csrf_exempt
    def post(self, request):
        serializer = DestinationSerializer(data=request.data)
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            user_id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(user_id)
            profile_repo_obj = profile_repository.ProfileRepository()
            profile = profile_repo_obj.get_profile_by_user_id(user_id)
            
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if serializer.is_valid():
            dest_name = serializer.validated_data.get('name')
            destination_exists = Destination.objects.filter(name=dest_name, profile=profile).first()
            if destination_exists:
                return Response({'message': 'Destinatoin already exists so did not need create a new one'}, status=200)
            serializer.save(profile=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DestinationDelete(APIView):
    @csrf_exempt
    def delete(self, request, name):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            user_id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(user_id)
            profile_repo_obj = profile_repository.ProfileRepository()
            profile = profile_repo_obj.get_profile_by_user_id(user_id)
            try:
                destination = Destination.objects.get(name=name, profile=profile)
                name = destination.name
                unquoted = unquote(name)
                # destination.delete()
                service = LikedDestinationsService()
                success = service.unlike_destination_for_user(user, unquoted)
                destination.delete()
                if success:
                    delete_from_bucketlist(profile.profile_id, name)
                    return JsonResponse({"message": "Destination unliked and deleted successfully"}, status=200)
                return JsonResponse({"status": "success", "message": "Destination deleted successfully"})
            except Destination.DoesNotExist:
                return JsonResponse({"error": "Destination not found"}, status=status.HTTP_404_NOT_FOUND)
            




@csrf_exempt
@api_view(['POST'])
def add_update_recommendation(request):
    auth = get_authorization_header(request).split()

    if auth and len(auth) == 2:
        token = auth[1].decode('utf-8')
        user_id = decode_access_token(token)
        user_auth_repository_obj = user_auth_repository.UserAuthRepository()
        user = user_auth_repository_obj.get_user_by_id(user_id)


    city_names = request.data.get('recommendations')

    if not city_names:
        return Response({'error': 'City name is required'}, status=400)

    try:
        with transaction.atomic():
            for city_name in city_names:
                recommendation, created = Recommendation.objects.get_or_create(
                    user=user,
                    city_name=city_name,
                    defaults={'count': 1}
                )
                if not created:
                    recommendation.count = F('count') + 1
                    recommendation.save()
            
            return Response({'message': 'Recommendations updated'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def get_recommendations(request):
    auth = get_authorization_header(request).split()

    if auth and len(auth) == 2:
        token = auth[1].decode('utf-8')
        user_id = decode_access_token(token)
        user_auth_repository_obj = user_auth_repository.UserAuthRepository()
        user = user_auth_repository_obj.get_user_by_id(user_id)

    try:
        recommendations = Recommendation.objects.filter(user=user).order_by('-count')[:8]
        result = [{'city_name': rec.city_name, 'count': rec.count} for rec in recommendations]
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
class SimilarityView(APIView):
    @csrf_exempt
    def get(self, request):
        try:
            auth = get_authorization_header(request).split()
            if not auth or len(auth) != 2:
                return Response({'error': 'Authorization token not found or invalid'}, status=401)

            token = auth[1].decode('utf-8')
            user_id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(user_id)
            profile_repo_obj = profile_repository.ProfileRepository()
            current_profile = profile_repo_obj.get_profile_by_user_id(user_id)

            if not current_profile or not hasattr(current_profile, 'liked_destinations'):
                return Response({'message': 'No liked destinations found for the current user'}, status=200)

            # Get all liked destinations for the current profile
            current_likes_list = current_profile.liked_destinations.all()
            current_likes = [json.loads(ld.liked_destinations) for ld in current_likes_list if ld.liked_destinations]

            if not current_likes:
                return Response([])

            # Fetch all other profiles' likes
            other_profiles_likes = LikeDestinations.objects.exclude(profile=current_profile)
            similarity_scores = []
            for other_likes in other_profiles_likes:
                other_liked_cities = json.loads(other_likes.liked_destinations) if other_likes.liked_destinations else []
                common_likes = len(set(sum(current_likes, [])) & set(other_liked_cities))
                if common_likes > 0:
                    similarity_score = {
                        'profile_id': other_likes.profile.id,
                        'similarity_fraction': common_likes / float(len(sum(current_likes, [])))
                    }
                    similarity_scores.append(similarity_score)

            return Response(similarity_scores)
        
        except Exception as e:
            # If anything unexpected happens, return an APIException with a message
            raise APIException(detail=str(e), code=500)



#a view to like and unlike trips

class LikeDestination(APIView):
    @csrf_exempt
    def post(self, request, destination_name):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            user_id = decode_access_token(token)
            user_auth_repository_obj = user_auth_repository.UserAuthRepository()
            user = user_auth_repository_obj.get_user_by_id(user_id)
            profile_repo_obj = profile_repository.ProfileRepository()
            profile = profile_repo_obj.get_profile_by_user_id(user_id)
            service = LikedDestinationsService()
            quoted_name = destination_name
            destination_name = unquote(destination_name)
            action = request.query_params.get('action')

            if action == 'like':
                success = service.like_destination_for_user(user, destination_name)
                add_to_bucketlist(profile.profile_id, quoted_name)
                
            elif action == 'unlike':
                success = service.unlike_destination_for_user(user, destination_name)
                if success:
                    delete_from_bucketlist(profile.profile_id, quoted_name)
            else:
                return JsonResponse({'error': 'Invalid action'}, status=400)

            if success:
                return JsonResponse({'status': 'success', 'message': f'City {action}d successfully'})
            else:
                return JsonResponse({'error': 'Operation failed'}, status=500)

#a view to check for liked

class DestinationisLiked(APIView):
    @csrf_exempt        
    def get(self, request, destination_name):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                user_id = decode_access_token(token)  
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(user_id)  

                service = LikedDestinationsService()
                is_liked = service.is_destination_liked_by_user(user, destination_name)         
                return Response({"isLiked": is_liked})
            
            except Exception as e:
                return Response({"error": str(e)}, status=500)
        else:
            return Response({"error": "Authorization token not provided"}, status=401)

class AllLikedDestinations(APIView):
    @csrf_exempt
    def get(self, request):
        auth = get_authorization_header(request).split()
        if auth and len(auth) == 2:
            try:
                token = auth[1].decode('utf-8')
                user_id = decode_access_token(token)
                user_auth_repository_obj = user_auth_repository.UserAuthRepository()
                user = user_auth_repository_obj.get_user_by_id(user_id)
                profile_repo_obj = profile_repository.ProfileRepository()
                profile_id = profile_repo_obj.get_profile_by_user_id(user)
                result = get_all_destinations_liked_by_profile(profile_id.profile_id)
                service = LikedDestinationsService()
                destinations = service.get_all_liked_destinations_for_user(result)
                return Response({"destinations": destinations})

            except Exception as e:
                return Response({"error": str(e)}, status=500)
        else:
            return Response({"error": "Authorization token not provided"}, status=401)
        


