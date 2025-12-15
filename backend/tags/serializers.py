"""
Serializers for Tags API
"""
from rest_framework import serializers
from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    """タグのシリアライザ"""
    
    tool_count = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = [
            'id',
            'name',
            'slug',
            'category',
            'synonyms',
            'description',
            'tool_count',
            'post_count',
        ]
        read_only_fields = ['id', 'slug']
    
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
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'category']
        read_only_fields = ['id', 'slug']
