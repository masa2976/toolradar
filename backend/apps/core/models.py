from django.db import models
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.admin.panels import FieldPanel, MultiFieldPanel, InlinePanel
from wagtail.models import Page
from wagtail.api import APIField
from wagtail.fields import RichTextField, StreamField
from wagtail import blocks
from wagtail.contrib.forms.models import AbstractEmailForm, AbstractFormField
from wagtail.rich_text import expand_db_html
from rest_framework import serializers
from modelcluster.fields import ParentalKey


@register_setting
class SiteSettings(BaseSiteSetting):
    """サイト全体の設定"""
    
    # サイト基本情報
    site_name = models.CharField(
        max_length=100,
        default="ToolRadar",
        verbose_name="サイト名"
    )
    
    site_description = models.TextField(
        default="FX・株式・仮想通貨のトレーディングツール総合情報サイト",
        verbose_name="サイト説明"
    )
    
    # 運営者情報
    operator_name = models.CharField(
        max_length=100,
        default="ToolRadar事務局",
        verbose_name="運営者名",
        help_text="匿名運営のため、個人名は非公開"
    )
    
    # SNS
    twitter_url = models.URLField(
        blank=True,
        verbose_name="Twitter（X）URL",
        help_text="例: https://twitter.com/toolradar"
    )
    
    # AdSense・Analytics
    google_adsense_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Google AdSense ID",
        help_text="例: ca-pub-1234567890123456"
    )
    
    google_analytics_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Google Analytics ID",
        help_text="例: G-XXXXXXXXXX"
    )
    
    # 免責事項
    disclaimer_text = models.TextField(
        blank=True,
        default="※投資は元本保証がございません。リスクを理解した上でご利用ください。",
        verbose_name="免責事項（短文）",
        help_text="サイト全体で表示される短い免責事項"
    )
    
    # 管理画面設定
    panels = [
        MultiFieldPanel([
            FieldPanel('site_name'),
            FieldPanel('site_description'),
        ], heading="サイト基本情報"),
        
        MultiFieldPanel([
            FieldPanel('operator_name'),
        ], heading="運営者情報"),
        
        MultiFieldPanel([
            FieldPanel('twitter_url'),
        ], heading="SNS"),
        
        MultiFieldPanel([
            FieldPanel('google_adsense_id'),
            FieldPanel('google_analytics_id'),
        ], heading="広告・解析"),
        
        MultiFieldPanel([
            FieldPanel('disclaimer_text'),
        ], heading="免責事項"),
    ]
    
    class Meta:
        verbose_name = "サイト設定"



class ExpandedStreamFieldSerializer(serializers.Field):
    """
    StreamFieldの内部リンク（RichTextBlock内）を展開するカスタムシリアライザー
    
    変換例:
    <a linktype="page" id="6"> → <a href="/contact/">
    """
    
    def to_representation(self, value):
        """
        StreamFieldの値をAPIレスポンス用に変換
        
        Args:
            value: StreamFieldの値（StreamValue）
            
        Returns:
            list: 各ブロックの辞書のリスト
        """
        result = []
        
        for block in value:
            block_dict = {
                'type': block.block_type,
                'value': block.value,
                'id': str(block.id) if hasattr(block, 'id') else None
            }
            
            # RichTextBlockの場合、内部リンクを展開
            if block.block_type == 'rich_text':
                try:
                    # expand_db_html()でデータベース形式のリンクを実際のHTMLに変換
                    block_dict['value'] = expand_db_html(str(block.value))
                except Exception as e:
                    # エラー時は元の値をそのまま使用
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error expanding RichText HTML: {e}")
                    block_dict['value'] = str(block.value)
            
            result.append(block_dict)
        
        return result


class BasicPage(Page):
    """法的ページ用のシンプルなページモデル（プライバシーポリシー、利用規約、免責事項）"""
    
    body = StreamField([
        ('rich_text', blocks.RichTextBlock(
            features=['h2', 'h3', 'h4', 'bold', 'italic', 'ol', 'ul', 'link', 'hr'],
            label="リッチテキスト",
            help_text="WYSIWYGエディタで編集"
        )),
        ('raw_html', blocks.RawHTMLBlock(
            label="HTML直接入力",
            help_text="HTMLコードを直接入力（上級者向け）"
        )),
    ], use_json_field=True, verbose_name="本文")
    
    show_in_footer = models.BooleanField(
        default=True,
        verbose_name="フッターに表示",
        help_text="チェックを入れるとフッターリンクに表示されます"
    )
    
    show_disclaimer = models.BooleanField(
        default=True,
        verbose_name="免責事項を表示",
        help_text="ページ下部に免責事項を表示"
    )
    
    # Wagtail API公開フィールド
    api_fields = [
        APIField('body', serializer=ExpandedStreamFieldSerializer()),
        APIField('show_in_footer'),
        APIField('show_disclaimer'),
    ]
    
    content_panels = Page.content_panels + [
        FieldPanel('body'),
        FieldPanel('show_in_footer'),
        FieldPanel('show_disclaimer'),
    ]
    
    class Meta:
        verbose_name = "基本ページ"
        verbose_name_plural = "基本ページ"


class ContactFormField(AbstractFormField):
    """お問い合わせフォームのフィールド"""
    page = ParentalKey(
        'ContactPage',
        on_delete=models.CASCADE,
        related_name='form_fields'
    )


class ContactPage(AbstractEmailForm):
    """お問い合わせフォームページ"""
    
    intro = StreamField([
        ('rich_text', blocks.RichTextBlock(
            features=['h2', 'h3', 'bold', 'italic', 'ol', 'ul', 'link'],
            label="リッチテキスト",
            help_text="WYSIWYG エディタで編集"
        )),
        ('raw_html', blocks.RawHTMLBlock(
            label="HTML直接入力",
            help_text="<small>タグなどHTMLを直接入力（上級者向け）"
        )),
    ], use_json_field=True, blank=True, verbose_name="フォーム説明")
    
    thank_you_text = StreamField([
        ('rich_text', blocks.RichTextBlock(
            features=['h2', 'h3', 'bold', 'italic', 'ol', 'ul', 'link'],
            label="リッチテキスト",
            help_text="WYSIWYG エディタで編集"
        )),
        ('raw_html', blocks.RawHTMLBlock(
            label="HTML直接入力",
            help_text="<small>タグなどHTMLを直接入力（上級者向け）"
        )),
    ], use_json_field=True, blank=True, verbose_name="送信完了メッセージ")
    
    # API公開設定
    api_fields = [
        APIField('intro', serializer=ExpandedStreamFieldSerializer()),
        APIField('thank_you_text', serializer=ExpandedStreamFieldSerializer()),
        APIField('form_fields'),
    ]
    
    content_panels = AbstractEmailForm.content_panels + [
        FieldPanel('intro'),
        InlinePanel('form_fields', label="フォームフィールド"),
        FieldPanel('thank_you_text'),
        MultiFieldPanel([
            FieldPanel('to_address'),
            FieldPanel('from_address'),
            FieldPanel('subject'),
        ], heading="メール設定"),
    ]
    
    class Meta:
        verbose_name = "お問い合わせページ"
        verbose_name_plural = "お問い合わせページ"
