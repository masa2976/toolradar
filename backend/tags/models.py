from django.db import models
from django.contrib.postgres.fields import ArrayField
from taggit.models import TagBase, GenericTaggedItemBase
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel
import unicodedata


@register_snippet
class Tag(TagBase):
    """カスタムタグモデル（表記ゆれ対応）"""
    
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
        help_text="タグのカテゴリ"
    )
    synonyms = ArrayField(
        models.CharField(max_length=50),
        verbose_name="表記ゆれ",
        blank=True,
        default=list,
        help_text="カンマ区切りで入力（例: ＲＳＩ,アールエスアイ）"
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


class TaggedItem(GenericTaggedItemBase):
    """Tag-Item中間テーブル"""
    tag = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_items",
    )
