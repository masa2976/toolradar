"""
イベントログクリーンアップスケジューラー

APSchedulerを使用して定期的にcleanup_eventsを実行
"""
import os
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from django.core.management import call_command

logger = logging.getLogger(__name__)


def cleanup_old_events():
    """
    古いイベントログをクリーンアップ
    
    このジョブは毎週日曜日の深夜3時に実行されます。
    """
    try:
        logger.info("=== イベントログクリーンアップ開始 ===")
        call_command('cleanup_events')
        logger.info("=== イベントログクリーンアップ完了 ===")
    except Exception as e:
        logger.error(f"イベントログクリーンアップエラー: {e}", exc_info=True)


def update_weekly_stats():
    """
    週間統計を更新
    
    このジョブは毎日深夜2時に実行されます。
    ローリング7日間のデータを集計し、ランキングを更新します。
    """
    try:
        logger.info("=== 週間統計更新開始 ===")
        call_command('update_weekly_stats')
        logger.info("=== 週間統計更新完了 ===")
    except Exception as e:
        logger.error(f"週間統計更新エラー: {e}", exc_info=True)


def start_scheduler():
    """
    スケジューラーを開始
    
    登録されるジョブ:
    - 週間統計更新: 毎日深夜2時に実行（ローリング7日間集計）
    - イベントログクリーンアップ: 毎週日曜日深夜3時に実行
    
    Django起動時に1度だけ呼ばれる
    """
    # 開発環境やrunserver_plusでは無効化（デバッグ時の多重起動を防ぐ）
    if settings.DEBUG:
        import sys
        # runserver の reloader プロセスでは実行しない
        if 'runserver' in sys.argv and os.environ.get('RUN_MAIN') != 'true':
            logger.info("スケジューラー: runserverのreloaderプロセスのためスキップ")
            return
    
    scheduler = BackgroundScheduler()
    
    # 既に登録されているか確認（多重登録を防ぐ）
    job_id = 'cleanup_old_events'
    if not scheduler.get_job(job_id):
        # 毎週日曜日の深夜3時に実行
        scheduler.add_job(
            cleanup_old_events,
            trigger=CronTrigger(day_of_week='sun', hour=3, minute=0),
            id=job_id,
            name='イベントログクリーンアップ',
            replace_existing=True,
            max_instances=1  # 同時実行を1つに制限
        )
        logger.info("スケジューラー: イベントログクリーンアップジョブを登録しました")
        logger.info("スケジュール: 毎週日曜日 03:00 JST")
    
    # 週間統計更新ジョブ（毎日深夜2時に実行）
    stats_job_id = 'update_weekly_stats'
    if not scheduler.get_job(stats_job_id):
        scheduler.add_job(
            update_weekly_stats,
            trigger=CronTrigger(hour=2, minute=0),
            id=stats_job_id,
            name='週間統計更新',
            replace_existing=True,
            max_instances=1
        )
        logger.info("スケジューラー: 週間統計更新ジョブを登録しました")
        logger.info("スケジュール: 毎日 02:00 JST")
    
    # スケジューラーを開始
    if not scheduler.running:
        scheduler.start()
        logger.info("スケジューラー: 起動しました")
    
    return scheduler
