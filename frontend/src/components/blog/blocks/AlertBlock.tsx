import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { AlertBlockValue } from '@/types/streamfield';

/**
 * Alertブロックコンポーネント
 * 
 * 重要な情報を目立たせるブロック。
 * 情報、成功、注意、警告の4種類。
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alert_role
 * @see UI/UX設計ガイドライン v2.0
 */
interface AlertBlockProps {
  value: AlertBlockValue;
}

// アラートタイプとスタイルのマッピング
// WCAG 2.1準拠: 100番台背景（ライトモード専用）
const alertStyles = {
  info: {
    container: 'bg-blue-100 border-blue-500 text-blue-900',
    IconComponent: Info,
  },
  success: {
    container: 'bg-green-100 border-green-500 text-green-900',
    IconComponent: CheckCircle,
  },
  warning: {
    container: 'bg-amber-100 border-amber-500 text-amber-900',
    IconComponent: AlertTriangle,
  },
  danger: {
    container: 'bg-red-100 border-red-500 text-red-900',
    IconComponent: XCircle,
  },
} as const;

export const AlertBlock = React.memo(({ value }: AlertBlockProps) => {
  const style = alertStyles[value.alert_type];
  const IconComponent = style.IconComponent;

  return (
    <div
      className={`flex flex-col px-2 py-0.5 border-l-4 rounded-lg my-4 ${style.container}`}
      role="alert"
    >
      {/* タイトル行（アイコン + タイトル） */}
      <div className="flex items-center gap-2">
        <IconComponent 
          className="w-4 h-4 flex-shrink-0"
          aria-hidden="true"
        />
        {value.title && (
          <h4 className="font-bold text-base leading-tight">
            {value.title}
          </h4>
        )}
      </div>

      {/* 本文（RichText） - タイトルがある場合は左インデント */}
      <div 
        className={`leading-relaxed [&>p]:mb-0 [&_a]:underline [&_a]:font-medium hover:[&_a]:opacity-80 ${value.title ? 'pl-5' : ''}`}
        dangerouslySetInnerHTML={{ __html: value.content }}
      />
    </div>
  );
});

AlertBlock.displayName = 'AlertBlock';
