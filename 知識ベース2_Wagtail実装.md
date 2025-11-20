# 知識ベース2: Wagtail実装

## 📝 StreamFieldブロック定義

### ASP比較表ブロック
```python
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock

class BrokerInfoBlock(blocks.StructBlock):
    """個別証券会社情報"""
    name = blocks.CharBlock(label="証券会社名")
    logo = ImageChooserBlock(required=False, label="ロゴ画像")

    features = blocks.ListBlock(
        blocks.CharBlock(),
        min_num=3,
        max_num=5,
        label="特徴・メリット"
    )

    bonus = blocks.CharBlock(
        required=False,
        label="キャンペーン情報",
        help_text="例: 口座開設で5万円キャッシュバック"
    )

    min_deposit = blocks.CharBlock(
        required=False,
        label="最低入金額",
        help_text="例: 5万円〜"
    )

    commission = blocks.CharBlock(
        required=False,
        label="手数料",
        help_text="例: スプレッド0.2銭〜"
    )

    rating = blocks.DecimalBlock(
        min_value=0,
        max_value=5,
        decimal_places=1,
        label="評価（5点満点）"
    )

    cta_url = blocks.URLBlock(
        label="アフィリエイトURL",
        help_text="ASP提供のトラッキングURL"
    )

    cta_text = blocks.CharBlock(
        default="今すぐ口座開設",
        label="ボタンテキスト"
    )

    tracking_id = blocks.CharBlock(
        required=False,
        label="トラッキングID",
        help_text="A/Bテスト用識別子"
    )

class ASPComparisonBlock(blocks.StructBlock):
    """ASP比較表ブロック"""
    title = blocks.CharBlock(
        default="おすすめ証券会社TOP3",
        label="セクションタイトル"
    )

    brokers = blocks.ListBlock(
        BrokerInfoBlock(),
        min_num=1,
        max_num=10,
        label="証券会社リスト"
    )

    layout = blocks.ChoiceBlock(
        choices=[
            ('table', '比較表形式'),
            ('cards', 'カード形式'),
            ('ranking', 'ランキング形式'),
        ],
        default='table',
        label="表示レイアウト"
    )

    show_disclaimer = blocks.BooleanBlock(
        default=True,
        required=False,
        label="免責事項を表示"
    )

    class Meta:
        template = 'blocks/asp_comparison.html'
        icon = 'table'
        label = 'ASP比較表'
```

### ASP CTAブロック
```python
class ASPCTABlock(blocks.StructBlock):
    """アフィリエイトCTAブロック"""
    heading = blocks.CharBlock(
        required=False,
        label="見出し",
        help_text="例: 今なら限定キャンペーン実施中！"
    )

    text = blocks.TextBlock(
        label="説明文",
        help_text="CTAの説明文を入力"
    )

    button_text = blocks.CharBlock(
        default="詳細を見る",
        label="ボタンテキスト"
    )

    url = blocks.URLBlock(
        label="アフィリエイトURL"
    )

    style = blocks.ChoiceBlock(
        choices=[
            ('primary', 'メインボタン（青）'),
            ('success', '成功ボタン（緑）'),
            ('warning', '注目ボタン（オレンジ）'),
        ],
        default='primary',
        label="ボタンスタイル"
    )

    size = blocks.ChoiceBlock(
        choices=[
            ('small', '小'),
            ('medium', '中'),
            ('large', '大'),
            ('full', '全幅'),
        ],
        default='medium',
        label="ボタンサイズ"
    )

    position = blocks.ChoiceBlock(
        choices=[
            ('left', '左寄せ'),
            ('center', '中央'),
            ('right', '右寄せ'),
        ],
        default='center',
        label="配置"
    )

    ab_variant = blocks.CharBlock(
        required=False,
        label="A/Bテストバリアント"
    )

    class Meta:
        template = 'blocks/asp_cta.html'
        icon = 'link'
        label = 'ASP CTAボタン'
```

### 関連ツールブロック
```python
class RelatedToolsBlock(blocks.StructBlock):
    """関連ツール表示ブロック"""
    title = blocks.CharBlock(
        default="関連ツール",
        label="セクションタイトル"
    )

    tools = blocks.ListBlock(
        blocks.StructBlock([
            ('tool_id', blocks.CharBlock(label="ツールID")),
        ]),
        min_num=1,
        max_num=5,
        label="表示するツール"
    )

    display_style = blocks.ChoiceBlock(
        choices=[
            ('list', 'リスト表示'),
            ('cards', 'カード表示'),
            ('compact', 'コンパクト表示'),
        ],
        default='cards',
        label="表示スタイル"
    )

    show_score = blocks.BooleanBlock(
        default=True,
        required=False,
        label="週間スコアを表示"
    )

    class Meta:
        template = 'blocks/related_tools.html'
        icon = 'grip'
        label = '関連ツール'
```

