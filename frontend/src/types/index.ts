// ============================================
// ToolRadar API型定義
// ============================================

// ツール関連
// ============================================

/**
 * プラットフォーム種別
 */
export type Platform = 'mt4' | 'mt5' | 'tradingview';

/**
 * ツールタイプ
 */
export type ToolType = 'EA' | 'Indicator' | 'Library' | 'Script' | 'Strategy';

/**
 * 価格タイプ
 */
export type PriceType = 'free' | 'paid' | 'freemium';

/**
 * ツールの統計情報
 */
export interface ToolStats {
  week_views: number;
  week_shares: number;
  week_avg_duration: number;
  week_score: number;
  week_rank?: number;
  prev_week_rank?: number | null;
  rank_change?: string;
  last_updated: string;
}

/**
 * ツールの基本情報
 */
export interface Tool {
  id: string; // UUID形式
  slug: string;
  name: string;
  short_description: string;
  long_description: string;
  platform: Platform[]; // 配列形式
  tool_type: ToolType;
  price_type: PriceType;
  image_url: string;
  external_url: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // オプション: 一覧表示時に統計情報が含まれる場合
  stats?: ToolStats;
  // オプション: リボンバッジ
  ribbons?: string[];
  // オプション: タグ名の配列
  tag_names?: string[];
}

/**
 * ツール詳細情報（統計情報を含む）
 */
export interface ToolDetail extends Tool {
  stats: ToolStats;
  price?: string; // 価格（任意）
  week_score?: number; // 週間スコア（任意）
  ribbons?: string[]; // リボンバッジ（任意）
  tags?: Tag[]; // タグ（任意）
  week_rank?: number; // 週間ランキング順位
  week_rank_change?: string; // 順位変動
  week_views?: number; // 週間PV数
  week_shares?: number; // 週間シェア数
}

export interface ToolsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tool[];
}

/**
 * ソート順オプション
 */
export type ToolsOrdering = '-week_score' | '-created_at' | 'name';

/**
 * ツール検索のクエリパラメータ
 */
export interface ToolsParams {
  platform?: Platform;
  tool_type?: ToolType;
  price_type?: PriceType;
  tags?: string;  // タグslug（カンマ区切りで複数指定可）
  q?: string;
  ordering?: ToolsOrdering;  // ソート順
  page?: number;
}

// ブログ関連
// ============================================

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  investment_type: 'forex' | 'stock' | 'crypto' | 'commodity' | 'general';
  featured_image?: string;
  published_at: string;
  view_count: number;
  reading_time?: number;
  author?: {
    name: string;
  };
  tags?: string[];
  related_tools?: Tool[];
}

export interface BlogPostDetail extends BlogPost {
  body: StreamFieldBlock[];
}

export interface StreamFieldBlock {
  type: string;
  value: any;
  id?: string;
}

export interface BlogPostsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
}

export interface BlogPostsParams {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

// ランキング関連
// ============================================

export interface RankingItem {
  rank: number;
  rank_change: string; // 'NEW', '↑2', '↓1', '→'
  tool: Tool;
  score: number;
  week_views: number;
  week_shares: number;
}

export interface RankingResponse {
  updated_at: string;
  rankings: RankingItem[];
}

export interface RankingParams {
  platform?: Platform;
  tool_type?: ToolType;
  limit?: number;
}

// タグ関連
// ============================================

export interface TagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  category: string;
  tool_count: number;
}

export interface TagsParams {
  category?: string;
}

// ASPアフィリエイト関連
// ============================================

export interface Broker {
  id: number;
  name: string;
  logo: string;
  features: string[];
  bonus: string;
  cta_url: string;
  tracking_id: string;
  rank: number;
}

export interface BrokersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Broker[];
}

// エラー
// ============================================

export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}

// イベントトラッキング
// ============================================

/**
 * イベントトラッキングのパラメータ
 */
export interface EventTrackingParams {
  target_type: 'tool';
  target_id: string;
  event_type: 'view' | 'share' | 'duration';
  duration_seconds?: number;
  share_platform?: 'twitter' | 'facebook' | 'line' | 'copy';
}

/**
 * 週間ランキングのアイテム
 */
export interface WeeklyRankingItem {
  rank: number;
  rank_change: string;
  tool: ToolDetail;
  score: number;
}

/**
 * 週間ランキングのレスポンス
 */
export interface WeeklyRankingResponse {
  updated_at: string;
  rankings: WeeklyRankingItem[];
}

// お問い合わせフォーム関連
// ============================================

/**
 * Wagtail ContactPageのフォームフィールド
 */
export interface ContactFormField {
  id: number;
  label: string;
  field_type: 'singleline' | 'multiline' | 'email' | 'number' | 'url' | 'checkbox' | 'checkboxes' | 'dropdown' | 'radio' | 'date' | 'datetime' | 'hidden';
  help_text: string;
  required: boolean;
  choices: string;
  default_value: string;
  clean_name: string;
}

/**
 * ContactPageのAPIレスポンス
 */
export interface ContactPageData {
  id: number;
  title: string;
  meta: {
    type: string;
    slug: string;
    seo_title: string;
    search_description: string;
    first_published_at: string;
  };
  intro: Array<{
    type: string;
    value: string;
    id: string;
  }>;
  thank_you_text: Array<{
    type: string;
    value: string;
    id: string;
  }>;
  form_fields: ContactFormField[];
}
