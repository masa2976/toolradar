# ToolRadar

**投資・トレーディングツールのキュレーションメディア**

FX・仮想通貨トレーディングツールの総合情報サイト。週間ランキングとブログ記事でユーザーに価値提供し、ASPアフィリエイトで収益化。

---

## 🚀 技術スタック

### Backend
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| Django | 5.2.6 | Webフレームワーク |
| Wagtail | 7.0.3 | Headless CMS |
| Django REST Framework | 3.16.1 | API構築 |
| APScheduler | 3.10.4 | タスクスケジューラー |
| PostgreSQL | 18 | データベース |
| Redis | 7 | キャッシュ |

### Frontend
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| Next.js | 16.0.7 | Reactフレームワーク（Turbopack標準） |
| React | 19.1.0 | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 4.x | スタイリング |
| TanStack Query | 5.59.0 | データフェッチング |
| Zustand | 5.0.2 | 状態管理 |
| next-devtools-mcp | latest | MCP統合（Claude Desktop連携） |

### Infrastructure
| ツール | 用途 |
|-------|------|
| Docker Compose | 開発環境 |
| Vercel | Frontendホスティング（予定） |
| Fly.io | Backendホスティング（予定） |

---

## 📁 プロジェクト構造

```
toolradar/
├── backend/
│   ├── config/             # Django設定
│   │   └── settings.py
│   ├── tools/              # ツールモデル・API
│   │   ├── models.py
│   │   ├── models_stats.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── scheduler.py    # APScheduler設定
│   │   └── management/commands/
│   ├── blog/               # Wagtailブログ
│   │   ├── models.py       # BlogPage
│   │   └── blocks.py       # StreamFieldブロック
│   ├── tags/               # タグ管理
│   ├── templates/          # Django/Wagtailテンプレート
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   │   ├── page.tsx    # トップページ
│   │   │   ├── tools/      # ツール一覧・詳細
│   │   │   ├── blog/       # ブログ詳細
│   │   │   ├── ranking/    # ランキングページ
│   │   │   ├── tags/       # タグページ
│   │   │   ├── sitemap.ts  # 動的サイトマップ
│   │   │   └── robots.ts   # robots.txt
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui系
│   │   │   ├── features/   # 機能コンポーネント
│   │   │   └── layout/     # レイアウト系
│   │   ├── lib/
│   │   │   ├── api/        # API通信
│   │   │   └── utils.ts
│   │   └── types/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env                    # 環境変数（Git除外）
├── .env.example            # 環境変数サンプル
└── 知識ベース*.md           # 開発ドキュメント
```

---

## ⚡ クイックスタート

### 前提条件
- Docker Desktop インストール済み
- Docker Compose V2 対応

### 1. 環境変数設定
```bash
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

### 2. コンテナ起動
```bash
# 全サービス起動
docker compose up -d

# ログ確認
docker compose logs -f
```

### 3. 初期設定
```bash
# マイグレーション実行
docker compose exec backend python manage.py migrate

# スーパーユーザー作成
docker compose exec backend python manage.py createsuperuser
```

### 4. アクセス
| URL | 説明 |
|-----|------|
| http://localhost:3000 | Frontend (Next.js) |
| http://localhost:8000/admin | Django Admin |
| http://localhost:8000/cms | Wagtail CMS |
| http://localhost:8000/api | REST API |

---

## 🛠 開発コマンド

### Docker操作
```bash
# 起動
docker compose up -d

# 停止
docker compose down

# 再起動
docker compose restart

# ログ確認
docker compose logs -f backend
docker compose logs -f frontend

# コンテナ内でシェル起動
docker compose exec backend bash
docker compose exec frontend sh
```

### Django管理
```bash
# マイグレーション作成・実行
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# 週間統計更新
docker compose exec backend python manage.py update_weekly_stats

# テストツール追加
docker compose exec backend python manage.py add_test_tools

# イベントログクリーンアップ
docker compose exec backend python manage.py cleanup_events

# Djangoシェル
docker compose exec backend python manage.py shell_plus
```

### Frontend
```bash
# パッケージ追加
docker compose exec frontend npm install <package>

