"""
Serializers for Tools API
"""
from rest_framework import serializers
from .models import Tool
from tags.serializers import TagSimpleSerializer


class ToolSerializer(serializers.ModelSerializer):
    """ツールのシリアライザ（詳細表示用）"""
    
    # タグはネストされたシリアライザで表示
    tags = TagSimpleSerializer(many=True, read_only=True)
    
    # 週間ランキング情報（後でToolStatsから取得）
    week_rank = serializers.SerializerMethodField()
    week_rank_change = serializers.SerializerMethodField()
    week_views = serializers.SerializerMethodField()
    
    class Meta:
        model = Tool
        fields = [
            'id',
            'name',
            'slug',
            'short_description',
            'long_description',
            'platform',
            'tool_type',
            'price_type',
            'price',
            'ribbons',
            'image_url',
            'external_url',
            'tags',
            'metadata',
            'created_at',
            'updated_at',
            # 週間ランキング情報
            'week_rank',
            'week_rank_change',
            'week_views',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_week_rank(self, obj):
        """週間ランキング順位を取得"""
        if hasattr(obj, 'stats'):
            return obj.stats.current_rank
        return None
    
    def get_week_rank_change(self, obj):
        """週間ランキング変動を取得"""
        if hasattr(obj, 'stats'):
            return obj.stats.get_rank_change()
        return None
    
    def get_week_views(self, obj):
        """週間PV数を取得"""
        if hasattr(obj, 'stats'):
            return obj.stats.week_views
        return 0


class ToolListSerializer(serializers.ModelSerializer):
    """ツールのシリアライザ（一覧表示用・軽量版）"""
    
    # タグは名前のリストのみ
    tag_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Tool
        fields = [
            'id',
            'name',
            'slug',
            'short_description',
            'platform',
            'tool_type',
            'price_type',
            'price',
            'ribbons',
            'image_url',
            'tag_names',
            'created_at',
            'updated_at',  # SEO: sitemap.xmlで最終更新日として使用
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_tag_names(self, obj):
        """タグ名のリストを取得"""
        return [tag.name for tag in obj.tags.all()[:5]]  # 最大5個まで  # 最大5個まで
