from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from common.models import Users, Locations
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password, make_password
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
View to add a User
Route: /login/addUser
Request Variables:
Method: POST
Parameters:
    user_id
    name
    location
    phone
    email
    authorization
    password

Responses:
    Failures:
        Status 405: Not a post request
        Status 400: Missing Parameter
        Status 403: User does not have access level
        Status 400: User does not exist
        Status 500: Something broke bad
"""
@csrf_exempt
def addUser(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        user_id = data.get("user_id")
        if user_id == None:
            return HttpResponseBadRequest("Missing 'user_id' Parameter")
        name = data.get("name")
        if (name == None) or (name == ''):
            return HttpResponseBadRequest("Missing name Parameter")
        location = data.get("location")
        if (location == None) or (name == ''):
            return HttpResponseBadRequest("Missing location Parameter")
        phone = data.get("phone")
        if (phone == None) or (phone == ''):
            return HttpResponseBadRequest("Missing phone Parameter")
        email = data.get("email")
        if (email == None) or (email == ''):
            return HttpResponseBadRequest("Missing email Parameter")
        authorization = data.get("authorization")
        if (authorization == None) or (authorization == ''):
            return HttpResponseBadRequest("Missing authorization Parameter")
        password = data.get("password")
        if (password == None) or (password == ''):
            return HttpResponseBadRequest("Missing password Parameter")
        

        #Verify User access level
        FoundUser = None
        try:
            FoundUser = Users.objects.get(user_id = user_id)
        except Users.DoesNotExist:
            return HttpResponseBadRequest("User does not exist")
        except Exception as e:
            print("Error in Finding User")
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
        #Verify Location
        FoundLocation = None
        try:
            FoundLocation = Locations.objects.filter(name = location, type = 'site').first()
        except Locations.DoesNotExist:
            return HttpResponseBadRequest("Location does not exist")
        except Exception as e:
            print("Error in finding location")
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
        #Verify User Access
        if (FoundUser.access_level >= 3 and FoundUser.location != FoundLocation):
            return HttpResponseForbidden("User is not allowed to make users in this location")
        elif (FoundUser.access_level >= 4) :
            return HttpResponseForbidden("User is not allowed to make users")
        
        #Verify User doesn't already exist
        try:
            ExistingUser = Users.objects.get(email = email)
            return HttpResponseBadRequest("User Already Exists")
        except Users.DoesNotExist:
            print("User does not already exist. Continuing Add user")
        except Exception as e:
            print("Error in Finding Existing User")
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
        
            
        # Add User
        try:
            names = name.split()
            first_name = names[0]
            last_name = ''
            if (len(names) > 1):
                last_name = names[1]
            match authorization:
                case "Primary":
                    authorization = 1
                case "Secondary":
                    authorization = 2
                case "Tertiary":
                    authorization = 3
                case "Quaternary":
                    authorization = 4
                case _:
                    authorization = 5
                
            new_row = Users.objects.create(first_name=first_name, last_name=last_name, email=email, phone=phone, password=make_password(password), access_level = authorization, location = FoundLocation)
            return HttpResponse("User made")
        except Exception as e:
            print("Error in adding User")
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
    else:
        return HttpResponseNotAllowed(["POST"])
