from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.text import slugify
import unicodedata
import re
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
        unique=True,
        help_text="ダウンロード/販売ページのURL（重複登録不可）"
    )
    
    # 重複チェック用の正規化された名前
    normalized_name = models.CharField(
        "正規化名",
        max_length=200,
        editable=False,
        blank=True,
        help_text="重複チェック用（自動生成）"
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
            models.Index(fields=['normalized_name']),
        ]
        constraints = [
            # 同じ名前 + 同じプラットフォームの組み合わせを禁止
            models.UniqueConstraint(
                fields=['normalized_name', 'platform'],
                name='unique_tool_per_platform'
            )
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # slugが空の場合は自動生成
        if not self.slug:
            self.slug = slugify(self.name)
        
        # 名前の正規化（重複チェック用）
        self.normalized_name = self._normalize_name(self.name)
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def _normalize_name(name):
        """
        名前を正規化して比較可能な形式に変換
        - 全角→半角変換（NFKC正規化）
        - 小文字化
        - 空白の統一
        - 特殊文字除去
        """
        if not name:
            return ""
        
        # 1. Unicode正規化（全角→半角）
        normalized = unicodedata.normalize('NFKC', name)
        
        # 2. 小文字化
        normalized = normalized.lower()
        
        # 3. 空白の統一（連続空白→単一空白、前後trim）
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        # 4. 特殊文字除去（英数字、日本語、空白のみ残す）
        normalized = re.sub(r'[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]', '', normalized)
        
        return normalized

    @property
    def computed_ribbons(self):
        """
        自動計算されるリボン
        - new: 作成から14日以内
        - popular: 週間ランキングトップ10
        """
        from django.utils import timezone
        from datetime import timedelta
        
        computed = []
        
        # "new" チェック: 14日以内に作成
        if self.created_at:
            days_since_creation = (timezone.now() - self.created_at).days
            if days_since_creation <= 14:
                computed.append('new')
        
        # "popular" チェック: 週間ランキングトップ10
        try:
            if hasattr(self, 'stats') and self.stats.current_rank:
                if self.stats.current_rank <= 10:
                    computed.append('popular')
        except Exception:
            pass
        
        return computed
    
    @property
    def all_ribbons(self):
        """
        手動リボン + 自動リボンを結合（重複を除く）
        """
        manual = self.ribbons or []
        computed = self.computed_ribbons
        # 重複を除いて結合
        all_ribbons = list(set(manual + computed))
        return all_ribbons

from .models_stats import ToolStats, EventLog
