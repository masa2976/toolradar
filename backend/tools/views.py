"""
Views for Tools API
"""
from django.db import models
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Tool
from .serializers import ToolSerializer, ToolListSerializer


class ToolFilter(django_filters.FilterSet):
    """ツール検索用カスタムフィルタ"""
    
    # プラットフォームフィルタ（複数選択可）
    platform = django_filters.CharFilter(method='filter_platform')
    
    # ツールタイプフィルタ（複数指定可、カンマ区切り）
    tool_type = django_filters.CharFilter(method='filter_tool_type')
    
    # 価格タイプフィルタ
    price_type = django_filters.ChoiceFilter(choices=Tool.PRICE_TYPE_CHOICES)
    
    # タグフィルタ（複数選択可、カンマ区切り）
    tags = django_filters.CharFilter(method='filter_tags')
    
    # リボンフィルタ
    ribbons = django_filters.CharFilter(method='filter_ribbons')
    
    class Meta:
        model = Tool
        fields = ['platform', 'tool_type', 'price_type', 'tags', 'ribbons']
    
    def filter_platform(self, queryset, name, value):
        """プラットフォームフィルタ（カンマ区切りで複数指定可、OR条件）"""
        platforms = [p.strip() for p in value.split(',')]
        # CharFieldのin検索でOR条件（mt4 OR mt5 OR tradingview）
        return queryset.filter(platform__in=platforms)
    
    def filter_tool_type(self, queryset, name, value):
        """ツールタイプフィルタ(カンマ区切りで複数指定可、OR条件)"""
        tool_types = [t.strip() for t in value.split(',')]
        # CharFieldのin検索でOR条件（EA OR Strategy OR Indicator）
        return queryset.filter(tool_type__in=tool_types)
    
    def filter_tags(self, queryset, name, value):
        """タグフィルタ（カンマ区切りで複数指定可）"""
        tag_slugs = [slug.strip() for slug in value.split(',')]
        for slug in tag_slugs:
            queryset = queryset.filter(tags__slug=slug)
        return queryset.distinct()
    
    def filter_ribbons(self, queryset, name, value):
        """リボンフィルタ（カンマ区切りで複数指定可）"""
        ribbons = [r.strip() for r in value.split(',')]
        for ribbon in ribbons:
            queryset = queryset.filter(ribbons__contains=[ribbon])
        return queryset


class ToolViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ツールAPI
    
    list: ツール一覧取得（検索・フィルタリング対応）
    retrieve: ツール詳細取得
    related: 関連ツール取得（SEO内部リンク用）
    
    ソートオプション:
    - ordering=-week_score: 人気順（週間スコア降順）
    - ordering=-created_at: 新着順
    - ordering=name: 名前順（昇順）
    """
    lookup_field = 'slug'
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ToolFilter
    search_fields = ['name', 'short_description', 'long_description']
    ordering_fields = ['created_at', 'name', 'week_score']
    ordering = ['-week_score', '-created_at']  # デフォルトは人気順
    
    def get_queryset(self):
        """
        week_scoreでのソートをサポートするため、
        statsをannotateしてweek_scoreをToolレベルで参照可能にする
        """
        from django.db.models import F, Value
        from django.db.models.functions import Coalesce
        
        return Tool.objects.prefetch_related('tags').select_related('stats').annotate(
            # statsがないツールは0として扱う
            week_score=Coalesce(F('stats__week_score'), Value(0.0))
        )
    
    def get_serializer_class(self):
        """一覧と詳細でシリアライザを使い分け"""
        if self.action == 'list':
            return ToolListSerializer
        return ToolSerializer
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """
        関連ツール取得API（SEO内部リンク用）
        
        アルゴリズム:
        1. 同じタグを持つツールを取得
        2. タグ一致数でスコアリング
        3. 同じplatform/tool_typeで追加スコア
        4. スコア順でソート、最大6件返却
        """
        from django.db.models import Count, Case, When, IntegerField, Value
        from rest_framework.response import Response
        
        tool = self.get_object()
        tag_ids = list(tool.tags.values_list('id', flat=True))
        
        if not tag_ids:
            # タグがない場合は同じplatform/tool_typeで取得
            related_tools = Tool.objects.filter(
                platform=tool.platform,
                tool_type=tool.tool_type
            ).exclude(id=tool.id).order_by('-created_at')[:6]
        else:
            # タグベースで関連ツールを取得
            related_tools = Tool.objects.filter(
                tags__id__in=tag_ids
            ).exclude(
                id=tool.id
            ).annotate(
                # タグ一致数をカウント
                tag_match_count=Count('tags', filter=models.Q(tags__id__in=tag_ids)),
                # 同じplatformなら+2点
                platform_match=Case(
                    When(platform=tool.platform, then=Value(2)),
                    default=Value(0),
                    output_field=IntegerField()
                ),
                # 同じtool_typeなら+1点
                type_match=Case(
                    When(tool_type=tool.tool_type, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField()
                ),
            ).annotate(
                # 総合スコア = タグ一致数 + platform + tool_type
                relevance_score=models.F('tag_match_count') + models.F('platform_match') + models.F('type_match')
            ).order_by('-relevance_score', '-created_at').distinct()[:6]
        
        serializer = ToolListSerializer(related_tools, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        })
