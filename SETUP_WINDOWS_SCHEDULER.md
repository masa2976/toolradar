# ⏰ APScheduler セットアップガイド（Windows対応）

## 📋 概要

ToolRadarでは **APScheduler** を使用して、イベントログのクリーンアップを自動実行します。

### ✅ 実装済みの機能

- ✅ **自動クリーンアップ**: 毎週日曜日 深夜3時に実行
- ✅ **Windows対応**: Docker内でスケジューラーが動作
- ✅ **ログ管理**: 専用ログファイルで実行履歴を記録
- ✅ **手動実行**: Admin画面からも実行可能

---

## 🚀 スケジューラーの起動

### 自動起動（推奨）

Django起動時に **自動的に** スケジューラーが起動します。

```bash
# Dockerコンテナを起動
docker compose up -d

# ログで起動確認
docker compose logs backend | grep "スケジューラー"
```

期待される出力:
```
backend-1  | INFO ... ToolsConfig: スケジューラーを起動しました
backend-1  | INFO ... スケジューラー: イベントログクリーンアップジョブを登録しました
backend-1  | INFO ... スケジュール: 毎週日曜日 03:00 JST
backend-1  | INFO ... スケジューラー: 起動しました
```

---

## 📊 実行スケジュール

| ジョブ名 | 実行タイミング | 処理内容 |
|---------|--------------|---------|
| イベントログクリーンアップ | 毎週日曜 03:00 JST | 30日以上古いログを削除 |

---

## 🔍 ログの確認

### スケジューラーログ

```bash
# ログファイルの確認
docker compose exec backend cat logs/scheduler.log

# リアルタイムで監視
docker compose exec backend tail -f logs/scheduler.log
```

### 実行履歴の確認

Admin画面で統計情報を確認:
```
http://localhost:8000/admin/tools/eventlog/
```

---

## 🛠 トラブルシューティング

### スケジューラーが起動しない場合

**1. ログを確認**
```bash
docker compose logs backend | grep -i "scheduler\|スケジューラー"
```

**2. コンテナを再起動**
```bash
docker compose restart backend
```

**3. APSchedulerがインストールされているか確認**
```bash
docker compose exec backend pip show APScheduler
```

### ジョブが実行されない場合

**1. スケジューラーのステータス確認**
```bash
docker compose exec backend python manage.py shell
```

```python
from tools.scheduler import start_scheduler
scheduler = start_scheduler()
print(scheduler.get_jobs())
```

**2. タイムゾーン確認**
```bash
docker compose exec backend python manage.py shell
```

```python
from django.utils import timezone
print(timezone.now())  # 現在時刻（JST）
```

---

## 🧪 テスト実行

### 手動でジョブを実行

**方法1: Django管理コマンド**
```bash
docker compose exec backend python manage.py cleanup_events
```

**方法2: Admin画面アクション**
1. http://localhost:8000/admin/tools/eventlog/ にアクセス
2. イベントログを選択（全選択不要）
3. アクション「🗑️ 古いログをクリーンアップ（実行）」を選択
4. 「実行」をクリック

**方法3: Pythonシェル**
```bash
docker compose exec backend python manage.py shell
```

```python
from tools.scheduler import cleanup_old_events
cleanup_old_events()
```

---

## ⚙️ カスタマイズ

### 実行時刻の変更

`backend/tools/scheduler.py` の以下の行を編集:

```python
# 毎週日曜日の深夜3時 → 毎日深夜2時に変更
scheduler.add_job(
    cleanup_old_events,
    trigger=CronTrigger(hour=2, minute=0),  # day_of_weekを削除
    id=job_id,
    name='イベントログクリーンアップ',
    replace_existing=True,
    max_instances=1
)
```

### 保持期間の変更

`backend/tools/management/commands/cleanup_events.py` の `--days` オプションを変更:

```python
# デフォルトを30日 → 60日に変更
parser.add_argument(
    '--days',
    type=int,
    default=60,  # ← ここを変更
    help='何日より古いログを削除するか（デフォルト: 60）'
)
```

---

## 📌 重要な注意事項

### ⚠️ 開発環境での動作

開発環境（`DEBUG=True`）では、runserverの自動リロード機能により、スケジューラーが **二重起動** する可能性があります。

これは正常な動作で、以下のログが表示されます:

```
backend-1  | INFO スケジューラー: runserverのreloaderプロセスのためスキップ
```

### ⚠️ 本番環境での注意点

本番環境（Gunicorn/uWSGI使用時）では、複数のワーカープロセスが起動します。

スケジューラーは **1つのプロセスのみ** で起動するよう設定済みですが、念のため確認してください。

---

## 🎯 次のステップ

1. ✅ スケジューラーが正常に起動しているか確認
2. ✅ ログファイルで実行履歴を確認
3. ✅ テスト実行で動作を確認
4. ⏭️ 必要に応じて実行時刻・保持期間をカスタマイズ

---

## 📚 関連ドキュメント

- [知識ベース4_運用ガイド](./知識ベース4_運用ガイド.md)
- [知識ベース5_作業ログ](./知識ベース5_作業ログ.md)
- [SETUP_PHASE1.md](./SETUP_PHASE1.md)

---

**最終更新**: 2025年1月
