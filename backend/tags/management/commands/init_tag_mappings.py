from django.core.management.base import BaseCommand
from tags.models import Tag, TagMapping


class Command(BaseCommand):
    """タグマッピングの初期データを投入"""
    help = 'Initialize tag mappings with default data'

    def handle(self, *args, **options):
        # デフォルトマッピングデータ
        default_mappings = Tag.get_default_mappings()
        
        created_count = 0
        updated_count = 0
        
        for mapping_data in default_mappings:
            canonical_name = mapping_data['canonical_name']
            variations = mapping_data['variations']
            category = mapping_data['category']
            
            # TagMappingを作成または更新
            mapping, created = TagMapping.objects.update_or_create(
                canonical_name=canonical_name,
                defaults={
                    'variations': variations,
                    'category': category
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created mapping: {canonical_name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'📝 Updated mapping: {canonical_name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✨ Complete! Created: {created_count}, Updated: {updated_count}'
            )
        )
        
        # 現在のマッピングを表示
        self.stdout.write('\n📋 Current mappings:')
        for mapping in TagMapping.objects.all().order_by('category', 'canonical_name'):
            variations_str = ', '.join(mapping.variations[:3])
            if len(mapping.variations) > 3:
                variations_str += '...'
            self.stdout.write(
                f'  • {mapping.canonical_name} ({mapping.category}): {variations_str}'
            )
