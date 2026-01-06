from typing import TYPE_CHECKING

from django.db import models

if TYPE_CHECKING:
    from django.http import HttpRequest
from django import forms
from django.utils.text import slugify
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel


# Wagtailページモデル関連
from wagtail.models import Page
from wagtail.fields import StreamField, RichTextField
from wagtail.api import APIField
from wagtail_headless_preview.models import HeadlessPreviewMixin
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.embeds.blocks import EmbedBlock
from wagtail.contrib.table_block.blocks import TableBlock

# カスタムブロックのインポート
from .blocks import (
    CTABlock,
    BannerBlock,
    RelatedToolsBlock,
    CodeBlock,
    HeadingBlock,
    TableOfContentsBlock,
    SpacerBlock,
    AlertBlock,
    AccordionBlock,  # Phase 11-3: 折りたたみコンテンツブロック
)
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from modelcluster.fields import ParentalKey, ParentalManyToManyField
from modelcluster.contrib.taggit import ClusterTaggableManager
from taggit.models import ItemBase


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



# ========================================
# BlogPageタグ（through model）
# ========================================
class BlogPageTag(ItemBase):
    """
    BlogPageとTagの中間テーブル（Wagtail公式パターン）
    ClusterTaggableManagerと連携してタグ機能を提供
    """
    tag = models.ForeignKey(
        'tags.Tag',
        related_name='tagged_blogs',
        on_delete=models.CASCADE
    )
    content_object = ParentalKey(
        'blog.BlogPage',
        on_delete=models.CASCADE,
        related_name='tagged_items'
    )


