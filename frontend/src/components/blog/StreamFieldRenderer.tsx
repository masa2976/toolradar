import React from 'react';
import type { StreamFieldBlock, StreamFieldRendererProps } from '@/types/streamfield';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { ComparisonTableBlock } from './blocks/ComparisonTableBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { TextBlock } from './blocks/TextBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { CTABlock } from './blocks/CTABlock';
import { BannerBlock } from './blocks/BannerBlock';

/**
 * StreamFieldレンダラー
 * 
 * Wagtail StreamFieldのJSONブロックを
 * 対応するReactコンポーネントにレンダリングします。
 * 
 * @example
 * ```tsx
 * <StreamFieldRenderer blocks={post.body} />
 * ```
 */
export function StreamFieldRenderer({ blocks }: StreamFieldRendererProps) {
  if (!blocks || !Array.isArray(blocks)) {
    console.warn('StreamFieldRenderer: blocks is not an array', blocks);
    return null;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <BlockRenderer key={block.id || index} block={block} />
      ))}
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
      case 'paragraph':
        return <ParagraphBlock value={block.value} />;
      
      case 'heading':
        return <HeadingBlock value={block.value} />;
      
      case 'text':
        return <TextBlock value={block.value} />;
      
      case 'code':
        return <CodeBlock value={block.value} />;
      
      case 'comparison_table':
        return <ComparisonTableBlock value={block.value} />;
      
      case 'cta':
        return <CTABlock value={block.value} />;
      
      case 'banner':
        return <BannerBlock value={block.value} />;
      
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
