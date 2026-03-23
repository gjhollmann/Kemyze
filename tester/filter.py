from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import ChangeLogs
from .serializers import ChangeLogsSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def get_change_logs(request):
    target_id = request.GET.get('ContainerID')
    target_user = request.GET.get('Name')

    logs = ChangeLogs.objects.all().order_by('-date_field', '-time_field')

    if target_id:
        logs = logs.filter(container_id=target_id)
    if target_user:
        logs = logs.filter(changed_by_name__icontains=target_user)

    serializer = ChangeLogsSerializer(logs, many=True)
    return Response(serializer.data)