class BlogPage(HeadlessPreviewMixin, Page):
    """ブログ記事ページ（Headless Preview対応）"""
    
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
        # ========================================
        # 📝 基本コンテンツ（見出し・本文・画像・引用）
        # ========================================
        ('basic_content', blocks.StreamBlock([
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
            ('quote', blocks.BlockQuoteBlock(
                label="引用",
                help_text="引用文を表示"
            )),
        ], icon='doc-full', label='📝 基本コンテンツ')),
        
        # ========================================
        # 🎨 メディア・埋め込み（表・動画・コード）
        # ========================================
        ('media', blocks.StreamBlock([
            ('table', TableBlock(
                label="表",
                help_text="データを表形式で表示（行・列を追加できます）",
                table_options={
                    'contextMenu': {
                        'items': {
                            'row_above': {'name': '上に行を挿入'},
                            'row_below': {'name': '下に行を挿入'},
                            'col_left': {'name': '左に列を挿入'},
                            'col_right': {'name': '右に列を挿入'},
                            'remove_row': {'name': '行を削除'},
                            'remove_col': {'name': '列を削除'},
                            'undo': {'name': '元に戻す'},
                            'redo': {'name': 'やり直す'}
                        }
                    },
                    'stretchH': 'all',        # 列を水平方向に伸ばす
                    'autoWrapRow': True,      # 行の自動折り返し
                    'autoWrapCol': True,      # 列の自動折り返し
                    'minSpareRows': 0,        # 最小予備行数
                }
            )),
            ('embed', EmbedBlock(
                label="埋め込み",
                help_text="YouTube動画やツイート等の埋め込み"
            )),
            ('code', CodeBlock()),
        ], icon='media', label='🎨 メディア・埋め込み')),
        
        # ========================================
        # 💰 収益化・CTA（CTAボタン・バナー・関連ツール）
        # ========================================
        ('monetization', blocks.StreamBlock([
            ('cta', CTABlock()),
            ('banner', BannerBlock()),
            ('related_tools', RelatedToolsBlock()),
        ], icon='link', label='💰 収益化・CTA')),
        
        # ========================================
        # 🔧 レイアウト・装飾（目次・余白・アラート・アコーディオン）
        # ========================================
        ('layout', blocks.StreamBlock([
            ('table_of_contents', TableOfContentsBlock()),
            ('spacer', SpacerBlock()),
            ('alert', AlertBlock()),
            ('accordion', AccordionBlock()),
        ], icon='cogs', label='🔧 レイアウト・装飾')),
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
    tags = ClusterTaggableManager(
        through=BlogPageTag,
        blank=True,
        verbose_name="タグ",
        help_text="記事に関連するタグ（入力で候補表示、既存タグから選択）"
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
        FieldPanel('tags'),  # ClusterTaggableManager: オートコンプリートUI
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
    
    # ========================================
    # Headless Preview設定
    # ========================================
    
    def get_client_root_url(self, request: "HttpRequest") -> str:
        """
        Next.jsフロントエンドのルートURL
        開発環境: http://localhost:3000
        本番環境: 環境変数で切り替え可能
        
        Args:
            request: HTTPリクエストオブジェクト
        
        Returns:
            フロントエンドのルートURL
        """
        import os
        return os.getenv('NEXT_PUBLIC_URL', 'http://localhost:3000')
    
    def get_preview_url(self, request: "HttpRequest", token: str) -> str:
        """
        プレビューURL生成
        Next.jsのプレビューAPIにリダイレクト
        
        Args:
            request: HTTPリクエストオブジェクト
            token: wagtail-headless-previewが生成したトークン
        
        Returns:
            Next.jsプレビューAPIのURL（トークン付き）
        """
        from django.utils.http import urlencode
        
        client_url = self.get_client_root_url(request)
        params = {
            "content_type": self.get_content_type_str(),
            "token": token,
            "slug": self.slug
        }
        return f"{client_url}/api/preview?{urlencode(params)}"


# ========================================
# 静的ページモデル
# ========================================

class StandardPage(HeadlessPreviewMixin, Page):
    """
    静的ページモデル（Headless Preview対応）
    
    プライバシーポリシー、利用規約、About、お問い合わせなどに使用
    """
    
    # 本文（リッチテキスト）
    body = RichTextField(
        "本文",
        blank=True,
        help_text="ページの本文を入力してください"
    )
    
    # Wagtail管理画面の設定
    content_panels = Page.content_panels + [
        FieldPanel('body'),
    ]
    
    # SEO設定（Wagtail標準のSEOフィールド）
    promote_panels = Page.promote_panels

    # Wagtail API公開設定（カスタムシリアライザー使用）
    api_fields = [
        APIField('body', serializer='blog.api_serializers.RichTextSerializer'),
        APIField('seo_title'),
        APIField('search_description'),
    ]
    
    # 親ページの制限（ルート直下のみ）
    parent_page_types = ['wagtailcore.Page']
    subpage_types = []
    
    class Meta:
        verbose_name = "静的ページ"
        verbose_name_plural = "静的ページ"
    
    def __str__(self):
        return self.title
    
    # ========================================
    # Headless Preview設定
    # ========================================
    
    def get_client_root_url(self, request: "HttpRequest") -> str:
        """
        Next.jsフロントエンドのルートURL
        開発環境: http://localhost:3000
        本番環境: 環境変数で切り替え可能
        
        Args:
            request: HTTPリクエストオブジェクト
        
        Returns:
            フロントエンドのルートURL
        """
        import os
        return os.getenv('NEXT_PUBLIC_URL', 'http://localhost:3000')
    
    def get_preview_url(self, request: "HttpRequest", token: str) -> str:
        """
        プレビューURL生成
        Next.jsのプレビューAPIにリダイレクト
        
        Args:
            request: HTTPリクエストオブジェクト
            token: wagtail-headless-previewが生成したトークン
        
        Returns:
            Next.jsプレビューAPIのURL（トークン付き）
        """
        from django.utils.http import urlencode
        
        client_url = self.get_client_root_url(request)
        params = {
            "content_type": self.get_content_type_str(),
            "token": token,
            "slug": self.slug
        }
        return f"{client_url}/api/preview?{urlencode(params)}"
