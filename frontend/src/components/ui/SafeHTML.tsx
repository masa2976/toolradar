'use client'

import { useEffect, useState } from 'react'

interface SafeHTMLProps {
  html: string
  className?: string
  allowedTags?: string[]
  allowedAttributes?: string[]
}

/**
 * SafeHTML コンポーネント
 * 
 * dangerouslySetInnerHTML を安全に使用するためのラッパーコンポーネント。
 * DOMPurify を使用してHTMLをサニタイズし、XSS攻撃から保護します。
 * 
 * Client-side onlyで動作するため、SSRでは空のdivが表示されます。
 * 
 * @param html - 表示するHTML文字列（ASP広告コードなど）
 * @param className - 追加するCSSクラス
 * @param allowedTags - 許可するHTMLタグのリスト（デフォルト: a, img, div, span, p, strong, em, br）
 * @param allowedAttributes - 許可する属性のリスト（デフォルト: href, target, rel, src, alt, class, style）
 * 
 * @example
 * <SafeHTML 
 *   html={ad.ad_code}
 *   className="asp-ad-content"
 * />
 */
export function SafeHTML({ 
  html, 
  className,
  allowedTags = ['a', 'img', 'div', 'span', 'p', 'strong', 'em', 'br', 'ul', 'ol', 'li'],
  allowedAttributes = ['href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'width', 'height'],
}: SafeHTMLProps) {
  const [sanitizedHTML, setSanitizedHTML] = useState<string>('')

  useEffect(() => {
    // Dynamic import: クライアントサイドでのみDOMPurifyをロード
    import('dompurify').then((module) => {
      const DOMPurify = module.default
      const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
        ALLOW_DATA_ATTR: false, // data-* 属性は許可しない（セキュリティ強化）
      })
      setSanitizedHTML(sanitized)
    })
  }, [html, allowedTags, allowedAttributes])
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}
