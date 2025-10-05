"""
Views for Blog API
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import BlogPage, BlogCategory, InvestmentType
from .serializers import (
    BlogPageSerializer,
    BlogPageListSerializer,
    BlogCategorySerializer,
    InvestmentTypeSerializer,
)


class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ブログカテゴリAPI
    
    list: カテゴリ一覧取得
    retrieve: カテゴリ詳細取得
    """
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    lookup_field = 'slug'


class InvestmentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    投資タイプAPI
    
    list: 投資タイプ一覧取得
    retrieve: 投資タイプ詳細取得
    """
    queryset = InvestmentType.objects.all()
    serializer_class = InvestmentTypeSerializer
    lookup_field = 'slug'


class BlogPageFilter(django_filters.FilterSet):
    """ブログ記事検索用カスタムフィルタ"""
    
    # カテゴリフィルタ
    category = django_filters.CharFilter(field_name='category__slug')
    
    # 投資タイプフィルタ
    investment_type = django_filters.CharFilter(field_name='investment_type__slug')
    
    # タグフィルタ（カンマ区切りで複数指定可）
    tags = django_filters.CharFilter(method='filter_tags')
    
    class Meta:
        model = BlogPage
        fields = ['category', 'investment_type', 'tags']
    
    def filter_tags(self, queryset, name, value):
        """タグフィルタ（カンマ区切りで複数指定可）"""
        tag_slugs = [slug.strip() for slug in value.split(',')]
        for slug in tag_slugs:
            queryset = queryset.filter(tags__slug=slug)
        return queryset.distinct()


class BlogPageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ブログ記事API
    
    list: 記事一覧取得（検索・フィルタリング対応）
    retrieve: 記事詳細取得
    """
    # 公開済みのライブページのみ取得
    queryset = BlogPage.objects.live().public().select_related(
        'category', 'investment_type'
    ).prefetch_related('tags', 'related_tools')
    
    lookup_field = 'slug'
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BlogPageFilter
    search_fields = ['title', 'excerpt', 'body']
    ordering_fields = ['first_published_at', 'last_published_at', 'view_count']
    ordering = ['-first_published_at']  # デフォルトは新着順
    
    def get_serializer_class(self):
        """一覧と詳細でシリアライザを使い分け"""
        if self.action == 'list':
            return BlogPageListSerializer
        return BlogPageSerializer
