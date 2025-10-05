"""
Views for Tags API
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Tag
from .serializers import TagSerializer


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    タグAPI
    
    list: タグ一覧取得
    retrieve: タグ詳細取得
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']  # カテゴリでフィルタリング
    search_fields = ['name', 'synonyms']  # 名前・synonymsで検索
    ordering_fields = ['name', 'category']
    ordering = ['category', 'name']  # デフォルトソート
