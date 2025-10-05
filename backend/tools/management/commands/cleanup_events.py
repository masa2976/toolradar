"""
古いイベントログ削除コマンド

使用方法:
    python manage.py cleanup_events
    python manage.py cleanup_events --days=30
    python manage.py cleanup_events --dry-run
    
説明:
    指定日数より古いEventLogを削除してDB容量を削減します。
    デフォルトでは30日以上前のログを削除します。
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from tools.models_stats import EventLog


class Command(BaseCommand):
    help = '古いイベントログを削除してDB容量を削減します'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='保持期間（日数）。この日数より古いログを削除（デフォルト: 30日）'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='実際に削除せず、削除対象のみ表示'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS(f'イベントログクリーンアップ'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))
        
        # 削除対象の日付
        cutoff_date = timezone.now() - timedelta(days=days)
        
        self.stdout.write(f'保持期間: {days}日')
        self.stdout.write(f'削除対象: {cutoff_date.strftime("%Y-%m-%d %H:%M")} より前のログ\n')
        
        # 削除対象のイベントログを取得
        old_events = EventLog.objects.filter(created_at__lt=cutoff_date)
        total_count = old_events.count()
        
        if total_count == 0:
            self.stdout.write(self.style.SUCCESS('削除対象のイベントログはありません'))
            return
        
        # イベント種別ごとの件数を表示
        event_types = old_events.values('event_type').distinct()
        
        self.stdout.write('削除対象の内訳:')
        for event_type_dict in event_types:
            event_type = event_type_dict['event_type']
            count = old_events.filter(event_type=event_type).count()
            self.stdout.write(f'  - {event_type}: {count:,}件')
        
        self.stdout.write(f'\n合計削除対象: {total_count:,}件\n')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN モード: 実際には削除しません'))
        else:
            # 確認メッセージ
            self.stdout.write(self.style.WARNING(f'本当に{total_count:,}件のログを削除しますか？'))
            
            # 実際に削除
            deleted_count, deleted_details = old_events.delete()
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ {deleted_count:,}件のログを削除しました'))
            
            # 削除の詳細を表示
            if deleted_details:
                self.stdout.write('\n削除詳細:')
                for model, count in deleted_details.items():
                    self.stdout.write(f'  - {model}: {count:,}件')
        
        # 残存ログ数を表示
        remaining_count = EventLog.objects.count()
        self.stdout.write(f'\n残存ログ数: {remaining_count:,}件')
        
        self.stdout.write(f'\n{"="*60}')
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN モード: 変更は保存されていません'))
        else:
            self.stdout.write(self.style.SUCCESS('クリーンアップが完了しました！'))
        self.stdout.write(f'{"="*60}\n')
