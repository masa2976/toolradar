"""
URL configuration for ToolRadar project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

# DRF Spectacular (Swagger UI)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Wagtail API (for headless preview)
from .api import api_router

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # Wagtail Admin
    path('cms/', include(wagtailadmin_urls)),
    
    # Wagtail Documents
    path('documents/', include(wagtaildocs_urls)),
    
    # === REST API エンドポイント ===
    path('api/', include('tools.urls')),      # Tools API
    path('api/', include('blog.urls')),       # Blog API
    path('api/', include('tags.urls')),       # Tags API
    path('api/', include('apps.asp.urls')),   # ASP API
    
    # API Schema & Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Wagtail API v2 (Headless Preview)
    # 注意: Wagtail Pagesルートの前に配置する必要あり
    path('api/v2/', api_router.urls),
    
    # Wagtail Pages (最後に配置)
    path('', include(wagtail_urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Django Debug Toolbar
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
