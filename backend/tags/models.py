from django.db import models
from django.contrib.postgres.fields import ArrayField
from taggit.models import TagBase, GenericTaggedItemBase
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel
import unicodedata


@register_snippet
class TagMapping(models.Model):
    """タグ正規化マッピング管理"""
    
    canonical_name = models.CharField(
        "正式名称",
        max_length=100,
        unique=True,
        help_text="統一されるタグ名（例: ボリンジャーバンド）"
    )
    
    variations = ArrayField(
        models.CharField(max_length=100),
        verbose_name="表記バリエーション",
        help_text="カンマ区切りで入力（例: bb,ｂｂ,ボリバン,Bollinger Bands）"
    )
    
    category = models.CharField(
        "カテゴリ",
        max_length=30,
        choices=[
            ('technical_indicator', 'テクニカル指標'),
            ('trade_style', '取引スタイル'),
            ('currency_pair', '通貨ペア'),
            ('strategy_type', '戦略タイプ'),
        ],
        default='technical_indicator'
    )
    
    panels = [
        FieldPanel('canonical_name'),
        FieldPanel('variations'),
        FieldPanel('category'),
    ]
    
    class Meta:
        verbose_name = "タグマッピング"
        verbose_name_plural = "タグマッピング"
        ordering = ['category', 'canonical_name']
    
    def __str__(self):
        return f"{self.canonical_name} ({len(self.variations)}個のバリエーション)"
    
    @classmethod
    def get_canonical_name(cls, tag_name):
        """入力されたタグ名から正式名称を取得"""
        normalized = Tag.normalize_string(tag_name)
        
        # 全マッピングをチェック
        for mapping in cls.objects.all():
            normalized_variations = [Tag.normalize_string(v) for v in mapping.variations]
            if normalized in normalized_variations:
                return mapping.canonical_name
        
        # マッピングがない場合は元の名前を返す
        return tag_name


@register_snippet
class Tag(TagBase):
    """カスタムタグモデル（表記ゆれ対応）"""
    
    # 管理者が事前登録したタグのみ使用可能（自動作成を防止）
    free_tagging = False
    
    CATEGORY_CHOICES = [
        ('technical_indicator', 'テクニカル指標'),
        ('trade_style', '取引スタイル'),
        ('currency_pair', '通貨ペア'),
        ('strategy_type', '戦略タイプ'),
    ]
    
    category = models.CharField(
        "カテゴリ",
        max_length=30,
        choices=CATEGORY_CHOICES,
        help_text="タグのカテゴリ",
        blank=True
    )
    synonyms = ArrayField(
        models.CharField(max_length=50),
        verbose_name="表記ゆれ",
        blank=True,
        default=list,
        help_text="自動的に収集された表記ゆれ"
    )
    description = models.TextField(
        "説明",
        blank=True,
        help_text="タグの説明（任意）"
    )
    
    panels = [
        FieldPanel('name'),
        FieldPanel('slug'),
        FieldPanel('category'),
        FieldPanel('synonyms'),
        FieldPanel('description'),
    ]
    
    class Meta:
        verbose_name = "タグ"
        verbose_name_plural = "タグ"
        ordering = ['category', 'name']
    
    @classmethod
    def normalize_string(cls, text):
        """文字列の正規化（NFKC + 小文字化）"""
        # Unicode正規化（全角→半角）
        normalized = unicodedata.normalize('NFKC', text)
        # ASCII文字を小文字化
        normalized = normalized.lower()
        # 前後の空白削除
        normalized = normalized.strip()
        return normalized
    
    @classmethod
    def find_by_name_or_synonym(cls, text):
        """名前またはシノニムからタグを検索"""
        normalized_text = cls.normalize_string(text)
        
        # 名前で検索
        try:
            tag = cls.objects.get(name__iexact=normalized_text)
            return tag
        except cls.DoesNotExist:
            pass
        
        # シノニムで検索
        for tag in cls.objects.all():
            normalized_synonyms = [cls.normalize_string(s) for s in tag.synonyms]
            if normalized_text in normalized_synonyms:
                return tag
        
        return None
    
    @classmethod
    def get_default_mappings(cls):
        """デフォルトのタグマッピング（初期データ用）"""
        return [
            {
                'canonical_name': 'ボリンジャーバンド',
                'variations': ['bb', 'ｂｂ', 'BB', 'bollinger bands', 'ボリバン'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': 'RSI',
                'variations': ['rsi', 'ｒｓｉ', 'アールエスアイ', 'relative strength index'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': 'MACD',
                'variations': ['macd', 'ｍａｃｄ', 'マックディー', 'マックディ'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': '移動平均',
                'variations': ['ma', 'ｍａ', 'moving average', 'sma', 'ema', '移動平均線'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': '一目均衡表',
                'variations': ['ichimoku', '一目', 'ichimoku cloud', 'イチモク'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': 'ストキャスティクス',
                'variations': ['stochastic', 'ストキャス', 'stochastics'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': 'フィボナッチ',
                'variations': ['fibonacci', 'fibo', 'フィボ', 'fibonacci retracement'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': 'パラボリック',
                'variations': ['parabolic', 'sar', 'parabolic sar', 'パラボリックSAR'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': 'ATR',
                'variations': ['atr', 'average true range', 'エーティーアール'],
                'category': 'technical_indicator'
            },
            {
                'canonical_name': 'ADX',
                'variations': ['adx', 'average directional index', 'エーディーエックス'],
                'category': 'technical_indicator'
            },
        ]
    
    @classmethod
    def normalize_and_get_or_create(cls, tag_name):
        """
        タグ名を正規化して取得または作成
        """
        if not tag_name:
            return None
        
        # TagMappingから正式名称を取得
        canonical_name = TagMapping.get_canonical_name(tag_name)
        
        # 既存タグを検索
        tag = cls.find_by_name_or_synonym(canonical_name)
        
        if tag:
            # synonymsに元の名前を追加（重複チェック付き）
            original_normalized = cls.normalize_string(tag_name)
            if original_normalized not in [cls.normalize_string(s) for s in tag.synonyms]:
                if original_normalized != cls.normalize_string(tag.name):
                    tag.synonyms.append(tag_name)
                    tag.save()
            return tag
        
        # 新規作成
        from django.utils.text import slugify
        
        # TagMappingからカテゴリを取得
        category = 'technical_indicator'
        try:
            mapping = TagMapping.objects.get(canonical_name=canonical_name)
            category = mapping.category
        except TagMapping.DoesNotExist:
            pass
        
        tag = cls.objects.create(
            name=canonical_name,
            slug=slugify(canonical_name),
            category=category,
            synonyms=[tag_name] if tag_name != canonical_name else []
        )
        
        return tag


class TaggedItem(GenericTaggedItemBase):
    """Tag-Item中間テーブル"""
    tag = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_items",
    )
