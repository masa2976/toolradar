"""
週間統計更新コマンド

使用方法:
    python manage.py update_weekly_stats
    
説明:
    直近7日間のEventLogから週間統計を集計し、ToolStatsを更新します。
    - 週間PV数、CTAクリック数、シェア数、平均滞在時間を計算
    - 週間スコアを計算
    - 順位を更新（前週順位も保存）
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count, Avg, Q
from datetime import timedelta
from tools.models import Tool
from tools.models_stats import ToolStats, EventLog


class Command(BaseCommand):
    help = '週間統計を更新し、ランキングを計算します'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='集計対象日数（デフォルト: 7日間）'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='実際に保存せず、結果のみ表示'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS(f'週間統計更新開始（過去{days}日間）'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))
        
        # 集計期間
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        self.stdout.write(f'集計期間: {start_date.strftime("%Y-%m-%d %H:%M")} 〜 {end_date.strftime("%Y-%m-%d %H:%M")}\n')
        
        # 全ツールを取得
        tools = Tool.objects.all()
        self.stdout.write(f'対象ツール数: {tools.count()}\n')
        
        updated_count = 0
        
        for tool in tools:
            # 期間内のイベントを集計
            events = EventLog.objects.filter(
                tool=tool,
                created_at__gte=start_date,
                created_at__lte=end_date
            )
            
            # PV数（viewイベント）
            week_views = events.filter(event_type='view').count()
            
            # CTAクリック数（clickイベント）
            week_clicks = events.filter(event_type='click').count()
            
            # シェア数（shareイベント）
            week_shares = events.filter(event_type='share').count()
            
            # 平均滞在時間（durationイベント、10秒以上のみ）
            duration_events = events.filter(
                event_type='duration',
                duration_seconds__gte=10
            )
            avg_duration = duration_events.aggregate(
                avg=Avg('duration_seconds')
            )['avg'] or 0.0
            
            # ToolStatsを取得または作成
            stats, created = ToolStats.objects.get_or_create(tool=tool)
            
            # 前週順位を保存（順位が変わる前に）
            if stats.current_rank is not None:
                stats.prev_week_rank = stats.current_rank
            
            # 統計を更新
            stats.week_views = week_views
            stats.week_clicks = week_clicks
            stats.week_shares = week_shares
            stats.week_avg_duration = round(avg_duration, 2)
            
            # スコア計算
            old_score = stats.week_score
            stats.calculate_score()
            
            if not dry_run:
                stats.save()
            
            updated_count += 1
            
            # 進捗表示（変化があったもののみ）
            if week_views > 0 or week_clicks > 0 or week_shares > 0 or avg_duration > 0:
                self.stdout.write(
                    f'  ✓ {tool.name}: '
                    f'PV={week_views}, Click={week_clicks}, Share={week_shares}, '
                    f'Duration={avg_duration:.1f}s, '
                    f'Score={old_score:.1f}→{stats.week_score:.1f}'
                )
        
        self.stdout.write(f'\n統計更新完了: {updated_count}件\n')
        
        # 順位を計算
        self.stdout.write('順位計算中...\n')
        
        # スコア順にソート
        ranked_stats = ToolStats.objects.all().order_by('-week_score', 'tool__name')
        
        for rank, stats in enumerate(ranked_stats, start=1):
            old_rank = stats.current_rank
            stats.current_rank = rank
            
            if not dry_run:
                stats.save()
            
            # TOP50のみ表示
            if rank <= 50:
                change = stats.get_rank_change()
                self.stdout.write(
                    f'  {rank:2d}位: {stats.tool.name:30s} '
                    f'(Score: {stats.week_score:6.1f}, Change: {change})'
                )
        
        self.stdout.write(f'\n{"="*60}')
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN モード: 変更は保存されていません'))
        else:
            self.stdout.write(self.style.SUCCESS('週間統計更新が完了しました！'))
        self.stdout.write(f'{"="*60}\n')
