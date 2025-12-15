import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * プラットフォームを配列に正規化
 * APIが文字列または配列を返す可能性があるため
 */
export function normalizePlatforms(platform: string | string[]): string[] {
  return Array.isArray(platform) ? platform : [platform];
}
