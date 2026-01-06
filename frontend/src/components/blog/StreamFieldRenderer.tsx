import React from 'react';
import type { StreamFieldBlock, StreamFieldRendererProps } from '@/types/streamfield';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { TextBlock } from './blocks/TextBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { CTABlock } from './blocks/CTABlock';
import { BannerBlock } from './blocks/BannerBlock';
import { TableOfContentsBlock } from './blocks/TableOfContentsBlock';
import { TableBlock } from './blocks/TableBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { AlertBlock } from './blocks/AlertBlock';
import { AccordionBlock } from './blocks/AccordionBlock';
import { AdSense } from '@/components/ui/AdSense';

// 広告配置を避けるべきブロックタイプ
const AVOID_AD_BEFORE_TYPES = ['cta', 'banner', 'asp_comparison', 'table_of_contents'];

interface ExtendedStreamFieldRendererProps extends StreamFieldRendererProps {
  /** 目次後に表示する広告スロットID */
  adSlotAfterToc?: string;
  /** 記事中盤に表示する広告スロットID（自動挿入用） */
  adSlotMiddle?: string;
  /** 広告を有効にするか（デフォルト: true） */
  enableAds?: boolean;
}

/**
 * StreamFieldレンダラー
 * 
 * Wagtail StreamFieldのJSONブロックを
 * 対応するReactコンポーネントにレンダリングします。
 * AdSense広告の自動挿入にも対応。
 * 
 * @example
 * ```tsx
 * <StreamFieldRenderer 
 *   blocks={post.body} 
 *   adSlotAfterToc={process.env.NEXT_PUBLIC_AD_SLOT_TOC}
 * />
 * ```
 */
