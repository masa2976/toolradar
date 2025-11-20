# Phase 1: EventLog自動クリーンアップ設定ガイド

## 📋 概要
このガイドでは、EventLogの自動クリーンアップ機能を設定します。

## ✅ 既に実装済みの内容

### 1. cleanup_eventsコマンドの拡張
- ✅ テーブルサイズ表示機能
- ✅ 大量削除時のメール通知機能（10万件以上）
- ✅ 詳細な統計情報表示

**テスト実行:**
```bash
# ドライラン（実際には削除しない）
docker compose exec backend python manage.py cleanup_events --dry-run

# 30日より古いログを削除
docker compose exec backend python manage.py cleanup_events

# 60日より古いログを削除
docker compose exec backend python manage.py cleanup_events --days=60
```

### 2. Admin画面の統計ダッシュボード
- ✅ EventLogAdminにchangelist_viewメソッド追加
- ✅ テーブルサイズ、総イベント数、直近7日/30日の統計表示
- ✅ イベント種別ごとの内訳表示

**確認方法:**
1. http://localhost:8000/admin/ にアクセス
2. 「Event logs」をクリック
3. 上部に統計情報が表示されます

## 🔧 手動セットアップが必要な項目

### 3. cron自動化設定

**Linux/Mac/WSL:**
```bash
# crontabを編集
crontab -e

# 以下を追加（毎週日曜深夜3時に実行）
0 3 * * 0 cd /home/kwwit/Desktop/trading-tools-platform && docker compose exec -T backend python manage.py cleanup_events >> /var/log/toolradar/cleanup.log 2>&1
```

**Windows (タスクスケジューラ):**
1. タスクスケジューラを開く
2. 「基本タスクの作成」をクリック
3. 名前: `ToolRadar EventLog Cleanup`
4. トリガー: 毎週日曜日 午前3:00
5. 操作: プログラムの開始
   - プログラム: `C:\Windows\System32\wsl.exe`
   - 引数: `-e bash -c "cd /mnt/c/Users/kwwit/Desktop/trading-tools-platform && docker compose exec -T backend python manage.py cleanup_events"`

### 4. ログディレクトリの作成

```bash
# ログディレクトリを作成
sudo mkdir -p /var/log/toolradar
sudo chmod 755 /var/log/toolradar

# または、プロジェクトディレクトリ内に作成
mkdir -p logs
```

### 5. ログローテーション設定

**Linux/Mac:**
```bash
# 設定ファイルをコピー
sudo cp config/logrotate.conf /etc/logrotate.d/toolradar

# 権限設定
sudo chmod 644 /etc/logrotate.d/toolradar

# テスト実行
sudo logrotate -d /etc/logrotate.d/toolradar
```

**Windows:**
ログローテーションの代わりに、定期的にログファイルを手動で管理するか、
PowerShellスクリプトを作成してタスクスケジューラで実行します。

### 6. メール通知設定

Djangoの`settings.py`にメール設定を追加：

```python
# config/settings.py

# メール設定（Gmail使用例）
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'  # アプリパスワード
DEFAULT_FROM_EMAIL = 'noreply@toolradar.jp'
ADMINS = [('Admin', 'admin@toolradar.jp')]

# または開発時はコンソール出力
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

**Gmail アプリパスワードの取得:**
1. Googleアカウント → セキュリティ
2. 2段階認証を有効化
3. アプリパスワードを生成
4. 生成されたパスワードを`EMAIL_HOST_PASSWORD`に設定

## 📊 監視・確認方法

### 統計情報の確認
```bash
# 現在のEventLog件数
docker compose exec backend python manage.py shell -c "from tools.models import EventLog; print(f'Total: {EventLog.objects.count()}')"

# テーブルサイズ確認
docker compose exec db psql -U postgres -d toolradar -c "SELECT pg_size_pretty(pg_total_relation_size('tools_eventlog'));"
```

### ログ確認
```bash
# クリーンアップログ確認
tail -f /var/log/toolradar/cleanup.log

# または
tail -f logs/cleanup.log
```

### cron実行確認
```bash
# cronログ確認（Linux）
grep CRON /var/log/syslog | grep cleanup

# 手動でテスト実行
docker compose exec backend python manage.py cleanup_events --dry-run
```

## ⚠️ トラブルシューティング

### メール送信エラー
```
⚠️ メール送信エラー: [Errno 111] Connection refused
```
**対処法:**
- メール設定が正しいか確認
- ファイアウォールでSMTPポート(587)が開いているか確認
- 開発時は`EMAIL_BACKEND = 'console'`に変更

### Permission denied エラー
```bash
# ログディレクトリの権限を確認・修正
sudo chown -R $USER:$USER /var/log/toolradar
sudo chmod 755 /var/log/toolradar
```

### cron が実行されない
```bash
# cronサービスの状態確認
sudo service cron status

# cronログ確認
grep CRON /var/log/syslog

# 手動実行でテスト
cd /home/kwwit/Desktop/trading-tools-platform && docker compose exec -T backend python manage.py cleanup_events
```

## 📝 今後の拡張予定

### Phase 2: 保持期間延長（3ヶ月後）
- 月間PV 10万超えたら90日に延長
- 四半期トレンド分析対応

### Phase 3: パーティショニング導入（1年後）
- 月間PV 100万超えたら検討
- 月次パーティショニングで高速削除

## 🎯 チェックリスト

- [ ] cleanup_eventsコマンドのドライラン実行
- [ ] Admin画面の統計情報表示確認
- [ ] ログディレクトリ作成
- [ ] cron設定（Linux/Mac）またはタスクスケジューラ設定（Windows）
- [ ] メール通知設定
- [ ] ログローテーション設定（Linux/Mac）
- [ ] 初回実行テスト
- [ ] 1週間後にcron実行確認

---
**最終更新:** 2025年1月
**ステータス:** Phase 1 実装完了、手動セットアップ待ち
