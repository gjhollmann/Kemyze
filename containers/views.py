from django.shortcuts import render
from django.core.management.base import BaseCommand, CommandError
from django.core import serializers
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.db.models import Subquery, OuterRef
from common.models import Containers, Locations, ContainerAuditLog, Users
from django.views.decorators.csrf import csrf_exempt
import json
import base64
import mimetypes
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseForbidden, HttpResponseServerError

# Create your views here.
"""
Default View Used for backend route testing
"""
def containersMain(request):
    return HttpResponse("Hello from the containers backend for Kemyze")


"""
View to retrieve a container.
Route: /containers/getContainer?kemID=<kemIDInput>&accessLevel=<accessLevelInput>
Request Variables:
Method: GET
Parameters:
    kemID
    accessLevel

Response:
If given accessLevel parameter the following JSON is returned:
    data = {
        'container_id'
        'chemical_name'
        'cas_number'
        'expr_date'
        'acqn_date'
        'location'
        'quantity'
        'sds_sheet' (note this is encoded in base64, must be decoded to use)
    }
If not given an accessLevel parameter, function will only return SDS
    data = {
        'sds_sheet' (note this is encoded in base64, must be decoded to use)
    }
"""
def getContainer(request):
    if request.method == "GET":
        access = True
        accessLevel = request.GET.get("accessLevel")
        kemID = request.GET.get("kemID")
        if accessLevel == None and kemID == None:
            return HttpResponseBadRequest("Missing 'accessLevel' and 'kemID' Parameters")
        elif kemID == None:
            return HttpResponseBadRequest("Missing 'kemID' Parameter")
        elif accessLevel == None:
            access = False
        try:
            FoundContainer = Containers.objects.get(container_id=kemID)
            location = FoundContainer.location.name
            FoundLocation = FoundContainer.location
            while FoundLocation.parent != None:
                FoundLocation = FoundLocation.parent
                location = location + ', ' + FoundLocation.name
            if (access):
                data = {
                    'container_id': FoundContainer.container_id,
                    'chemical_name': FoundContainer.chemical_name,
                    'cas_number': FoundContainer.cas_number,
                    'expr_date': FoundContainer.expr_date,
                    'acqn_date': FoundContainer.acqn_date,
                    'location': location,
                    'quantity': FoundContainer.quantity,
                    'sds_sheet': FoundContainer.sds_sheet.decode("utf-8")
                }
            else:
                data = {
                    'sds_sheet': FoundContainer.sds_sheet.decode("utf-8")
                }
            return JsonResponse(data)
        except Containers.DoesNotExist:
            return HttpResponseBadRequest("Container does not exist")
        except Exception as e:
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
    else:
        return HttpResponseNotAllowed(["GET"])


"""
View to retrieve just an SDS for a container.
Used for testing SDS file format and retrieval. 
Route: /containers/getSDS?kemID=<kemIDInput>
Request Variables:
Method: GET
Parameters:
    kemID
    
Response:
    Page that displays the SDS pdf. 
"""
def getSDS(request):
    if request.method == "GET":
        kemID = request.GET.get("kemID")
        if kemID == None:
            return HttpResponseBadRequest("Missing 'kemID' Parameter")
        try:
            FoundContainer = Containers.objects.get(container_id=kemID)
            sdsSheet = base64.b64decode(FoundContainer.sds_sheet)
            chemName = FoundContainer.chemical_name
            fileName = chemName + "SDS.pdf"
            response = HttpResponse(sdsSheet, content_type="application/pdf")
            response["Content-Disposition"] = f'inline; filename={fileName}'

            return response
        except Containers.DoesNotExist:
            return HttpResponseBadRequest("Container does not exist")
    else:
        return HttpResponseNotAllowed(["GET"])

