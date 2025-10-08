import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Draft Mode無効化API
 * 
 * プレビューモードを終了して通常モードに戻る
 */
export async function GET() {
  const draft = await draftMode();
  draft.disable();
  
  // トップページにリダイレクト
  redirect('/');
}
