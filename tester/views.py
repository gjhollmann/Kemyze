from django.shortcuts import render
from django.http import HttpResponse

def tester(request):
    return HttpResponse("Hello from Kemyze")