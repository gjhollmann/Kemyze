from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from django.http import HttpResponse
from .models import TestTable
from .models import Container
from .serializers import ContainerSerializer

def tester(request):
    return HttpResponse("Hello from Kemyze")

def dbtester(request):
    myData = TestTable.objects.all().values()
    return HttpResponse(myData)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_containers(request):
    containers = Container.objects.all()
    serializer = ContainerSerializer(containers, many=True)
    return Response(serializer.data)