"""
View to retrieve a search.
Route: /containers/getSearch?input=<seachInput>&count=<indexOffset>
Request Variables:
Method: GET
Parameters:
    input
    count

Response:
The following will return data in the format of the following JSON
data = {
        {
            'container_id'
            'chemical_name'
            'cas_number'
            'expr_date'
            'acqn_date'
            'location'
            'quantity'
        }, 
        {
            'container_id'
            'chemical_name'
            'cas_number'
            'expr_date'
            'acqn_date'
            'location'
            'quantity'
        }, 
        ... Repeats until ten containers ...
    }
On receiving a count parameter, the response will send containers in between index count and count + 10
"""
def getSearch(request):
    if request.method == "GET":
        input = request.GET.get("input")
        count = request.GET.get("count")
        show_low = request.GET.get("show_low")

        if input == None:
            if show_low is not None:
                input = ""
            else:
                return HttpResponseBadRequest("Missing 'input' Parameter")
        if count is None or not count.isdigit():
            count = 0
        else:
            count = int(count)
        try:
            data = []
            if (input.isdigit()):
                FoundSearch = Containers.objects.filter(container_id=input).defer("sds_sheet") | Containers.objects.filter(chemical_name__icontains=input).defer("sds_sheet")  | Containers.objects.filter(location__name__icontains=input).defer("sds_sheet")
            else:
                FoundSearch = Containers.objects.filter(chemical_name__icontains=input).defer("sds_sheet")  | Containers.objects.filter(location__name__icontains=input).defer("sds_sheet")
            if show_low is not None and show_low.lower() == "true":
                FoundSearch = FoundSearch.filter(quantity__iexact="low")
            for container in FoundSearch[count:count+10]:
                location = container.location.name
                FoundLocation = container.location
                while FoundLocation.parent != None:
                    FoundLocation = FoundLocation.parent
                    location = location + ', ' + FoundLocation.name
                data.append({
                    'container_id': container.container_id,
                    'chemical_name': container.chemical_name,
                    'cas_number': container.cas_number,
                    'expr_date': container.expr_date,
                    'acqn_date': container.acqn_date,
                    'location': location,
                    'quantity': container.quantity,
                })
            return JsonResponse(data, safe=False)
        except Exception as error:
            return HttpResponseBadRequest(error)
    else:
        return HttpResponseNotAllowed(["GET"])

# If user selects 'Recently Changed,' display all RC containers. Include search bar input if present. 
def getSearchRecent(request):
    if request.method == "GET":
        count = request.GET.get("count")

        if count is None or not count.isdigit():
            count = 0
        else:
            count = int(count)

        try:
            recently_changed_data = []
            search_bar_input = request.GET.get("search", "") # Check search bar for specified chemical name.

            # If search bar contains input, query container table for matching chemical name. Else, query all records as targets.
            # Treat numeric values as container IDS and other types as different identifiers.
            if search_bar_input.strip():
                if search_bar_input.isdigit():
                    TargetContainers = Containers.objects.filter(container_id=search_bar_input)

                else:
                    TargetContainers = Containers.objects.filter(chemical_name__icontains=search_bar_input)

            else:
                TargetContainers = Containers.objects.all()

            # Query container_audit_log table, associating container_id with the container found in the query above. 
            # Order by changed_at (most recent change timestamp) in descending order, limiting output to 1 timestamp (for each container).
            most_recent_audit = ContainerAuditLog.objects.filter(container_id=OuterRef('container_id')).order_by('-changed_at').values('changed_at')[:1]
    
            # Use the timestamp returned by most_recent_audit to be represented as most_recent_change. 
            recently_changed_containers = (
            TargetContainers
                .annotate(most_recent_change=Subquery(most_recent_audit))
                .order_by('-most_recent_change', 'container_id')
            )
    
            for container in recently_changed_containers[count:count+10]:
                location = container.location.name
                found_location = container.location
    
                while found_location.parent != None:
                    found_location = found_location.parent
                    location = location + ', ' + found_location.name

                recently_changed_data.append({
                    'container_id': container.container_id,
                    'chemical_name': container.chemical_name,
                    'cas_number': container.cas_number,
                    'most_recent_change': container.most_recent_change,
                    'expr_date': container.expr_date,
                    'acqn_date': container.acqn_date,
                    'location': location,
                    'quantity': container.quantity,
                })
            return JsonResponse(recently_changed_data, safe=False)
        except Exception as error:
            return HttpResponseBadRequest(error)
    else:
        return HttpResponseNotAllowed(["GET"])  
