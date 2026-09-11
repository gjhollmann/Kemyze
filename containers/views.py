from django.shortcuts import render
from django.core.management.base import BaseCommand, CommandError
from django.core import serializers
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.db.models import Subquery, OuterRef
from common.models import Containers, Locations, ContainerAuditLog
from django.views.decorators.csrf import csrf_exempt
import json
import base64
import mimetypes

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
        if input == None:
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


def getSearchRecent(request):
    if request.method == "GET":
        #input = request.GET.get("input")
        count = request.GET.get("count")

        #if input == None:
            #return HttpResponseBadRequest("Missing parameter: 'input'")

        if count is None or not count.isdigit():
            count = 0
        else:
            count = int(count)

        try:
            recently_changed_data = []
            search_bar_input = request.GET.get("search", "") # Check search bar for specified chemical name.

            # If search bar contains input, query container table for matching chemical name. Else, query all records as targets.
            if search_bar_input.strip():
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
