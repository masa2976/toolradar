from django.db import models
from django import forms
from django.utils.text import slugify
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel


# Wagtailページモデル関連
from wagtail.models import Page
from wagtail.fields import StreamField
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.embeds.blocks import EmbedBlock
from wagtail.contrib.table_block.blocks import TableBlock

# カスタムブロックのインポート
from .blocks import (
    ASPComparisonBlock,
    ASPCTABlock,
    ASPBannerBlock,
    RelatedToolsBlock,
    CodeBlock,
    HeadingBlock,
)
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from modelcluster.fields import ParentalManyToManyField


@register_snippet
class BlogCategory(models.Model):
    """ブログ記事のカテゴリ（Wagtailスニペット）"""
    
    name = models.CharField(
        "カテゴリ名",
        max_length=100,
        unique=True,
        help_text="例: 初心者ガイド、ツールレビュー"
    )
    slug = models.SlugField(
        "スラッグ",
        unique=True,
        help_text="URL用（自動生成されます）"
    )
    description = models.TextField(
        "説明",
        blank=True,
        help_text="このカテゴリの説明（任意）"
    )
    order = models.IntegerField(
        "表示順",
        default=0,
        help_text="小さい数字ほど上に表示されます"
    )
    
    panels = [
        FieldPanel('name'),
        FieldPanel('slug'),
        FieldPanel('description'),
        FieldPanel('order'),
    ]
    
    class Meta:
        verbose_name = "ブログカテゴリ"
        verbose_name_plural = "ブログカテゴリ"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # slugが空の場合は自動生成
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


@register_snippet
class InvestmentType(models.Model):
    """投資タイプ（Wagtailスニペット）"""
    
    name = models.CharField(
        "投資タイプ名",
        max_length=100,
        unique=True,
        help_text="例: FX、株式、仮想通貨"
    )
    slug = models.SlugField(
        "スラッグ",
        unique=True,
        help_text="URL用（自動生成されます）"
    )
    description = models.TextField(
        "説明",
        blank=True,
        help_text="この投資タイプの説明（任意）"
    )
    order = models.IntegerField(
        "表示順",
        default=0,
        help_text="小さい数字ほど上に表示されます"
    )
    
    panels = [
        FieldPanel('name'),
        FieldPanel('slug'),
        FieldPanel('description'),
        FieldPanel('order'),
    ]
    
    class Meta:
        verbose_name = "投資タイプ"
        verbose_name_plural = "投資タイプ"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # slugが空の場合は自動生成
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# ========================================
# ブログページモデル
# ========================================

class BlogIndexPage(Page):
    """ブログ記事一覧ページ（親ページ）"""
    
    intro = models.TextField(
        "イントロダクション",
        blank=True,
        help_text="ブログトップページに表示される説明文"
    )
    
    content_panels = Page.content_panels + [
        FieldPanel('intro'),
    ]
    
    # このページの子ページとしてBlogPageのみ許可
    subpage_types = ['blog.BlogPage']
    
    class Meta:
        verbose_name = "ブログインデックスページ"
        verbose_name_plural = "ブログインデックスページ"
    
    def get_context(self, request):
        """テンプレートコンテキストをカスタマイズ"""
        context = super().get_context(request)
        
        # 公開済みのブログ記事を取得（新しい順）
        blog_pages = self.get_children().live().order_by('-first_published_at')
        
        context['blog_pages'] = blog_pages
        return context


class BlogPage(Page):
    """ブログ記事ページ"""
    
    # ========================================
    # 基本情報
    # ========================================
    excerpt = models.TextField(
        "抜粋",
        max_length=200,
        help_text="記事の要約（検索結果・SNSシェア用、最大200文字）"
    )
    
    category = models.ForeignKey(
        BlogCategory,
        verbose_name="カテゴリ",
        on_delete=models.SET_NULL,
        null=True,
        related_name='blog_pages',
        help_text="記事のカテゴリを選択"
    )
    
    investment_type = models.ForeignKey(
        InvestmentType,
        verbose_name="投資タイプ",
        on_delete=models.SET_NULL,
        null=True,
        related_name='blog_pages',
        help_text="記事が扱う投資タイプを選択"
    )
    
    # ========================================
    # コンテンツ（最小限のStreamField）
    # ========================================
    body = StreamField([
        # 基本コンテンツブロック
        ('heading', HeadingBlock()),
        ('text', blocks.RichTextBlock(
            label="本文",
            features=[
                # 基本装飾
                'bold', 'italic',
                # リンク
                'link',
                # リスト
                'ol', 'ul',
                # 引用・水平線
                'blockquote', 'hr',
            ],
            help_text="本文の段落（太字、斜体、リンク、リストなどが使えます）"
        )),
        ('image', ImageChooserBlock(
            label="画像",
            help_text="記事内の画像"
        )),
        ('table', TableBlock(
            label="表",
            help_text="データを表形式で表示（行・列を追加できます）",
            table_options={
                'contextMenu': [
                    'row_above',
                    'row_below', 
                    'col_left',
                    'col_right',
                    'remove_row',
                    'remove_col',
                    'undo',
                    'redo'
                ]
            }
        )),
        ('quote', blocks.BlockQuoteBlock(
            label="引用",
            help_text="引用文を表示"
        )),
        ('embed', EmbedBlock(
            label="埋め込み",
            help_text="YouTube動画やツイート等の埋め込み"
        )),
        
        # コード表示
        ('code', CodeBlock()),
        
        # ASPアフィリエイトブロック（収益化の核心）
        ('asp_comparison', ASPComparisonBlock()),
        ('asp_cta', ASPCTABlock()),
        ('asp_banner', ASPBannerBlock()),
        
        # 関連コンテンツ
        ('related_tools', RelatedToolsBlock()),
    ], use_json_field=True, blank=True)
    
    # ========================================
    # メディア
    # ========================================
    featured_image = models.ForeignKey(
        'wagtailimages.Image',
        verbose_name="アイキャッチ画像",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        help_text="記事のアイキャッチ画像（推奨: 1200×630px）"
    )
    
    # ========================================
    # 関連コンテンツ
    # ========================================
    related_tools = ParentalManyToManyField(
        'tools.Tool',
        verbose_name="関連ツール",
        blank=True,
        help_text="この記事で紹介するツール"
    )
    
    # ========================================
    # タグ
    # ========================================
    tags = ParentalManyToManyField(
        'tags.Tag',
        blank=True,
        verbose_name="タグ",
        help_text="記事に関連するタグ（既存タグから選択）"
    )
    
    # ========================================
    # 統計
    # ========================================
    view_count = models.IntegerField(
        "閲覧数",
        default=0,
        editable=False,
        help_text="この記事の閲覧数（自動カウント）"
    )
    
    # ========================================
    # Wagtail管理パネル設定
    # ========================================
    content_panels = Page.content_panels + [
        MultiFieldPanel([
            FieldPanel('excerpt'),
            FieldPanel('category'),
            FieldPanel('investment_type'),
        ], heading="記事情報"),
        FieldPanel('featured_image'),
        FieldPanel('body'),
        FieldPanel('related_tools'),
        FieldPanel('tags', widget=forms.CheckboxSelectMultiple),
    ]
    
    # ========================================
    # ページ階層設定
    # ========================================
    parent_page_types = ['blog.BlogIndexPage']
    subpage_types = []
    
    # ========================================
    # メタ情報
    # ========================================
    class Meta:
        verbose_name = "ブログ記事"
        verbose_name_plural = "ブログ記事"
    
    def __str__(self):
        return self.title
