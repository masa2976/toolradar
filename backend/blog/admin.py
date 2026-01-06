from django.contrib import admin
from .models import BlogCategory, InvestmentType


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    """ブログカテゴリ管理画面"""
    
    list_display = [
        'name',
        'slug',
        'order',
        'blog_count',
    ]
    list_editable = ['order']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    
    fieldsets = (
        ('基本情報', {
            'fields': ('name', 'slug', 'description')
        }),
        ('表示設定', {
            'fields': ('order',),
        }),
    )
    
    def blog_count(self, obj):
        """このカテゴリの記事数"""
        return obj.blog_pages.count()
    blog_count.short_description = '記事数'


@admin.register(InvestmentType)
class InvestmentTypeAdmin(admin.ModelAdmin):
    """投資タイプ管理画面"""
    
    list_display = [
        'name',
        'slug',
        'order',
        'blog_count',
    ]
    list_editable = ['order']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    
    fieldsets = (
        ('基本情報', {
            'fields': ('name', 'slug', 'description')
        }),
        ('表示設定', {
            'fields': ('order',),
        }),
    )
    
    def blog_count(self, obj):
        """このタイプの記事数"""
        return obj.blog_pages.count()
    blog_count.short_description = '記事数'
