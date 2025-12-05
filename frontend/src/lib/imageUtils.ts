/**
 * 画像最適化ユーティリティ（Phase SEO-5）
 * 
 * Next.js Image コンポーネント用のプレースホルダー生成
 * - 外部画像にはblurDataURLが必要
 * - SVGベースの軽量プレースホルダーを提供
 */

/**
 * シンプルなグレーのSVGプレースホルダー（Base64エンコード）
 * サイズ: 約100バイト（非常に軽量）
 */
export const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

/**
 * SVGをBase64 Data URIに変換
 */
const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

/**
 * シマーエフェクト付きプレースホルダーData URI
 * 使用例: blurDataURL={shimmerDataUrl(700, 475)}
 */
export const shimmerDataUrl = (w: number, h: number) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`

/**
 * シンプルなグレープレースホルダー（アニメーションなし）
 * より軽量なオプション
 */
export const placeholderDataUrl = 
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'

/**
 * カラープレースホルダー生成
 * @param color - HEX色コード（例: '#f3f4f6'）
 */
export const colorPlaceholder = (color: string = '#f3f4f6') => {
  const svg = `<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/></svg>`
  return `data:image/svg+xml;base64,${toBase64(svg)}`
}

/**
 * 画像タイプ別のデフォルトalt属性テンプレート
 */
export const generateAlt = {
  /**
   * ツール画像用alt属性
   */
  tool: (name: string, platform: string | string[], toolType?: string) => {
    const platformStr = Array.isArray(platform) ? platform.join('/') : platform
    const suffix = toolType ? ` - ${toolType}ツール` : 'のサムネイル画像'
    return `${name}${platformStr ? ` (${platformStr.toUpperCase()})` : ''}${suffix}`
  },

  /**
   * ブログ記事用alt属性
   */
  blog: (title: string, customAlt?: string) => {
    return customAlt || `${title}のアイキャッチ画像`
  },

  /**
   * カテゴリ画像用alt属性
   */
  category: (label: string, description?: string) => {
    return description ? `${label} - ${description}` : label
  },
}
