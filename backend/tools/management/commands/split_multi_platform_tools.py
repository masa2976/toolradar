"""
複数プラットフォームのツールを分割する管理コマンド
"""
from django.core.management.base import BaseCommand
from tools.models import Tool


class Command(BaseCommand):
    help = '複数プラットフォームのツールを個別レコードに分割'

    def handle(self, *args, **options):
        # 複数プラットフォームのツールを取得
        multi_platform_tools = Tool.objects.filter(
            id__in=[29, 27, 26]  # RSI Divergence Detector, Trend Follower EA, Scalping Master Pro
        )
        
        for tool in multi_platform_tools:
            if len(tool.platform) <= 1:
                self.stdout.write(
                    self.style.SUCCESS(f'✓ {tool.name}: 既に単一プラットフォーム（スキップ）')
                )
                continue
            
            self.stdout.write('\n' + '='*60)
            self.stdout.write(f'処理中: {tool.name}')
            self.stdout.write(f'現在のプラットフォーム: {tool.platform}')
            self.stdout.write('='*60)
            
            platforms = tool.platform[:]  # コピー
            
            # 最初のプラットフォームは既存レコードを更新
            first_platform = platforms[0]
            original_slug = tool.slug
            new_slug = f"{original_slug}-{first_platform}"
            
            self.stdout.write('\n[既存レコード更新]')
            self.stdout.write(f'  ID: {tool.id}')
            self.stdout.write(f'  名前: {tool.name} → {tool.name} ({first_platform.upper()}版)')
            self.stdout.write(f'  slug: {original_slug} → {new_slug}')
            self.stdout.write(f'  platform: {tool.platform} → [\'{first_platform}\']')
            
            tool.name = f"{tool.name} ({first_platform.upper()}版)"
            tool.slug = new_slug
            tool.platform = [first_platform]
            tool.save()
            
            self.stdout.write(self.style.SUCCESS('  ✓ 更新完了'))
            
            # 2番目以降のプラットフォームは新規レコード作成
            for platform in platforms[1:]:
                new_slug = f"{original_slug}-{platform}"
                
                # 元のツール名から "(XXX版)" を除去
                base_name = tool.name.replace(f" ({first_platform.upper()}版)", "")
                new_name = f"{base_name} ({platform.upper()}版)"
                
                self.stdout.write('\n[新規レコード作成]')
                self.stdout.write(f'  名前: {new_name}')
                self.stdout.write(f'  slug: {new_slug}')
                self.stdout.write(f'  platform: [\'{platform}\']')
                
                new_tool = Tool.objects.create(
                    name=new_name,
                    slug=new_slug,
                    short_description=tool.short_description,
                    long_description=tool.long_description,
                    platform=[platform],
                    tool_type=tool.tool_type,
                    price_type=tool.price_type,
                    price=tool.price,
                    ribbons=tool.ribbons,
                    image_url=tool.image_url,
                    external_url=tool.external_url,
                    metadata=tool.metadata,
                )
                
                # タグをコピー
                for tag in tool.tags.all():
                    new_tool.tags.add(tag)
                
                self.stdout.write(self.style.SUCCESS(f'  ✓ ID {new_tool.id} として作成完了'))
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('✅ 全ての分割処理が完了しました！'))
        self.stdout.write('='*60 + '\n')
        
        # 結果確認
        self.stdout.write('【結果確認】')
        all_tools = Tool.objects.all().order_by('name')
        for t in all_tools:
            self.stdout.write(f'  - {t.name}: platform={t.platform}, slug={t.slug}')
