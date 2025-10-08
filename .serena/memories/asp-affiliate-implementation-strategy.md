# ASPアフィリエイト実装戦略

## 重要な方針転換

**❌ データベース構築は不要**
- 書籍情報のDB管理は複雑かつ非効率
- Amazon PA-API（有料・審査必要）
- 楽天API（アカウント必要）

**✅ 専用バナー埋め込みが最適解**
- Amazon Associates（アソシエイト）公式バナー
- 楽天アフィリエイト公式バナー
- Next.js `next/script`コンポーネントで実装

## Next.jsでの実装方法

### 1. Amazon アソシエイト

```tsx
import Script from 'next/script'

<Script
  id="amazon-banner"
  strategy="lazyOnload"
  dangerouslySetInnerHTML={{
    __html: `
      amzn_assoc_ad_type = "banner";
      amzn_assoc_marketplace = "amazon";
      amzn_assoc_region = "JP";
      amzn_assoc_placement = "assoc_banner_placement_default";
      amzn_assoc_tracking_id = "your-tag-22";
      amzn_assoc_width = "728";
      amzn_assoc_height = "90";
    `
  }}
/>
<Script 
  src="//z-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&Operation=GetScript&ID=OneJS&WS=1"
  strategy="lazyOnload"
/>
```

### 2. 楽天アフィリエイト

```tsx
import Script from 'next/script'

<Script
  id="rakuten-banner"
  strategy="lazyOnload"
  src="https://rakuten-banner-url.js"
/>
```

## Strategyの選択

| strategy | 用途 | 優先度 |
|----------|------|--------|
| **beforeInteractive** | 最優先スクリプト | 🔴 高 |
| **afterInteractive** | デフォルト | 🟡 中 |
| **lazyOnload** | 低優先度（ASP推奨） | 🟢 低 |

**ASPバナーは`lazyOnload`推奨**:
- Core Web Vitals影響最小
- ユーザー体験優先
- バックグラウンド読み込み

## 実装箇所

### Phase 6-2: Wagtailブログ（最優先）
- StreamField ASPブロック
- 記事内に柔軟に配置
- カスタムバナーコンポーネント

### Phase 6-1: サイドバーウィジェット（次優先）
- トップページ・一覧ページ
- 常時表示（CTR向上）

### Phase 後回し: ツール詳細ページ
- 不要または最小限
- AdSense 2箇所のみで十分

## セキュリティ考慮

- `dangerouslySetInnerHTML`は信頼できるソースのみ
- Amazon/楽天公式コードのみ使用
- XSS対策（Next.js自動エスケープ）
