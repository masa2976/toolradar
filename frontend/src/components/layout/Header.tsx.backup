'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'

const navigationItems = [
  { label: 'ツール検索', href: '/' },
  { label: 'ブログ', href: '/blog' },
  { label: '週間ランキング', href: '/ranking/weekly' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  // ウィンドウリサイズ時にメニューを自動で閉じる（デスクトップ切替時）
  useEffect(() => {
    const handleResize = () => {
      // 1024px以上（lg）になったらメニューを閉じる
      if (window.innerWidth >= 1024 && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* モバイルハンバーガーメニュー（左側） */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>メニュー</SheetTitle>
            </SheetHeader>
            
            {/* ナビゲーションリンク */}
            <nav className="mt-6 flex flex-col space-y-3 pb-6 border-b">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium text-gray-700 transition-colors hover:text-blue-600 px-2 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* サイドバーコンテンツ（モバイル用） */}
            <div className="mt-6">
              <Sidebar isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>

        {/* ロゴ（中央） */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="hidden font-bold text-xl sm:inline-block">
            ToolRadar
          </span>
        </Link>

        {/* デスクトップナビゲーション（右側） */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* スペーサー（モバイル時のバランス調整） */}
        <div className="w-10 lg:hidden" />
      </div>
    </header>
  )
}
