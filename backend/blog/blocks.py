"""
ToolRadar ブログ用カスタムStreamFieldブロック

ASPアフィリエイト・収益化に特化したカスタムブロック定義
"""

from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


# ========================================
# ASPアフィリエイトブロック
# ========================================

class ComparisonItemBlock(blocks.StructBlock):
    """汎用比較項目ブロック（証券会社、ツール、書籍など何でも比較可能）"""
    
    name = blocks.CharBlock(
        label="項目名",
        max_length=100,
        help_text="例: DMM FX、MetaTrader 5、一番やさしいFXの本"
    )
    
    image = ImageChooserBlock(
        label="画像",
        required=False,
        help_text="ロゴ、サムネイル、表紙画像など（推奨: 200×200px程度）"
    )
    
    features = blocks.ListBlock(
        blocks.CharBlock(max_length=200),
        label="特徴・詳細",
        min_num=1,
        max_num=10,
        help_text="比較ポイントを自由に記載（1〜10個）"
    )
    
    rating = blocks.DecimalBlock(
        label="評価",
        min_value=0,
        max_value=5,
        decimal_places=1,
        required=False,
        help_text="5段階評価（0.0〜5.0）省略可"
    )
    
    price_info = blocks.CharBlock(
        label="価格・コスト情報",
        max_length=100,
        required=False,
        help_text="例: 無料、月額980円、口座開設無料、¥1,540"
    )
    
    highlight_text = blocks.CharBlock(
        label="ハイライト",
        max_length=100,
        required=False,
        help_text="例: 🎁新規口座開設で最大30万円、📚Amazon売れ筋1位"
    )
    
    cta_url = blocks.URLBlock(
        label="リンクURL",
        required=False,
        help_text="詳細ページまたはアフィリエイトURL（省略可）"
    )
    
    cta_text = blocks.CharBlock(
        label="ボタンテキスト",
        max_length=50,
        default="詳細を見る",
        required=False,
        help_text="CTAボタンに表示するテキスト"
    )
    
    tracking_id = blocks.CharBlock(
        label="トラッキングID",
        max_length=50,
        required=False,
        help_text="A/Bテスト用の識別ID（省略可）"
    )
    
    class Meta:
        icon = 'list-ul'
        label = '比較項目'


class ComparisonTableBlock(blocks.StructBlock):
    """汎用比較表ブロック（証券会社、ツール、書籍など何でも比較）"""
    
    title = blocks.CharBlock(
        label="比較表タイトル",
        max_length=100,
        default="比較表",
        help_text="例: おすすめFX証券会社TOP3、MT4 vs MT5徹底比較、初心者向け投資書籍3選"
    )
    
    description = blocks.TextBlock(
        label="説明文",
        max_length=500,
        required=False,
        help_text="比較表の概要や注意事項（省略可）"
    )
    
    items = blocks.ListBlock(
        ComparisonItemBlock(),
        label="比較項目",
        min_num=2,
        max_num=10,
        help_text="比較する項目を追加（2〜10個）"
    )
    
    layout = blocks.ChoiceBlock(
        label="表示形式",
        choices=[
            ('table', '比較表形式'),
            ('cards', 'カード形式'),
            ('ranking', 'ランキング形式'),
        ],
        default='cards',
        help_text="比較表の表示レイアウト"
    )
    
    show_rating = blocks.BooleanBlock(
        label="評価を表示",
        default=True,
        required=False,
        help_text="評価（星）を表示するか"
    )
    
    show_price = blocks.BooleanBlock(
        label="価格情報を表示",
        default=True,
        required=False,
        help_text="価格・コスト情報を表示するか"
    )
    
    class Meta:
        template = 'blocks/comparison_table.html'
        icon = 'table'
        label = '比較表'


class ASPCTABlock(blocks.StructBlock):
    """アフィリエイトCTAボタンブロック"""
    
    heading = blocks.CharBlock(
        label="見出し",
        max_length=100,
        required=False,
        help_text="CTA上部の見出し（省略可）"
    )
    
    text = blocks.TextBlock(
        label="説明文",
        max_length=500,
        help_text="CTAボタンの説明テキスト"
    )
    
    button_text = blocks.CharBlock(
        label="ボタンテキスト",
        max_length=50,
        default="詳細を見る",
        help_text="ボタンに表示するテキスト"
    )
    
    url = blocks.URLBlock(
        label="アフィリエイトURL",
        help_text="リンク先のアフィリエイトURL"
    )
    
    style = blocks.ChoiceBlock(
        label="ボタンスタイル",
        choices=[
            ('primary', 'メインボタン（青）'),
            ('success', '成功ボタン（緑）'),
            ('warning', '警告ボタン（オレンジ）'),
        ],
        default='primary',
        help_text="ボタンの色・スタイル"
    )
    
    size = blocks.ChoiceBlock(
        label="ボタンサイズ",
        choices=[
            ('small', '小'),
            ('medium', '中'),
            ('large', '大'),
        ],
        default='medium',
        help_text="ボタンの大きさ"
    )
    
    ab_variant = blocks.CharBlock(
        label="A/Bテストバリアント",
        max_length=50,
        required=False,
        help_text="A/Bテスト用の識別子（例: variant_a）"
    )
    
    class Meta:
        template = 'blocks/asp_cta.html'
        icon = 'link'
        label = 'ASP CTAボタン'


