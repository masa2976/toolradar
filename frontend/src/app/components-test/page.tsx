export default function ComponentsTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* タイトル */}
        <h1 className="text-4xl font-bold text-foreground">
          カラーシステム v2.0 テスト
        </h1>

        {/* Primary Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Primary Colors（信頼感のブルー）</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-primary" />
              <p className="text-sm">primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-primary-hover" />
              <p className="text-sm">primary-hover</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-primary-light" />
              <p className="text-sm">primary-light</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-primary-dark" />
              <p className="text-sm">primary-dark</p>
            </div>
          </div>
        </section>

        {/* Accent Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-accent">Accent Colors（CTA用オレンジ）</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-accent" />
              <p className="text-sm">accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-accent-hover" />
              <p className="text-sm">accent-hover</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-accent-light" />
              <p className="text-sm">accent-light</p>
            </div>
          </div>
        </section>

        {/* Semantic Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Semantic Colors</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-success" />
              <p className="text-sm">success</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-warning" />
              <p className="text-sm">warning</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-danger" />
              <p className="text-sm">danger</p>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Trust Indicators</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-trust" />
              <p className="text-sm">trust (セキュリティ)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-verified" />
              <p className="text-sm">verified (認証)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-premium" />
              <p className="text-sm">premium (ゴールド)</p>
            </div>
          </div>
        </section>

        {/* CTAボタンのデモ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">CTA Buttons Demo</h2>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary-hover">
              Primary Button
            </button>
            <button className="rounded-lg bg-accent px-6 py-3 font-bold text-white hover:bg-accent-hover">
              Accent Button (CTA)
            </button>
            <button className="rounded-lg bg-success px-6 py-3 font-bold text-white">
              Success Button
            </button>
            <button className="rounded-lg bg-danger px-6 py-3 font-bold text-white">
              Danger Button
            </button>
          </div>
        </section>

        {/* バッジのデモ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Badges Demo</h2>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
              Primary Badge
            </span>
            <span className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white">
              New!
            </span>
            <span className="rounded-full bg-success px-4 py-2 text-sm font-medium text-white">
              Free
            </span>
            <span className="rounded-full bg-warning px-4 py-2 text-sm font-medium text-white">
              Popular
            </span>
            <span className="rounded-full bg-verified px-4 py-2 text-sm font-medium text-white">
              ✓ Verified
            </span>
            <span className="rounded-full bg-premium px-4 py-2 text-sm font-medium text-white">
              ★ Premium
            </span>
          </div>
        </section>

        {/* 期待効果の説明 */}
        <section className="space-y-4 rounded-lg border-2 border-primary bg-primary-light p-6">
          <h2 className="text-2xl font-bold text-primary">📊 期待効果</h2>
          <ul className="space-y-2 text-foreground">
            <li>✅ <strong>CTR: +15-30%</strong> - ビビッドカラーによる注目度向上</li>
            <li>✅ <strong>CVR: +21%</strong> - オレンジCTAボタンによる行動喚起</li>
            <li>✅ <strong>ブランド認知度: +50%</strong> - 一貫したカラーシステム</li>
            <li>✅ <strong>信頼感向上</strong> - 投資業界標準のブルー採用</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
