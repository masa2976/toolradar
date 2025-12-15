from django.contrib import admin
from django import forms
from django.contrib import messages
from import_export import resources, fields, widgets
from import_export.admin import ImportExportModelAdmin
from .models import Tool
from tags.models import Tag

# ファジーマッチング（類似ツール検出用）
try:
    from thefuzz import fuzz
    FUZZY_MATCHING_ENABLED = True
except ImportError:
    FUZZY_MATCHING_ENABLED = False


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
    
    # ArrayFieldの処理（ribbonsのみ実際にArrayField）
    ribbons = fields.Field(
        column_name='ribbons',
        attribute='ribbons',
        widget=ArrayFieldWidget(),
        default=[]
    )
    
    # ManyToManyFieldの処理（タグ）
    tags = fields.Field(
        column_name='tags',
        attribute='tags',
        widget=widgets.ManyToManyWidget(Tag, separator=',', field='name'),
        default=''
    )
    
    class Meta:
        model = Tool
        import_id_fields = ('slug',)  # slugで一意識別
        skip_unchanged = False        # ManyToMany対応
        use_bulk = False              # ManyToMany対応
        batch_size = 1000            # バッチサイズ
        # エクスポート用フィールド（タイムスタンプは読み取り専用）
        fields = (
            'name', 'slug', 'short_description', 'long_description',
            'platform', 'tool_type', 'price_type',
            'ribbons', 'image_url', 'external_url', 'metadata',
            'tags'
        )
        export_order = (
            'name', 'slug', 'short_description', 'long_description',
            'platform', 'tool_type', 'price_type',
            'ribbons', 'image_url', 'external_url', 'metadata',
            'tags', 'created_at', 'updated_at'
        )
        # idフィールドを明示的に除外
        exclude = ('id',)
    
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
        
        # created_at, updated_atをインポート時に除外
        row.pop('created_at', None)
        row.pop('updated_at', None)
        
        # metadata が空文字列の場合は空のdictに変換
        if row.get('metadata') == '':
            row['metadata'] = '{}'
        elif row.get('metadata') and isinstance(row['metadata'], str):
            # JSON文字列をパースして有効か確認
            try:
                import json
                json.loads(row['metadata'])
            except:
                row['metadata'] = '{}'
        
        # ribbonsが空の場合の処理
        if row.get('ribbons') == '':
            row['ribbons'] = ''
    
    def after_import_instance(self, instance, new, row=None, **kwargs):
        """
        インポート後の処理
        タグの正規化と関連付けを行う
        """
        if row is None:
            return
        
        # インスタンスが新規作成の場合は先に保存
        if new and not instance.pk:
            instance.save()
        
        # タグ処理（カンマ区切りのタグ名を想定）
        tags_str = row.get('tags', '')
        if tags_str and isinstance(tags_str, str):
            # カンマ区切りでタグ名を分割
            tag_names = [name.strip() for name in tags_str.split(',') if name.strip()]
            
            # 正規化処理を使ってタグを取得または作成
            normalized_tags = []
            for tag_name in tag_names:
                try:
                    # Tag.normalize_and_get_or_create()を使用
                    tag = Tag.normalize_and_get_or_create(tag_name)
                    normalized_tags.append(tag)
                except Exception as e:
                    # エラーが発生した場合はログに記録
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"タグ '{tag_name}' の正規化に失敗しました: {e}")
            
            # タグを設定
            if normalized_tags:
                instance.tags.set(normalized_tags)
        
    def export(self, queryset=None, **kwargs):
        """エクスポート処理のカスタマイズ"""
        if queryset is None:
            queryset = self.get_queryset()
        
        # エクスポート時はタグも含めてprefetchして最適化
        queryset = queryset.prefetch_related('tags')
        
        return super().export(queryset, **kwargs)


class ToolAdminForm(forms.ModelForm):
    """
    ツール管理フォーム（ファジーマッチング警告機能付き）
    """
    
    class Meta:
        model = Tool
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 類似ツール情報を保持する属性
        self._similar_tools = []
    
    def clean_name(self):
        """
        名前の類似チェック（同一プラットフォーム内）
        - 85%以上の類似度で警告リストに追加
        - 登録自体はブロックしない（警告のみ）
        """
        name = self.cleaned_data.get('name')
        platform = self.data.get('platform')  # フォームデータから取得
        
        if not name or not FUZZY_MATCHING_ENABLED:
            return name
        
        # 既存ツールと比較
        queryset = Tool.objects.all()
        if self.instance.pk:
            # 編集時は自分自身を除外
            queryset = queryset.exclude(pk=self.instance.pk)
        
        # 同一プラットフォームのツールのみ対象
        if platform:
            queryset = queryset.filter(platform=platform)
        
        similar_tools = []
        for tool in queryset:
            # ファジーマッチングで類似度を計算
            ratio = fuzz.ratio(name.lower(), tool.name.lower())
            if ratio >= 85:
                similar_tools.append({
                    'tool': tool,
                    'ratio': ratio,
                    'platform': tool.get_platform_display()
                })
        
        # 類似度の高い順にソート
        similar_tools.sort(key=lambda x: x['ratio'], reverse=True)
        self._similar_tools = similar_tools
        
        return name


