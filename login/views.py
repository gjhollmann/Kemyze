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
            return JsonResponse(rejection)
        
        else:    
            try:
                valid_user = Users.objects.get(email=user_email)
                
                email_subject = "Kemyze: Reset Password"
                reset_msg = "Hello, please reset your password below."
                from_email = "no-reply@kemyze.com"
                send_mail(email_subject, reset_msg, from_email, [user_email], fail_silently=False)

            except Users.DoesNotExist:
                valid_user = None
    
        confirmation = {
                            "status": "OK", 
                            "message": "If an account associated with this email exists, reset instructions have been sent."
                       }
        return JsonResponse(confirmation)
    else:
        return HttpResponseNotAllowed(["POST"])
# end forgotPasswordReq        