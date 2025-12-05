/**
 * 目次（Table of Contents）ユーティリティ
 * 
 * StreamFieldブロックから見出しを抽出し、目次用のデータを生成します。
 */

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 = h2, 3 = h3
}

/**
 * 日本語テキストをslug化（URL安全な文字列に変換）
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 日本語文字を含む全角文字を保持
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\s-]/g, '')
    // スペースとハイフンをアンダースコアに
    .replace(/[\s-]+/g, '_')
    // 先頭と末尾のアンダースコアを削除
    .replace(/^_+|_+$/g, '');
}

/**
 * StreamFieldブロックから見出しを抽出
 */
export function extractHeadings(blocks: any[]): TocItem[] {
  if (!Array.isArray(blocks)) {
    return [];
  }

  const headings: TocItem[] = [];
  let h2Counter = 0;
  let h3Counter = 0;

  for (const block of blocks) {
    if (block.type === 'heading') {
      const level = block.value?.level || 2;
      const text = block.value?.text || '';

      // h2, h3のみ抽出
      if (level === 2 || level === 3) {
        if (level === 2) {
          h2Counter++;
          h3Counter = 0; // h2が出たらh3カウンターをリセット
        } else {
          h3Counter++;
        }

        const id = level === 2 
          ? `heading-${h2Counter}-${slugify(text)}`
          : `heading-${h2Counter}-${h3Counter}-${slugify(text)}`;

        headings.push({
          id,
          text,
          level,
        });
      }
    }
  }

  return headings;
}

/**
 * 見出しテキストからIDを生成（既存の見出しと重複しないように）
 */
export function generateHeadingId(text: string, index?: number): string {
  if (index !== undefined) {
    return `heading-${index}-${slugify(text)}`;
  }
  return `heading-${slugify(text)}`;
}
