from django.contrib import admin
from taggit.models import Tag as TaggitTag
from import_export import resources, fields, widgets
from import_export.admin import ImportExportModelAdmin
from .models import Tag, TagMapping

# django-taggitの標準Tag管理画面を非表示にする
admin.site.unregister(TaggitTag)


from import_export.formats.base_formats import CSV


class CSVUTF8BOM(CSV):
    """UTF-8 BOM付きCSVフォーマット（Excel日本語対応）"""
    
    def get_title(self):
        return "csv"
    
    def export_data(self, dataset, **kwargs):
        """BOM付きCSVデータを生成"""
        csv_data = super().export_data(dataset, **kwargs)
        # UTF-8 BOM（\ufeff）を追加
        return '\ufeff' + csv_data


class ArrayFieldWidget(widgets.Widget):
    """ArrayField用のカスタムWidget（パイプ区切り）"""
    
    def clean(self, value, row=None, **kwargs):
        """インポート時: 文字列 → リスト"""
        if not value:
            return []
        if isinstance(value, list):
            return value
        # パイプ区切り、カンマ区切りに対応
        if '|' in value:
            return [item.strip() for item in value.split('|') if item.strip()]
        elif ',' in value:
            return [item.strip() for item in value.split(',') if item.strip()]
        else:
            return [value.strip()]
    
    def render(self, value, obj=None, **kwargs):
        """エクスポート時: リスト → 文字列（パイプ区切り）"""
        if not value:
            return ''
        if isinstance(value, list):
            return '|'.join(value)
        return value


class TagResource(resources.ModelResource):
    """Tag一括インポート用リソース"""
    
    # ArrayFieldの処理（synonyms）
    synonyms = fields.Field(
        column_name='synonyms',
        attribute='synonyms',
        widget=ArrayFieldWidget()
    )
    
    class Meta:
        model = Tag
        import_id_fields = ('slug',)  # 重複チェック用
        skip_unchanged = True         # 変更なしはスキップ
        use_bulk = True               # バルク操作で高速化
        batch_size = 1000            # バッチサイズ
        fields = (
            'id', 'name', 'slug', 'category', 
            'synonyms', 'description'
        )
        export_order = fields
    
    def before_import_row(self, row, **kwargs):
        """インポート前の行処理"""
        # slugが空の場合は自動生成
        if not row.get('slug') and row.get('name'):
            from django.utils.text import slugify
            row['slug'] = slugify(row['name'])
        
        # nameの正規化（NFKC + 小文字化）
        if row.get('name'):
            import unicodedata
            name = row['name']
            # NFKC正規化
            name = unicodedata.normalize('NFKC', name)
            row['name'] = name


@admin.register(Tag)
class TagAdmin(ImportExportModelAdmin):
    """タグ管理画面（インポート・エクスポート対応）"""
    
    resource_class = TagResource
    formats = (CSVUTF8BOM,)  # UTF-8 BOM付きCSV（Excel日本語対応）
    
    list_display = [
        'name',
        'slug',
        'category',
        'get_tool_count',
        'get_post_count',
        'get_synonyms_display',
    ]
    list_filter = [
        'category',
    ]
    search_fields = [
        'name',
        'slug',
        'synonyms',
    ]
    prepopulated_fields = {
        'slug': ('name',)
    }
    
    fieldsets = (
        ('基本情報', {
            'fields': ('name', 'slug', 'category')
        }),
        ('表記ゆれ', {
            'fields': ('synonyms',),
            'description': '表記ゆれをリスト形式で入力してください'
        }),
        ('説明', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
    )
    
    def get_tool_count(self, obj):
        """ツール数を表示"""
        from tools.models import Tool
        count = Tool.objects.filter(tags=obj).count()
        return count
    get_tool_count.short_description = 'ツール数'
    
    def get_post_count(self, obj):
        """記事数を表示"""
        from blog.models import BlogPage
        count = BlogPage.objects.live().filter(tags=obj).count()
        return count
    get_post_count.short_description = '記事数'
    
    def get_synonyms_display(self, obj):
        """表記ゆれを表示"""
        if obj.synonyms:
            return ', '.join(obj.synonyms[:3])  # 最初の3つのみ表示
        return '-'
    get_synonyms_display.short_description = '表記ゆれ'


@admin.register(TagMapping)
class TagMappingAdmin(admin.ModelAdmin):
    """タグマッピング管理画面"""
    
    list_display = [
        'canonical_name',
        'category',
        'get_variations_display',
    ]
    
    list_filter = [
        'category',
    ]
    
    search_fields = [
        'canonical_name',
        'variations',
    ]
    
    fieldsets = (
        ('基本情報', {
            'fields': ('canonical_name', 'category')
        }),
        ('表記バリエーション', {
            'fields': ('variations',),
            'description': 'カンマ区切りで入力（例: bb,ｂｂ,ボリバン,Bollinger Bands）'
        }),
    )
    
    def get_variations_display(self, obj):
        """バリエーションを表示"""
        if obj.variations:
            display = ', '.join(obj.variations[:5])  # 最初の5つのみ表示
            if len(obj.variations) > 5:
                display += f'... (計{len(obj.variations)}個)'
            return display
        return '-'
    get_variations_display.short_description = 'バリエーション'
