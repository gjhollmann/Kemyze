from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from .models import Container
from .serializers import ContainerSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def get_change_logs(request):
    target_id = request.GET.get('id')

    if target_id:
        logs = Container.objects.filter(container_id=target_id).order_by('-timestamp')
    else:
        logs = Container.objects.all().order_by('-timestamp')

    serializer = ContainerSerializer(logs, many=True)
    return Response(serializer.data)