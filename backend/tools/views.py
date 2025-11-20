"""
Views for Tools API
"""
from rest_framework import viewsets, filters
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
    """
    queryset = Tool.objects.prefetch_related('tags').all()
    lookup_field = 'slug'
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ToolFilter
    search_fields = ['name', 'short_description', 'long_description']
    ordering_fields = ['created_at', 'name', 'price']
    ordering = ['-created_at']  # デフォルトは新着順
    
    def get_serializer_class(self):
        """一覧と詳細でシリアライザを使い分け"""
        if self.action == 'list':
            return ToolListSerializer
        return ToolSerializer
