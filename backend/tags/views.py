"""
Views for Tags API
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Tag, TagCategory
from .serializers import TagSerializer, TagCategorySerializer


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    タグAPI
    
    list: タグ一覧取得
    retrieve: タグ詳細取得
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    
    # ページネーションを無効化（タグは全件取得が適切）
    pagination_class = None
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tag_category__slug']  # カテゴリでフィルタリング
    search_fields = ['name', 'synonyms']  # 名前・synonymsで検索
    ordering_fields = ['name', 'tag_category__display_order']
    ordering = ['tag_category__display_order', 'name']  # デフォルトソート
    
    def get_queryset(self):
        """select_relatedでN+1問題を防ぐ"""
        return Tag.objects.select_related('tag_category').all()


class TagCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    タグカテゴリAPI
    
    list: カテゴリ一覧取得
    retrieve: カテゴリ詳細取得
    """
    queryset = TagCategory.objects.all()
    serializer_class = TagCategorySerializer
    lookup_field = 'slug'
    
    # ページネーションを無効化
    pagination_class = None
    
    ordering = ['display_order']
