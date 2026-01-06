/**
 * Wagtail StreamField 型定義
 * 
 * Wagtail APIから返されるStreamFieldのJSON構造を
 * TypeScriptで型安全に扱うための型定義
 */

/**
 * StreamFieldブロックの基本構造
 * @template T - ブロック固有のvalue型
 */
export interface StreamFieldBlock<T = any> {
  /** ブロックの種別（例: 'paragraph', 'heading', 'comparison_table'） */
  type: string;
  /** ブロック固有のデータ */
  value: T;
  /** 一意識別子（オプション） */
  id?: string;
}

/**
 * Paragraphブロックのvalue型
 */
export interface ParagraphBlockValue {
  /** 段落のテキスト内容 */
  text: string;
}

/**
 * Headingブロックのvalue型
 */
export interface HeadingBlockValue {
  /** 見出しのテキスト */
  text: string;
  /** 見出しレベル（2-4） */
  level?: 2 | 3 | 4;
}

/**
 * Codeブロックのvalue型
 */
export interface CodeBlockValue {
  /** プログラミング言語 */
  language: string;
  /** コード内容 */
  code: string;
  /** キャプション（オプション） */
  caption?: string;
}

/**
 * 証券会社情報
 */
export interface Broker {
  /** 証券会社名 */
  name: string;
  /** ロゴ画像URL */
  logo?: string;
  /** 評価（1-5） */
  rating: number;
  /** 特徴リスト */
  features: string[];
  /** ボーナス情報 */
  bonus?: string;
  /** コスト情報 */
  cost?: string;
  /** CTAリンクURL */
  cta_url: string;
  /** CTAボタンテキスト */
  cta_text: string;
  /** トラッキングID */
  tracking_id?: string;
}

/**
 * ComparisonTableブロックのvalue型
 */
export interface ComparisonTableValue {
  /** タイトル */
  title: string;
  /** 説明文（オプション） */
  description?: string;
  /** 証券会社リスト */
  brokers: Broker[];
  /** レイアウト形式 */
  layout?: 'table' | 'cards' | 'ranking';
}

/**
 * Tableブロックのvalue型
 */
export interface TableValue {
  /** 表データ（2次元配列） */
  data: string[][];
  /** 最初の行をヘッダーとして扱うか */
  first_row_is_table_header?: boolean;
  /** 最初の列をヘッダーとして扱うか */
  first_col_is_header?: boolean;
}

/**
 * CTAブロックのvalue型
 */
export interface CTAValue {
  /** 見出し */
  heading?: string;
  /** 説明文 */
  text: string;
  /** ボタンテキスト */
  button_text: string;
  /** リンクURL */
  url: string;
  /** スタイル */
  style?: 'primary' | 'success' | 'warning';
  /** サイズ */
  size?: 'small' | 'medium' | 'large';
  /** A/Bテストバリアント */
  ab_variant?: string;
}

/**
 * Bannerブロックのvalue型
 */
export interface BannerValue {
  /** バナーHTMLコード */
  html_code: string;
}

/**
 * Spacerブロックのvalue型
 */
export interface SpacerBlockValue {
  /** 余白サイズ（small: 20px, medium: 40px, large: 60px, xlarge: 80px） */
  size: 'small' | 'medium' | 'large' | 'xlarge';
}

/**
 * Alertブロックのvalue型
 */
export interface AlertBlockValue {
  /** アラート種類（info: 情報, success: 成功, warning: 注意, danger: 警告） */
  alert_type: 'info' | 'success' | 'warning' | 'danger';
  /** タイトル（オプション） */
  title?: string;
  /** コンテンツ（RichTextはHTMLとして返される） */
  content: string;
}

/**
 * Accordionブロックのvalue型
 */
export interface AccordionBlockValue {
  /** アコーディオンのタイトル */
  title: string;
  /** 折りたたまれるコンテンツ（RichTextはHTMLとして返される） */
  content: string;
  /** デフォルトで開いた状態にするか */
  is_open_by_default: boolean;
}

