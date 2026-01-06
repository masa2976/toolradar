"""
ToolRadar ブログ用カスタムStreamFieldブロック

ASPアフィリエイト・収益化に特化したカスタムブロック定義
"""

from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


# ========================================
# ASPアフィリエイトブロック
# ========================================




class CTABlock(blocks.StructBlock):
    """CTAボタンブロック"""

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
        template = 'blocks/cta.html'
        icon = 'link'
        label = 'CTAボタン'
        description = '読者にアクションを促すボタン。アフィリエイトリンクや資料請求、口座開設などに最適です。'
        preview_template = 'blocks/cta.html'  # プレビュー用テンプレートを明示
        preview_value = {
            'heading': '今なら限定キャンペーン！',
            'text': 'FX口座開設で最大5万円キャッシュバック',
            'button_text': '今すぐ無料で口座開設',
            'url': 'https://example.com',
            'style': 'primary',
            'size': 'large',
        }


class BannerBlock(blocks.StructBlock):
    """
    バナー広告ブロック

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
        template = 'blocks/banner.html'
        icon = 'code'
        label = 'バナー広告'
        description = 'ASP（A8.net、もしもアフィリエイト等）から提供されるバナー広告のHTMLコードをそのまま埋め込めます。'
        preview_template = 'blocks/banner.html'
        preview_value = {
            'html_code': '<div style="border: 2px dashed #ccc; padding: 20px; text-align: center;">バナー広告がここに表示されます<br><small>（ASPから提供されたコードを貼り付けてください）</small></div>'
        }


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
        description = '記事の構造を作る見出し（H2/H3/H4）。SEO最適化と自動目次生成に対応しています。'
        preview_template = 'blocks/heading.html'
        preview_value = {
            'level': 'h2',
            'text': 'FX自動売買EAの選び方完全ガイド'
        }


class TableOfContentsBlock(blocks.StructBlock):
    """
    目次ブロック

    記事内の見出し（h2, h3）を自動抽出して目次を生成します。
    編集者は目次を配置したい位置にこのブロックを追加するだけで、
    フロントエンドが自動的に見出しリストを生成します。
    """
    title = blocks.CharBlock(
        label='目次タイトル',
        default='目次',
        max_length=50,
        required=False,
        help_text='目次のタイトル（省略時は「目次」）'
    )

    show_h2 = blocks.BooleanBlock(
        label='H2を表示',
        default=True,
        required=False,
        help_text='大見出し（H2）を目次に表示'
    )

    show_h3 = blocks.BooleanBlock(
        label='H3を表示',
        default=True,
        required=False,
        help_text='中見出し（H3）を目次に表示'
    )

    class Meta:
        icon = 'list-ul'
        label = '目次'
        template = 'blocks/table_of_contents.html'
        description = '記事内の見出しから自動生成される目次。長い記事の読みやすさを向上させます。'
        preview_template = 'blocks/table_of_contents.html'
        preview_value = {
            'title': '目次',
            'show_h2': True,
            'show_h3': True
        }


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
        description = '記事で紹介するツールへのリンク集。カード形式、リスト形式などで表示できます。'
        preview_template = 'blocks/related_tools.html'
        preview_value = {
            'title': '関連ツール',
            'tool_slugs': ['grid-master-ea', 'super-rsi-indicator'],
            'display_style': 'cards'
        }


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
        description = 'プログラムコードを読みやすく表示。MQL4/MQL5、Pine Script、Pythonなどのシンタックスハイライトに対応。'
        preview_template = 'blocks/code.html'
        preview_value = {
            'language': 'mql5',
            'code': 'int OnInit() {\n  Print("EA initialized!");\n  return INIT_SUCCEEDED;\n}',
            'caption': 'MT5 EAの初期化コード例'
        }



# ========================================
# レイアウト調整ブロック
# ========================================

class SpacerBlock(blocks.StructBlock):
    """
    余白調整ブロック

    セクション間の余白を柔軟に調整できるブロック。
    レイアウトの見やすさ向上に使用。
    """
    size = blocks.ChoiceBlock(
        label='余白サイズ',
        choices=[
            ('small', '小（20px）'),
            ('medium', '中（40px）'),
            ('large', '大（60px）'),
            ('xlarge', '特大（80px）'),
        ],
        default='medium',
        help_text='セクション間の余白の大きさを選択'
    )

    class Meta:
        template = 'blocks/spacer.html'
        icon = 'arrows-up-down'
        label = '余白'
        description = 'セクション間の余白を柔軟に調整。小・中・大・特大の4サイズから選べます。'
        preview_template = 'blocks/spacer.html'
        preview_value = {
            'size': 'medium'
        }


class AlertBlock(blocks.StructBlock):
    """
    アラート・通知ブロック

    重要な情報を目立たせるブロック。
    情報、成功、注意、警告の4種類。
    """
    alert_type = blocks.ChoiceBlock(
        label='アラート種類',
        choices=[
            ('info', '情報（青）'),
            ('success', '成功・推奨（緑）'),
            ('warning', '注意（黄）'),
            ('danger', '警告（赤）'),
        ],
        default='info',
        help_text='アラートの種類を選択（色とアイコンが変わります）'
    )
    title = blocks.CharBlock(
        label='タイトル',
        required=False,
        max_length=100,
        help_text='アラートのタイトル（省略可）'
    )
    content = blocks.RichTextBlock(
        label='内容',
        features=['bold', 'italic', 'link'],
        help_text='アラートの本文（太字、斜体、リンク使用可）'
    )

    class Meta:
        template = 'blocks/alert.html'
        icon = 'warning'
        label = 'アラート'
        description = '重要な情報を目立たせる通知ボックス。情報・成功・注意・警告の4種類から選べます。'
        preview_template = 'blocks/alert.html'
        preview_value = {
            'alert_type': 'warning',
            'title': '注意事項',
            'content': '<p>FXトレードには<b>リスク</b>が伴います。余裕資金で取引を行いましょう。</p>'
        }


class AccordionBlock(blocks.StructBlock):
    """
    折りたたみ可能なアコーディオンブロック

    長い説明やFAQなど、必要に応じて表示/非表示を切り替えられるコンテンツに使用。
    ユーザーが見出しをクリックすることで、本文の表示/非表示を切り替えられます。
    """
    title = blocks.CharBlock(
        label='見出し',
        max_length=200,
        help_text='折りたたみセクションの見出し（クリックで開閉）'
    )
    content = blocks.RichTextBlock(
        label='本文',
        features=['bold', 'italic', 'link', 'ol', 'ul'],
        help_text='折りたたまれるコンテンツ（太字、斜体、リンク、リスト使用可）'
    )
    is_open_by_default = blocks.BooleanBlock(
        label='デフォルトで開く',
        required=False,
        default=False,
        help_text='チェックすると、最初から開いた状態で表示されます'
    )

    class Meta:
        template = 'blocks/accordion.html'
        icon = 'collapse-down'
        label = 'アコーディオン'
        description = 'クリックで開閉できる折りたたみコンテンツ。FAQや補足説明など、任意表示の情報に最適です。'
        preview_template = 'blocks/accordion.html'
        preview_value = {
            'title': 'よくある質問：EAは本当に勝てますか？',
            'content': '<p>EAの<b>勝率は戦略次第</b>です。過去のバックテスト結果だけでなく、<b>フォワードテスト</b>での実績も確認しましょう。</p><ul><li>バックテスト期間が長いか</li><li>フォワードテストで安定しているか</li><li>適切なリスク管理があるか</li></ul>',
            'is_open_by_default': False
        }
