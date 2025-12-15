import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { rankingApi } from '@/lib/api';
import type { Platform, ToolType, RankingParams } from '@/types';
import { WeeklyRankingClient } from './WeeklyRankingClient';

// ============================================
// 定数定義
// ============================================

// MT5を優先表示（主要プラットフォーム）
const VALID_PLATFORMS: Platform[] = ['mt5', 'mt4', 'tradingview'];

// URL用のツールタイプマッピング（小文字→正式名）
const TOOL_TYPE_MAP: Record<string, ToolType> = {
  ea: 'EA',
  indicator: 'Indicator',
  library: 'Library',
  script: 'Script',
  strategy: 'Strategy',
};

// プラットフォーム表示名
const PLATFORM_NAMES: Record<Platform, string> = {
  mt4: 'MT4',
  mt5: 'MT5',
  tradingview: 'TradingView',
};

// ツールタイプ表示名
const TOOL_TYPE_NAMES: Record<ToolType, string> = {
  EA: 'EA（自動売買）',
  Indicator: 'インジケーター',
  Library: 'ライブラリ',
  Script: 'スクリプト',
  Strategy: 'ストラテジー',
};

// プラットフォームごとの有効なツールタイプ
// MT4/MT5: EA, Indicator, Script, Library（MQL5公式サイトより）
// TradingView: Indicator, Strategy, Library（Pine Script公式ドキュメントより）
const TOOL_TYPES_BY_PLATFORM: Record<Platform, ToolType[]> = {
  mt4: ['EA', 'Indicator', 'Script', 'Library'],
  mt5: ['EA', 'Indicator', 'Script', 'Library'],
  tradingview: ['Indicator', 'Strategy', 'Library'],
};

// 全プラットフォーム共通で表示する場合のツールタイプ（全種類）
const ALL_TOOL_TYPES: ToolType[] = ['EA', 'Indicator', 'Script', 'Library', 'Strategy'];

// ============================================
// 型定義
// ============================================

interface PageProps {
  params: Promise<{
    filters?: string[];
  }>;
}

interface ParsedFilters {
  platform?: Platform;
  toolType?: ToolType;
}

// ============================================
// ヘルパー関数
// ============================================

function parseFilters(filters?: string[]): ParsedFilters | null {
  if (!filters || filters.length === 0) {
    return {}; // 全体ランキング
  }

  const [platformStr, toolTypeStr] = filters;

  // プラットフォームの検証
  if (platformStr && !VALID_PLATFORMS.includes(platformStr as Platform)) {
    return null; // 無効なプラットフォーム
  }

  const platform = platformStr as Platform | undefined;

  // ツールタイプの検証（小文字で受け取り、正式名に変換）
  let toolType: ToolType | undefined;
  if (toolTypeStr) {
    const normalizedToolType = TOOL_TYPE_MAP[toolTypeStr.toLowerCase()];
    if (!normalizedToolType) {
      return null; // 無効なツールタイプ
    }
    
    // プラットフォームとツールタイプの組み合わせを検証
    // 例: TradingView + EA は無効
    if (platform && !TOOL_TYPES_BY_PLATFORM[platform].includes(normalizedToolType)) {
      return null; // このプラットフォームで無効なツールタイプ
    }
    
    toolType = normalizedToolType;
  }

  return { platform, toolType };
}

function buildTitle(parsed: ParsedFilters): string {
  const parts: string[] = [];
  
  if (parsed.platform) {
    parts.push(PLATFORM_NAMES[parsed.platform]);
  }
  if (parsed.toolType) {
    parts.push(TOOL_TYPE_NAMES[parsed.toolType]);
  }
  
  if (parts.length === 0) {
    return '週間ランキング';
  }
  
  return `${parts.join(' ')} 週間ランキング`;
}

function buildDescription(parsed: ParsedFilters): string {
  const parts: string[] = [];
  
  if (parsed.platform) {
    parts.push(PLATFORM_NAMES[parsed.platform]);
  }
  if (parsed.toolType) {
    parts.push(TOOL_TYPE_NAMES[parsed.toolType]);
  }
  
  if (parts.length === 0) {
    return '今週最も注目を集めたトレーディングツールをランキング形式でご紹介。PV数・シェア数・滞在時間から算出した独自スコアで評価しています。';
  }
  
  return `${parts.join('の')}ツールの週間人気ランキング。PV数・シェア数・滞在時間から算出した独自スコアで評価しています。`;
}

// ============================================
// メタデータ生成
// ============================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { filters } = await params;
  const parsed = parseFilters(filters);
  
  if (!parsed) {
    return {
      title: 'ページが見つかりません',
    };
  }
  
  const title = buildTitle(parsed);
  const description = buildDescription(parsed);
  
  return {
    title: `${title} | ToolRadar`,
    description,
    openGraph: {
      title: `${title} | ToolRadar`,
      description,
      type: 'website',
    },
  };
}

// ============================================
// 静的パス生成（SEO用）
// ============================================

// URL用のツールタイプマッピング（正式名→小文字）
const TOOL_TYPE_TO_URL: Record<ToolType, string> = {
  EA: 'ea',
  Indicator: 'indicator',
  Library: 'library',
  Script: 'script',
  Strategy: 'strategy',
};

export async function generateStaticParams() {
  const paths: { filters: string[] }[] = [];
  
  // 全体ランキング
  paths.push({ filters: [] });
  
  // プラットフォーム別
  for (const platform of VALID_PLATFORMS) {
    paths.push({ filters: [platform] });
    
    // プラットフォーム + ツールタイプ別（有効な組み合わせのみ）
    const validToolTypes = TOOL_TYPES_BY_PLATFORM[platform];
    for (const toolType of validToolTypes) {
      paths.push({ filters: [platform, TOOL_TYPE_TO_URL[toolType]] });
    }
  }
  
  return paths;
}

// ============================================
// ページコンポーネント
// ============================================

export default async function WeeklyRankingPage({ params }: PageProps) {
  const { filters } = await params;
  const parsed = parseFilters(filters);
  
  // 無効なURLの場合は404
  if (!parsed) {
    notFound();
  }
  
  // APIパラメータを構築
  const apiParams: RankingParams = {};
  if (parsed.platform) {
    apiParams.platform = parsed.platform;
  }
  if (parsed.toolType) {
    apiParams.tool_type = parsed.toolType;
  }
  
  // データ取得
  const rankingData = await rankingApi.getWeeklyRanking(apiParams);
  
  const title = buildTitle(parsed);
  
  // プラットフォームに応じたツールタイプを選択
  // プラットフォーム未選択時は全種類、選択時はそのプラットフォームで有効な種類のみ
  const toolTypes = parsed.platform 
    ? TOOL_TYPES_BY_PLATFORM[parsed.platform] 
    : ALL_TOOL_TYPES;
  
  return (
    <WeeklyRankingClient
      initialData={rankingData}
      title={title}
      currentPlatform={parsed.platform}
      currentToolType={parsed.toolType}
      platforms={VALID_PLATFORMS}
      toolTypes={toolTypes}
      platformNames={PLATFORM_NAMES}
      toolTypeNames={TOOL_TYPE_NAMES}
    />
  );
}
