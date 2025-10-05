"""
ToolRadar ブログ用カスタムStreamFieldブロック

ASPアフィリエイト・収益化に特化したカスタムブロック定義
"""

from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


# ========================================
# ASPアフィリエイトブロック
# ========================================

class BrokerBlock(blocks.StructBlock):
    """証券会社情報ブロック"""
    
    name = blocks.CharBlock(
        label="証券会社名",
        max_length=100,
        help_text="例: DMM FX、GMOクリック証券"
    )
    
    logo = ImageChooserBlock(
        label="ロゴ画像",
        required=False,
        help_text="証券会社のロゴ（推奨: 200×80px程度）"
    )
    
    features = blocks.ListBlock(
        blocks.CharBlock(max_length=200),
        label="特徴",
        min_num=3,
        max_num=5,
        help_text="証券会社の主な特徴を3〜5個"
    )
    
    bonus = blocks.CharBlock(
        label="キャンペーン情報",
        max_length=200,
        required=False,
        help_text="例: 新規口座開設で最大30万円キャッシュバック"
    )
    
    min_deposit = blocks.CharBlock(
        label="最低入金額",
        max_length=50,
        required=False,
        help_text="例: 10,000円〜"
    )
    
    commission = blocks.CharBlock(
        label="手数料",
        max_length=100,
        required=False,
        help_text="例: スプレッド0.2銭〜（米ドル/円）"
    )
    
    rating = blocks.DecimalBlock(
        label="評価",
        min_value=0,
        max_value=5,
        decimal_places=1,
        default=4.5,
        help_text="5段階評価（0.0〜5.0）"
    )
    
    cta_url = blocks.URLBlock(
        label="アフィリエイトURL",
        help_text="証券会社へのアフィリエイトリンク"
    )
    
    cta_text = blocks.CharBlock(
        label="ボタンテキスト",
        max_length=50,
        default="今すぐ口座開設",
        help_text="CTAボタンに表示するテキスト"
    )
    
    tracking_id = blocks.CharBlock(
        label="トラッキングID",
        max_length=50,
        required=False,
        help_text="A/Bテスト用の識別ID"
    )
    
    class Meta:
        icon = 'user'
        label = '証券会社情報'


class ASPComparisonBlock(blocks.StructBlock):
    """ASP証券会社比較表ブロック"""
    
    title = blocks.CharBlock(
        label="比較表タイトル",
        max_length=100,
        default="おすすめ証券会社TOP3",
        help_text="比較表の見出し"
    )
    
    brokers = blocks.ListBlock(
        BrokerBlock(),
        label="証券会社リスト",
        min_num=1,
        max_num=10,
        help_text="比較する証券会社を追加"
    )
    
    layout = blocks.ChoiceBlock(
        label="表示形式",
        choices=[
            ('table', '比較表形式'),
            ('cards', 'カード形式'),
            ('ranking', 'ランキング形式'),
        ],
        default='table',
        help_text="比較表の表示レイアウト"
    )
    
    class Meta:
        template = 'blocks/asp_comparison.html'
        icon = 'table'
        label = 'ASP比較表'


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
    """アフィリエイトバナー広告ブロック"""
    
    image = ImageChooserBlock(
        label="バナー画像",
        help_text="バナー広告の画像（推奨: 728×90px または 300×250px）"
    )
    
    url = blocks.URLBlock(
        label="リンク先URL",
        help_text="バナークリック時のリンク先（アフィリエイトURL）"
    )
    
    alt_text = blocks.CharBlock(
        label="代替テキスト",
        max_length=200,
        help_text="画像の説明（SEO・アクセシビリティ対応）"
    )
    
    tracking_id = blocks.CharBlock(
        label="トラッキングID",
        max_length=50,
        required=False,
        help_text="クリック計測用のID"
    )
    
    class Meta:
        template = 'blocks/asp_banner.html'
        icon = 'image'
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
