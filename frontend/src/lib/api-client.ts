import axios, { AxiosError, AxiosInstance } from 'axios';
import type { ApiError } from '@/types';

// ============================================
// API Client設定
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Axiosインスタンス作成
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒
});

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    const apiError: ApiError = {
      message: 'An error occurred',
      status: error.response?.status,
    };

    if (error.response) {
      // サーバーエラー（4xx, 5xx）
      apiError.message =
        error.response.data?.detail ||
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      apiError.status = error.response.status;
      apiError.detail = error.response.data?.detail;
    } else if (error.request) {
      // ネットワークエラー
      apiError.message = 'Network error: Unable to reach server';
    } else {
      // その他のエラー
      apiError.message = error.message || 'Unknown error';
    }

    return Promise.reject(apiError);
  }
);

// ============================================
// Query Keys（TanStack Query用）
// ============================================

export const queryKeys = {
  tools: {
    all: ['tools'] as const,
    lists: () => [...queryKeys.tools.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...queryKeys.tools.lists(), params] as const,
    details: () => [...queryKeys.tools.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.tools.details(), slug] as const,
  },
  blog: {
    all: ['blog'] as const,
    lists: () => [...queryKeys.blog.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...queryKeys.blog.lists(), params] as const,
    details: () => [...queryKeys.blog.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.blog.details(), slug] as const,
  },
  ranking: {
    all: ['ranking'] as const,
    weekly: (params?: Record<string, any>) => [...queryKeys.ranking.all, 'weekly', params] as const,
  },
  tags: {
    all: ['tags'] as const,
    list: (params?: Record<string, any>) => [...queryKeys.tags.all, params] as const,
  },
} as const;