### カスタムテーブルブロック
```python
from wagtail.contrib.table_block.blocks import TableBlock

class ComparisonTableBlock(TableBlock):
    """比較表用テーブルブロック"""

    class Meta:
        template = 'blocks/comparison_table.html'
        icon = 'table'
        label = '比較表'
        help_text = '項目比較用のテーブル'
```

## 📄 BlogPageモデル完全版

```python
from wagtail.models import Page
from wagtail.fields import StreamField
from wagtail.admin.panels import (
    FieldPanel, MultiFieldPanel, InlinePanel
)
from wagtail.search import index
from modelcluster.fields import ParentalKey
from modelcluster.contrib.taggit import ClusterTaggableManager

class BlogPage(Page):
    """ブログ記事ページ"""

    # メタ情報
    excerpt = models.TextField(
        max_length=200,
        help_text="記事の要約（検索結果・SNS表示用）"
    )

    category = models.CharField(
        max_length=30,
        choices=[
            ('beginner_guide', '初心者ガイド'),
            ('tool_review', 'ツールレビュー'),
            ('trading_strategy', 'トレード戦略'),
            ('market_analysis', '市場分析'),
            ('ranking_report', 'ランキング特集'),
            ('news', 'ニュース・更新情報'),
            ('tutorial', 'チュートリアル'),
        ],
        help_text="記事のカテゴリー"
    )

    investment_type = models.CharField(
        max_length=20,
        choices=[
            ('forex', 'FX'),
            ('stock', '株式'),
            ('crypto', '仮想通貨'),
            ('commodity', 'コモディティ'),
            ('general', '投資全般'),
        ],
        help_text="投資ジャンル"
    )

    # コンテンツ
    body = StreamField([
        ('paragraph', blocks.RichTextBlock(
            features=['bold', 'italic', 'link', 'ol', 'ul', 'hr', 'h3', 'h4']
        )),
        ('heading', blocks.CharBlock(
            form_classname="title",
            icon='title'
        )),
        ('image', ImageChooserBlock()),
        ('table', ComparisonTableBlock()),
        ('quote', blocks.BlockQuoteBlock()),
        ('embed', blocks.EmbedBlock()),
        ('code', blocks.CodeBlock(label='コード')),

        # カスタムASPブロック
        ('asp_comparison', ASPComparisonBlock()),
        ('asp_cta', ASPCTABlock()),
        ('related_tools', RelatedToolsBlock()),
    ], use_json_field=True)

    # アイキャッチ画像
    featured_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    # 関連設定
    related_tools = models.ManyToManyField(
        'tools.Tool',
        blank=True,
        help_text="この記事で紹介するツール"
    )

    tags = ClusterTaggableManager(
        through='blog.BlogPageTag',
        blank=True
    )

    # 統計
    view_count = models.IntegerField(
        default=0,
        editable=False
    )

    # 検索インデックス
    search_fields = Page.search_fields + [
        index.SearchField('excerpt'),
        index.SearchField('body'),
        index.FilterField('category'),
        index.FilterField('investment_type'),
    ]

    # 管理パネル設定
    content_panels = Page.content_panels + [
        MultiFieldPanel([
            FieldPanel('excerpt'),
            FieldPanel('category'),
            FieldPanel('investment_type'),
        ], heading="記事情報"),
        FieldPanel('featured_image'),
        FieldPanel('body'),
        FieldPanel('related_tools'),
        FieldPanel('tags'),
    ]

    promote_panels = Page.promote_panels + [
        # Wagtail標準のSEO機能を使用
    ]

    # ページ階層設定
    parent_page_types = ['blog.BlogIndexPage']
    subpage_types = []

    # URL設定
    def get_url_parts(self, request=None):
        """カスタムURL生成"""
        url_parts = super().get_url_parts(request)

        if url_parts:
            # /blog/2025/01/slug/ 形式
            url_parts = list(url_parts)
            url_parts[2] = '/blog/{}/{}/{}/'.format(
                self.first_published_at.year,
                self.first_published_at.strftime('%m'),
                self.slug
            )

        return url_parts
```

## 🎨 テンプレート構成