export function StreamFieldRenderer({ 
  blocks,
  adSlotAfterToc,
  adSlotMiddle,
  enableAds = true,
}: ExtendedStreamFieldRendererProps) {
  if (!blocks || !Array.isArray(blocks)) {
    console.warn('StreamFieldRenderer: blocks is not an array', blocks);
    return null;
  }

  // ========================================
  // Phase 2対応: ネストされたブロックを平坦化して探索
  // ========================================
  
  /**
   * カテゴリブロックを展開して全ブロックを平坦化
   * カテゴリ構造（basic_content, media, etc.）を透過的に扱う
   */
  const flattenBlocks = (blocks: StreamFieldBlock[]): StreamFieldBlock[] => {
    const result: StreamFieldBlock[] = [];
    for (const block of blocks) {
      // カテゴリブロックの場合は中身を展開
      if (['basic_content', 'media', 'monetization', 'layout'].includes(block.type)) {
        if (Array.isArray(block.value)) {
          result.push(...flattenBlocks(block.value));
        }
      } else {
        result.push(block);
      }
    }
    return result;
  };

  const flatBlocks = flattenBlocks(blocks);
  
  // 目次ブロックのインデックスを探す（平坦化後）
  const tocIndex = flatBlocks.findIndex(block => block.type === 'table_of_contents');
  
  // 記事中盤の広告挿入位置を計算（H2見出しの前、かつASP/CTAを避ける）
  let middleAdIndex = -1;
  if (adSlotMiddle && enableAds && flatBlocks.length >= 6) {
    const targetIndex = Math.floor(flatBlocks.length / 2);
    // targetIndex周辺でH2見出しを探す
    for (let i = targetIndex; i < Math.min(targetIndex + 3, flatBlocks.length); i++) {
      const block = flatBlocks[i];
      if (block.type === 'heading' && !AVOID_AD_BEFORE_TYPES.includes(flatBlocks[i - 1]?.type)) {
        middleAdIndex = i;
        break;
      }
    }
  }

  // ========================================
  // レンダリング: 広告挿入は平坦化したブロック位置で判定
  // ========================================
  let flatIndex = 0;
  
  const renderWithAds = (blocks: StreamFieldBlock[]): React.ReactNode[] => {
    return blocks.map((block, index) => {
      // カテゴリブロックの場合は再帰的に処理
      if (['basic_content', 'media', 'monetization', 'layout'].includes(block.type)) {
        if (Array.isArray(block.value)) {
          return (
            <React.Fragment key={block.id || `category-${index}`}>
              {renderWithAds(block.value)}
            </React.Fragment>
          );
        }
        return null;
      }

      const currentFlatIndex = flatIndex++;
      
      return (
        <React.Fragment key={block.id || `block-${index}`}>
          {/* 記事中盤の広告（H2見出しの前） */}
          {middleAdIndex === currentFlatIndex && adSlotMiddle && enableAds && (
            <AdSense 
              slot={adSlotMiddle} 
              placement="blog-middle"
              format="auto"
            />
          )}
          
          <BlockRenderer block={block} />
          
          {/* 目次の直後に広告を挿入 */}
          {currentFlatIndex === tocIndex && adSlotAfterToc && enableAds && (
            <AdSense 
              slot={adSlotAfterToc} 
              placement="blog-toc"
            />
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="space-y-6">
      {renderWithAds(blocks)}
    </div>
  );
}

/**
 * 個別ブロックのレンダラー
 * 
 * ブロックの type に応じて適切なコンポーネントを選択します。
 * 未知のブロック型の場合は警告を表示してスキップします。
 */
interface BlockRendererProps {
  block: StreamFieldBlock;
}

function BlockRenderer({ block }: BlockRendererProps) {
  try {
    switch (block.type) {
      // ========================================
      // カテゴリブロック（Phase 2対応）
      // カテゴリは透過的に扱い、中身のブロックをレンダリング
      // ========================================
      case 'basic_content':
      case 'media':
      case 'monetization':
      case 'layout':
        // カテゴリブロックの場合、中身のブロック配列を再帰的にレンダリング
        if (Array.isArray(block.value)) {
          return (
            <>
              {block.value.map((nestedBlock: StreamFieldBlock, index: number) => (
                <BlockRenderer key={nestedBlock.id || `${block.type}-${index}`} block={nestedBlock} />
              ))}
            </>
          );
        }
        return null;

      // ========================================
      // 基本コンテンツブロック
      // ========================================
      case 'paragraph':
        return <ParagraphBlock value={block.value} />;
      
      case 'heading':
        return <HeadingBlock value={block.value} />;
      
      case 'text':
        return <TextBlock value={block.value} />;
      
      case 'quote':
        return <ParagraphBlock value={block.value} />; // 引用も段落として表示
      
      case 'image':
        // TODO: ImageBlock コンポーネントを作成
        return <div className="my-4">[画像: {JSON.stringify(block.value)}]</div>;

      // ========================================
      // メディア・埋め込みブロック
      // ========================================
      case 'table':
        return <TableBlock value={block.value} />;
      
      case 'embed':
        // TODO: EmbedBlock コンポーネントを作成
        return <div className="my-4">[埋め込み: {JSON.stringify(block.value)}]</div>;
      
      case 'code':
        return <CodeBlock value={block.value} />;

      // ========================================
      // 収益化・CTAブロック
      // ========================================
      case 'cta':
        return <CTABlock value={block.value} />;
      
      case 'banner':
        return <BannerBlock value={block.value} />;
      
      case 'related_tools':
        // TODO: RelatedToolsBlock コンポーネントを作成
        return <div className="my-4">[関連ツール: {JSON.stringify(block.value)}]</div>;

      // ========================================
      // レイアウト・装飾ブロック
      // ========================================
      case 'table_of_contents':
        return <TableOfContentsBlock value={block.value} />;
      
      case 'spacer':
        return <SpacerBlock value={block.value} />;
      
      case 'alert':
        return <AlertBlock value={block.value} />;
      
      case 'accordion':
        return <AccordionBlock value={block.value} />;
      
      default:
        console.warn(`Unknown block type: ${block.type}`);
        return <UnknownBlockFallback block={block} />;
    }
  } catch (error) {
    console.error(`Error rendering block ${block.type}:`, error);
    return <ErrorBoundaryFallback error={error} block={block} />;
  }
}

/**
 * 未知のブロック型のフォールバック
 * 
 * 開発環境では詳細情報を表示し、
 * 本番環境では静かにスキップします。
 */
function UnknownBlockFallback({ block }: BlockRendererProps) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="my-4 p-4 border-2 border-dashed border-warning rounded-lg bg-warning/10">
        <p className="text-sm font-semibold text-warning-foreground mb-2">
          ⚠️ 未実装のブロック型: {block.type}
        </p>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            デバッグ情報を表示
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
            {JSON.stringify(block, null, 2)}
          </pre>
        </details>
      </div>
    );
  }
  
  // 本番環境では静かにスキップ
  return null;
}

/**
 * エラーバウンダリのフォールバック
 */
function ErrorBoundaryFallback({ error, block }: { error: unknown; block: StreamFieldBlock }) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="my-4 p-4 border-2 border-danger rounded-lg bg-danger/10">
        <p className="text-sm font-semibold text-danger mb-2">
          ❌ ブロックレンダリングエラー: {block.type}
        </p>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            エラー詳細を表示
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </details>
      </div>
    );
  }
  
  // 本番環境では静かにスキップ
  return null;
}
