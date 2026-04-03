from django.shortcuts import render
from django.http import HttpResponse
from common.models import Users

# Create your views here.

#This function tests to ensure the routing to this app works
def tester(request):
    return HttpResponse("Hello from the login backend for Kemyze")

#This function tests to ensure the models for this app work
def newModelTest(request):
    myData = Users.objects.all().values()
    return HttpResponse(myData)