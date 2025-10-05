"""
週間ランキング用のシリアライザ
"""
from rest_framework import serializers
from .models_stats import ToolStats, EventLog
from .serializers import ToolListSerializer


class ToolStatsSerializer(serializers.ModelSerializer):
    """ツール統計のシリアライザ（管理用）"""
    
    tool_name = serializers.CharField(source='tool.name', read_only=True)
    rank_change = serializers.SerializerMethodField()
    
    class Meta:
        model = ToolStats
        fields = [
            'tool',
            'tool_name',
            'week_views',
            'week_shares',
            'week_avg_duration',
            'week_score',
            'current_rank',
            'prev_week_rank',
            'rank_change',
            'last_updated'
        ]
        read_only_fields = ['last_updated']
    
    def get_rank_change(self, obj):
        """順位変動を取得"""
        return obj.get_rank_change()


class WeeklyRankingSerializer(serializers.Serializer):
    """週間ランキング表示用シリアライザ"""
    
    rank = serializers.IntegerField(source='current_rank')
    rank_change = serializers.SerializerMethodField()
    tool = ToolListSerializer(read_only=True)
    score = serializers.FloatField(source='week_score')
    week_views = serializers.IntegerField()
    week_shares = serializers.IntegerField()
    week_avg_duration = serializers.FloatField()
    
    def get_rank_change(self, obj):
        """順位変動を取得"""
        return obj.get_rank_change()


class EventLogSerializer(serializers.ModelSerializer):
    """イベントログのシリアライザ"""
    
    class Meta:
        model = EventLog
        fields = [
            'id',
            'tool',
            'event_type',
            'duration_seconds',
            'share_platform',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EventTrackingSerializer(serializers.Serializer):
    """イベントトラッキングAPI用シリアライザ"""
    
    tool_id = serializers.IntegerField(
        help_text='ツールID'
    )
    event_type = serializers.ChoiceField(
        choices=['view', 'duration', 'share'],
        help_text='イベント種別（view|duration|share）'
    )
    duration_seconds = serializers.IntegerField(
        required=False,
        allow_null=True,
        min_value=10,
        help_text='滞在時間（秒）※durationイベントの場合のみ、10秒以上'
    )
    share_platform = serializers.ChoiceField(
        choices=['twitter', 'facebook', 'line', 'copy'],
        required=False,
        allow_null=True,
        help_text='シェアプラットフォーム（twitter|facebook|line|copy）※shareイベントの場合のみ'
    )
    
    def validate(self, data):
        """カスタムバリデーション"""
        event_type = data.get('event_type')
        
        # durationイベントの場合、duration_secondsが必須
        if event_type == 'duration':
            if not data.get('duration_seconds'):
                raise serializers.ValidationError({
                    'duration_seconds': 'durationイベントの場合、滞在時間は必須です'
                })
        
        # shareイベントの場合、share_platformが必須
        if event_type == 'share':
            if not data.get('share_platform'):
                raise serializers.ValidationError({
                    'share_platform': 'shareイベントの場合、プラットフォームは必須です'
                })
        
        return data
