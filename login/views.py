from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseForbidden, HttpResponseServerError
from common.models import Users
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
import json

# Create your views here.
"""
Original function loginMain(...) preserved for validation. 
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
"""

# Function loginMain(...) modified to compare a passed plaintext password
# with stored, encoded Django hash using 'check_password.' Django in-house
# hashing API employs SHA-256.
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
                FoundUser = Users.objects.get(email=User)

                # Invoke check_password to compare plaintext to hash. 
                if check_password(Password, FoundUser.password):
                    data = {
                        'userID': FoundUser.user_id,
                        'accessLevel': FoundUser.access_level
                    }
                    return JsonResponse(data)
                else: # Return a generic login error if check_password evaluates to False.
                    return HttpResponseBadRequest("Login failed; invalid information.")
            except Users.DoesNotExist:
                return HttpResponseBadRequest("Login failed; invalid information.") # Reproduce generic login error message. 
    else:
        return HttpResponse("Hello from the login backend for Kemyze")
# end loginMain(...)


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

"""
View to retrieve a user's profile information.
Route: /login/getUser?active_user_id=<id>&user_id=<id>
Request Variables:
Method: GET
Parameters:
    active_user_id - required. The user making the request.
    user_id        - required. The user whose information is requested.

Response:
    data = {
        'user_id', 'first_name', 'last_name', 'email', 'phone',
        'access_level', 'location' (name, or null)
    }
    The password is never returned.

Failures:
    Status 405: Not a GET request
    Status 400: Missing 'active_user_id' Parameter
    Status 400: Missing 'user_id' Parameter
    Status 400: Invalid user id
    Status 400: Active user does not exist
    Status 400: Requested user does not exist
    Status 403: Active user does not have access to this user
    Status 500: Something broke bad
"""
def getUser(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    active_user_id = request.GET.get("active_user_id")
    user_id = request.GET.get("user_id")
    if active_user_id is None:
        return HttpResponseBadRequest("Missing 'active_user_id' Parameter")
    if user_id is None:
        return HttpResponseBadRequest("Missing 'user_id' Parameter")

    try:
        ActiveUser = Users.objects.get(user_id=active_user_id)
    except (ValueError, TypeError):
        return HttpResponseBadRequest("Invalid user id")
    except Users.DoesNotExist:
        return HttpResponseBadRequest("Active user does not exist")
    except Exception as e:
        print(e)
        return HttpResponseServerError(f"An unexpected error occurred: {e}")

    try:
        RequestedUser = Users.objects.get(user_id=user_id)
    except (ValueError, TypeError):
        return HttpResponseBadRequest("Invalid user id")
    except Users.DoesNotExist:
        return HttpResponseBadRequest("Requested user does not exist")
    except Exception as e:
        print(e)
        return HttpResponseServerError(f"An unexpected error occurred: {e}")

    # user can always view themselves
    # Level 4+ cannot view other users; level 3 only users at their own location.
    if ActiveUser.user_id != RequestedUser.user_id:
        if ActiveUser.access_level >= 4:
            return HttpResponseForbidden("User does not have access to other users' information")
        if ActiveUser.access_level == 3 and ActiveUser.location_id != RequestedUser.location_id:
            return HttpResponseForbidden("User does not have access to users in this location")

    data = {
        "user_id": RequestedUser.user_id,
        "first_name": RequestedUser.first_name,
        "last_name": RequestedUser.last_name,
        "email": RequestedUser.email,
        "phone": RequestedUser.phone,
        "access_level": RequestedUser.access_level,
        "location": RequestedUser.location.name if RequestedUser.location else None,
    }
    return JsonResponse(data)