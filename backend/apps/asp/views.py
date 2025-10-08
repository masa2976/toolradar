from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Broker
from .serializers import BrokerSerializer


class BrokerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ASP証券会社API
    
    読み取り専用（list, retrieve）
    """
    queryset = Broker.objects.filter(is_active=True)
    serializer_class = BrokerSerializer
    permission_classes = [AllowAny]  # 公開API
    
    def get_queryset(self):
        """有効な証券会社をrank順で取得"""
        return Broker.objects.filter(is_active=True).order_by('rank', '-created_at')
