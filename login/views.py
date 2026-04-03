from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from common.models import Users

# Create your views here.


def loginMain(request):
    if request.method == "GET":
        User = request.GET.get("User")
        Password = request.GET.get("Password")
        if User == None and Password == None:
            return HttpResponseBadRequest("Missing 'User' and 'Password' Parameters")
        elif User == None:
            return HttpResponseBadRequest("Missing 'User' Parameter")
        elif Password == None:
            return HttpResponseBadRequest("Missing 'Password' Paramter")
        else:
            try:
                FoundUser = Users.objects.get(email=User, password=Password)
                data = {'userID': FoundUser.user_id, 'accessLevel': FoundUser.access_level}
                return JsonResponse(data)
            except Users.DoesNotExist:
                return HttpResponseBadRequest("User does not exist")
    else:
        return HttpResponse("Hello from the login backend for Kemyze")

#This function tests to ensure the models for this app work
def newModelTest(request):
    myData = Users.objects.all().values()
    return HttpResponse(myData)