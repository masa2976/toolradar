// ============================================
// Wagtail API型定義
// ============================================

/**
 * StandardPage型定義
 * 静的ページ（プライバシーポリシー、利用規約、About、お問い合わせ等）
 */
export interface StandardPage {
  id: number;
  title: string;
  slug: string;
  body: string; // HTML文字列として返される（カスタムシリアライザー使用）
  meta: {
    type: string;
    detail_url: string;
    html_url: string;
    slug: string;
    first_published_at: string;
    seo_title?: string;
    search_description?: string;
  };
}

/**
 * Wagtail API レスポンス型（StandardPage用）
 */
export interface StandardPageAPIResponse {
  meta: {
    total_count: number;
  };
  items: StandardPage[];
}
