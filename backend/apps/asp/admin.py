from django.contrib import admin
from django.utils.html import format_html
from .models import ASPAd


@admin.register(ASPAd)
class ASPAdAdmin(admin.ModelAdmin):
    """ASP広告管理画面（業界標準設計）"""
    
    list_display = [
        'name', 
        'placement_badge',
        'period_status',
        'performance_stats',
        'priority',
        'weight',
        'is_active',
        'created_at'
    ]
    
    list_filter = [
        'is_active',
        'placement',
        'start_date',
        'end_date',
    ]
    
    search_fields = [
        'name',
    ]
    
    ordering = ['placement', 'priority', '-weight']
    
    fieldsets = [
        ('基本情報', {
            'fields': ['name', 'is_active']
        }),
        ('広告コード', {
            'fields': ['ad_code'],
            'description': 'A8.netなどのASPからコピーしたHTMLタグをそのまま貼り付けてください'
        }),
        ('配置設定', {
            'fields': ['placement', 'priority', 'weight']
        }),
        ('期限設定', {
            'fields': ['start_date', 'end_date'],
            'description': '開始日時・終了日時を設定すると自動的に表示/非表示が切り替わります'
        }),
        ('効果測定', {
            'fields': ['impressions', 'clicks', 'ctr_display'],
            'classes': ['collapse']
        }),
        ('タイムスタンプ', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    ]
    
    readonly_fields = [
        'impressions',
        'clicks',
        'ctr_display',
        'created_at',
        'updated_at'
    ]
    
    # カスタム表示メソッド
    
    def placement_badge(self, obj):
        """配置場所をバッジ表示"""
        colors = {
            'homepage-hero': '#dc3545',  # 赤
            'homepage-middle': '#ffc107',  # 黄
            'homepage-bottom': '#28a745',  # 緑
            'blog-toc': '#17a2b8',  # 水色
            'blog-middle': '#6c757d',  # グレー
            'blog-bottom': '#007bff',  # 青
            'tool-detail-top': '#6610f2',  # 紫
            'tool-detail-bottom': '#fd7e14',  # オレンジ
            'sidebar-top': '#e83e8c',  # ピンク
            'sidebar-bottom': '#20c997',  # テール
            'list-infeed': '#6f42c1',  # インディゴ
        }
        color = colors.get(obj.placement, '#6c757d')
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_placement_display()
        )
    placement_badge.short_description = '配置場所'
    
    def period_status(self, obj):
        """期限ステータス表示"""
        if not obj.is_active:
            return format_html('<span style="color: #dc3545;">❌ 無効</span>')
        
        if obj.is_valid_period():
            if obj.end_date:
                return format_html(
                    '<span style="color: #28a745;">✅ 有効（〜{}）</span>',
                    obj.end_date.strftime('%Y/%m/%d')
                )
            else:
                return format_html('<span style="color: #28a745;">✅ 有効（無期限）</span>')
        else:
            if obj.start_date:
                from django.utils import timezone
                if timezone.now() < obj.start_date:
                    return format_html(
                        '<span style="color: #ffc107;">⏳ 予約（{}〜）</span>',
                        obj.start_date.strftime('%Y/%m/%d')
                    )
            return format_html('<span style="color: #dc3545;">⏹ 期限切れ</span>')
    
    period_status.short_description = 'ステータス'
    
    def performance_stats(self, obj):
        """効果測定の要約表示"""
        if obj.impressions == 0:
            return format_html('<span style="color: #6c757d;">データなし</span>')
        
        ctr = obj.ctr
        ctr_color = '#28a745' if ctr >= 2.0 else '#ffc107' if ctr >= 1.0 else '#dc3545'
        
        # フォーマット済みの値を先に作成
        impressions_formatted = f'{obj.impressions:,}'
        ctr_formatted = f'{ctr:.2f}'
        
        return format_html(
            '<div style="font-size: 11px;">'
            '表示: <strong>{}</strong> | '
            'クリック: <strong>{}</strong> | '
            '<span style="color: {};">CTR: <strong>{}%</strong></span>'
            '</div>',
            impressions_formatted,
            obj.clicks,
            ctr_color,
            ctr_formatted
        )
    performance_stats.short_description = '効果測定'
    
    def ctr_display(self, obj):
        """CTRの詳細表示（readonly_fields用）"""
        return f'{obj.ctr:.2f}%'
    ctr_display.short_description = 'CTR（クリック率）'
    
    # アクション
    
    actions = ['activate_ads', 'deactivate_ads', 'reset_stats']
    
    def activate_ads(self, request, queryset):
        """選択した広告を有効化"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count}件の広告を有効化しました。')
    activate_ads.short_description = '選択した広告を有効化'
    
    def deactivate_ads(self, request, queryset):
        """選択した広告を無効化"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count}件の広告を無効化しました。')
    deactivate_ads.short_description = '選択した広告を無効化'
    
    def reset_stats(self, request, queryset):
        """効果測定をリセット"""
        count = queryset.update(impressions=0, clicks=0)
        self.message_user(request, f'{count}件の広告の効果測定をリセットしました。')
    reset_stats.short_description = '効果測定をリセット'
