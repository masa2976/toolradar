import type {
  Tool,
  ToolDetail,
  ToolsResponse,
  ToolsParams,
  EventTrackingParams,
  WeeklyRankingResponse,
} from '@/types';

/**
 * APIベースURL取得
 * - Server Component: API_URL_INTERNAL を優先（Docker内部通信）
 * - Client Component: NEXT_PUBLIC_API_URL を使用（ブラウザからアクセス）
 */
function getApiBaseUrl(): string {
  const baseUrl = typeof window === 'undefined'
    ? (process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
  
  // /api パスを追加（末尾スラッシュは除去）
  return baseUrl.replace(/\/$/, '') + '/api';
}

/**
 * カスタムAPIエラークラス
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * fetchラッパー関数（エラーハンドリング付き）
 *
 * @param url - リクエストURL
 * @param options - fetchオプション
 * @returns レスポンスデータ
 * @throws {APIError} HTTPエラーの場合
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // HTTPステータスチェック（fetchは200番台以外でもエラーをthrowしない）
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        response.statusText,
        errorData
      );
    }

    // レスポンスが空の場合（204 No Content等）
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    // APIErrorはそのまま再throw
    if (error instanceof APIError) {
      throw error;
    }

    // その他のエラー（ネットワークエラー等）
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      'Network Error'
    );
  }
}

/**
 * URLクエリパラメータを構築
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * ツール一覧を取得（Server Component用）
 *
 * @param params - 検索パラメータ
 * @returns ツール一覧
 */
export async function getTools(
  params?: ToolsParams
): Promise<ToolsResponse> {
  const queryString = params ? buildQueryString(params) : '';
  const url = `${getApiBaseUrl()}/tools/${queryString}`;

  return apiFetch<ToolsResponse>(url, {
    // Next.js 16: キャッシュを明示的に制御
    cache: 'no-store' as RequestCache, // 常に最新データを取得
  });
}

/**
 * ツール詳細を取得（Server Component用）
 *
 * @param slug - ツールのslug
 * @returns ツール詳細
 */
export async function getToolBySlug(slug: string): Promise<ToolDetail> {
  const url = `${getApiBaseUrl()}/tools/${slug}/`;

  return apiFetch<ToolDetail>(url, {
    // 詳細ページは1時間キャッシュ
    next: { revalidate: 3600 } as { revalidate: number },
  });
}

/**
 * 週間ランキングを取得（Server Component用）
 *
 * @returns 週間ランキング
 */
export async function getWeeklyRanking(): Promise<WeeklyRankingResponse> {
  const url = `${getApiBaseUrl()}/ranking/weekly/`;

  return apiFetch<WeeklyRankingResponse>(url, {
    // ランキングは5分キャッシュ
    next: { revalidate: 300 } as { revalidate: number },
  });
}

/**
 * イベントをトラッキング（Client Component用）
 *
 * @param params - イベントパラメータ
 */
export async function trackEvent(params: EventTrackingParams): Promise<void> {
  const url = `${getApiBaseUrl()}/events/track/`;

  await apiFetch<void>(url, {
    method: 'POST',
    body: JSON.stringify(params),
    cache: 'no-store' as RequestCache, // イベントトラッキングはキャッシュしない
  });
}

/**
 * ツール一覧を取得（Client Component用）
 * TanStack Queryで使用することを想定
 *
 * @param params - 検索パラメータ
 * @returns ツール一覧
 */
export async function getToolsClient(
  params?: ToolsParams
): Promise<ToolsResponse> {
  const queryString = params ? buildQueryString(params) : '';
  const url = `${getApiBaseUrl()}/tools/${queryString}`;

  // クライアント側ではキャッシュをfetchに任せない（TanStack Queryが管理）
  return apiFetch<ToolsResponse>(url, {
    cache: 'no-store' as RequestCache,
  });
}

/**
 * 旧API互換用（既存コードとの互換性維持）
 * @deprecated 新規実装では上記の関数を直接使用してください
 */
export const toolsApi = {
  getTools,
  getToolBySlug,
};
