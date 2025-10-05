# ToolRadar Phase 1-2 完了報告

**完了日**: 2025年10月1日  
**進捗**: 100% 完了 ✅

## 完了内容

### 1. Wagtailスニペット ✅
- BlogCategory: 7件
  - 初心者ガイド、ツールレビュー、トレード戦略、市場分析、ランキング特集、チュートリアル、ニュース・更新情報
- InvestmentType: 5件
  - FX、株式、仮想通貨、コモディティ、投資全般
- 管理: Wagtail CMS + Django Admin両方で管理可能

### 2. Tagモデル ✅
- カスタムTag: 25件（4カテゴリ）
  - technical_indicator: 8件（RSI, MACD, 移動平均, ボリンジャーバンド等）
  - trade_style: 6件（スキャルピング, デイトレード, スイング等）
  - currency_pair: 6件（USD/JPY, EUR/USD, GBP/JPY等）
  - strategy_type: 5件（トレンドフォロー, 逆張り, ブレイクアウト等）
- 正規化機能: NFKC + 小文字化 + synonyms対応
- django-taggit標準Tag管理画面を非表示化

### 3. Toolモデル ✅
- 基本情報: name, slug, short_description, long_description
- プラットフォーム: platform (ArrayField)
- 価格情報: price_type, price
- リボン: ribbons (ArrayField)
- タグ機能: TaggableManager
- サンプルデータ: Super RSI Indicator（1件）

### 4. BlogPageモデル ✅
#### BlogIndexPage
- introフィールド
- 子ページとしてBlogPageのみ許可
- get_context()で公開済み記事取得
- **作成・公開成功**

#### BlogPage
- 基本情報: excerpt, category, investment_type
- StreamField: 最小構成（paragraph, heading, image）
- featured_image: アイキャッチ画像
- related_tools: **ParentalManyToManyField**（Wagtail互換）
- tags: **ParentalManyToManyField + CheckboxSelectMultiple**
  - ✅ **25件のタグがチェックボックス形式で選択可能**
  - ✅ **表記ゆれゼロ**（既存タグからのみ選択）
  - ✅ 新規タグ作成は管理者のみ（スニペットから）
- view_count: 閲覧数カウンター
- **下書き保存・プレビュー・公開すべて成功**

### 5. テンプレート ✅
- base.html (1.2KB)
- blog_index_page.html (1.8KB)
- blog_page.html (3.4KB)
- 最小限の表示確認完了
- **注**: アイキャッチ画像は簡易表示（Phase 3で本格実装予定）

## 解決した技術的問題

### 1. ManyToManyField vs ParentalManyToManyField
**問題**: 通常のManyToManyFieldではWagtailのリビジョン機能が動作しない  
**解決**: ParentalManyToManyFieldに統一（tags, related_tools両方）

### 2. タグの表記ゆれ問題
**問題**: ClusterTaggableManagerは自由入力がデフォルト  
**解決**: ParentalManyToManyField + CheckboxSelectMultipleで既存タグからのみ選択

### 3. マイグレーションエラー
**問題**: ClusterTaggableManager → ParentalManyToManyFieldへの直接変更は不可  
**解決**: blogアプリのテーブル・マイグレーションをリセットして再生成

### 4. page_ptrエラー
**問題**: 保存前にManyToManyフィールドを使おうとしてエラー  
**解決**: related_toolsをParentalManyToManyFieldに変更

## 技術構成

### 確定ライブラリバージョン
```
Django==5.2.6
wagtail==7.0.3
pillow==11.0.0
psycopg2-binary==2.9.10
wagtail-cache==3.0.0
django-taggit==5.0.1
modelcluster==6.3
```

### PostgreSQL
- バージョン: PostgreSQL 18 (Docker)

### Docker環境
- toolradar_backend: Up (http://localhost:8000)
- toolradar_db: Up (healthy)
- toolradar_redis: Up (healthy)

### アクセス情報
- Django Admin: http://localhost:8000/admin
- Wagtail CMS: http://localhost:8000/cms/
- 管理者: admin / （ユーザー設定パスワード）

## プロジェクトパス
- Windows: C:\Users\kwwit\Desktop\trading-tools-platform
- WSL: /mnt/c/Users/kwwit/Desktop/trading-tools-platform

## 次のPhase予定

### Phase 1-3: データ管理（予定）
- django-import-export設定
- ツール・タグの一括インポート機能
- 初期データCSV作成

### Phase 2: ブログ機能拡張（予定）
- StreamField拡張（ASPブロック等）
- カスタムASPブロック実装
- リアルタイムプレビュー強化
- SEOフィールド実装
- 編集ワークフロー設定

### Phase 3: フロントエンド（予定）
- Next.js基本設定
- API連携
- A/Bテスト基盤
- 構造化データ、OGP
- パフォーマンス最適化
- アイキャッチ画像の本格実装

## 重要な設計方針

### Wagtail実装方針
- ✅ 最小構成から開始（不要な機能は使わない）
- ✅ StreamFieldは最小限（Phase 2で拡張予定）
- ⏳ ASPブロックはPhase 2で実装
- ✅ 編集体験を最優先
- ⏳ テンプレートは最小限（Phase 3でNext.js実装時に本格化）

### ビジネスモデル
- ✅ 主要収益源: ASPアフィリエイト（証券口座開設）
- ✅ 副収益源: Google AdSense
- ✅ ツール検索は差別化要素（収益より集客・SEO目的）

### データ管理
- ⏳ django-import-exportで一括管理（Phase 1-3予定）
- ✅ タグは正規化して統一管理
- ✅ スニペットで非技術者でも管理可能

## Phase 1-2 成功要因

1. **段階的アプローチ**
   - 最小限の実装から開始
   - 1つずつ動作確認
   - 問題が出たら即座に対処

2. **Wagtail互換性の理解**
   - ParentalManyToManyFieldの重要性を把握
   - Wagtailのリビジョン機能との統合

3. **ユーザーフィードバック**
   - タグのチェックボックス表示要件
   - 保存エラーの即座な報告

## 残存する軽微な問題

### SECRET_KEY警告
```
SyntaxWarning: invalid escape sequence '\!'
```
- 影響: なし（動作には問題なし）
- 修正方法: settings.pyのSECRET_KEYをraw string `r'...'`に変更（任意）

### アイキャッチ画像表示
- 現状: 簡易表示（`{{ page.featured_image.url }}`）
- 理由: Wagtail画像は`{% image %}`タグ推奨
- 対応: Phase 3でNext.jsフロントエンド実装時に本格対応

---

**Phase 1-2: 100% 完了** ✅
**次のチャット**: Phase 1-3（django-import-export設定）またはPhase 2（ブログ機能拡張）
