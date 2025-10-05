from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.text import slugify
from taggit.managers import TaggableManager
from tags.models import TaggedItem


class Tool(models.Model):
    """トレーディングツール情報モデル"""
    
    # プラットフォーム選択肢
    PLATFORM_CHOICES = [
        ('mt4', 'MetaTrader 4'),
        ('mt5', 'MetaTrader 5'),
        ('tradingview', 'TradingView'),
    ]
    
    # ツールタイプ選択肢
    TOOL_TYPE_CHOICES = [
        ('EA', 'EA（自動売買）'),
        ('Indicator', 'インジケーター'),
        ('Library', 'ライブラリ'),
        ('Script', 'スクリプト'),
        ('Strategy', 'ストラテジー'),
    ]
    
    # 価格タイプ選択肢
    PRICE_TYPE_CHOICES = [
        ('free', '無料'),
        ('paid', '有料'),
        ('freemium', 'フリーミアム'),
    ]
    
    # 基本情報
    name = models.CharField(
        "ツール名",
        max_length=200,
        help_text="ツールの名前"
    )
    slug = models.SlugField(
        "スラッグ",
        unique=True,
        help_text="URL用（自動生成されます）"
    )
    short_description = models.TextField(
        "短い説明",
        max_length=100,
        help_text="一覧表示用の短い説明（100文字以内）"
    )
    long_description = models.TextField(
        "詳細説明",
        blank=True,
        help_text="詳細ページ用の説明（HTMLまたはMarkdown）"
    )
    
    # プラットフォームとタイプ
    platform = models.CharField(
        max_length=20,
        choices=PLATFORM_CHOICES,
        verbose_name="プラットフォーム",
        help_text="対応プラットフォーム"
    )
    tool_type = models.CharField(
        "ツールタイプ",
        max_length=20,
        choices=TOOL_TYPE_CHOICES,
        help_text="ツールの種類"
    )
    
    # 価格情報
    price_type = models.CharField(
        "価格タイプ",
        max_length=20,
        choices=PRICE_TYPE_CHOICES,
        default='free',
        help_text="価格体系"
    )
    price = models.DecimalField(
        "価格",
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="有料の場合の価格（USD）"
    )
    
    # リボン（バッジ表示用）
    ribbons = ArrayField(
        models.CharField(max_length=20),
        verbose_name="リボン",
        blank=True,
        default=list,
        help_text="例: new, featured, popular"
    )
    
    # 画像とURL
    image_url = models.URLField(
        "画像URL",
        help_text="サムネイル画像のURL"
    )
    external_url = models.URLField(
        "外部URL",
        help_text="ダウンロード/販売ページのURL"
    )
    
    # メタデータ
    metadata = models.JSONField(
        "メタデータ",
        default=dict,
        blank=True,
        help_text="開発者、バージョン、最終更新日等"
    )
    
    # タグ
    tags = TaggableManager(
        through=TaggedItem,
        verbose_name="タグ",
        help_text="関連するタグ",
        blank=True
    )
    
    # タイムスタンプ
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)
    
    class Meta:
        verbose_name = "ツール"
        verbose_name_plural = "ツール"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tool_type']),
            models.Index(fields=['price_type']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # slugが空の場合は自動生成
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

from .models_stats import ToolStats, EventLog
