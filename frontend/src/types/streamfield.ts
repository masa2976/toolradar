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
 * 型付きStreamFieldブロック
 */
export type ParagraphBlock = StreamFieldBlock<ParagraphBlockValue>;
export type HeadingBlock = StreamFieldBlock<HeadingBlockValue>;
export type CodeBlock = StreamFieldBlock<CodeBlockValue>;
export type ComparisonTableBlock = StreamFieldBlock<ComparisonTableValue>;
export type CTABlock = StreamFieldBlock<CTAValue>;
export type BannerBlock = StreamFieldBlock<BannerValue>;

/**
 * 既知のブロック型のUnion
 */
export type KnownBlock = 
  | ParagraphBlock
  | HeadingBlock
  | CodeBlock
  | ComparisonTableBlock
  | CTABlock
  | BannerBlock;

/**
 * StreamFieldレンダラーのProps
 */
export interface StreamFieldRendererProps {
  /** ブロックの配列 */
  blocks: StreamFieldBlock[];
}
