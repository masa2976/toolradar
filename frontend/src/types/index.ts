// ============================================
// ToolRadar API型定義
// ============================================

// ツール関連
// ============================================

export interface Tool {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  long_description?: string;
  platform: 'mt4' | 'mt5' | 'tradingview';
  tool_type: 'EA' | 'Indicator' | 'Library' | 'Script' | 'Strategy';
  price_type: 'free' | 'paid' | 'freemium';
  price: string | null;
  ribbons: string[];
  image_url: string;
  external_url?: string;
  tag_names: string[];
  created_at: string;
  updated_at?: string;
}

export interface ToolsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tool[];
}

export interface ToolsParams {
  platform?: string;
  tool_type?: string;
  price_type?: string;
  tags?: string;
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
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
  platform?: string;
  limit?: number;
}

// タグ関連
// ============================================

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

// エラー
// ============================================

export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}
