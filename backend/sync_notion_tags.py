#!/usr/bin/env python
"""Notionタグマスターを同期するスクリプト"""
import os
import sys
import django

# Djangoセットアップ
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
sys.path.insert(0, '/app')
django.setup()

from tags.models import Tag

# Notionから取得したタグデータ（2025-12-12 最新取得）
notion_tags = [
    {"name": "RSI", "slug": "rsi", "category": "technical_indicator", "synonyms": ["アールエスアイ", "相対力指数"]},
    {"name": "デイトレード", "slug": "day-trade", "category": "trade_style", "synonyms": ["Day Trade", "デイトレ"]},
    {"name": "ATR", "slug": "atr", "category": "technical_indicator", "synonyms": ["Average True Range", "アベレージトゥルーレンジ"]},
    {"name": "スイングトレード", "slug": "swing-trade", "category": "trade_style", "synonyms": ["Swing Trade", "スイング"]},
    {"name": "トレンドフォロー", "slug": "trend-follow", "category": "strategy_type", "synonyms": ["Trend Follow", "順張り"]},
    {"name": "株式", "slug": "stock", "category": "asset_type", "synonyms": ["Stock", "株"]},
    {"name": "スキャルピング", "slug": "scalping", "category": "trade_style", "synonyms": ["Scalping", "スキャ"]},
    {"name": "ポンド円", "slug": "gbpjpy", "category": "currency_pair", "synonyms": ["GBPJPY", "GBP/JPY"]},
    {"name": "MACD", "slug": "macd", "category": "technical_indicator", "synonyms": ["マックディー"]},
    {"name": "ボリンジャーバンド", "slug": "bollinger-bands", "category": "technical_indicator", "synonyms": ["BB", "Bollinger Bands"]},
    {"name": "ブレイクアウト", "slug": "breakout", "category": "strategy_type", "synonyms": ["Breakout"]},
    {"name": "仮想通貨", "slug": "crypto", "category": "asset_type", "synonyms": ["Crypto", "暗号資産", "ビットコイン"]},
    {"name": "逆張り", "slug": "counter-trend", "category": "strategy_type", "synonyms": ["Counter Trend", "カウンタートレンド"]},
    {"name": "ビットコイン", "slug": "bitcoin", "category": "asset_type", "synonyms": ["Bitcoin", "BTC", "BTCUSD"]},
    {"name": "資金管理", "slug": "money-management", "category": "strategy_type", "synonyms": ["Money Management", "MM", "リスク管理"]},
    {"name": "マーチンゲール", "slug": "martingale", "category": "strategy_type", "synonyms": ["Martingale", "ナンピン"]},
    {"name": "一目均衡表", "slug": "ichimoku", "category": "technical_indicator", "synonyms": ["Ichimoku", "雲"]},
    {"name": "ポンドドル", "slug": "gbpusd", "category": "currency_pair", "synonyms": ["GBPUSD", "GBP/USD"]},
    {"name": "FX", "slug": "fx", "category": "asset_type", "synonyms": ["外国為替", "Forex", "為替"]},
    {"name": "移動平均", "slug": "moving-average", "category": "technical_indicator", "synonyms": ["MA", "SMA", "EMA", "単純移動平均", "指数移動平均"]},
    {"name": "ストキャスティクス", "slug": "stochastic", "category": "technical_indicator", "synonyms": ["Stochastic", "ストキャス"]},
    {"name": "ユーロドル", "slug": "eurusd", "category": "currency_pair", "synonyms": ["EURUSD", "EUR/USD"]},
    {"name": "ドル円", "slug": "usdjpy", "category": "currency_pair", "synonyms": ["USDJPY", "USD/JPY"]},
    {"name": "ポジショントレード", "slug": "position-trade", "category": "trade_style", "synonyms": ["Position Trade", "長期保有"]},
    {"name": "ゴールド", "slug": "gold", "category": "asset_type", "synonyms": ["Gold", "金", "XAUUSD"]},
    {"name": "ユーロ円", "slug": "eurjpy", "category": "currency_pair", "synonyms": ["EURJPY", "EUR/JPY"]},
    {"name": "ニューラルネットワーク", "slug": "neural-network", "category": "strategy_type", "synonyms": ["Neural Network", "NN", "AI", "機械学習", "Machine Learning"]},
    {"name": "グリッド", "slug": "grid", "category": "strategy_type", "synonyms": ["Grid", "グリッドトレード"]},
    {"name": "バックテスト", "slug": "backtest", "category": "strategy_type", "synonyms": ["Backtest", "検証", "ストラテジーテスター"]},
    {"name": "トレーリング", "slug": "trailing", "category": "strategy_type", "synonyms": ["Trailing", "トレール", "追従", "Trailing Stop"]},
    {"name": "オーダーフロー", "slug": "order-flow", "category": "technical_indicator", "synonyms": ["Order Flow", "注文フロー"]},
    {"name": "モメンタム", "slug": "momentum", "category": "technical_indicator", "synonyms": ["Momentum", "MOM", "勢い"]},
    {"name": "チャートパターン", "slug": "chart-pattern", "category": "technical_indicator", "synonyms": ["Chart Pattern", "ダブルトップ", "ダブルボトム", "ヘッドアンドショルダー", "三尊"]},
    {"name": "サポート・レジスタンス", "slug": "support-resistance", "category": "technical_indicator", "synonyms": ["サポレジ", "Support Resistance", "S/R", "支持線", "抵抗線"]},
    {"name": "出来高", "slug": "volume", "category": "technical_indicator", "synonyms": ["Volume", "ボリューム", "売買高"]},
    {"name": "ヘッジ", "slug": "hedge", "category": "strategy_type", "synonyms": ["Hedge", "Hedging", "両建て"]},
    {"name": "FVG", "slug": "fvg", "category": "technical_indicator", "synonyms": ["Fair Value Gap", "フェアバリューギャップ", "インバランス"]},
]

def main():
    created = 0
    updated = 0
    notion_slugs = []

    print("=" * 50)
    print("Notionタグマスター同期開始")
    print("=" * 50)

    for tag_data in notion_tags:
        notion_slugs.append(tag_data['slug'])
        
        # slugまたはnameで検索
        existing = Tag.objects.filter(slug=tag_data['slug']).first()
        if not existing:
            existing = Tag.objects.filter(name=tag_data['name']).first()
        
        if existing:
            old_slug = existing.slug
            existing.name = tag_data['name']
            existing.slug = tag_data['slug']
            existing.category = tag_data['category']
            existing.synonyms = tag_data['synonyms']
            existing.save()
            updated += 1
            if old_slug != tag_data['slug']:
                print(f"✅ 更新: {tag_data['name']} ({old_slug} → {tag_data['slug']})")
        else:
            Tag.objects.create(
                name=tag_data['name'],
                slug=tag_data['slug'],
                category=tag_data['category'],
                synonyms=tag_data['synonyms']
            )
            created += 1
            print(f"🆕 作成: {tag_data['name']} ({tag_data['slug']})")

    print("\n" + "=" * 50)
    print(f"同期完了: 作成 {created}件, 更新 {updated}件")
    print(f"Notionタグ数: {len(notion_tags)}件")
    print(f"DB総タグ数: {Tag.objects.count()}件")

    # Notionにないタグを表示
    old_tags = Tag.objects.exclude(slug__in=notion_slugs)
    if old_tags.exists():
        print(f"\n⚠️ Notionに存在しない古いタグ ({old_tags.count()}件):")
        for tag in old_tags:
            print(f"  - {tag.name} ({tag.slug})")
    print("=" * 50)

if __name__ == '__main__':
    main()
