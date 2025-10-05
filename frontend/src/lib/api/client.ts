import axios, { AxiosError, AxiosInstance } from 'axios';

// ============================================
// API Client設定
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Axiosインスタンス
 * Django REST Framework APIとの通信に使用
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒
});

// ============================================
// インターセプター
// ============================================

/**
 * リクエストインターセプター
 * 将来的に認証トークンをここで追加
 */
apiClient.interceptors.request.use(
  (config) => {
    // TODO: 認証トークンの追加
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * レスポンスインターセプター
 * エラーハンドリング
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    // エラーオブジェクトの構築
    const apiError = {
      message: 'An error occurred',
      status: error.response?.status,
      detail: undefined as string | undefined,
    };

    if (error.response) {
      // サーバーエラー（4xx, 5xx）
      apiError.message =
        error.response.data?.detail ||
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      apiError.status = error.response.status;
      apiError.detail = error.response.data?.detail;
      
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // ネットワークエラー
      apiError.message = 'Network error: Unable to reach server';
      console.error('Network Error:', error.message);
    } else {
      // その他のエラー
      apiError.message = error.message || 'Unknown error';
      console.error('Unknown Error:', error.message);
    }

    return Promise.reject(apiError);
  }
);
