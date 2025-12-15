'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { useCallback } from 'react'

interface CTAButtonProps {
  toolId: string
  externalUrl: string
  priceType: 'free' | 'paid' | 'freemium'
  className?: string
}

/**
 * CTAボタン（クリックトラッキング付き）
 * 
 * price_typeに基づいて文言を動的に変更:
 * - free: 「無料でダウンロード」
 * - paid: 「購入ページへ」
 * - freemium: 「詳細を見る」
 */
export function CTAButton({ 
  toolId, 
  externalUrl, 
  priceType,
  className 
}: CTAButtonProps) {
  
  // CTAクリック時のトラッキング
  const handleClick = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      
      await fetch(`${apiUrl}/events/track/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_type: 'tool',
          target_id: toolId,
          event_type: 'click',
        }),
      })
    } catch (error) {
      // トラッキングエラーは無視（ユーザー体験を妨げない）
      console.warn('CTA click tracking failed:', error)
    }
  }, [toolId])
  
  // price_typeに基づいてボタン文言を決定
  const getButtonText = () => {
    switch (priceType) {
      case 'free':
        return '無料でダウンロード'
      case 'paid':
        return '購入ページへ'
      case 'freemium':
        return '詳細を見る'
      default:
        return '公式サイトで入手'
    }
  }
  
  return (
    <Button 
      asChild
      className={className}
      size="lg"
    >
      <a
        href={externalUrl}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="flex items-center justify-center gap-2"
        onClick={handleClick}
      >
        {getButtonText()}
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  )
}
