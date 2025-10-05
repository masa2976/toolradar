from django.contrib import admin
from import_export import resources, fields, widgets
from import_export.admin import ImportExportModelAdmin
from .models import Tool
from tags.models import Tag


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
        # パイプ区切り、カンマ区切り、スペース区切りに対応
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


class ToolResource(resources.ModelResource):
    """Tool一括インポート用リソース"""
    
    # ArrayFieldの処理
    platform = fields.Field(
        column_name='platform',
        attribute='platform',
        widget=ArrayFieldWidget()
    )
    ribbons = fields.Field(
        column_name='ribbons',
        attribute='ribbons',
        widget=ArrayFieldWidget()
    )
    
    # ManyToManyFieldの処理（タグ）
    tags = fields.Field(
        column_name='tags',
        attribute='tags',
        widget=widgets.ManyToManyWidget(Tag, separator=',', field='name')
    )
    
    class Meta:
        model = Tool
        import_id_fields = ('slug',)  # 重複チェック用
        skip_unchanged = False        # ManyToMany対応のためFalseに変更
        use_bulk = False              # ManyToMany対応のためFalseに変更
        batch_size = 1000            # バッチサイズ
        fields = (
            'id', 'name', 'slug', 'short_description', 'long_description',
            'platform', 'tool_type', 'price_type', 'price',
            'ribbons', 'image_url', 'external_url', 'metadata',
            'tags', 'created_at', 'updated_at'
        )
        export_order = fields
    
    def before_import_row(self, row, **kwargs):
        """インポート前の行処理"""
        # slugが空の場合は自動生成
        if not row.get('slug') and row.get('name'):
            from django.utils.text import slugify
            row['slug'] = slugify(row['name'])
        
        # プラットフォームの正規化（小文字化）
        if row.get('platform'):
            if isinstance(row['platform'], str):
                row['platform'] = row['platform'].lower().strip()
    
    def after_import_instance(self, instance, new, row=None, **kwargs):
        """インポート後の処理（ManyToMany対応）"""
        # tagsフィールドの処理
        if row and 'tags' in row:
            tags_str = row.get('tags', '')
            if tags_str:
                # カンマで分割してタグを取得
                tag_names = [name.strip() for name in tags_str.split(',') if name.strip()]
                # タグオブジェクトを取得
                tag_objects = []
                for tag_name in tag_names:
                    try:
                        tag = Tag.objects.get(name=tag_name)
                        tag_objects.append(tag)
                    except Tag.DoesNotExist:
                        # タグが存在しない場合はスキップ（またはログ出力）
                        pass
                
                # インスタンスが保存されていない場合は、一時的に保存
                if not instance.pk:
                    instance.save()
                
                # ManyToManyを設定
                instance.tags.set(tag_objects)


@admin.register(Tool)
class ToolAdmin(ImportExportModelAdmin):
    """ツール管理画面（インポート・エクスポート対応）"""
    
    resource_class = ToolResource
    formats = (CSVUTF8BOM,)  # UTF-8 BOM付きCSV（Excel日本語対応）
    
    list_display = [
        'name',
        'tool_type',
        'price_type',
        'display_platforms',
        'created_at'
    ]
    list_filter = [
        'tool_type',
        'price_type',
        'platform',
        'created_at'
    ]
    search_fields = [
        'name',
        'slug',
        'short_description'
    ]
    prepopulated_fields = {
        'slug': ('name',)
    }
    readonly_fields = [
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('基本情報', {
            'fields': ('name', 'slug', 'short_description', 'long_description')
        }),
        ('分類', {
            'fields': ('platform', 'tool_type', 'tags')
        }),
        ('価格', {
            'fields': ('price_type', 'price')
        }),
        ('表示設定', {
            'fields': ('ribbons', 'image_url', 'external_url')
        }),
        ('メタデータ', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('タイムスタンプ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def display_platforms(self, obj):
        """プラットフォームを表示"""
        # platformは単一の文字列になったので、そのまま大文字で表示
        return obj.platform.upper()
    display_platforms.short_description = 'プラットフォーム'
    display_platforms.short_description = 'プラットフォーム'


# ToolStats と EventLog のインポート追加
from .models_stats import ToolStats, EventLog


@admin.register(ToolStats)
class ToolStatsAdmin(admin.ModelAdmin):
    """ツール統計管理画面"""
    
    list_display = [
        'tool',
        'week_score',
        'current_rank',
        'rank_change_display',
        'week_views',
        'week_shares',
        'week_avg_duration',
        'last_updated'
    ]
    list_filter = [
        'last_updated',
    ]
    search_fields = [
        'tool__name',
    ]
    readonly_fields = [
        'last_updated',
        'rank_change_display'
    ]
    
    fieldsets = (
        ('ツール情報', {
            'fields': ('tool',)
        }),
        ('週間統計', {
            'fields': ('week_views', 'week_shares', 'week_avg_duration')
        }),
        ('スコア・順位', {
            'fields': ('week_score', 'current_rank', 'prev_week_rank', 'rank_change_display')
        }),
        ('メタ情報', {
            'fields': ('last_updated',),
            'classes': ('collapse',)
        }),
    )
    
    def rank_change_display(self, obj):
        """順位変動を表示"""
        return obj.get_rank_change()
    rank_change_display.short_description = '順位変動'
    
    actions = ['calculate_scores']
    
    def calculate_scores(self, request, queryset):
        """選択した統計のスコアを再計算"""
        count = 0
        for stats in queryset:
            stats.calculate_score()
            stats.save()
            count += 1
        self.message_user(request, f'{count}件のスコアを再計算しました。')
    calculate_scores.short_description = 'スコアを再計算'


@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    """イベントログ管理画面"""
    
    list_display = [
        'tool',
        'event_type',
        'duration_seconds',
        'share_platform',
        'created_at',
        'is_bot_display'
    ]
    list_filter = [
        'event_type',
        'share_platform',
        'created_at',
    ]
    search_fields = [
        'tool__name',
        'ip_address',
    ]
    readonly_fields = [
        'created_at',
        'is_bot_display'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('イベント情報', {
            'fields': ('tool', 'event_type', 'duration_seconds', 'share_platform')
        }),
        ('メタ情報', {
            'fields': ('ip_address', 'user_agent', 'created_at', 'is_bot_display'),
            'classes': ('collapse',)
        }),
    )
    
    def is_bot_display(self, obj):
        """Bot判定結果を表示"""
        return '✅ Bot' if EventLog.is_bot(obj.user_agent) else '❌ Human'
    is_bot_display.short_description = 'Bot判定'
