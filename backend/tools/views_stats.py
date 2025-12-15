"""
週間ランキングAPI
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Tool
from .models_stats import ToolStats, EventLog
from .serializers_stats import (
    WeeklyRankingSerializer,
    EventTrackingSerializer
)


class WeeklyRankingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    週間ランキングAPI
    
    list: 週間ランキング取得（TOP50）
    
    クエリパラメータ:
    - platform: プラットフォームフィルタ（mt4|mt5|tradingview）
    - tool_type: ツールタイプフィルタ（EA|Indicator|Library|Script|Strategy）
    """
    serializer_class = WeeklyRankingSerializer
    
    # ページネーション無効化（TOP50のみ表示）
    pagination_class = None
    
    def get_queryset(self):
        """クエリセット取得（プラットフォーム・ツールタイプフィルタ対応）"""
        queryset = ToolStats.objects.select_related('tool').filter(
            current_rank__isnull=False,
            current_rank__lte=50
        ).order_by('current_rank')
        
        # プラットフォームフィルタ
        platform = self.request.query_params.get('platform')
        if platform:
            # CharFieldの単純な等価比較
            queryset = queryset.filter(tool__platform=platform)
        
        # ツールタイプフィルタ
        tool_type = self.request.query_params.get('tool_type')
        if tool_type:
            queryset = queryset.filter(tool__tool_type=tool_type)
        
        # limit パラメータ対応
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """ランキング一覧取得"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # レスポンスにメタ情報を追加
        return Response({
            'updated_at': queryset.first().last_updated if queryset.exists() else None,
            'count': queryset.count(),
            'rankings': serializer.data
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def track_event(request):
    """
    イベントトラッキングAPI
    
    POST /api/events/track/
    
    ボディ:
    {
        "tool_id": 1,
        "event_type": "view"|"duration"|"share",
        "duration_seconds": 45,  // durationの場合のみ
        "share_platform": "twitter"  // shareの場合のみ
    }
    """
    serializer = EventTrackingSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    data = serializer.validated_data
    
    # ツールの存在確認
    try:
        tool = Tool.objects.get(id=data['tool_id'])
    except Tool.DoesNotExist:
        return Response(
            {'error': 'ツールが見つかりません'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # User-Agent取得
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # Bot判定（Botの場合は記録しない）
    if EventLog.is_bot(user_agent):
        return Response(
            {'message': 'Bot detected, event not tracked'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    # IPアドレス取得
    ip_address = request.META.get('REMOTE_ADDR')
    
    # イベント記録
    event = EventLog.objects.create(
        tool=tool,
        event_type=data['event_type'],
        duration_seconds=data.get('duration_seconds'),
        share_platform=data.get('share_platform'),
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return Response(
        {'message': 'Event tracked successfully'},
        status=status.HTTP_201_CREATED
    )
