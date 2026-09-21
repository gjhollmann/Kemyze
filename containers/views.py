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
                return HttpResponseForbidden
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


