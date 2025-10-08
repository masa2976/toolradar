import { apiClient } from './client';
import type { BrokersResponse } from '@/types';

// ============================================
// ASPアフィリエイト関連API
// ============================================

export const brokersApi = {
  getBrokers: async (): Promise<BrokersResponse> => {
    const { data } = await apiClient.get<BrokersResponse>('/brokers/');
    return data;
  },
};
