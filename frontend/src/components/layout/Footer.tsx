import Link from 'next/link'

const footerLinks = {
  company: [
    { label: 'About', href: '/about' },
    { label: 'お問い合わせ', href: '/contact' },
  ],
  legal: [
    { label: 'プライバシーポリシー', href: '/privacy-policy' },
    { label: '利用規約', href: '/terms' },
    { label: '免責事項', href: '/disclaimer' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* ロゴとキャッチコピー */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-xl">ToolRadar</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              EA・インジケーター探しの羅針盤
            </p>
          </div>

          {/* 会社情報 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 免責事項 */}
        <div className="mt-8 border-t pt-6">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            当サイトに掲載されている情報は、各ツールの最終更新日時点のものです。
            投資は元本保証がございません。投資判断はご自身の責任において行ってください。
            当サイトの情報を利用して生じたいかなる損害についても、当サイトは責任を負いかねます。
          </p>
        </div>

        {/* コピーライト */}
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} ToolRadar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
