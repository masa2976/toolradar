from django.db import models
from django.contrib.postgres.fields import ArrayField


class Broker(models.Model):
    """ASP証券会社情報"""
    
    name = models.CharField(
        max_length=100,
        verbose_name='証券会社名',
        help_text='例: DMM FX, GMOクリック証券'
    )
    
    logo = models.URLField(
        blank=True,
        verbose_name='ロゴURL',
        help_text='証券会社のロゴ画像URL（将来的に画像アップロードに変更予定）'
    )
    
    features = ArrayField(
        models.CharField(max_length=200),
        verbose_name='特徴',
        help_text='証券会社の特徴（最大5個推奨）',
        default=list
    )
    
    bonus = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='ボーナス情報',
        help_text='例: 新規口座開設で最大30万円'
    )
    
    cta_url = models.URLField(
        verbose_name='アフィリエイトURL',
        help_text='口座開設ページのURL（アフィリエイトリンク）'
    )
    
    tracking_id = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='トラッキングID',
        help_text='A/Bテスト用ID（例: asp-dmm-fx-001）'
    )
    
    rank = models.IntegerField(
        default=0,
        verbose_name='表示順',
        help_text='数字が小さいほど上位に表示（1位=1, 2位=2, ...）'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='有効',
        help_text='チェックを外すと非表示になります'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='作成日時'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新日時'
    )
    
    class Meta:
        ordering = ['rank', '-created_at']
        verbose_name = 'ASP証券会社'
        verbose_name_plural = 'ASP証券会社'
        indexes = [
            models.Index(fields=['rank', 'is_active']),
            models.Index(fields=['is_active', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.rank}位: {self.name}" if self.rank > 0 else self.name