### blocks/asp_comparison.html
```django
{% load wagtailcore_tags %}

<div class="asp-comparison asp-comparison--{{ self.layout }}">
    <h2>{{ self.title }}</h2>

    {% if self.layout == 'table' %}
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>証券会社</th>
                    <th>特徴</th>
                    <th>キャンペーン</th>
                    <th>最低入金額</th>
                    <th>評価</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {% for broker in self.brokers %}
                <tr>
                    <td>
                        {% if broker.logo %}
                            {% image broker.logo width-100 %}
                        {% endif %}
                        {{ broker.name }}
                    </td>
                    <td>
                        <ul>
                        {% for feature in broker.features %}
                            <li>{{ feature }}</li>
                        {% endfor %}
                        </ul>
                    </td>
                    <td>{{ broker.bonus|default:"" }}</td>
                    <td>{{ broker.min_deposit|default:"-" }}</td>
                    <td>
                        <span class="rating">{{ broker.rating }}/5</span>
                    </td>
                    <td>
                        <a href="{{ broker.cta_url }}"
                           class="btn btn-primary"
                           rel="nofollow noopener noreferrer"
                           data-tracking="{{ broker.tracking_id }}">
                            {{ broker.cta_text }}
                        </a>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>

    {% elif self.layout == 'cards' %}
        <div class="broker-cards">
            {% for broker in self.brokers %}
            <div class="broker-card">
                <!-- カード形式の実装 -->
            </div>
            {% endfor %}
        </div>

    {% elif self.layout == 'ranking' %}
        <ol class="broker-ranking">
            {% for broker in self.brokers %}
            <li class="broker-item">
                <!-- ランキング形式の実装 -->
            </li>
            {% endfor %}
        </ol>
    {% endif %}

    {% if self.show_disclaimer %}
    <p class="disclaimer">
        ※投資は元本保証がございません。リスクを理解した上でご利用ください。
    </p>
    {% endif %}
</div>
```

## ⚙️ Wagtail設定

### settings.py
```python
INSTALLED_APPS = [
    'wagtail.contrib.forms',
    'wagtail.contrib.redirects',
    'wagtail.embeds',
    'wagtail.sites',
    'wagtail.users',
    'wagtail.snippets',
    'wagtail.documents',
    'wagtail.images',
    'wagtail.search',
    'wagtail.admin',
    'wagtail',

    'modelcluster',
    'taggit',
    'django_extensions',

    'apps.blog',
    'apps.tools',
]

WAGTAIL_SITE_NAME = 'ToolRadar'
WAGTAILIMAGES_FORMAT_CONVERSIONS = {
    'webp': 'webp',
    'jpeg': 'jpeg',
}
```

### wagtail_hooks.py
```python
from wagtail import hooks
from wagtail.admin.menu import MenuItem

@hooks.register('register_admin_menu_item')
def register_tool_menu_item():
    """ツール管理メニュー追加"""
    return MenuItem(
        'ツール管理',
        '/admin/tools/tool/',
        classnames='icon icon-cogs',
        order=200
    )

@hooks.register('construct_main_menu')
def hide_unnecessary_menu_items(request, menu_items):
    """不要なメニュー項目を非表示"""
    menu_items[:] = [
        item for item in menu_items
        if item.name not in ['documents', 'reports']
    ]
```

## 📊 プレビュー機能

```python
class BlogPage(Page):
    # プレビューモード設定
    preview_modes = [
        ('', 'デフォルト'),
        ('mobile', 'モバイル'),
        ('amp', 'AMP'),
    ]

    def serve_preview(self, request, mode_name=''):
        """プレビュー処理"""
        if mode_name == 'mobile':
            # モバイルプレビュー用の処理
            request.is_mobile_preview = True
        elif mode_name == 'amp':
            # AMPプレビュー用の処理
            return self.serve_amp(request)

        return super().serve_preview(request, mode_name)

    def get_preview_template(self, request, mode_name):
        """プレビューテンプレート選択"""
        if mode_name == 'mobile':
            return 'blog/blog_page_mobile_preview.html'
        return 'blog/blog_page.html'
```

## 🔒 承認ワークフロー

```python
# settings.py
WAGTAIL_WORKFLOW_ENABLED = True

# ワークフローステップ
# 1. 下書き作成（編集者）
# 2. レビュー依頼
# 3. 内容確認（レビュアー）
# 4. 承認（承認者）
# 5. 公開

# グループ設定例
from django.contrib.auth.models import Group

editor_group = Group.objects.create(name='編集者')
reviewer_group = Group.objects.create(name='レビュアー')
approver_group = Group.objects.create(name='承認者')
```
