from rest_framework import serializers
from .models import ASPAd


class ASPAdSerializer(serializers.ModelSerializer):
    """ASP広告シリアライザー（完全版）"""
    
    # 計算プロパティ
    ctr = serializers.FloatField(read_only=True)
    is_valid_period = serializers.BooleanField(read_only=True)
    
    # 表示用ラベル
    placement_display = serializers.CharField(
        source='get_placement_display',
        read_only=True
    )
    
    class Meta:
        model = ASPAd
        fields = [
            'id',
            'name',
            'ad_code',
            'placement',
            'placement_display',
            'priority',
            'weight',
            'start_date',
            'end_date',
            'impressions',
            'clicks',
            'ctr',
            'is_valid_period',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'impressions',
            'clicks',
            'ctr',
            'is_valid_period',
            'created_at',
            'updated_at',
        ]


class ASPAdSimpleSerializer(serializers.ModelSerializer):
    """ASP広告シンプルシリアライザー（フロントエンド表示用）"""
    
    class Meta:
        model = ASPAd
        fields = [
            'id',
            'name',
            'ad_code',
            'placement',
        ]
