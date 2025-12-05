'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useReCaptcha } from 'next-recaptcha-v3';
import { submitContactForm, type ContactApiError } from '@/lib/api/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ContactFormField } from '@/types';

interface ContactFormProps {
  formFields: ContactFormField[];
  thankYouHtml: string;
}

export function ContactForm({ formFields, thankYouHtml }: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { executeRecaptcha } = useReCaptcha();
  const { toast } = useToast();

  // フォームのデフォルト値を生成
  const defaultValues: Record<string, string> = {};
  formFields.forEach((field) => {
    defaultValues[field.clean_name] = field.default_value || '';
  });
  // ハニーポット用
  defaultValues['honeypot'] = '';

  const form = useForm({
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      setSuccessMessage(data.message);
      setIsSubmitted(true);
      form.reset();
      
      toast({
        title: '送信完了',
        description: data.message,
        variant: 'default',
      });
    },
    onError: (error: ContactApiError) => {
      toast({
        title: '送信エラー',
        description: error.message || 'お問い合わせの送信中にエラーが発生しました。',
        variant: 'destructive',
      });
      
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field, {
            type: 'manual',
            message: messages[0],
          });
        });
      }
    },
  });

  const onSubmit = async (data: Record<string, string>) => {
    // ハニーポットチェック（Bot検出）
    if (data.honeypot) {
      console.warn('Bot detected');
      return;
    }

    // reCAPTCHA v3トークン取得
    if (!executeRecaptcha) {
      console.error('reCAPTCHA not loaded yet');
      toast({
        title: 'エラー',
        description: 'セキュリティ検証が読み込めませんでした。ページを再読み込みしてください。',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = await executeRecaptcha('contact_form');
      
      // ハニーポットを除去してデータを整形
      const { honeypot, ...formData } = data;
      
      mutation.mutate({
        ...formData,
        recaptcha_token: token,
      });
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      const { honeypot, ...formData } = data;
      mutation.mutate(formData);
    }
  };

  // 選択肢を配列に変換
  const parseChoices = (choices: string): string[] => {
    if (!choices) return [];
    return choices.split(/\r?\n/).filter(Boolean);
  };

  // フィールドタイプに応じたコンポーネントをレンダリング
  const renderField = (field: ContactFormField) => {
    const { register, formState: { errors }, setValue, watch } = form;
    const fieldError = errors[field.clean_name];
    const choices = parseChoices(field.choices);

    switch (field.field_type) {
      case 'singleline':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.clean_name}
              {...register(field.clean_name, {
                required: field.required ? `${field.label}は必須です` : false,
              })}
              disabled={mutation.isPending}
              placeholder={field.help_text || `${field.label}を入力`}
            />
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.clean_name}
              type="email"
              {...register(field.clean_name, {
                required: field.required ? `${field.label}は必須です` : false,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '有効なメールアドレスを入力してください',
                },
              })}
              disabled={mutation.isPending}
              placeholder={field.help_text || 'example@example.com'}
            />
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'multiline':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.clean_name}
              {...register(field.clean_name, {
                required: field.required ? `${field.label}は必須です` : false,
                minLength: {
                  value: 10,
                  message: '10文字以上で入力してください',
                },
              })}
              disabled={mutation.isPending}
              placeholder={field.help_text || `${field.label}を入力`}
              className="min-h-[150px]"
            />
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={watch(field.clean_name)}
              onValueChange={(value) => setValue(field.clean_name, value)}
              disabled={mutation.isPending}
              className="space-y-2"
            >
              {choices.map((choice, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={choice}
                    id={`${field.clean_name}-${index}`}
                  />
                  <Label
                    htmlFor={`${field.clean_name}-${index}`}
                    className="font-normal cursor-pointer"
                  >
                    {choice}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {/* hidden inputでreact-hook-formに登録 */}
            <input
              type="hidden"
              {...register(field.clean_name, {
                required: field.required ? `${field.label}を選択してください` : false,
              })}
            />
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <select
              id={field.clean_name}
              {...register(field.clean_name, {
                required: field.required ? `${field.label}を選択してください` : false,
              })}
              disabled={mutation.isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">選択してください</option>
              {choices.map((choice, index) => (
                <option key={index} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-start space-x-2">
            <Checkbox
              id={field.clean_name}
              checked={watch(field.clean_name) === 'true'}
              onCheckedChange={(checked) => 
                setValue(field.clean_name, checked ? 'true' : '')
              }
              disabled={mutation.isPending}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={field.clean_name}
                className="font-normal cursor-pointer"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.help_text && (
                <p className="text-sm text-muted-foreground">{field.help_text}</p>
              )}
            </div>
            <input
              type="hidden"
              {...register(field.clean_name, {
                required: field.required ? `${field.label}にチェックしてください` : false,
              })}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.clean_name}
              type="number"
              {...register(field.clean_name, {
                required: field.required ? `${field.label}は必須です` : false,
              })}
              disabled={mutation.isPending}
              placeholder={field.help_text || `${field.label}を入力`}
            />
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'url':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.clean_name}
              type="url"
              {...register(field.clean_name, {
                required: field.required ? `${field.label}は必須です` : false,
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: '有効なURLを入力してください（http://またはhttps://で始まる）',
                },
              })}
              disabled={mutation.isPending}
              placeholder={field.help_text || 'https://example.com'}
            />
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.clean_name}
              type="date"
              {...register(field.clean_name, {
                required: field.required ? `${field.label}は必須です` : false,
              })}
              disabled={mutation.isPending}
            />
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.clean_name}
              type="datetime-local"
              {...register(field.clean_name, {
                required: field.required ? `${field.label}は必須です` : false,
              })}
              disabled={mutation.isPending}
            />
            {field.help_text && !fieldError && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );

      case 'hidden':
        return (
          <input
            key={field.id}
            type="hidden"
            {...register(field.clean_name)}
            defaultValue={field.default_value}
          />
        );

      default:
        // 未対応のフィールドタイプはsinglelineとして扱う
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.clean_name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.clean_name}
              {...register(field.clean_name, {
                required: field.required ? `${field.label}は必須です` : false,
              })}
              disabled={mutation.isPending}
              placeholder={field.help_text || `${field.label}を入力`}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );
    }
  };

  // 送信完了画面
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">送信完了</AlertTitle>
          <AlertDescription className="text-green-700">
            {successMessage || 'お問い合わせを受け付けました。'}
          </AlertDescription>
        </Alert>

        {thankYouHtml && (
          <div
            className="prose prose-sm max-w-none
              prose-headings:font-bold
              prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3
              prose-a:text-blue-600 prose-a:underline"
            dangerouslySetInnerHTML={{ __html: thankYouHtml }}
          />
        )}

        <Button
          onClick={() => {
            setIsSubmitted(false);
            setSuccessMessage(null);
          }}
          variant="outline"
        >
          新しいお問い合わせを作成
        </Button>
      </div>
    );
  }

  // フォームがない場合
  if (formFields.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>お問い合わせフォーム</AlertTitle>
        <AlertDescription>
          現在、お問い合わせフォームは準備中です。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* API エラーメッセージ */}
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>送信エラー</AlertTitle>
          <AlertDescription>
            お問い合わせの送信中にエラーが発生しました。しばらく経ってから再度お試しください。
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 動的フィールド */}
        {formFields.map((field) => renderField(field))}

        {/* ハニーポット（Bot検出用・非表示） */}
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }}>
          <Input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            {...form.register('honeypot')}
          />
        </div>

        {/* 送信ボタン */}
        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              送信中...
            </>
          ) : (
            '送信する'
          )}
        </Button>
      </form>
    </div>
  );
}