# end def getSearchRecent    


"""
View to edit a container.
Route: /containers/editContainer
Request Variables:
Method: POST
Parameters:
    user_id
    container_id
    key + change combos

Responses:
    Failures:
        Status 405: Not a post request
        Status 400: Missing user_id Paramter
        Status 403: User does not have access level
        Status 400: User does not exist
        Status 400: Container does not exist
        Status 400: Location does not exist
        Status 500: Something broke bad
    
"""
@csrf_exempt
def editContainer(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        user_id = data.get("user_id")
        if user_id == None:
            return HttpResponseBadRequest("Missing 'user_id' Parameter")
        
        #Verify User access level
        try:
            FoundUser = Users.objects.get(user_id = user_id)
            if FoundUser.access_level > 3:
                return HttpResponseForbidden()
        except Users.DoesNotExist:
            return HttpResponseBadRequest("User does not exist")
        except Exception as e:
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
        # Edit container
        try:
            FoundContainer = Containers.objects.get(container_id=data.get("container_id"))
            
            if (data.get("chemical_name") != None):
                FoundContainer.chemical_name = data.get("chemical_name")
            if (data.get("cas_number") != None):
                FoundContainer.cas_number = data.get("cas_number")
            if (data.get("expr_date") != None):
                FoundContainer.expr_date = data.get("expr_date")
            if (data.get("acqn_date") != None):
                FoundContainer.acqn_date = data.get("acqn_date")
            if (data.get("quantity") != None):
                FoundContainer.quantity = data.get("quantity")
            
            newLocation = data.get("location")
            newRoom = data.get("room")
            newCabinet = data.get("cabinet")
            newShelf = data.get("shelf")
            if (newLocation != None and newRoom != None and newCabinet != None and newShelf != None):
                try:
                    FoundLocation = Locations.objects.get(name=newShelf, parent__name=newCabinet, parent__parent__name=newRoom, parent__parent__parent__name=newLocation)
                    FoundContainer.location = FoundLocation
                except FoundLocation.DoesNotExist:
                    return HttpResponseBadRequest("Location does not exist")
                except Exception as e:
                    print(e)
                    return HttpResponseServerError(f"An unexpected error occurred: {e}")
            FoundContainer.save()
            # Update Change log
            FoundLog = ContainerAuditLog.objects.last()
            FoundLog.changed_by = user_id
            FoundLog.save()
            
            # return Success
            return HttpResponse("Success")
        except Containers.DoesNotExist:
            print("Could not find container")
            return HttpResponseBadRequest("Container does not exist")
        except Exception as e:
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
        
        
        
    else:
        return HttpResponseNotAllowed(["POST"])

"""
View to get the children of a location.
Used to build location input options in edit container 
Route: /containers/getLocationChildren
Request Variables:
Method: GET
Parameters:
    location
    
Responses:
    Failures:
        Status 400: Location does not exist
        Status 500: Something broke bad
"""
def getLocationChildren(request):
    if request.method == "GET":
        location = request.GET.get("location")
        room = request.GET.get("room")
        cabinet = request.GET.get("cabinet")
        shelf = request.GET.get("shelf")
        try:
            FoundLocation = None
            if (shelf!=None):
                FoundLocation = Locations.objects.filter(name=shelf, parent__name=cabinet, parent__parent__name=room, parent__parent__parent__name=location).first()
            elif (cabinet!=None):
                FoundLocation = Locations.objects.filter(name=cabinet, parent__name=room, parent__parent__name=location).first()
            elif (room!=None):
                FoundLocation = Locations.objects.filter(name=room,parent__name=location).first()
            elif (location!=None):
                FoundLocation = Locations.objects.get(name=location)
            
            childLocations = None
            if (FoundLocation != None):
                childLocations = Locations.objects.filter(parent=FoundLocation)
            else:
                childLocations = Locations.objects.filter(parent__isnull=True)
            data = []
            for child in childLocations:
                data.append({
                    'name': child.name,
                })
            return JsonResponse(data, safe=False)
        except Locations.DoesNotExist:
            return HttpResponseBadRequest("Location does not exist")
        except Exception as e:
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
    else:
        return HttpResponseNotAllowed(["GET"])

"""
View to get the last 20 changes of a container.
Route: /containers/getContainerChangeLog
Request Variables:
Method: GET
Parameters:
    container_id
    
Responses:
    Failures:
        Status 400: Missing container_id
        Status 400: Container not found
        Status 500: Something broke bad
"""
def getContainerChangeLog(request):
    if request.method == "GET":
        container_id = request.GET.get("container_id")
        if container_id == None:
            return HttpResponseBadRequest("Missing 'container_id' Parameter")
        try:
            FoundLogs = ContainerAuditLog.objects.filter(container_id=container_id).order_by('-changed_at')[:20]
            data = []
            for log in FoundLogs:
                user_first_name = ''
                user_last_name = ''
                try:
                    FoundUser = Users.objects.get(user_id=log.changed_by)
                    user_first_name = FoundUser.first_name
                    user_last_name = FoundUser.last_name
                except Users.DoesNotExist:
                    user_first_name = 'Tester'
                    user_last_name = 'User'
                old_values = log.old_values
                new_values = log.new_values
                
                old_name = old_values.get("chemical_name")
                new_name = new_values.get("chemical_name")
                if (old_name!=new_name):
                    data.append({
                    'Date': log.changed_at.date(),
                    'Time': log.changed_at.time(),
                    'ContainerID': container_id,
                    'User': user_first_name + " " + user_last_name,
                    'Type': "Edit",
                    'Change': "Name",
                    'Old': old_name,
                    'New': new_name
                    })
                    
                old_cas = old_values.get("cas_number")
                new_cas = new_values.get("cas_number")
                if (old_cas!=new_cas):
                    data.append({
                    'Date': log.changed_at.date(),
                    'Time': log.changed_at.time(),
                    'ContainerID': container_id,
                    'User': user_first_name + " " + user_last_name,
                    'Type': "Edit",
                    'Change': "CAS",
                    'Old': old_cas,
                    'New': new_cas
                    })
                
                old_quantity = old_values.get("quantity")
                new_quantity = new_values.get("quantity")
                if (old_quantity!=new_quantity):
                    data.append({
                    'Date': log.changed_at.date(),
                    'Time': log.changed_at.time(),
                    'ContainerID': container_id,
                    'User': user_first_name + " " + user_last_name,
                    'Type': "Quantity",
                    'Change': "Quantity",
                    'Old': old_quantity,
                    'New': new_quantity
                    })
                    
                old_acqn_date = old_values.get("acqn_date")
                new_acqn_date = new_values.get("acqn_date")
                if (old_acqn_date!=new_acqn_date):
                    data.append({
                    'Date': log.changed_at.date(),
                    'Time': log.changed_at.time(),
                    'ContainerID': container_id,
                    'User': user_first_name + " " + user_last_name,
                    'Type': "Edit",
                    'Change': "Acqn Date",
                    'Old': old_acqn_date,
                    'New': new_acqn_date
                    })
                    
                old_expr_date = old_values.get("expr_date")
                new_expr_date = new_values.get("expr_date")
                if (old_acqn_date!=new_acqn_date):
                    data.append({
                    'Date': log.changed_at.date(),
                    'Time': log.changed_at.time(),
                    'ContainerID': container_id,
                    'User': user_first_name + " " + user_last_name,
                    'Type': "Edit",
                    'Change': "Expr Date",
                    'Old': old_expr_date,
                    'New': new_expr_date
                    })
                    
                """
                data.append({
                    'Date': log.changed_at.date(),
                    'Time': log.changed_at.time(),
                    'ContainerID': container_id,
                    'User': user_first_name + " " + user_last_name
                    
                })
                """
                
                old_location = ''
                try:
                    FoundLocation = Locations.objects.get(location_id=old_values.get("location_id"))
                    old_location = FoundLocation.name
                    while (FoundLocation.parent != None):
                        FoundLocation = FoundLocation.parent
                        old_location = FoundLocation.name + ', ' + old_location
                except:
                    old_location = ''
                new_location = ''
                try:
                    FoundLocation = Locations.objects.get(location_id=new_values.get("location_id"))
                    new_location = FoundLocation.name
                    while (FoundLocation.parent != None):
                        FoundLocation = FoundLocation.parent
                        new_location = FoundLocation.name + ', ' + new_location
                except:
                    new_location = ''
                    
                if (old_location!=new_location):
                    data.append({
                    'Date': log.changed_at.date(),
                    'Time': log.changed_at.time(),
                    'ContainerID': container_id,
                    'User': user_first_name + " " + user_last_name,
                    'Type': "Location",
                    'Change': "Location",
                    'Old': old_location,
                    'New': new_location
                    })
 
            return JsonResponse(data, safe=False)
        except Containers.DoesNotExist:
            print("Could not find container")
    else:
        return HttpResponseNotAllowed(["GET"])

"""
View to upload an SDS PDF for a container.
Route: /containers/uploadSDS
Request Variables:
Method: POST (multipart/form-data)
Parameters:
    user_id       - required
    container_id  - optional. Present when attaching to an existing
                    container (Edit Container flow). Absent when the
                    container hasn't been created yet (Add Container flow) -
                    in that case the base64 is just handed back so the
                    client can include it when it does create the container.
    sds_file      - required. The PDF itself.
 
Response:
    data = {
        'success': True,
        'sds_base64'  (base64-encoded string of the PDF, matches the same
                       encoding already used for Containers.sds_sheet)
    }
 
Failures:
    Status 405: Not a POST request
    Status 400: Missing 'user_id' Parameter
    Status 400: Missing 'sds_file' Parameter
    Status 400: User does not exist
    Status 403: User does not have access level
    Status 400: Container does not exist (only checked when container_id given)
    Status 415: File is not a valid PDF
    Status 500: Something broke bad
"""
@csrf_exempt
def uploadSDS(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
 
    user_id = request.POST.get("user_id")
    container_id = request.POST.get("container_id")
    sds_file = request.FILES.get("sds_file")
 
    if user_id is None:
        return HttpResponseBadRequest("Missing 'user_id' Parameter")
    if not sds_file:
        return HttpResponseBadRequest("Missing 'sds_file' Parameter")
 
    # Verify user access level (same pattern as editContainer)
    # Change this if you want to allow other access levels to upload SDS files.
    try:
        FoundUser = Users.objects.get(user_id=user_id)
        if FoundUser.access_level > 3:
            return HttpResponseForbidden("User does not have permission to upload SDS documents")
    except Users.DoesNotExist:
        return HttpResponseBadRequest("User does not exist")
    except Exception as e:
        print(e)
        return HttpResponseServerError(f"An unexpected error occurred: {e}")
 
    # PDF file validation by checking magic bytes.
    # stops a renamed non-PDF from getting through.
    file_bytes = sds_file.read()
    reported_pdf_mime = sds_file.content_type == "application/pdf"
    if not reported_pdf_mime or file_bytes[:4] != b"%PDF":
        return HttpResponse("Uploaded file is not a valid PDF", status=415)
 
    # Same encoding Containers.sds_sheet uses
    # raw base64 bytes, since sds_sheet is a BinaryField.
    encoded = base64.b64encode(file_bytes)
 
    # Only attach directly when we already have a real container row
    # (the Edit Container flow). The Add Container flow doesn't have a
    # container yet, so there's nothing to attach to until it's created.
    if container_id:
        try:
            FoundContainer = Containers.objects.get(container_id=container_id)
            FoundContainer.sds_sheet = encoded
            FoundContainer.save()
        except Containers.DoesNotExist:
            return HttpResponseBadRequest("Container does not exist")
        except Exception as e:
            print(e)
            return HttpResponseServerError(f"An unexpected error occurred: {e}")
    data = {
        "success": True,
        "sds_base64": encoded.decode("utf-8"),
    }
    return JsonResponse(data)

"""
View to create a new container.
Route: /containers/createContainer
Request Variables:
Method: POST (application/json, same convention as editContainer)
Parameters:
    user_id        - required
    chemical_name  - required
    cas_number     - optional
    expr_date      - optional (YYYY-MM-DD), container has no expiration if omitted
    acqn_date      - required (YYYY-MM-DD)
    quantity       - required
    location       - required. Top-level location name (matches editContainer's
                     "location" param - the root of the location hierarchy)
    room           - required
    cabinet        - required
    shelf          - required
    sds_base64     - required. The base64 string returned by uploadSDS's
                     response when it was called without a container_id
                     (Add Container flow always uploads the SDS first).
 
Response:
    data = {
        'success': True,
        'container_id': <the new container's id>
    }
 
Failures:
    Status 405: Not a POST request
    Status 400: Missing 'user_id' Parameter
    Status 400: Missing '<field>' Parameter (chemical_name, acqn_date,
                quantity, sds_base64, or the location fields)
    Status 400: User does not exist
    Status 403: User does not have access level
    Status 400: Location does not exist
    Status 500: Something broke bad
"""
@csrf_exempt
def createContainer(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
 
    data = json.loads(request.body)
    user_id = data.get("user_id")
    if user_id is None:
        return HttpResponseBadRequest("Missing 'user_id' Parameter")
 
    # Verify user access level
    # access levels > 3 are not allowed to create containers
    # chnage this if needed
    try:
        FoundUser = Users.objects.get(user_id=user_id)
        if FoundUser.access_level > 3:
            return HttpResponseForbidden("User does not have permission to create containers")
    except Users.DoesNotExist:
        return HttpResponseBadRequest("User does not exist")
    except Exception as e:
        print(e)
        return HttpResponseServerError(f"An unexpected error occurred: {e}")
 
    chemical_name = data.get("chemical_name")
    acqn_date = data.get("acqn_date")
    quantity = data.get("quantity")
    sds_base64 = data.get("sds_base64")
    location_name = data.get("location")
    room = data.get("room")
    cabinet = data.get("cabinet")
    shelf = data.get("shelf")
 
    if not chemical_name:
        return HttpResponseBadRequest("Missing 'chemical_name' Parameter")
    if not acqn_date:
        return HttpResponseBadRequest("Missing 'acqn_date' Parameter")
    if not quantity:
        return HttpResponseBadRequest("Missing 'quantity' Parameter")
    if not sds_base64:
        return HttpResponseBadRequest("Missing 'sds_base64' Parameter")
    if not (location_name and room and cabinet and shelf):
        return HttpResponseBadRequest("Missing location fields")
 
    # Resolve the leaf Locations row (same lookup pattern as editContainer)
    try:
        FoundLocation = Locations.objects.get(
            name=shelf,
            parent__name=cabinet,
            parent__parent__name=room,
            parent__parent__parent__name=location_name,
        )
    except Locations.DoesNotExist:
        return HttpResponseBadRequest("Location does not exist")
    except Exception as e:
        print(e)
        return HttpResponseServerError(f"An unexpected error occurred: {e}")
 
    try:
        # sds_base64 arrives as a JSON string (uploadSDS already decoded it
        # to utf-8 str for its own response), so it needs to be re-encoded
        # back to bytes here - sds_sheet stores the same raw base64 bytes
        # uploadSDS/getContainer use everywhere else in this file.
        NewContainer = Containers.objects.create(
            chemical_name=chemical_name,
            cas_number=data.get("cas_number"),
            expr_date=data.get("expr_date"),
            acqn_date=acqn_date,
            location=FoundLocation,
            quantity=quantity,
            sds_sheet=sds_base64.encode("utf-8"),
        )
    except Exception as e:
        print(e)
        return HttpResponseServerError(f"An unexpected error occurred: {e}")
 
    data = {
        "success": True,
        "container_id": NewContainer.container_id,
    }
    return JsonResponse(data)
