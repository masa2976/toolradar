# ToolRadar

**投資・トレーディングツールのキュレーション × ブログメディア**

## 🎯 プロジェクト概要

- **フロントエンド**: Next.js 15 + React 19
- **バックエンド**: Django 5.2 + Wagtail 7.0
- **データベース**: PostgreSQL 18
- **キャッシュ**: Redis
- **開発環境**: Docker Compose

## 🚀 セットアップ

### 前提条件

- Docker Desktop インストール済み
- Docker Compose V2 対応

### 環境構築

```bash
# 1. 環境変数設定
cp .env.example .env

# 2. Dockerコンテナ起動
docker compose up -d

# 3. ログ確認
docker compose logs -f
```

### プロジェクト生成（初回のみ）

#### バックエンド（Django + Wagtail）

```bash
docker compose exec backend bash

# Djangoプロジェクト作成
django-admin startproject config .
python manage.py startapp tools
python manage.py startapp blog

# マイグレーション
python manage.py migrate

# 管理者ユーザー作成
python manage.py createsuperuser
```

#### フロントエンド（Next.js）

```bash
docker compose exec frontend sh

# Next.jsプロジェクト作成
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# 依存関係追加
npm install @tanstack/react-query zustand framer-motion axios
```

## 📁 プロジェクト構造

```
toolradar/
├── backend/         # Django + Wagtail
├── frontend/        # Next.js
├── docker-compose.yml
└── .env
```

## 🔗 アクセスURL

- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:8000/admin
- **Wagtail Admin**: http://localhost:8000/cms

## 📚 ドキュメント

詳細は各種仕様書を参照してください：
- データモデル仕様
- API仕様
- UI/UX設計ガイドライン
- ブログ機能仕様
- SEO・マネタイズ仕様

## 🛠 開発コマンド

```bash
# コンテナ再起動
docker compose restart

# コンテナ停止
docker compose down

# ログ確認
docker compose logs backend
docker compose logs frontend

# マイグレーション
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# npmパッケージ追加
docker compose exec frontend npm install <package>
```

## 📈 開発ステータス

- [ ] Phase 1: 基盤構築（Django + Wagtail）
- [ ] Phase 2: ブログ機能
- [ ] Phase 3: フロントエンド
- [ ] Phase 4: 収益最適化

---

**Made with ❤️ for traders and investors**
