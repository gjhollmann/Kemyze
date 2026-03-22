from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import Q
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


@api_view(['GET'])
@permission_classes([AllowAny])
def search_containers(request):
    query = request.GET.get('q', '')

    containers = Container.objects.filter(
        Q(chemical_name__icontains=query) |
        Q(cas_number__icontains=query) |
        Q(location__icontains=query)
    )

    serializer = ContainerSerializer(containers, many=True)
    return Response(serializer.data)