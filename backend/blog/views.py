"""
Views for Blog API
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.db.models import Q, Count
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
    lookup_field = 'slug'
    
    def get_queryset(self):
        """公開済みのライブページのみ取得"""
        return BlogPage.objects.live().public().select_related(
            'category', 'investment_type'
        ).prefetch_related('tags', 'related_tools')
    
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
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """
        関連記事取得API（SEO内部リンク用）
        
        アルゴリズム:
        1. 同一カテゴリを優先
        2. 同一投資タイプを次に優先
        3. 共通タグ数でスコアリング
        4. ビュー数も考慮
        5. 最大4件返却
        """
        page = self.get_object()
        tag_ids = list(page.tags.values_list('id', flat=True))
        
        # 関連記事クエリの構築
        related_pages = BlogPage.objects.live().public().filter(
            ~Q(id=page.id)  # 現在の記事を除外
        ).annotate(
            # カテゴリ一致で+3点
            category_match=models.Case(
                models.When(category=page.category, then=models.Value(3)),
                default=models.Value(0),
                output_field=models.IntegerField()
            ),
            # 投資タイプ一致で+2点
            investment_match=models.Case(
                models.When(investment_type=page.investment_type, then=models.Value(2)),
                default=models.Value(0),
                output_field=models.IntegerField()
            ),
        )
        
        # タグがある場合はタグ一致数も加算
        if tag_ids:
            related_pages = related_pages.annotate(
                tag_match_count=Count('tags', filter=Q(tags__id__in=tag_ids))
            ).annotate(
                relevance_score=models.F('category_match') + 
                               models.F('investment_match') + 
                               models.F('tag_match_count')
            )
        else:
            related_pages = related_pages.annotate(
                relevance_score=models.F('category_match') + 
                               models.F('investment_match')
            )
        
        # スコア順、ビュー数順でソート
        related_pages = related_pages.order_by(
            '-relevance_score', 
            '-view_count', 
            '-first_published_at'
        )[:4]
        
        serializer = BlogPageListSerializer(related_pages, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        })
