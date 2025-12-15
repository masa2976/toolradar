'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { trackEvent } from '@/lib/api/tools'
import { useToast } from '@/hooks/use-toast'

interface ShareButtonsProps {
  toolId: string
  toolName: string
  toolSlug: string
}

type SharePlatform = 'twitter' | 'facebook' | 'line' | 'copy'

/**
 * SNSシェアボタンコンポーネント
 * 
 * 機能:
 * - Twitter, Facebook, LINE, URLコピーでのシェア
 * - shareイベントのトラッキング
 * 
 * 知識ベース3より:
 * - share_platform: 'twitter', 'facebook', 'line', 'copy'
 */
export function ShareButtons({ toolId, toolName, toolSlug }: ShareButtonsProps) {
  const { toast } = useToast()
  const [isSharing, setIsSharing] = useState(false)
  
  // ベースURL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'
  const shareUrl = `${siteUrl}/tools/${toolSlug}`
  const shareText = `${toolName} - ToolRadar`

  /**
   * シェア処理（共通）
   */
  const handleShare = async (platform: SharePlatform) => {
    setIsSharing(true)

    try {
      // ============================================
      // 1. shareイベント送信
      // ============================================
      await trackEvent({
        target_type: 'tool',
        target_id: toolId,
        event_type: 'share',
        share_platform: platform,
      })

      // ============================================
      // 2. プラットフォーム別のシェア処理
      // ============================================
      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            '_blank',
            'width=600,height=400'
          )
          break

        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            '_blank',
            'width=600,height=400'
          )
          break

        case 'line':
          window.open(
            `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`,
            '_blank',
            'width=600,height=400'
          )
          break

        case 'copy':
          await navigator.clipboard.writeText(shareUrl)
          toast({
            title: 'URLをコピーしました',
            description: 'クリップボードにコピーされました',
          })
          break
      }
    } catch (error) {
      console.error('[ShareButtons] シェア失敗:', error)
      toast({
        title: 'シェアに失敗しました',
        description: 'もう一度お試しください',
        variant: 'destructive',
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Xシェア */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        disabled={isSharing}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        X
      </Button>

      {/* Facebookシェア */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        disabled={isSharing}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Facebook
      </Button>

      {/* LINEシェア */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('line')}
        disabled={isSharing}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        LINE
      </Button>

      {/* URLコピー */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        disabled={isSharing}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        URLコピー
      </Button>
    </div>
  )
}
