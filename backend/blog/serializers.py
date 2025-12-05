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
        """StreamFieldをJSON形式で返す（comparison_tableブロックは変換）"""
        try:
            # get_prep_value()でベースとなるJSONを取得
            blocks = obj.body.get_prep_value()
            
            # 各ブロックを処理
            result = []
            for block in blocks:
                block_type = block.get('type')
                
                # comparison_tableブロックの場合のみ変換
                if block_type == 'comparison_table':
                    transformed_block = self._transform_comparison_table_block(block)
                    result.append(transformed_block)
                else:
                    # 他のブロックはそのまま
                    result.append(block)
            
            return result
            
        except Exception as e:
            # エラーが発生した場合は空リストを返す
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error serializing body for {obj.slug}: {e}")
            return []

    def _transform_comparison_table_block(self, block):
        """
        comparison_tableブロックをフロントエンド用の形式に変換
        
        変換内容:
        - items[] → brokers[] に変更
        - items[].value.features[] (オブジェクト配列) → brokers[].features[] (文字列配列)
        - items[].value のネストを解除
        - rating を数値型に変換
        """
        try:
            value = block.get('value', {})
            items = value.get('items', [])
            
            # itemsをbrokersに変換
            brokers = []
            for item in items:
                item_value = item.get('value', {})
                
                # features配列を文字列配列に変換
                features_raw = item_value.get('features', [])
                features = [
                    f.get('value', '') if isinstance(f, dict) else str(f)
                    for f in features_raw
                ]
                
                # rating を float に変換（文字列の場合）
                rating = item_value.get('rating', 0)
                if isinstance(rating, str):
                    try:
                        rating = float(rating)
                    except (ValueError, TypeError):
                        rating = 0.0
                
                # brokerオブジェクトを構築
                broker = {
                    'name': item_value.get('name', ''),
                    'rating': rating,
                    'features': features,
                    'cta_url': item_value.get('cta_url', ''),
                    'cta_text': item_value.get('cta_text', '詳細を見る'),
                }
                
                # オプションフィールド（存在する場合のみ追加）
                if item_value.get('image'):
                    broker['logo'] = item_value['image']
                if item_value.get('highlight_text'):
                    broker['bonus'] = item_value['highlight_text']
                if item_value.get('price_info'):
                    broker['cost'] = item_value['price_info']
                if item_value.get('tracking_id'):
                    broker['tracking_id'] = item_value['tracking_id']
                
                brokers.append(broker)
            
            # 変換後のブロック
            return {
                'id': block.get('id'),
                'type': 'comparison_table',
                'value': {
                    'title': value.get('title', ''),
                    'description': value.get('description'),
                    'brokers': brokers,
                    'layout': value.get('layout', 'ranking'),
                }
            }
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error transforming comparison_table block: {e}")
            # エラー時は元のブロックをそのまま返す
            return block


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
    updated_at = serializers.DateTimeField(source='last_published_at', read_only=True)  # SEO: sitemap.xmlで最終更新日として使用
    view_count = serializers.IntegerField(read_only=True, default=0)
    
    def get_featured_image_thumbnail(self, obj):
        """サムネイル画像URLを取得"""
        if not obj.featured_image:
            return None
        return obj.featured_image.get_rendition('fill-300x200').url
    
    def get_tag_names(self, obj):
        """タグ名のリストを取得"""
        return [tag.name for tag in obj.tags.all()[:5]]  # 最大5個まで  # 最大5個まで
