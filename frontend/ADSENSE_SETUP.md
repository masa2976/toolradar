# Google AdSense セットアップガイド

**最終更新**: 2025年10月21日  
**対象**: ToolRadar フロントエンド  
**前提**: Next.js 15.5.3 + React 19

---

## 📋 目次

1. [Google AdSense審査フローの概要](#google-adsense審査フローの概要)
2. [審査前の準備](#審査前の準備)
3. [審査申請時の手順](#審査申請時の手順)
4. [審査中の注意事項](#審査中の注意事項)
5. [審査合格後の手順](#審査合格後の手順)
6. [環境変数の設定方法](#環境変数の設定方法)
7. [動作確認方法](#動作確認方法)
8. [トラブルシューティング](#トラブルシューティング)

---

## 🔄 Google AdSense審査フローの概要

Google AdSenseの審査プロセスは以下の流れになります：

```
1. 本番公開
   ↓
2. AdSenseアカウント作成
   ↓
3. 審査コード配置（<head>タグ内のmeta tag）
   ↓
4. 審査申請
   ↓
5. 審査中（数日〜2-4週間）← Googleクローラーがサイト巡回
   ↓
6. 審査合格
   ↓
7. パブリッシャーID有効化
   ↓
8. 広告ユニット作成
   ↓
9. 広告コード配置
   ↓
10. 広告配信開始
```

### 重要なポイント

1. **審査コードと広告コードは別物**
   - **審査コード（meta tag）**: サイト所有権の確認用
   - **広告ユニットコード（ins tag）**: 実際の広告表示用

2. **審査中は広告は表示されない**（Googleの仕様）

3. **パブリッシャーIDは審査申請時に発行されるが、有効化されるのは合格後**

---

## 🛠️ 審査前の準備

### 必要な要件

審査申請前に以下の要件を満たしていることを確認してください：

#### 1. サイト要件

- ✅ **独自ドメイン必須**（サブドメイン不可）
- ✅ **オリジナルコンテンツ**（2000文字 × 10記事以上推奨）
- ✅ **プライバシーポリシー必須**
- ✅ **お問い合わせフォーム推奨**
- ✅ **AdSenseプログラムポリシー準拠**
- ✅ **ユーザーに価値あるコンテンツ**

#### 2. コンテンツ品質

- 記事数: 10記事以上
- 文字数: 1記事あたり2000文字以上
- オリジナリティ: コピーコンテンツ禁止
- 更新頻度: 定期的な更新

#### 3. 技術要件

- SSL証明書（HTTPS）
- レスポンシブデザイン
- 適切なナビゲーション
- 高速なページ読み込み（Core Web Vitals）

---

## 📤 審査申請時の手順

### Step 1: AdSenseアカウント作成

1. [Google AdSense](https://www.google.com/adsense/start/)にアクセス
2. Googleアカウントでログイン
3. サイトURL、メールアドレスを入力
4. アカウント情報を入力（住所、電話番号等）

### Step 2: パブリッシャーIDの取得

審査申請時に以下の形式でパブリッシャーIDが発行されます：

```
ca-pub-XXXXXXXXXXXXXXXX
```

**このIDをメモしてください。**

---

### Step 3: 環境変数の設定（審査申請時）

`.env.local`ファイルに以下を設定：

```bash
# Google AdSense - 審査申請時の設定
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_STATUS=pending
```

**重要:**
- `STATUS=pending`に設定することで、審査中は広告コードが配置されません
- 審査コード（meta tag）のみが`<head>`に配置されます

---

### Step 4: コンテナ再起動

```bash
# プロジェクトルートで実行
cd /mnt/c/Users/kwwit/Desktop/trading-tools-platform

# フロントエンドコンテナを再起動
docker compose restart frontend
```

---

### Step 5: 審査コードの確認

ブラウザで本番サイト（またはローカル）を開き、以下を確認：

1. **ブラウザの開発者ツールを開く**（F12キー）
2. **Elementsタブを選択**
3. **`<head>`タグ内を確認**
4. 以下のコードが存在することを確認：

```html
<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
```

**✅ 確認できたら次へ進む**

---

### Step 6: AdSenseダッシュボードで審査申請

1. [AdSenseホーム](https://www.google.com/adsense/)にログイン
2. 「サイト」カードを選択
3. 「サイトを審査に送信」をクリック
4. 審査コードが正しく配置されているか確認を求められる
5. 「審査を申請」をクリック

**審査申請完了！**

---

## ⏳ 審査中の注意事項

### 審査期間

- **通常**: 数日〜2週間
- **長い場合**: 2〜4週間

### 審査状態の確認方法

[AdSenseホーム](https://www.google.com/adsense/) > **「サイト」カード**で確認

**ステータス表示:**
- 🔄 **審査中**: Googleクローラーがサイトを巡回中
- ✅ **承認済み**: 審査合格
- ❌ **却下**: 審査落ち（理由が表示される）

### 審査中にやってはいけないこと

- ❌ **サイトの大幅な変更**（記事の大量削除等）
- ❌ **審査コードの削除**
- ❌ **サイトの非公開化**
- ❌ **robots.txtでGooglebotをブロック**

### 審査中にやるべきこと

- ✅ **記事の追加・更新**（品質向上）
- ✅ **ユーザーエクスペリエンスの改善**
- ✅ **Core Web Vitalsの最適化**
- ✅ **定期的な審査状態の確認**

---

## 🎉 審査合格後の手順

### Step 1: 広告ユニットの作成

1. [AdSenseホーム](https://www.google.com/adsense/)にログイン
2. **「広告」** > **「サマリー」**を選択
3. **「広告ユニットごと」**タブを選択
4. **「ディスプレイ広告」**を選択
5. 広告ユニット名を入力（例: `tool-detail-top`）
6. 広告サイズを選択（推奨: `レスポンシブ`）
7. **「作成」**をクリック

**広告ユニットID（data-ad-slot）が発行されます**（例: `1234567890`）

---

### Step 2: 環境変数の更新

`.env.local`ファイルを以下のように更新：

```bash
# Google AdSense - 審査合格後の設定
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_STATUS=approved  # ← pending から approved に変更
```

**重要:**
- `STATUS=approved`に変更することで、広告ユニットコードが配置されます
- これにより、実際の広告が表示されるようになります

---

### Step 3: コンテナ再起動

```bash
# プロジェクトルートで実行
cd /mnt/c/Users/kwwit/Desktop/trading-tools-platform

# フロントエンドコンテナを再起動
docker compose restart frontend
```

---

### Step 4: 広告表示の確認

ブラウザで本番サイト（またはローカル）を開き、以下を確認：

1. **ツール詳細ページ**（例: `/tools/grid-master-ea`）にアクセス
2. **技術仕様セクションの後**に広告スペースが表示されることを確認
3. **開発者ツール**（F12）で以下を確認：

```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="YYYYYYYYYY"
     data-ad-format="auto"></ins>
```

**注意:**
- **開発環境（localhost）では実際の広告は表示されません**
- 本番環境でのみ広告が配信されます
- 初回表示まで数分〜数時間かかる場合があります

---

## ⚙️ 環境変数の設定方法

### 設定ファイル: `.env.local`

プロジェクトの`frontend/.env.local`に以下を設定します。

#### テンプレート

`frontend/.env.local.example`を参考にしてください：

```bash
# ========================================
# Google AdSense設定
# ========================================
# Google AdSenseのパブリッシャーID
# 形式: ca-pub-XXXXXXXXXXXXXXXX
# 
# 取得方法:
# 1. Google AdSenseアカウント作成
# 2. サイト情報入力
# 3. AdSenseダッシュボードでIDを取得
# 
# 【重要】審査状態の管理:
# - 審査前: 未設定
# - 審査申請時〜審査中: 下記2つを設定、STATUS=pending
# - 審査合格後: 下記2つを設定、STATUS=approved
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_STATUS=pending

# 審査状態
# - pending: 審査申請中・審査中（広告非表示）
# - approved: 審査合格後（広告表示）
# 注意:
# - 審査前は両方とも未設定にしてください
# - 審査申請時にpendingを設定
# - 審査合格後にapprovedに変更
```

---

### 各段階での設定値

#### 1. 審査前

```bash
# 両方とも未設定（コメントアウトまたは削除）
# NEXT_PUBLIC_ADSENSE_CLIENT_ID=
# NEXT_PUBLIC_ADSENSE_STATUS=
```

**結果:**
- 審査コード（meta tag）: 配置されない
- 広告ユニットコード: 配置されない

---

#### 2. 審査申請時〜審査中

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_STATUS=pending
```

**結果:**
- 審査コード（meta tag）: `<head>`に配置される ✅
- 広告ユニットコード: 配置されない（`return null`）

---

#### 3. 審査合格後

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_STATUS=approved
```

**結果:**
- 審査コード（meta tag）: `<head>`に配置される ✅
- 広告ユニットコード: 配置される ✅（実際の広告が表示）

---

## 🧪 動作確認方法

### Docker環境での確認手順

#### 1. 審査前のテスト

```bash
# 1. .env.localを編集（CLIENT_IDとSTATUSをコメントアウト）
cd /mnt/c/Users/kwwit/Desktop/trading-tools-platform/frontend
nano .env.local

# 2. コンテナ再起動
cd ..
docker compose restart frontend

# 3. ブラウザで確認（http://localhost:3000）
# → AdSenseスペースは非表示（return null）
# → <head>に審査コードも存在しない
```

---

#### 2. 審査中のテスト

```bash
# 1. .env.localを編集
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
NEXT_PUBLIC_ADSENSE_STATUS=pending

# 2. コンテナ再起動
docker compose restart frontend

# 3. ブラウザで確認（http://localhost:3000）
# → AdSenseスペースは非表示（return null）
# → <head>に審査コード（meta tag）が存在することを確認（F12 > Elements）
```

**確認項目:**
```html
<meta name="google-adsense-account" content="ca-pub-0000000000000000">
```

---

#### 3. 審査合格後のテスト

```bash
# 1. .env.localを編集
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
NEXT_PUBLIC_ADSENSE_STATUS=approved

# 2. コンテナ再起動
docker compose restart frontend

# 3. ブラウザで確認（http://localhost:3000）
# → AdSense広告表示（開発環境では実際の広告は表示されない）
# → <ins class="adsbygoogle">が存在することを確認（F12 > Elements）
```

**確認項目:**
```html
<ins class="adsbygoogle" ... data-ad-client="ca-pub-0000000000000000"></ins>
```

---

### 確認ページ

以下のページで広告配置を確認できます：

1. **トップページ** (`/`)
   - ページ下部: AdSense（審査合格後のみ表示）

2. **ツール詳細** (`/tools/grid-master-ea`)
   - 技術仕様セクションの後: AdSense（審査合格後のみ表示）

---

## 🔧 トラブルシューティング

### Q1: 審査コード（meta tag）が表示されない

**原因:**
- 環境変数が正しく設定されていない
- コンテナが再起動されていない

**解決方法:**
```bash
# 1. .env.localを確認
cat frontend/.env.local

# 2. 環境変数が正しいか確認
docker compose exec frontend printenv | grep ADSENSE

# 3. コンテナ再起動
docker compose restart frontend

# 4. ブラウザのキャッシュをクリア（Ctrl + Shift + R）
```

---

### Q2: 審査が長期間（3週間以上）進まない

**原因:**
- サイトがAdSenseポリシーに違反している
- Googlebotがサイトをクロールできていない

**解決方法:**
1. **AdSenseポリシーの確認**
   - [AdSenseプログラムポリシー](https://support.google.com/adsense/answer/48182)を再確認

2. **robots.txtの確認**
   ```
   User-agent: Googlebot
   Allow: /
   ```

3. **Google Search Consoleで確認**
   - クロールエラーがないか確認
   - サイトマップが正しく送信されているか確認

4. **再審査申請**
   - AdSenseダッシュボードから再申請

---

### Q3: 審査に落ちた（却下された）

**主な却下理由:**
- コンテンツ不足（記事数・文字数）
- 低品質なコンテンツ
- ポリシー違反（禁止コンテンツ）
- 技術的問題（クロールエラー等）

**解決方法:**
1. **却下理由を確認**
   - AdSenseダッシュボードで詳細を確認

2. **問題を修正**
   - 記事を追加・改善
   - ポリシー違反箇所を修正
   - 技術的問題を解決

3. **再申請**
   - 最低2週間空けてから再申請推奨

---

### Q4: 広告が表示されない（審査合格後）

**原因:**
- `STATUS=pending`のまま
- 広告ユニットIDが未設定
- 初回表示までに時間がかかっている

**解決方法:**
```bash
# 1. 環境変数を確認
cat frontend/.env.local
# → STATUS=approved になっているか？

# 2. コンテナ再起動
docker compose restart frontend

# 3. 数時間〜1日待つ
# → AdSenseは初回表示まで時間がかかる場合がある

# 4. AdSenseダッシュボードで確認
# → 広告配信が開始されているか確認
```

---

### Q5: 本番環境でも広告が表示されない

**原因:**
- Content Security Policy（CSP）で広告スクリプトがブロックされている
- Ad Blockerが有効になっている

**解決方法:**
1. **CSPの確認**
   - `next.config.js`でCSP設定を確認
   - AdSense関連のドメインを許可

2. **Ad Blockerを無効化**
   - ブラウザのAd Blocker拡張機能を無効化してテスト

3. **開発者ツールでエラー確認**
   - F12 > Consoleでエラーメッセージを確認

---

### Q6: 広告クリック率（CTR）が低い

**原因:**
- 広告配置が適切でない
- コンテンツと広告の関連性が低い

**改善方法:**
1. **A/Bテストの実施**
   - Phase 8-6で広告配置のA/Bテストを実施予定

2. **広告サイズの最適化**
   - レスポンシブ広告を使用
   - 画面サイズに応じた最適サイズを表示

3. **コンテンツの改善**
   - ユーザーに価値あるコンテンツを提供
   - 関連性の高い記事を作成

---

## 📚 参考リンク

### Google公式ドキュメント

- [AdSenseへのお申し込み](https://support.google.com/adsense/answer/3180977?hl=ja)
- [サイトをAdSenseにリンクする](https://support.google.com/adsense/answer/7584263?hl=ja)
- [AdSenseプログラムポリシー](https://support.google.com/adsense/answer/48182)
- [AdSenseコードを取得してコピーする](https://support.google.com/adsense/answer/9274019?hl=ja)

### ToolRadar関連ドキュメント

- [Phase 8-5 引き継ぎ文書](../docs/phase8-5_handoff.md)（存在する場合）
- [ToolRadar 実装ガイド v2.0](../docs/implementation_guide_v2.md)（存在する場合）

---

## ⚠️ 重要な注意事項

### セキュリティ

- ✅ 審査コード（meta tag）は安全（公開情報）
- ✅ パブリッシャーIDも公開情報
- ⚠️ Content Security Policy（CSP）は未設定（Phase 8-7で対応予定）

### パフォーマンス

- ✅ AdSenseスクリプトはクライアントサイドで動的ロード
- ✅ 審査前・審査中はスクリプト読み込みなし（高速）
- ⚠️ 本番環境でのCore Web Vitals未検証（Phase 8-7で対応予定）

### Google AdSense規約

- ⚠️ 広告密度: コンテンツより多くしない（Google推奨）
- ⚠️ Better Ads Standardsに準拠（確認必要）
- ⚠️ クリック誘導禁止（"クリックしてください"等の文言禁止）
- ⚠️ 自分の広告をクリックしない（規約違反 → アカウント停止）

---

**最終更新**: 2025年10月21日  
**作成者**: Claude + ユーザー  
**Phase**: Phase 8-5 ✅