# ビルド
docker compose exec frontend npm run build
```

---

## 📊 主要機能

### 実装済み機能

#### ツール管理
- [x] ツール一覧・詳細表示
- [x] プラットフォーム別フィルター（MT4/MT5/TradingView）
- [x] ツールタイプ別フィルター（EA/Indicator/Strategy等）
- [x] 価格タイプ別フィルター（無料/有料/フリーミアム）
- [x] 週間ランキング表示
- [x] 関連ツール表示

#### ブログ機能
- [x] Wagtail CMS統合
- [x] StreamFieldによるリッチコンテンツ
- [x] ブログ記事プレビュー（Headless Preview）
- [x] カテゴリー・タグ分類

#### 統計・分析
- [x] イベントトラッキング（PV/シェア/滞在時間）
- [x] 週間スコア自動計算
- [x] APSchedulerによる定期タスク実行

#### SEO対策
- [x] 動的メタタグ生成
- [x] Open Graph / Twitter Card
- [x] 構造化データ（JSON-LD）
- [x] sitemap.xml自動生成
- [x] robots.txt設定

#### その他
- [x] レスポンシブデザイン
- [x] ダークモード対応
- [x] SNSシェアボタン
- [x] お問い合わせフォーム

### 開発予定
- [ ] 画像最適化（WebP/AVIF）
- [ ] ユーザー認証
- [ ] お気に入り機能
- [ ] コメント機能
- [ ] 多言語対応

---

## 🔧 スケジューラー（APScheduler）

バックエンドではAPSchedulerによる定期タスクが自動実行されます。

### 登録済みジョブ
| ジョブ名 | 実行タイミング | 処理内容 |
|---------|---------------|---------|
| イベントログクリーンアップ | 毎週日曜 03:00 JST | 30日以上古いログを削除 |

### スケジューラー確認
```bash
# ログ確認
docker compose logs backend | grep スケジューラー

# 手動実行
docker compose exec backend python manage.py cleanup_events
```

---

## 🤖 MCP連携（Claude Desktop）

Next.js DevTools MCPにより、Claude Desktopと連携して開発効率を向上できます。

### 設定方法
Claude Desktopの設定ファイル（`%APPDATA%\Claude\claude_desktop_config.json`）:
```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

### 活用例
- リアルタイムビルドエラー検出
- ハイドレーションエラー検出
- ルート情報自動取得
- 環境変数確認

---

## 📚 ドキュメント

詳細な仕様は以下のドキュメントを参照してください：

| ファイル | 内容 |
|---------|------|
| 知識ベース1_技術仕様.md | 技術スタック・データモデル・API仕様 |
| 知識ベース2_Wagtail実装.md | Wagtailブロック・テンプレート設定 |
| 知識ベース3_ビジネス仕様.md | マネタイズ・ランキング・SEO仕様 |
| 知識ベース4_運用ガイド.md | Docker操作・管理コマンド |
| 知識ベース5_作業ログ.md | トラブルシューティング・Tips |

---

## 🔗 外部リソース

- [Django Documentation](https://docs.djangoproject.com/en/5.2/)
- [Wagtail Documentation](https://docs.wagtail.org/en/stable/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)
- [APScheduler](https://apscheduler.readthedocs.io/en/stable/)

---

## 📈 開発ステータス

### 完了フェーズ
- ✅ Phase 1: 基盤構築（Django + Wagtail + Next.js）
- ✅ Phase 2: ツール管理機能
- ✅ Phase 3: ブログ機能（Wagtail CMS）
- ✅ Phase 4: 週間ランキング
- ✅ Phase SEO: メタタグ・サイトマップ・robots.txt

### 進行中
- 🔄 デザイン改善
- 🔄 パフォーマンス最適化

### 予定
- 📋 本番環境デプロイ
- 📋 収益最適化（ASP連携）

---

## ⚠️ 注意事項

- `.env`ファイルは絶対にGitにコミットしないこと
- 本番環境では`DEBUG=False`を設定すること
- バックアップは定期的に実行すること

---

**Made with ❤️ for traders and investors**
