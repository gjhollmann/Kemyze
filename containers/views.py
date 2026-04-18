from django.shortcuts import render
from django.core.management.base import BaseCommand, CommandError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from common.models import Containers, Locations
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

