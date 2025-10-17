import type { CategoryItem } from '@/components/ui/CategorySection'

/**
 * プラットフォーム（固定3つ）
 */
export const platforms: CategoryItem[] = [
  {
    label: 'MT4',
    href: '/tools?platform=mt4',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    label: 'MT5',
    href: '/tools?platform=mt5',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    label: 'TradingView',
    href: '/tools?platform=tradingview',
    gradient: 'from-purple-500 to-purple-600',
  },
]

/**
 * ツールタイプ（IconFeatureCard用）
 * 注: EAとStrategyは実質的に同じ機能（自動売買）のため統合
 */
export const toolTypes: CategoryItem[] = [
  {
    label: 'EA / Strategy',
    href: '/tools?tool_type=EA,Strategy',
    gradient: 'from-green-500 to-green-600',
    description: '自動売買プログラム。設定したロジックで24時間自動取引',
    icon: '🤖',
  },
  {
    label: 'Indicator',
    href: '/tools?tool_type=Indicator',
    gradient: 'from-orange-500 to-orange-600',
    description: 'チャート分析用インジケーター。相場の方向性を可視化',
    icon: '📊',
  },
  {
    label: 'Script',
    href: '/tools?tool_type=Script',
    gradient: 'from-teal-500 to-teal-600',
    description: '特定の作業を実行するツール。一括注文や分析補助に便利',
    icon: '⚙️',
  },
  {
    label: 'Library',
    href: '/tools?tool_type=Library',
    gradient: 'from-yellow-500 to-yellow-600',
    description: '他のツール開発に使える関数集。開発者向けライブラリ',
    icon: '📚',
  },
]

/**
 * テクニカル指標（スライダー: 5個）
 */
export const technicalIndicators: CategoryItem[] = [
  {
    label: 'RSI',
    href: '/tools?tags=rsi',
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    label: 'MACD',
    href: '/tools?tags=macd',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  {
    label: '移動平均',
    href: '/tools?tags=ma',
    gradient: 'from-sky-500 to-sky-600',
  },
  {
    label: 'ボリンジャーバンド',
    href: '/tools?tags=bb',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    label: 'ストキャスティクス',
    href: '/tools?tags=stochastic',
    gradient: 'from-indigo-500 to-indigo-600',
  },
]

/**
 * トレードスタイル（ImageOverlayCard用）
 */
export const tradeStyles: CategoryItem[] = [
  {
    label: 'スキャルピング',
    href: '/tools?tags=scalping',
    gradient: 'from-pink-500 to-pink-600',
    description: '数秒〜数分で完結する超短期売買スタイル',
    backgroundImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
  },
  {
    label: 'デイトレード',
    href: '/tools?tags=day_trading',
    gradient: 'from-rose-500 to-rose-600',
    description: '1日以内に完結する短期売買スタイル',
    backgroundImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop',
  },
  {
    label: 'スイング',
    href: '/tools?tags=swing',
    gradient: 'from-violet-500 to-violet-600',
    description: '数日〜数週間保有する中期トレードスタイル',
    backgroundImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
  },
  {
    label: 'ポジション',
    href: '/tools?tags=position',
    gradient: 'from-emerald-500 to-emerald-600',
    description: '数週間〜数ヶ月保有する長期トレードスタイル',
    backgroundImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
  },
]

/**
 * 価格帯（固定3つ）
 */
export const priceTypes: CategoryItem[] = [
  {
    label: '無料',
    href: '/tools?price_type=free',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    label: '有料',
    href: '/tools?price_type=paid',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    label: 'フリーミアム',
    href: '/tools?price_type=freemium',
    gradient: 'from-lime-500 to-lime-600',
  },
]
