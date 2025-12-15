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
 * fetchラッパー関数（エラーハンドリング + 指数バックオフリトライ付き）
 *
 * 429 Too Many Requests などの一時的なエラーに対して、
 * 指数バックオフ + Jitterでリトライを行います。
 *
 * @param url - リクエストURL
 * @param options - fetchオプション
 * @param retryConfig - リトライ設定（オプション）
 * @returns レスポンスデータ
 * @throws {APIError} HTTPエラーの場合
 */
async function apiFetch<T>(
  url: string, 
  options?: RequestInit,
  retryConfig?: { maxRetries?: number; baseDelay?: number }
): Promise<T> {
  const { maxRetries = 3, baseDelay = 500 } = retryConfig || {};
  
  /**
   * 指数バックオフ + Jitterで待機時間を計算
   */
  const getBackoffDelay = (attempt: number, retryAfterMs?: number): number => {
    // Retry-Afterヘッダーが指定されている場合はそれを優先
    if (retryAfterMs) return retryAfterMs;
    
    // 指数バックオフ: baseDelay * 2^attempt（例: 500ms, 1000ms, 2000ms, 4000ms）
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    // Jitter: ランダムな遅延を追加（0-100ms）して同時リトライを防ぐ
    const jitter = Math.random() * 100;
    // 最大30秒でキャップ
    return Math.min(exponentialDelay + jitter, 30000);
  };
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  /**
   * リトライ可能なステータスコードかどうかを判定
   */
  const isRetryable = (status: number): boolean => {
    return status === 429 || // Too Many Requests
           status === 500 || // Internal Server Error
           status === 502 || // Bad Gateway
           status === 503 || // Service Unavailable
           status === 504;   // Gateway Timeout
  };
  
  let lastError: APIError | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      // HTTPステータスチェック
      if (!response.ok) {
        // 429の場合はRetry-Afterヘッダーを確認
        let retryAfterMs: number | undefined;
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('Retry-After');
          if (retryAfterHeader) {
            const seconds = parseInt(retryAfterHeader, 10);
            if (!isNaN(seconds)) {
              retryAfterMs = seconds * 1000;
            }
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        const apiError = new APIError(
          errorData.message || `HTTP Error: ${response.status}`,
          response.status,
          response.statusText,
          errorData
        );
        
        // リトライ可能なエラーで、まだリトライ回数が残っている場合
        if (isRetryable(response.status) && attempt < maxRetries) {
          const delay = getBackoffDelay(attempt, retryAfterMs);
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[apiFetch] ${response.status} error, retrying in ${delay.toFixed(0)}ms (attempt ${attempt + 1}/${maxRetries})...`
            );
          }
          await sleep(delay);
          lastError = apiError;
          continue;
        }
        
        throw apiError;
      }

      // レスポンスが空の場合（204 No Content等）
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data as T;
      
    } catch (error) {
      // APIErrorはそのまま再throw（リトライ対象外エラー）
      if (error instanceof APIError) {
        throw error;
      }

      // ネットワークエラーの場合もリトライ
      if (attempt < maxRetries) {
        const delay = getBackoffDelay(attempt);
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[apiFetch] Network error, retrying in ${delay.toFixed(0)}ms (attempt ${attempt + 1}/${maxRetries})...`
          );
        }
        await sleep(delay);
        lastError = new APIError(
          error instanceof Error ? error.message : 'Unknown error',
          0,
          'Network Error'
        );
        continue;
      }

      throw new APIError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        'Network Error'
      );
    }
  }
  
  // ここに到達した場合は最後のエラーをthrow
  throw lastError || new APIError('Max retries exceeded', 0, 'Retry Failed');
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

  try {
    // バックエンドの形式に変換
    const backendParams = {
      tool_id: params.target_id,
      event_type: params.event_type,
      duration_seconds: params.duration_seconds,
      share_platform: params.share_platform,
    };

    await apiFetch<void>(url, {
      method: 'POST',
      body: JSON.stringify(backendParams),
      cache: 'no-store' as RequestCache,
    });
  } catch (error) {
    // トラッキングエラーは静かに処理（ユーザー体験に影響させない）
    if (process.env.NODE_ENV === 'development') {
      console.warn('[trackEvent] Failed to track event:', error);
    }
  }
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
