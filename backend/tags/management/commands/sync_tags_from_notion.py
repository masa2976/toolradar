"""
Notionのタグマスターデータをバックエンドに同期するコマンド
"""
from django.core.management.base import BaseCommand
from tags.models import Tag


class Command(BaseCommand):
    help = 'Notionのタグマスターデータを同期'

    def handle(self, *args, **options):
        # Notionからのタグマスターデータ（2025-12-12取得）
        notion_tags = [
            # テクニカル指標 (technical_indicator)
            {"name": "RSI", "slug": "rsi", "category": "technical_indicator", "synonyms": ["アールエスアイ", "相対力指数"]},
            {"name": "MACD", "slug": "macd", "category": "technical_indicator", "synonyms": ["マックディー"]},
            {"name": "ATR", "slug": "atr", "category": "technical_indicator", "synonyms": ["Average True Range", "アベレージトゥルーレンジ"]},
            {"name": "移動平均", "slug": "moving-average", "category": "technical_indicator", "synonyms": ["MA", "SMA", "EMA", "単純移動平均", "指数移動平均"]},
            {"name": "ボリンジャーバンド", "slug": "bollinger-bands", "category": "technical_indicator", "synonyms": ["BB", "Bollinger Bands"]},
            {"name": "ストキャスティクス", "slug": "stochastic", "category": "technical_indicator", "synonyms": ["Stochastic", "ストキャス"]},
            {"name": "一目均衡表", "slug": "ichimoku", "category": "technical_indicator", "synonyms": ["Ichimoku", "雲"]},
            {"name": "モメンタム", "slug": "momentum", "category": "technical_indicator", "synonyms": ["Momentum", "MOM", "勢い"]},
            {"name": "サポート・レジスタンス", "slug": "support-resistance", "category": "technical_indicator", "synonyms": ["サポレジ", "Support Resistance", "S/R", "支持線", "抵抗線"]},
            {"name": "出来高", "slug": "volume", "category": "technical_indicator", "synonyms": ["Volume", "ボリューム", "売買高"]},
            {"name": "オーダーフロー", "slug": "order-flow", "category": "technical_indicator", "synonyms": ["Order Flow", "注文フロー"]},
            {"name": "チャートパターン", "slug": "chart-pattern", "category": "technical_indicator", "synonyms": ["Chart Pattern", "ダブルトップ", "ダブルボトム", "ヘッドアンドショルダー", "三尊"]},
            {"name": "FVG", "slug": "fvg", "category": "technical_indicator", "synonyms": ["Fair Value Gap", "フェアバリューギャップ", "インバランス"]},
            
            # トレードスタイル (trade_style)
            {"name": "スキャルピング", "slug": "scalping", "category": "trade_style", "synonyms": ["Scalping", "スキャ"]},
            {"name": "デイトレード", "slug": "day-trade", "category": "trade_style", "synonyms": ["Day Trade", "デイトレ"]},
            {"name": "スイングトレード", "slug": "swing-trade", "category": "trade_style", "synonyms": ["Swing Trade", "スイング"]},
            {"name": "ポジショントレード", "slug": "position-trade", "category": "trade_style", "synonyms": ["Position Trade", "長期保有"]},
            
            # 通貨ペア (currency_pair)
            {"name": "ドル円", "slug": "usdjpy", "category": "currency_pair", "synonyms": ["USDJPY", "USD/JPY"]},
            {"name": "ユーロドル", "slug": "eurusd", "category": "currency_pair", "synonyms": ["EURUSD", "EUR/USD"]},
            {"name": "ユーロ円", "slug": "eurjpy", "category": "currency_pair", "synonyms": ["EURJPY", "EUR/JPY"]},
            {"name": "ポンドドル", "slug": "gbpusd", "category": "currency_pair", "synonyms": ["GBPUSD", "GBP/USD"]},
            {"name": "ポンド円", "slug": "gbpjpy", "category": "currency_pair", "synonyms": ["GBPJPY", "GBP/JPY"]},
            
            # 戦略タイプ (strategy_type)
            {"name": "トレンドフォロー", "slug": "trend-follow", "category": "strategy_type", "synonyms": ["Trend Follow", "順張り"]},
            {"name": "逆張り", "slug": "counter-trend", "category": "strategy_type", "synonyms": ["Counter Trend", "カウンタートレンド"]},
            {"name": "ブレイクアウト", "slug": "breakout", "category": "strategy_type", "synonyms": ["Breakout"]},
            {"name": "マーチンゲール", "slug": "martingale", "category": "strategy_type", "synonyms": ["Martingale", "ナンピン"]},
            {"name": "グリッド", "slug": "grid", "category": "strategy_type", "synonyms": ["Grid", "グリッドトレード"]},
            {"name": "資金管理", "slug": "money-management", "category": "strategy_type", "synonyms": ["Money Management", "MM", "リスク管理"]},
            {"name": "ニューラルネットワーク", "slug": "neural-network", "category": "strategy_type", "synonyms": ["Neural Network", "NN", "AI", "機械学習", "Machine Learning"]},
            {"name": "ヘッジ", "slug": "hedge", "category": "strategy_type", "synonyms": ["Hedge", "Hedging", "両建て"]},
            {"name": "バックテスト", "slug": "backtest", "category": "strategy_type", "synonyms": ["Backtest", "検証", "ストラテジーテスター"]},
            {"name": "トレーリング", "slug": "trailing", "category": "strategy_type", "synonyms": ["Trailing", "トレール", "追従", "Trailing Stop"]},
            
            # 資産タイプ (asset_type)
            {"name": "FX", "slug": "fx", "category": "asset_type", "synonyms": ["外国為替", "Forex", "為替"]},
            {"name": "株式", "slug": "stock", "category": "asset_type", "synonyms": ["Stock", "株"]},
            {"name": "仮想通貨", "slug": "crypto", "category": "asset_type", "synonyms": ["Crypto", "暗号資産", "ビットコイン"]},
            {"name": "ゴールド", "slug": "gold", "category": "asset_type", "synonyms": ["Gold", "金", "XAUUSD"]},
            {"name": "ビットコイン", "slug": "bitcoin", "category": "asset_type", "synonyms": ["Bitcoin", "BTC", "BTCUSD"]},
        ]

        created_count = 0
        updated_count = 0

        for tag_data in notion_tags:
            # slugまたはnameで既存タグを検索
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
                updated_count += 1
                if old_slug != tag_data['slug']:
                    self.stdout.write(f"✅ 更新: {tag_data['name']} (slug: {old_slug} → {tag_data['slug']})")
                else:
                    self.stdout.write(f"✅ 更新: {tag_data['name']} (slug: {tag_data['slug']})")
            else:
                Tag.objects.create(
                    name=tag_data['name'],
                    slug=tag_data['slug'],
                    category=tag_data['category'],
                    synonyms=tag_data['synonyms']
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"🆕 作成: {tag_data['name']} (slug: {tag_data['slug']})"))

        self.stdout.write(f"\n合計: 作成 {created_count}件, 更新 {updated_count}件")

        # 古いタグを表示
        notion_slugs = [t['slug'] for t in notion_tags]
        old_tags = Tag.objects.exclude(slug__in=notion_slugs)
        if old_tags.exists():
            self.stdout.write(self.style.WARNING("\n⚠️ Notionに存在しない古いタグ:"))
            for tag in old_tags:
                self.stdout.write(f"  - {tag.name} (slug: {tag.slug})")
