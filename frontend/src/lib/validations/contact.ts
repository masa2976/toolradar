import { z } from 'zod';

/**
 * お問い合わせフォームのバリデーションスキーマ
 * バックエンドのバリデーションルールと一致
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'お名前は2文字以上で入力してください' })
    .max(100, { message: 'お名前は100文字以内で入力してください' }),
  
  email: z
    .string()
    .email({ message: '有効なメールアドレスを入力してください' })
    .max(255, { message: 'メールアドレスは255文字以内で入力してください' }),
  
  subject: z
    .string()
    .min(1, { message: '件名を入力してください' })
    .max(200, { message: '件名は200文字以内で入力してください' }),
  
  message: z
    .string()
    .min(10, { message: 'お問い合わせ内容は10文字以上で入力してください' })
    .max(2000, { message: 'お問い合わせ内容は2000文字以内で入力してください' }),
  
  // ハニーポット（Bot検出用）
  // 人間のユーザーには見えない隠しフィールド
  // Botが自動で埋めることを想定し、値が入っていたらスパムと判定
  honeypot: z.string().optional().default(''),
});

/**
 * フォームデータの型定義
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;