/**
 * 型付きStreamFieldブロック
 */
export type ParagraphBlock = StreamFieldBlock<ParagraphBlockValue>;
export type HeadingBlock = StreamFieldBlock<HeadingBlockValue>;
export type CodeBlock = StreamFieldBlock<CodeBlockValue>;
export type ComparisonTableBlock = StreamFieldBlock<ComparisonTableValue>;
export type TableBlock = StreamFieldBlock<TableValue>;
export type CTABlock = StreamFieldBlock<CTAValue>;
export type BannerBlock = StreamFieldBlock<BannerValue>;
export type SpacerBlock = StreamFieldBlock<SpacerBlockValue>;
export type AlertBlock = StreamFieldBlock<AlertBlockValue>;
export type AccordionBlock = StreamFieldBlock<AccordionBlockValue>;

/**
 * カテゴリブロックのvalue型（Phase 2対応）
 * カテゴリブロックは子ブロックの配列を持つ
 */
export type CategoryBlockValue = StreamFieldBlock[];

/**
 * カテゴリブロック型（Phase 2対応）
 */
export type BasicContentBlock = StreamFieldBlock<CategoryBlockValue> & { type: 'basic_content' };
export type MediaBlock = StreamFieldBlock<CategoryBlockValue> & { type: 'media' };
export type MonetizationBlock = StreamFieldBlock<CategoryBlockValue> & { type: 'monetization' };
export type LayoutBlock = StreamFieldBlock<CategoryBlockValue> & { type: 'layout' };

/**
 * Imageブロックのvalue型
 */
export interface ImageBlockValue {
  /** 画像ID */
  id: number;
  /** 画像URL */
  url?: string;
  /** 代替テキスト */
  alt?: string;
  /** キャプション */
  caption?: string;
}

/**
 * Quoteブロックのvalue型
 */
export type QuoteBlockValue = string;

/**
 * Embedブロックのvalue型
 */
export interface EmbedBlockValue {
  /** 埋め込みURL */
  url: string;
  /** 埋め込みHTML */
  html?: string;
}

/**
 * RelatedToolsブロックのvalue型
 */
export interface RelatedToolsBlockValue {
  /** 表示するツールIDリスト */
  tools: { tool_id: string }[];
  /** 表示スタイル */
  display_style?: 'list' | 'cards' | 'compact';
  /** スコア表示フラグ */
  show_score?: boolean;
}

/**
 * TableOfContentsブロックのvalue型
 */
export interface TableOfContentsValue {
  /** 対象見出しレベル */
  depth?: number;
}

/**
 * 型付きStreamFieldブロック（追加分）
 */
export type ImageBlock = StreamFieldBlock<ImageBlockValue>;
export type QuoteBlock = StreamFieldBlock<QuoteBlockValue>;
export type EmbedBlock = StreamFieldBlock<EmbedBlockValue>;
export type RelatedToolsBlock = StreamFieldBlock<RelatedToolsBlockValue>;

/**
 * 既知のブロック型のUnion
 */
export type KnownBlock = 
  // カテゴリブロック（Phase 2）
  | BasicContentBlock
  | MediaBlock
  | MonetizationBlock
  | LayoutBlock
  // 基本コンテンツ
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | QuoteBlock
  // メディア・埋め込み
  | TableBlock
  | EmbedBlock
  | CodeBlock
  // 収益化・CTA
  | CTABlock
  | BannerBlock
  | RelatedToolsBlock
  // レイアウト・装飾
  | SpacerBlock
  | AlertBlock
  | AccordionBlock
  // レガシー
  | ComparisonTableBlock;

/**
 * StreamFieldレンダラーのProps
 */
export interface StreamFieldRendererProps {
  /** ブロックの配列 */
  blocks: StreamFieldBlock[];
}
