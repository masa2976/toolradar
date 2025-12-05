from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q
from random import choices
from .models import ASPAd
from .serializers import ASPAdSerializer, ASPAdSimpleSerializer


class ASPAdViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ASP広告API（業界標準設計）

    エンドポイント:
    - GET /api/asp/ads/ - 広告一覧
    - GET /api/asp/ads/{id}/ - 広告詳細
    - GET /api/asp/ads/?placement=homepage-middle - 配置場所でフィルタ
    - GET /api/asp/ads/get_ad/?placement=xxx&strategy=random - 広告取得（ローテーション対応）
    - POST /api/asp/ads/{id}/impression/ - 表示数カウント
    - POST /api/asp/ads/{id}/click/ - クリック数カウント
    """
    serializer_class = ASPAdSimpleSerializer
    permission_classes = [AllowAny]  # 公開API

    def get_queryset(self):
        """
        有効な広告を取得（期限チェック含む）
        """
        now = timezone.now()
        queryset = ASPAd.objects.filter(is_active=True)

        # 期限チェック
        # 開始日が設定されている場合、現在時刻より前
        queryset = queryset.filter(
            Q(start_date__isnull=True) | Q(start_date__lte=now)
        )

        # 終了日が設定されている場合、現在時刻より後
        queryset = queryset.filter(
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        )

        # パラメータでフィルタ
        placement = self.request.query_params.get('placement', None)
        if placement:
            queryset = queryset.filter(placement=placement)

        # 優先度順にソート
        return queryset.order_by('priority', '-weight', '-created_at')

    def get_serializer_class(self):
        """
        詳細表示時は完全なシリアライザーを使用
        """
        if self.action == 'retrieve':
            return ASPAdSerializer
        return ASPAdSimpleSerializer

    @action(detail=False, methods=['get'])
    def get_ad(self, request):
        """
        配置場所に応じた広告を返す（ローテーション対応）

        GET /api/asp/ads/get_ad/?placement=homepage-middle&strategy=random

        Parameters:
        - placement (required): 配置場所
        - strategy (optional): priority | random (デフォルト: priority)
        """
        placement = request.query_params.get('placement')
        strategy = request.query_params.get('strategy', 'priority')

        if not placement:
            return Response(
                {'error': 'placement parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ads = self.get_queryset().filter(placement=placement)

        if not ads.exists():
            return Response(None, status=status.HTTP_204_NO_CONTENT)

        # 戦略に応じて広告選択
        if strategy == 'random':
            # 重み付きランダム選択
            ad = choices(
                population=list(ads),
                weights=[ad.weight for ad in ads],
                k=1
            )[0]
        else:
            # 優先度順（priority → weight → created_at）
            ad = ads.first()

        # 表示数カウント（非同期推奨だが、ここでは同期）
        ad.increment_impressions()

        return Response(ASPAdSimpleSerializer(ad).data)

    @action(detail=True, methods=['post'])
    def impression(self, request, pk=None):
        """
        表示数をカウント

        POST /api/asp/ads/{id}/impression/
        """
        ad = self.get_object()
        ad.increment_impressions()

        return Response({
            'status': 'success',
            'impressions': ad.impressions,
            'message': '表示数をカウントしました'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def click(self, request, pk=None):
        """
        クリック数をカウント

        POST /api/asp/ads/{id}/click/
        """
        ad = self.get_object()
        ad.increment_clicks()

        return Response({
            'status': 'success',
            'clicks': ad.clicks,
            'ctr': ad.ctr,
            'message': 'クリック数をカウントしました'
        }, status=status.HTTP_200_OK)
