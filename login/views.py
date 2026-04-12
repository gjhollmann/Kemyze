from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from common.models import Users
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
import json

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
            return HttpResponseBadRequest("Missing 'Password' Parameter")
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


# Handle user's forgotten password specification.
@csrf_exempt
def forgotPasswordReq(request):
    if request.method == "POST":
        data = json.loads(request.body) # Extract email from JSON payload. 
        user_email = data.get("email")
        
        if not user_email or not user_email.strip():
            rejection = {
                            "status": "error",
                            "message": "Missing or empty email parameter."
                        }
            return JsonResponse(rejection, status=400)
        
        else:    
            try:
                ValidUser = Users.objects.get(email=user_email)
                # Successful attempt logs to be added.

                email_subject = "Kemyze: Reset Password"
                reset_msg = "Hello - please follow the email reset instructions below." # Generic instruction prompt.
                from_email = "no-reply@kemyze.com" # Test sender.
                send_mail(email_subject, reset_msg, from_email, 
                          [user_email], fail_silently=False) # Use fail_silently for testing.

            except Users.DoesNotExist:
                ValidUser = None
                # Failed attempt logs to be added.
    
        confirmation = {
                            "status": "OK", 
                            "message": "Reset instructions have been sent."
                       } # Generic response (existent or non-existent user).
        return JsonResponse(confirmation, status=200)
    
    else:
        return HttpResponseNotAllowed(["POST"])
# end forgotPasswordReq        