class ASPBannerBlock(blocks.StructBlock):
    """
    アフィリエイトバナー広告ブロック
    
    A8.net、もしもアフィリエイト、バリューコマース等のASPから提供される
    バナー広告のHTMLコードをそのまま貼り付けて使用します。
    """
    
    html_code = blocks.TextBlock(
        label="バナー広告コード",
        help_text=(
            "A8.net等のASPから提供されたバナー広告のHTMLコードを"
            "そのまま貼り付けてください。\n"
            "例: <a href=\"...\"><img src=\"...\" width=\"...\" height=\"...\"></a>"
        ),
        rows=5
    )
    
    class Meta:
        template = 'blocks/asp_banner.html'
        icon = 'code'
        label = 'ASPバナー広告'


class HeadingBlock(blocks.StructBlock):
    """
    構造化された見出しブロック
    
    SEO最適化のため、見出しレベル（h2/h3/h4）を明示的に指定可能。
    フロントエンドでの目次自動生成にも対応。
    """
    level = blocks.ChoiceBlock(
        choices=[
            ('h2', 'H2（大見出し）'),
            ('h3', 'H3（中見出し）'),
            ('h4', 'H4（小見出し）'),
        ],
        default='h2',
        label='見出しレベル',
        help_text='見出しの重要度を選択してください'
    )
    
    text = blocks.CharBlock(
        label='見出しテキスト',
        max_length=200,
        help_text='セクションの見出しを入力（最大200文字）'
    )
    
    class Meta:
        icon = 'title'
        label = '見出し'
        template = 'blocks/heading.html'


# ========================================
# 関連コンテンツブロック
# ========================================

class RelatedToolsBlock(blocks.StructBlock):
    """関連ツール紹介ブロック"""
    
    title = blocks.CharBlock(
        label="セクションタイトル",
        max_length=100,
        default="関連ツール",
        help_text="このセクションの見出し"
    )
    
    # Note: PageChooserBlockはToolモデルではなくPageモデル用
    # ToolへのリンクはURLで指定する方式に変更
    tool_slugs = blocks.ListBlock(
        blocks.CharBlock(
            label="ツールスラッグ",
            max_length=100,
            help_text="ツールのslug（例: super-rsi-indicator）"
        ),
        label="ツールリスト",
        min_num=1,
        max_num=5,
        help_text="関連ツールのslugを入力（最大5個）"
    )
    
    display_style = blocks.ChoiceBlock(
        label="表示スタイル",
        choices=[
            ('list', 'リスト表示'),
            ('cards', 'カード表示'),
            ('compact', 'コンパクト表示'),
        ],
        default='cards',
        help_text="ツールの表示形式"
    )
    
    class Meta:
        template = 'blocks/related_tools.html'
        icon = 'grip'
        label = '関連ツール'


# ========================================
# コード表示ブロック
# ========================================

class CodeBlock(blocks.StructBlock):
    """コードブロック（シンタックスハイライト対応）"""
    
    language = blocks.ChoiceBlock(
        label="プログラミング言語",
        choices=[
            ('python', 'Python'),
            ('javascript', 'JavaScript'),
            ('mql4', 'MQL4'),
            ('mql5', 'MQL5'),
            ('pine', 'Pine Script'),
            ('json', 'JSON'),
            ('sql', 'SQL'),
            ('bash', 'Bash'),
            ('plaintext', 'プレーンテキスト'),
        ],
        default='python',
        help_text="シンタックスハイライトの言語"
    )
    
    code = blocks.TextBlock(
        label="コード",
        help_text="表示するコード"
    )
    
    caption = blocks.CharBlock(
        label="キャプション",
        max_length=200,
        required=False,
        help_text="コードの説明（省略可）"
    )
    
    class Meta:
        template = 'blocks/code.html'
        icon = 'code'
        label = 'コードブロック'
