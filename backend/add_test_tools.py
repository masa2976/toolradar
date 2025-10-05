#!/usr/bin/env python
"""
テストツールデータ追加スクリプト
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.tools.models import Tool
from apps.tags.models import Tag

def add_test_tools():
    print("=" * 60)
    print("テストツールデータ追加開始")
    print("=" * 60)
    
    # 既存ツール確認
    existing_count = Tool.objects.count()
    print(f"\n現在のツール数: {existing_count}件")
    
    # タグ取得
    try:
        tag_grid = Tag.objects.get(slug='grid')
        tag_scalping = Tag.objects.get(slug='scalping')
        tag_ma = Tag.objects.get(slug='ma')
        tag_rsi = Tag.objects.get(slug='rsi')
        print("✓ タグ取得成功")
    except Tag.DoesNotExist as e:
        print(f"✗ エラー: 必要なタグが見つかりません - {e}")
        return
    
    # ツール3: Scalping Master Pro
    tool3, created = Tool.objects.get_or_create(
        slug="scalping-master-pro",
        defaults={
            'name': "Scalping Master Pro",
            'short_description': "高速スキャルピング専用EA。1分足で利益を積み重ねます。",
            'long_description': "1分足チャートで高速スキャルピングを行うEAです。ボラティリティが高い時間帯に特化した設計。",
            'platform': ['mt4', 'mt5'],
            'tool_type': 'EA',
            'price_type': 'paid',
            'price': '199.00',
            'ribbons': ['featured'],
            'image_url': 'https://via.placeholder.com/400x225/3b82f6/ffffff?text=Scalping+Master',
            'external_url': 'https://example.com/scalping-master',
            'metadata': {
                'developer': 'ScalpingPro Inc.',
                'version': '2.1.0',
                'last_updated': '2025-09-15'
            }
        }
    )
    if created:
        tool3.tags.add(tag_scalping, tag_ma)
        print(f"✓ {tool3.name} を追加しました")
    else:
        print(f"  {tool3.name} は既に存在します")
    
    # ツール4: Trend Follower EA
    tool4, created = Tool.objects.get_or_create(
        slug="trend-follower-ea",
        defaults={
            'name': "Trend Follower EA",
            'short_description': "トレンドフォロー戦略で安定した利益を目指します。",
            'long_description': "移動平均線を使用したシンプルなトレンドフォローEA。初心者から上級者まで幅広く対応。",
            'platform': ['mt5', 'tradingview'],
            'tool_type': 'EA',
            'price_type': 'free',
            'ribbons': [],
            'image_url': 'https://via.placeholder.com/400x225/10b981/ffffff?text=Trend+Follower',
            'external_url': 'https://example.com/trend-follower',
            'metadata': {
                'developer': 'TrendMaster',
                'version': '1.5.2',
                'last_updated': '2025-08-20'
            }
        }
    )
    if created:
        tool4.tags.add(tag_ma)
        print(f"✓ {tool4.name} を追加しました")
    else:
        print(f"  {tool4.name} は既に存在します")
    
    # ツール5: Multi Timeframe Dashboard
    tool5, created = Tool.objects.get_or_create(
        slug="multi-timeframe-dashboard",
        defaults={
            'name': "Multi Timeframe Dashboard",
            'short_description': "複数時間足を一画面で確認できるダッシュボード。",
            'long_description': "1分足から日足まで、複数の時間足を同時に表示。トレンド方向を一目で把握できます。",
            'platform': ['tradingview'],
            'tool_type': 'Indicator',
            'price_type': 'freemium',
            'ribbons': [],
            'image_url': 'https://via.placeholder.com/400x225/8b5cf6/ffffff?text=MTF+Dashboard',
            'external_url': 'https://example.com/mtf-dashboard',
            'metadata': {
                'developer': 'DashboardLab',
                'version': '3.0.1',
                'last_updated': '2025-09-01'
            }
        }
    )
    if created:
        tool5.tags.add(tag_ma)
        print(f"✓ {tool5.name} を追加しました")
    else:
        print(f"  {tool5.name} は既に存在します")
    
    # ツール6: RSI Divergence Detector
    tool6, created = Tool.objects.get_or_create(
        slug="rsi-divergence-detector",
        defaults={
            'name': "RSI Divergence Detector",
            'short_description': "RSIダイバージェンスを自動検出するインジケーター。",
            'long_description': "RSIと価格のダイバージェンスを自動的に検出し、トレンド転換のシグナルを表示します。",
            'platform': ['mt4', 'mt5'],
            'tool_type': 'Indicator',
            'price_type': 'paid',
            'price': '49.99',
            'ribbons': ['new'],
            'image_url': 'https://via.placeholder.com/400x225/f59e0b/ffffff?text=RSI+Divergence',
            'external_url': 'https://example.com/rsi-divergence',
            'metadata': {
                'developer': 'IndicatorPro',
                'version': '1.2.0',
                'last_updated': '2025-09-25'
            }
        }
    )
    if created:
        tool6.tags.add(tag_rsi)
        print(f"✓ {tool6.name} を追加しました")
    else:
        print(f"  {tool6.name} は既に存在します")
    
    # ツール7: Fibonacci Auto Plotter
    tool7, created = Tool.objects.get_or_create(
        slug="fibonacci-auto-plotter",
        defaults={
            'name': "Fibonacci Auto Plotter",
            'short_description': "フィボナッチリトレースメントを自動描画するツール。",
            'long_description': "直近の高値・安値を自動検出し、フィボナッチリトレースメントを自動描画します。",
            'platform': ['tradingview'],
            'tool_type': 'Script',
            'price_type': 'free',
            'ribbons': ['popular'],
            'image_url': 'https://via.placeholder.com/400x225/06b6d4/ffffff?text=Fibonacci+Auto',
            'external_url': 'https://example.com/fibonacci-auto',
            'metadata': {
                'developer': 'ChartTools',
                'version': '2.3.1',
                'last_updated': '2025-08-10'
            }
        }
    )
    if created:
        tool7.tags.add(tag_ma)
        print(f"✓ {tool7.name} を追加しました")
    else:
        print(f"  {tool7.name} は既に存在します")
    
    # 最終確認
    final_count = Tool.objects.count()
    added_count = final_count - existing_count
    
    print(f"\n" + "=" * 60)
    print(f"ツール追加完了")
    print(f"  追加前: {existing_count}件")
    print(f"  追加後: {final_count}件")
    print(f"  新規追加: {added_count}件")
    print("=" * 60)
    
    # 全ツールリスト表示
    print("\n【全ツール一覧】")
    for i, tool in enumerate(Tool.objects.all().order_by('id'), 1):
        print(f"  {i}. {tool.name} ({tool.slug})")
        print(f"     Platform: {', '.join(tool.platform)}, Type: {tool.tool_type}, Price: {tool.price_type}")

if __name__ == '__main__':
    add_test_tools()
