"""
Serializers for Tags API
"""
from rest_framework import serializers
from .models import Tag, TagCategory


class TagCategorySerializer(serializers.ModelSerializer):
    """タグカテゴリのシリアライザ"""
    
    tag_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TagCategory
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'display_order',
            'tag_count',
        ]
        read_only_fields = ['id']
    
    def get_tag_count(self, obj):
        """このカテゴリに属するタグの数"""
        return obj.tags.count()


class TagSerializer(serializers.ModelSerializer):
    """タグのシリアライザ"""
    
    tool_count = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()  # 後方互換性のため
    category_detail = TagCategorySerializer(source='tag_category', read_only=True)
    
    class Meta:
        model = Tag
        fields = [
            'id',
            'name',
            'slug',
            'category',  # 後方互換性（文字列）
            'category_detail',  # 詳細情報（オブジェクト）
            'synonyms',
            'description',
            'tool_count',
            'post_count',
        ]
        read_only_fields = ['id', 'slug']
    
    def get_category(self, obj):
        """後方互換性のためカテゴリスラッグを返す"""
        if obj.tag_category:
            return obj.tag_category.slug
        return None
    
    def get_tool_count(self, obj):
        """このタグが付いているツールの数を取得"""
        from tags.models import TaggedItem
        # TaggableManager経由でカウント（TaggedItemを使用）
        return TaggedItem.objects.filter(tag=obj).count()
    
    def get_post_count(self, obj):
        """このタグが付いている記事の数を取得"""
        from blog.models import BlogPage
        return BlogPage.objects.live().filter(tags=obj).count()


class TagSimpleSerializer(serializers.ModelSerializer):
    """タグの簡易シリアライザ（ツール一覧表示用）"""
    
    category = serializers.SerializerMethodField()  # 後方互換性のため
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'category']
        read_only_fields = ['id', 'slug']
    
    def get_category(self, obj):
        """後方互換性のためカテゴリスラッグを返す"""
        if obj.tag_category:
            return obj.tag_category.slug
        return None
