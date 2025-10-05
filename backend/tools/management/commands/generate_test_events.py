"""
テストイベントデータ生成コマンド

使用方法:
    python manage.py generate_test_events
    python manage.py generate_test_events --events=1000
    python manage.py generate_test_events --tools=5 --events=500
    python manage.py generate_test_events --days=30
    
説明:
    ランキングアルゴリズムのテストやフロントエンド開発用に、
    大量のランダムなイベントログを生成します。
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from tools.models import Tool
from tools.models_stats import EventLog


class Command(BaseCommand):
    help = 'テスト用のイベントログを大量生成します'
    
    # イベント生成の重み付け
    EVENT_WEIGHTS = {
        'view': 70,      # PVが最も多い
        'duration': 20,  # 滞在時間は中程度
        'share': 10,     # シェアは少なめ
    }
    
    # シェアプラットフォームの選択肢
    SHARE_PLATFORMS = ['twitter', 'facebook', 'line', 'copy']
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--events',
            type=int,
            default=100,
            help='生成するイベント数（デフォルト: 100）'
        )
        parser.add_argument(
            '--tools',
            type=int,
            default=None,
            help='対象ツール数（デフォルト: 全ツール）'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='イベント分散期間（直近N日間に分散、デフォルト: 7日）'
        )
        parser.add_argument(
            '--clean',
            action='store_true',
            help='生成前に既存のテストデータを削除'
        )
    
    def handle(self, *args, **options):
        events_count = options['events']
        tools_limit = options['tools']
        days = options['days']
        clean = options['clean']
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS(f'テストイベントデータ生成'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))
        
        # ツール取得
        tools = Tool.objects.all()
        if tools_limit:
            tools = tools[:tools_limit]
        
        tools_list = list(tools)
        tools_count = len(tools_list)
        
        if tools_count == 0:
            self.stdout.write(self.style.ERROR('エラー: ツールが存在しません'))
            return
        
        self.stdout.write(f'対象ツール数: {tools_count}')
        self.stdout.write(f'生成イベント数: {events_count:,}')
        self.stdout.write(f'分散期間: 直近{days}日間\n')
        
        # 既存データ削除
        if clean:
            deleted_count = EventLog.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f'既存データ削除: {deleted_count:,}件\n'))
        
        # イベント生成
        self.stdout.write('イベント生成中...\n')
        
        created_events = {
            'view': 0,
            'duration': 0,
            'share': 0,
        }
        
        # 期間の開始・終了
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # バッチ処理用のリスト
        events_to_create = []
        
        for i in range(events_count):
            # ランダムにツール選択
            tool = random.choice(tools_list)
            
            # イベント種別を重み付きでランダム選択
            event_type = random.choices(
                list(self.EVENT_WEIGHTS.keys()),
                weights=list(self.EVENT_WEIGHTS.values()),
                k=1
            )[0]
            
            # ランダムな日時（指定期間内）
            random_seconds = random.randint(0, days * 24 * 60 * 60)
            created_at = start_date + timedelta(seconds=random_seconds)
            
            # イベント作成
            event_data = {
                'tool': tool,
                'event_type': event_type,
                'created_at': created_at,
                'user_agent': 'TestAgent/1.0',
                'ip_address': f'192.168.{random.randint(0, 255)}.{random.randint(1, 254)}',
            }
            
            # イベント種別ごとの追加データ
            if event_type == 'duration':
                # 滞在時間: 10秒〜600秒（10分）
                event_data['duration_seconds'] = random.randint(10, 600)
            elif event_type == 'share':
                # シェアプラットフォーム
                event_data['share_platform'] = random.choice(self.SHARE_PLATFORMS)
            
            events_to_create.append(EventLog(**event_data))
            created_events[event_type] += 1
            
            # プログレス表示（100件ごと）
            if (i + 1) % 100 == 0:
                self.stdout.write(f'  生成中... {i + 1:,} / {events_count:,}')
        
        # バルクインサート（高速）
        EventLog.objects.bulk_create(events_to_create, batch_size=500)
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ {events_count:,}件のイベントを生成しました\n'))
        
        # 統計表示
        self.stdout.write('生成イベント内訳:')
        for event_type, count in created_events.items():
            percentage = (count / events_count) * 100
            self.stdout.write(f'  - {event_type}: {count:,}件 ({percentage:.1f}%)')
        
        # ツール別の分布を表示（TOP10）
        self.stdout.write('\nツール別イベント数（TOP10）:')
        from django.db.models import Count
        tool_stats = EventLog.objects.values('tool__name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        for i, stat in enumerate(tool_stats, 1):
            self.stdout.write(f'  {i:2d}. {stat["tool__name"]:30s}: {stat["count"]:,}件')
        
        # 期間内の分布確認
        total_events = EventLog.objects.count()
        recent_events = EventLog.objects.filter(created_at__gte=start_date).count()
        
        self.stdout.write(f'\n総イベント数: {total_events:,}件')
        self.stdout.write(f'直近{days}日間: {recent_events:,}件')
        
        self.stdout.write(f'\n{"="*60}')
        self.stdout.write(self.style.SUCCESS('テストデータ生成が完了しました！'))
        self.stdout.write(self.style.WARNING('\n次のステップ: python manage.py update_weekly_stats を実行してランキングを更新'))
        self.stdout.write(f'{"="*60}\n')
