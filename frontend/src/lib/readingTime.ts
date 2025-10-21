/**
 * 記事の読了時間を計算
 * 
 * @param content - 記事本文（HTML文字列 or StreamFieldブロック配列）
 * @returns 読了時間（分）
 * 
 * 計算基準: 日本語の平均読書速度 500文字/分
 */
export function calculateReadingTime(content: string | any[]): number {
  let text = ''
  
  // HTML文字列の場合
  if (typeof content === 'string') {
    // HTMLタグを除去してテキストのみ抽出
    text = content.replace(/<[^>]*>/g, '')
  } 
  // StreamFieldブロック配列の場合
  else if (Array.isArray(content)) {
    text = content
      .map(block => {
        // テキストブロックの場合
        if (block.type === 'paragraph' && block.value?.text) {
          return block.value.text
        }
        // 見出しブロックの場合
        if ((block.type === 'heading' || block.type === 'h2' || block.type === 'h3') && block.value) {
          return typeof block.value === 'string' ? block.value : block.value.text || ''
        }
        // その他のブロック（画像、コードなど）は文字列化
        return JSON.stringify(block.value || '')
      })
      .join(' ')
  }
  
  // HTMLエンティティをデコード（&nbsp; など）
  text = text.replace(/&[^;]+;/g, ' ')
  
  // 文字数をカウント
  const charCount = text.length
  
  // 読了時間を計算（500文字/分、最低1分）
  const minutes = Math.ceil(charCount / 500)
  return Math.max(minutes, 1)
}

/**
 * 読了時間を人間が読みやすい形式で返す
 * 
 * @param content - 記事本文
 * @returns "3分で読めます" のような文字列
 */
export function getReadingTimeText(content: string | any[]): string {
  const minutes = calculateReadingTime(content)
  return `${minutes}分で読めます`
}
