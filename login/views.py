from django.shortcuts import render
from django.db.models import Q
from common.models import Locations, Users
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseForbidden, HttpResponseServerError
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

"""
View to edit a user's profile.
Route: /login/editUser
Method: POST (JSON body)
Body:
    active_user_id - required. The user making the request.
    user_id        - required. The user being edited.
    Optional (only sent when changed): first_name, last_name, email,
    phone, access_level, location (name), password (plaintext, hashed here).

Failures:
    405 Not a POST request
    400 Invalid JSON / missing or invalid fields / user does not exist
    403 Active user may not edit this user or set these values
    500 Unexpected error
"""
@csrf_exempt
def editUser(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        body = json.loads(request.body)
    except (ValueError, TypeError):
        return HttpResponseBadRequest("Invalid JSON")

    active_user_id = body.get("active_user_id")
    user_id = body.get("user_id")
    if active_user_id is None:
        return HttpResponseBadRequest("Missing 'active_user_id' Parameter")
    if user_id is None:
        return HttpResponseBadRequest("Missing 'user_id' Parameter")

    try:
        ActiveUser = Users.objects.get(user_id=active_user_id)
        TargetUser = Users.objects.get(user_id=user_id)
    except (ValueError, TypeError):
        return HttpResponseBadRequest("Invalid user id")
    except Users.DoesNotExist:
        return HttpResponseBadRequest("User does not exist")
    except Exception as e:
        print(e)
        return HttpResponseServerError(f"An unexpected error occurred: {e}")

    is_self = ActiveUser.user_id == TargetUser.user_id

    # Permission checks

    if ActiveUser.access_level > 3:
        return HttpResponseForbidden("User does not have permission to edit profiles")

    if not is_self:
        if ActiveUser.access_level == 3 and ActiveUser.location_id != TargetUser.location_id:
            return HttpResponseForbidden("User does not have access to users in this location")
        # Lower number = more privilege; can't edit someone above you
        if TargetUser.access_level < ActiveUser.access_level:
            return HttpResponseForbidden("User cannot edit a higher-access user")

    try:
        if "first_name" in body:
            TargetUser.first_name = str(body["first_name"]).strip()
        if "last_name" in body:
            TargetUser.last_name = str(body["last_name"]).strip()

        if "email" in body:
            email = str(body["email"]).strip()
            if not email or "@" not in email:
                return HttpResponseBadRequest("Invalid email")
            if Users.objects.filter(email=email).exclude(user_id=TargetUser.user_id).exists():
                return HttpResponseBadRequest("That email is already in use")
            TargetUser.email = email

        if "phone" in body:
            TargetUser.phone = str(body["phone"]).strip()

        if "access_level" in body:
            new_level = int(body["access_level"])
            if new_level < 1 or new_level > 4:
                return HttpResponseBadRequest("Invalid access level")
            if new_level < ActiveUser.access_level:
                return HttpResponseForbidden("User cannot grant a higher access level than their own")
            if is_self and new_level != TargetUser.access_level:
                return HttpResponseForbidden("User cannot change their own access level")
            TargetUser.access_level = new_level

        if "location" in body:
            if is_self and ActiveUser.access_level > 3:
                return HttpResponseForbidden("User cannot change their own location")
            matches = Locations.objects.filter(name=body["location"])
            if matches.count() != 1:
                return HttpResponseBadRequest("Location not found or ambiguous")
            TargetUser.location = matches.first()
            
            # Hash the password before storing; never store plaintext
        if body.get("password"):
            TargetUser.password = make_password(body["password"])


        TargetUser.save()
    except ValueError:
        return HttpResponseBadRequest("Invalid value")
    except Exception as e:
        print(e)
        return HttpResponseServerError(f"An unexpected error occurred: {e}")

    return HttpResponse("Success")

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


def _get_accessible_location_ids(root_location_id):
    """Return a location ID and all of its descendant location IDs."""
    accessible_location_ids = {root_location_id}
    parent_location_ids = [root_location_id]

    while parent_location_ids:
        child_location_ids = list(
            Locations.objects.filter(parent_id__in=parent_location_ids).values_list(
                "location_id", flat=True
            )
        )
        parent_location_ids = [
            location_id
            for location_id in child_location_ids
            if location_id not in accessible_location_ids
        ]
        accessible_location_ids.update(parent_location_ids)

    return accessible_location_ids


@csrf_exempt
def searchManagedUsers(request):
    """Return one page of accounts the requesting user is allowed to manage.

    Access levels are ordered from most to least privileged. Primary, secondary,
    and tertiary users therefore have levels 1, 2, and 3 respectively. A
    requesting user can only see accounts in their assigned location tree that
    have a numerically higher (less privileged) access level.
    """
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "message": "Request body must be valid JSON."},
            status=400,
        )

    requesting_user_id = data.get("user_id")
    search = data.get("search", "")
    offset = data.get("offset", 0)

    if requesting_user_id is None:
        return JsonResponse(
            {"success": False, "message": "'user_id' is required."},
            status=400,
        )

    if not isinstance(search, str):
        return JsonResponse(
            {"success": False, "message": "'search' must be text."},
            status=400,
        )

    try:
        requesting_user_id = int(requesting_user_id)
        offset = int(offset)
    except (TypeError, ValueError):
        return JsonResponse(
            {"success": False, "message": "'user_id' and 'offset' must be valid numbers."},
            status=400,
        )

    if requesting_user_id <= 0 or offset < 0:
        return JsonResponse(
            {"success": False, "message": "'user_id' must be positive and 'offset' cannot be negative."},
            status=400,
        )

    try:
        requesting_user = Users.objects.select_related("location").get(
            user_id=requesting_user_id
        )
    except Users.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "Requesting user does not exist."},
            status=404,
        )

    # Primary, secondary, and tertiary access levels are 1 through 3.
    if requesting_user.access_level > 3:
        return HttpResponseForbidden("User does not have permission to search managed accounts.")

    is_primary = requesting_user.access_level == 1

    # If primary user, return ALL users in database.
    if is_primary:
        managed_users = Users.objects.all()
    else:
        if requesting_user.location_id is None:
            return JsonResponse(
                {"success": False, "message": "Requesting user does not have an assigned location."},
                status=400,
            )

        accessible_location_ids = _get_accessible_location_ids(requesting_user.location_id)

        managed_users = Users.objects.filter(
            location_id__in=accessible_location_ids,
            access_level__gt=requesting_user.access_level,
        )

    normalized_search = search.strip()
    if normalized_search:
        managed_users = managed_users.filter(
            Q(first_name__icontains=normalized_search)
            | Q(last_name__icontains=normalized_search)
            | Q(location__name__icontains=normalized_search)
        )

    page_size = 10
    page = list(
        managed_users.select_related("location")
        .order_by("first_name", "last_name", "user_id")[offset : offset + page_size + 1]
    )
    has_more = len(page) > page_size

    return JsonResponse(
        {
            "success": True,
            "results": [
                {
                    "id": user.user_id,
                    "name": f"{user.first_name} {user.last_name}".strip(),
                    "location": user.location.name if user.location else "",
                    "access_level": user.access_level,
                }
                for user in page[:page_size]
            ],
            "offset": offset,
            "next_offset": offset + page_size if has_more else None,
            "has_more": has_more,
        },
        status=200,
    )

