"""
週間ランキング用のモデル
"""
from django.db import models
from .models import Tool


class ToolStats(models.Model):
    """ツール統計（週間ランキング用）"""
    
    tool = models.OneToOneField(
        Tool,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='stats',
        verbose_name='ツール'
    )
    
    # 週間統計
    week_views = models.IntegerField(
        '週間PV数',
        default=0,
        help_text='直近7日間のページビュー数'
    )
    week_shares = models.IntegerField(
        '週間シェア数',
        default=0,
        help_text='直近7日間のSNSシェア数'
    )
    week_avg_duration = models.FloatField(
        '週間平均滞在時間',
        default=0.0,
        help_text='直近7日間の平均滞在時間（秒）'
    )
    
    # 計算済みスコア
    week_score = models.FloatField(
        '週間スコア',
        default=0.0,
        help_text='WeeklyScore = (週間PV × 0.5) + (平均滞在時間 ÷ 10 × 0.3) + (週間シェア数 × 2)',
        db_index=True
    )
    
    # 順位情報
    current_rank = models.IntegerField(
        '現在の順位',
        null=True,
        blank=True,
        help_text='現在の週間順位（1〜50）'
    )
    prev_week_rank = models.IntegerField(
        '前週順位',
        null=True,
        blank=True,
        help_text='前週の順位（順位変動計算用）'
    )
    
    # メタデータ
    last_updated = models.DateTimeField(
        '最終更新日時',
        auto_now=True
    )
    
    class Meta:
        verbose_name = 'ツール統計'
        verbose_name_plural = 'ツール統計'
        ordering = ['-week_score']
        indexes = [
            models.Index(fields=['-week_score'], name='idx_week_score'),
            models.Index(fields=['current_rank'], name='idx_current_rank'),
        ]
    
    def __str__(self):
        return f'{self.tool.name} - Score: {self.week_score:.1f}'
    
    def calculate_score(self):
        """週間スコアを計算"""
        # スコア計算式: (週間PV × 0.5) + (平均滞在時間 ÷ 10 × 0.3) + (週間シェア数 × 2)
        score = (
            (self.week_views * 0.5) +
            ((self.week_avg_duration / 10) * 0.3) +
            (self.week_shares * 2)
        )
        self.week_score = round(score, 2)
        return self.week_score
    
    def get_rank_change(self):
        """順位変動を取得"""
        if self.prev_week_rank is None:
            return 'NEW'
        if self.current_rank is None:
            return '---'
        
        change = self.prev_week_rank - self.current_rank
        if change > 0:
            return f'↑{change}'
        elif change < 0:
            return f'↓{abs(change)}'
        else:
            return '→'


class EventLog(models.Model):
    """イベントログ（PV、滞在時間、シェア記録用）"""
    
    EVENT_TYPES = [
        ('view', 'ページビュー'),
        ('duration', '滞在時間'),
        ('share', 'シェア'),
    ]
    
    SHARE_PLATFORMS = [
        ('twitter', 'Twitter/X'),
        ('facebook', 'Facebook'),
        ('line', 'LINE'),
        ('copy', 'URLコピー'),
    ]
    
    tool = models.ForeignKey(
        Tool,
        on_delete=models.CASCADE,
        related_name='events',
        verbose_name='ツール'
    )
    
    event_type = models.CharField(
        'イベント種別',
        max_length=20,
        choices=EVENT_TYPES
    )
    
    # 滞在時間用（durationイベントのみ）
    duration_seconds = models.IntegerField(
        '滞在時間（秒）',
        null=True,
        blank=True,
        help_text='10秒以上のみ有効'
    )
    
    # シェア用（shareイベントのみ）
    share_platform = models.CharField(
        'シェアプラットフォーム',
        max_length=20,
        choices=SHARE_PLATFORMS,
        null=True,
        blank=True
    )
    
    # メタデータ
    ip_address = models.GenericIPAddressField(
        'IPアドレス',
        null=True,
        blank=True,
        help_text='Bot判定用'
    )
    user_agent = models.TextField(
        'User-Agent',
        blank=True,
        help_text='Bot判定用'
    )
    created_at = models.DateTimeField(
        '記録日時',
        auto_now_add=True,
        db_index=True
    )
    
    class Meta:
        verbose_name = 'イベントログ'
        verbose_name_plural = 'イベントログ'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tool', '-created_at'], name='idx_tool_created'),
            models.Index(fields=['event_type', '-created_at'], name='idx_event_created'),
        ]
    
    def __str__(self):
        return f'{self.tool.name} - {self.get_event_type_display()} @ {self.created_at}'
    
    @classmethod
    def is_bot(cls, user_agent):
        """User-AgentからBot判定"""
        if not user_agent:
            return True
        
        bot_keywords = [
            'bot', 'crawl', 'spider', 'scrape',
            'googlebot', 'bingbot', 'slurp', 'duckduckbot',
            'baiduspider', 'yandexbot', 'facebookexternalhit'
        ]
        
        user_agent_lower = user_agent.lower()
        return any(keyword in user_agent_lower for keyword in bot_keywords)
