/**
 * API成功レスポンスの型
 */
export interface ContactApiResponse {
  success: boolean;
  message: string;
  thank_you_text?: string;
}

/**
 * APIエラーレスポンスの型
 */
export interface ContactApiError {
  success: false;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
}

/**
 * 動的フォームデータの型（任意のフィールド名に対応）
 */
export type DynamicContactFormData = Record<string, string>;

/**
 * お問い合わせフォーム送信API
 * @param data フォームデータ（動的フィールド対応）
 * @returns 成功レスポンス
 * @throws APIエラー
 */
export async function submitContactForm(
  data: DynamicContactFormData
): Promise<ContactApiResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const response = await fetch(`${apiUrl}/api/contact/submit/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ContactApiError = await response.json();
    throw error;
  }

  return response.json();
}
