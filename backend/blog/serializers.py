"""
Serializers for Blog API
"""
from rest_framework import serializers
from wagtail.images.api.fields import ImageRenditionField
from .models import BlogPage, BlogCategory, InvestmentType
from tools.serializers import ToolListSerializer
from tags.serializers import TagSimpleSerializer


class BlogCategorySerializer(serializers.ModelSerializer):
    """ブログカテゴリのシリアライザ"""
    
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description']


class InvestmentTypeSerializer(serializers.ModelSerializer):
    """投資タイプのシリアライザ"""
    
    class Meta:
        model = InvestmentType
        fields = ['id', 'name', 'slug', 'description']


class BlogPageSerializer(serializers.Serializer):
    """ブログ記事のシリアライザ（詳細表示用）"""
    
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField()
    slug = serializers.SlugField()
    excerpt = serializers.CharField()
    
    # カテゴリと投資タイプ
    category = BlogCategorySerializer()
    investment_type = InvestmentTypeSerializer()
    
    # アイキャッチ画像（複数サイズのレンディション）
    featured_image = serializers.SerializerMethodField()
    
    # StreamField: JSONとして出力
    body = serializers.SerializerMethodField()
    
    # 関連
    related_tools = ToolListSerializer(many=True, read_only=True)
    tags = TagSimpleSerializer(many=True, read_only=True)
    
    # メタ情報
    published_at = serializers.DateTimeField(source='first_published_at', read_only=True)
    updated_at = serializers.DateTimeField(source='last_published_at', read_only=True)
    view_count = serializers.IntegerField(read_only=True, default=0)
    
    # SEO
    search_description = serializers.CharField(read_only=True)
    
    def get_featured_image(self, obj):
        """アイキャッチ画像の複数サイズを取得"""
        if not obj.featured_image:
            return None
        
        request = self.context.get('request')
        return {
            'original': obj.featured_image.file.url,
            'thumbnail': obj.featured_image.get_rendition('fill-300x200').url,
            'medium': obj.featured_image.get_rendition('fill-800x450').url,
            'large': obj.featured_image.get_rendition('fill-1200x630').url,
        }
    
    def get_body(self, obj):
        """StreamFieldをJSONに変換"""
        result = []
        for block in obj.body:
            value = block.value
            # RichTextの場合はHTML文字列に変換
            if hasattr(value, 'source'):
                value = value.source
            # オブジェクトの場合はget_api_representation()を試す
            elif hasattr(value, 'get_api_representation'):
                value = value.get_api_representation()
            # プリミティブ型以外はstr()で変換
            elif not isinstance(value, (str, int, float, bool, list, dict, type(None))):
                value = str(value)
            
            result.append({
                'type': block.block_type,
                'value': value,
                'id': str(block.id) if hasattr(block, 'id') else None
            })
        return result


class BlogPageListSerializer(serializers.Serializer):
    """ブログ記事のシリアライザ（一覧表示用・軽量版）"""
    
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField()
    slug = serializers.SlugField()
    excerpt = serializers.CharField()
    
    # カテゴリと投資タイプは名前のみ
    category_name = serializers.CharField(source='category.name', read_only=True)
    investment_type_name = serializers.CharField(source='investment_type.name', read_only=True)
    
    # アイキャッチ画像（サムネイルのみ）
    featured_image_thumbnail = serializers.SerializerMethodField()
    
    # タグは名前のリストのみ
    tag_names = serializers.SerializerMethodField()
    
    # メタ情報
    published_at = serializers.DateTimeField(source='first_published_at', read_only=True)
    view_count = serializers.IntegerField(read_only=True, default=0)
    
    def get_featured_image_thumbnail(self, obj):
        """サムネイル画像URLを取得"""
        if not obj.featured_image:
            return None
        return obj.featured_image.get_rendition('fill-300x200').url
    
    def get_tag_names(self, obj):
        """タグ名のリストを取得"""
        return [tag.name for tag in obj.tags.all()[:5]]  # 最大5個まで
