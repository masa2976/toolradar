import { useQuery } from '@tanstack/react-query';
import { brokersApi } from '@/lib/api';
import { queryKeys, staleTimeConfig } from '@/lib/query';

// ============================================
// ASPアフィリエイト関連カスタムフック
// ============================================

/**
 * 証券会社一覧取得フック
 * @returns TanStack Queryの結果オブジェクト
 * 
 * @example
 * ```tsx
 * const { data, isPending, isError } = useBrokers();
 * ```
 */
export function useBrokers() {
  return useQuery({
    queryKey: queryKeys.brokers.all,
    queryFn: brokersApi.getBrokers,
    staleTime: staleTimeConfig.brokers,
  });
}