@admin.register(Tool)
class ToolAdmin(ImportExportModelAdmin):
    """ツール管理画面(インポート・エクスポート対応)"""
    
    form = ToolAdminForm  # ファジーマッチング警告機能付きフォーム
    resource_class = ToolResource
    formats = (CSVUTF8BOM,)  # UTF-8 BOM付きCSV(Excel日本語対応)
    
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
        'updated_at',
        'computed_ribbons_display'
    ]
    
    # filter_horizontalは削除（ClusterTaggableManagerと互換性なし）
    # tagsフィールドは標準のタグ入力ウィジェットを使用
    
    fieldsets = (
        ('基本情報', {
            'fields': ('name', 'slug', 'short_description', 'long_description')
        }),
        ('分類', {
            'fields': ('platform', 'tool_type', 'tags'),
            'description': 'タグはカンマ区切りで入力。正規化処理で表記揺れを自動統一します。'
        }),
        ('価格', {
            'fields': ('price_type',)
        }),
        ('表示設定', {
            'fields': ('ribbons', 'computed_ribbons_display', 'image_url', 'external_url'),
            'description': '※ "new"（14日以内）と "popular"（TOP10）は自動計算されます。手動リボン（featured等）のみ入力してください。'
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
    
    def save_related(self, request, form, formsets, change):
        """
        ManyToManyフィールド（タグ）保存後に正規化処理を実行
        Admin画面での手動入力時も表記揺れを防ぐ
        """
        # まず通常通り保存
        super().save_related(request, form, formsets, change)
        
        # 保存されたオブジェクトを取得
        obj = form.instance
        
        # 現在のタグを取得
        current_tags = list(obj.tags.all())
        
        if current_tags:
            # 正規化されたタグのリストを作成
            normalized_tags = []
            for tag in current_tags:
                # 正規化処理を実行
                normalized_tag = Tag.normalize_and_get_or_create(tag.name)
                normalized_tags.append(normalized_tag)
            
            # 一度全てクリアして、正規化されたタグを再設定
            obj.tags.clear()
            obj.tags.add(*normalized_tags)
    
    def save_model(self, request, obj, form, change):
        """
        モデル保存時に類似ツール警告を表示
        """
        # まず保存を実行
        super().save_model(request, obj, form, change)
        
        # フォームに類似ツール情報があれば警告表示
        if hasattr(form, '_similar_tools') and form._similar_tools:
            similar_list = []
            for item in form._similar_tools[:5]:  # 最大5件まで表示
                tool = item['tool']
                ratio = item['ratio']
                similar_list.append(f'「{tool.name}」({tool.platform.upper()}) - 類似度{ratio}%')
            
            warning_msg = (
                f'⚠️ 類似ツールが見つかりました: {", ".join(similar_list)}。'
                f'重複登録でないかご確認ください。'
            )
            messages.warning(request, warning_msg)
    
    def display_platforms(self, obj):
        """プラットフォームを表示"""
        # platformは単一の文字列になったので、そのまま大文字で表示
        return obj.platform.upper()
    display_platforms.short_description = 'プラットフォーム'
    
    def computed_ribbons_display(self, obj):
        """自動計算されるリボンを表示"""
        if obj.pk:
            ribbons = obj.computed_ribbons
            if ribbons:
                return ', '.join(ribbons)
            return '（なし）'
        return '（保存後に表示されます）'
    computed_ribbons_display.short_description = '自動リボン'


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
    
    # アクション追加
    actions = ['cleanup_old_events_dry_run', 'cleanup_old_events']
    
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

    def changelist_view(self, request, extra_context=None):
        """一覧画面にデータベース統計情報とスケジューラー情報を追加"""
        extra_context = extra_context or {}
        
        # テーブルサイズ取得
        from django.db import connection
        cursor = connection.cursor()
        
        try:
            cursor.execute("""
                SELECT pg_size_pretty(pg_total_relation_size('tools_eventlog'))
            """)
            table_size = cursor.fetchone()[0]
        except Exception:
            table_size = 'N/A'
        
        # 統計情報
        from django.utils import timezone
        from datetime import timedelta
        
        total_events = EventLog.objects.count()
        
        # 直近7日間のイベント数
        week_ago = timezone.now() - timedelta(days=7)
        week_events = EventLog.objects.filter(created_at__gte=week_ago).count()
        
        # 直近30日間のイベント数
        month_ago = timezone.now() - timedelta(days=30)
        month_events = EventLog.objects.filter(created_at__gte=month_ago).count()
        
        # イベント種別ごとの集計
        from django.db import models as django_models
        event_stats = EventLog.objects.values('event_type').annotate(
            count=django_models.Count('id')
        ).order_by('-count')
        
        # 最古のレコード
        oldest_event = EventLog.objects.order_by('created_at').first()
        oldest_date = oldest_event.created_at if oldest_event else None
        
        # 30日以上古いかチェック
        is_old_data = False
        if oldest_date:
            days_old = (timezone.now() - oldest_date).days
            is_old_data = days_old >= 30
        
        extra_context['db_stats'] = {
            'table_size': table_size,
            'total_events': total_events,
            'week_events': week_events,
            'month_events': month_events,
            'event_stats': event_stats,
            'oldest_date': oldest_date,
            'is_old_data': is_old_data,
        }
        
        # スケジューラー情報を取得
        scheduler_info = self._get_scheduler_info()
        extra_context['scheduler_info'] = scheduler_info
        
        return super().changelist_view(request, extra_context=extra_context)
    
    def _get_scheduler_info(self):
        """スケジューラー情報を取得"""
        from tools.scheduler import start_scheduler
        from django.utils import timezone
        
        try:
            scheduler = start_scheduler()
            
            # クリーンアップジョブを取得
            cleanup_job = scheduler.get_job('cleanup_old_events')
            
            if cleanup_job:
                return {
                    'is_running': scheduler.running,
                    'job_exists': True,
                    'next_run_time': cleanup_job.next_run_time,
                    'schedule': '毎週日曜日 03:00 JST',
                    'job_name': cleanup_job.name,
                }
            else:
                return {
                    'is_running': scheduler.running,
                    'job_exists': False,
                    'error': 'クリーンアップジョブが見つかりません',
                }
        except Exception as e:
            return {
                'is_running': False,
                'job_exists': False,
                'error': f'スケジューラー情報の取得に失敗: {str(e)}',
            }
    is_bot_display.short_description = 'Bot判定'
    
    def cleanup_old_events_dry_run(self, request, queryset):
        """古いイベントログをクリーンアップ(ドライラン)"""
        from django.utils import timezone
        from datetime import timedelta
        
        # 30日前の日時を計算
        cutoff_date = timezone.now() - timedelta(days=30)
        
        # 削除対象のカウント
        total_count = EventLog.objects.filter(created_at__lt=cutoff_date).count()
        
        if total_count == 0:
            self.message_user(
                request,
                '削除対象のイベントログはありません。',
                level='info'
            )
        else:
            # イベント種別ごとの集計
            from django.db import models as django_models
            event_breakdown = EventLog.objects.filter(
                created_at__lt=cutoff_date
            ).values('event_type').annotate(
                count=django_models.Count('id')
            ).order_by('-count')
            
            breakdown_text = ', '.join([
                f"{item['event_type']}: {item['count']}件"
                for item in event_breakdown
            ])
            
            dry_run_msg = (
                f'【ドライラン】削除対象: {total_count}件 '
                f'({cutoff_date.strftime("%Y-%m-%d %H:%M")}より前) - 内訳: {breakdown_text}'
            )
            
            self.message_user(
                request,
                dry_run_msg,
                level='warning'
            )
    
    cleanup_old_events_dry_run.short_description = '🔍 古いログをクリーンアップ（ドライラン）'
    
    def cleanup_old_events(self, request, queryset):
        """古いイベントログをクリーンアップ(実行)"""
        from django.utils import timezone
        from datetime import timedelta
        from django.core.mail import mail_admins
        
        # 30日前の日時を計算
        cutoff_date = timezone.now() - timedelta(days=30)
        
        # 削除前のカウント
        total_count = EventLog.objects.filter(created_at__lt=cutoff_date).count()
        
        if total_count == 0:
            self.message_user(
                request,
                '削除対象のイベントログはありません。',
                level='info'
            )
            return
        
        # イベント種別ごとの集計(削除前)
        from django.db import models as django_models
        event_breakdown = EventLog.objects.filter(
            created_at__lt=cutoff_date
        ).values('event_type').annotate(
            count=django_models.Count('id')
        ).order_by('-count')
        
        # 削除実行
        deleted = EventLog.objects.filter(created_at__lt=cutoff_date).delete()
        deleted_count = deleted[0]
        
        breakdown_text = ', '.join([
            f"{item['event_type']}: {item['count']}件"
            for item in event_breakdown
        ])
        
        # 成功メッセージ
        success_msg = (
            f'✅ {deleted_count}件のイベントログを削除しました '
            f'({cutoff_date.strftime("%Y-%m-%d %H:%M")}より前) - 内訳: {breakdown_text}'
        )
        self.message_user(request, success_msg, level='success')
        
        # 10万件以上削除した場合はメール通知
        if deleted_count >= 100000:
            try:
                email_message = (
                    f'{deleted_count}件のイベントログを削除しました。\n'
                    f'詳細: {breakdown_text}'
                )
                mail_admins(
                    subject='EventLog大量削除アラート',
                    message=email_message,
                )
            except Exception as e:
                self.message_user(
                    request,
                    f'メール送信エラー: {str(e)}',
                    level='warning'
                )
    
    cleanup_old_events.short_description = '🗑️ 古いログをクリーンアップ（実行）'
