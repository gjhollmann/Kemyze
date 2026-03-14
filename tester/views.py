from django.shortcuts import render
from django.http import HttpResponse
from .models import TestTable

def tester(request):
    return HttpResponse("Hello from Kemyze")

def dbtester(request):
    myData = TestTable.objects.all().values()
    return HttpResponse(myData)