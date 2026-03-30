from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def tester(request):
    return HttpResponse("Hello from the login backend for Kemyze")