from django.shortcuts import render
from django.http import JsonResponse
from .models import DummyModel
from django.views.decorators.csrf import csrf_exempt
import json
def hello_world(request):
    return JsonResponse({'message': 'hello world'})

@csrf_exempt
def add_to_db(request):
    body = json.loads(request.body)
    name = body["name"]
    description= body["description"]
    DummyModel.objects.create(name= name, description=description)
    return JsonResponse({'message': 'successfully persisted data'})

    
