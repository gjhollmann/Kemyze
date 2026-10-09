from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotAllowed
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


@csrf_exempt
def deleteUser(request):
    """Delete a user when the requesting user has tertiary-or-higher access."""
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Request body must be valid JSON."}, status=400)

    requesting_user_id = data.get("user_id")
    target_user_id = data.get("target_user_id")

    if requesting_user_id is None or target_user_id is None:
        return JsonResponse(
            {"success": False, "message": "Both 'user_id' and 'target_user_id' are required."},
            status=400,
        )

    try:
        requesting_user_id = int(requesting_user_id)
        target_user_id = int(target_user_id)
    except (TypeError, ValueError):
        return JsonResponse(
            {"success": False, "message": "User IDs must be valid numbers."},
            status=400,
        )

    if requesting_user_id <= 0 or target_user_id <= 0:
        return JsonResponse(
            {"success": False, "message": "User IDs must be positive numbers."},
            status=400,
        )

    if requesting_user_id == target_user_id:
        return JsonResponse(
            {"success": False, "message": "You cannot delete your own account."},
            status=400,
        )

    try:
        requesting_user = Users.objects.get(user_id=requesting_user_id)
    except Users.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "Requesting user does not exist."},
            status=400,
        )

    # Access levels 1 through 3 correspond to primary, secondary, and tertiary.
    if requesting_user.access_level > 3:
        return HttpResponseForbidden("User does not have permission to delete accounts.")

    try:
        target_user = Users.objects.get(user_id=target_user_id)
    except Users.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "User to delete does not exist."},
            status=404,
        )

    target_user.delete()
    return JsonResponse(
        {"success": True, "message": "User deleted successfully.", "user_id": target_user_id},
        status=200,
    )




