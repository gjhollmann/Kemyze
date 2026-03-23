  


from django.http import HttpResponse, JsonResponse
from .models import TestTable, ContainerChangeLog


def tester(request):
    return HttpResponse("Hello from Kemyze")


def dbtester(request):
    myData = list(TestTable.objects.all().values())
    return JsonResponse(myData, safe=False)


def _serialize_log(log):
    return {
        "audit_id": log.audit_id,
        "container_id": log.container_id,
        "action_type": log.action_type,
        "old_values": log.old_values,
        "new_values": log.new_values,
        "changed_by": log.changed_by,
        "changed_at": log.changed_at.isoformat() if log.changed_at else None,
    }


def get_change_log(request, container_id):
    try:
        logs = ContainerChangeLog.objects.filter(
            container_id=container_id
        ).order_by("-changed_at", "-audit_id")

        data = [_serialize_log(log) for log in logs]
        return JsonResponse(data, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_most_recent_change(request, container_id):
    try:
        latest_log = (
            ContainerChangeLog.objects.filter(container_id=container_id)
            .order_by("-changed_at", "-audit_id")
            .first()
        )

        if latest_log is None:
            return JsonResponse(
                {"message": "No changes found for this container"},
                status=404
            )

        return JsonResponse(_serialize_log(latest_log), safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)