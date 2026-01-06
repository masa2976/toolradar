'use client'

import { useQuery } from '@tanstack/react-query'
import { tagsApi } from '@/lib/api/tags'
import type { TagCategory, Tag, TagsParams } from '@/types'

// ============================================
// タグ関連フック
// ============================================

/**
 * タグカテゴリ一覧を取得するフック
 */
export function useTagCategories() {
  return useQuery<TagCategory[], Error>({
    queryKey: ['tagCategories'],
    queryFn: () => tagsApi.getTagCategories(),
    staleTime: 1000 * 60 * 10, // 10分間キャッシュ
  })
}

/**
 * タグ一覧を取得するフック
 * @param params - カテゴリフィルタ
 */
export function useTags(params?: TagsParams) {
  return useQuery<Tag[], Error>({
    queryKey: ['tags', params],
    queryFn: () => tagsApi.getTags(params),
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  })
}
