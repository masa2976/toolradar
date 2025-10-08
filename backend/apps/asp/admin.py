from django.contrib import admin
from .models import Broker


@admin.register(Broker)
class BrokerAdmin(admin.ModelAdmin):
    list_display = ['name', 'rank', 'is_active', 'bonus', 'created_at']
    list_filter = ['is_active', 'rank']
    search_fields = ['name', 'tracking_id']
    ordering = ['rank', '-created_at']
    
    fieldsets = [
        ('基本情報', {
            'fields': ['name', 'logo', 'rank', 'is_active']
        }),
        ('特徴・ボーナス', {
            'fields': ['features', 'bonus'],
            'description': '特徴は各項目を改行で区切って入力してください（例：\n業界最狭スプレッド\n24時間サポート\n取引ツール充実）'
        }),
        ('アフィリエイト設定', {
            'fields': ['cta_url', 'tracking_id']
        }),
        ('タイムスタンプ', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        """ArrayFieldのカスタムウィジェット"""
        if db_field.name == 'features':
            from django import forms
            from django.contrib.postgres.forms import SimpleArrayField
            
            kwargs['form_class'] = SimpleArrayField
            kwargs['base_field'] = forms.CharField(max_length=200)
            kwargs['delimiter'] = '\n'  # 改行区切り
            kwargs['widget'] = forms.Textarea(attrs={
                'rows': 5,
                'placeholder': '各項目を改行で区切って入力\n例：\n業界最狭スプレッド\n24時間サポート\n取引ツール充実'
            })
        
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    def save_model(self, request, obj, form, change):
        """保存時の処理"""
        super().save_model(request, obj, form, change)
        
        # rankが設定されていない場合、自動採番
        if obj.rank == 0:
            from django.db import models
            max_rank = Broker.objects.filter(is_active=True).aggregate(
                models.Max('rank')
            )['rank__max'] or 0
            obj.rank = max_rank + 1
            obj.save()
