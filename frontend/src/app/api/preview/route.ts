import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * Wagtail Headless Preview API
 * 
 * Wagtailの「プレビュー」ボタンから呼ばれる
 * トークンを検証し、Draft Modeを有効化してブログ記事へリダイレクト
 * 
 * クエリパラメータ:
 * - token: Wagtailが生成するプレビュートークン（必須）
 * - content_type: コンテンツタイプ（例: blog.blogpage）
 * - slug: 記事のスラッグ
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const contentType = searchParams.get('content_type');
  const slug = searchParams.get('slug');

  // ========================================
  // 1. パラメータ検証
  // ========================================
  if (!token) {
    return new Response('Missing token', { 
      status: 401,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  if (!slug) {
    return new Response('Missing slug', { 
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // ========================================
  // 2. Wagtail APIでトークン検証
  // ========================================
  try {
    // Docker内部通信用URL（サーバー側のみ）
    const apiUrl = process.env.API_URL || 'http://backend:8000';
    
    // Wagtail headless preview APIエンドポイント
    const verifyUrl = `${apiUrl}/api/v2/page_preview/1/?token=${token}&content_type=${contentType}`;
    
    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // キャッシュ無効化（プレビューは常に最新データ）
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Wagtail API verification failed:', {
        status: response.status,
        statusText: response.statusText,
      });
      
      return new Response('Invalid token or unauthorized', { 
        status: 401,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // トークン検証成功
    const previewData = await response.json();
    
    console.log('Preview token verified successfully:', {
      slug,
      contentType,
      hasData: !!previewData,
    });

  } catch (error) {
    console.error('Error verifying preview token:', error);
    return new Response('Error verifying preview token', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // ========================================
  // 3. Draft Mode有効化
  // ========================================
  const draft = await draftMode();
  draft.enable();

  // ========================================
  // 4. ページタイプに応じてリダイレクト
  // ========================================
  // 日本語slugを適切にエンコード
  const encodedSlug = encodeURIComponent(slug);
  
  // content_typeで分岐
  let redirectUrl: string;
  
  if (contentType === 'blog.blogpage') {
    // BlogPage → /blog/{slug}
    redirectUrl = `/blog/${encodedSlug}`;
  } else if (contentType === 'blog.standardpage') {
    // StandardPage → /{slug}
    redirectUrl = `/${encodedSlug}`;
  } else {
    // その他のページタイプ（将来の拡張用）
    console.warn('Unknown content type:', contentType);
    redirectUrl = `/${encodedSlug}`;
  }
  
  console.log('Redirecting to preview:', {
    contentType,
    slug,
    redirectUrl,
  });
  
  redirect(redirectUrl);
}
