"""
Core app URL configuration
お問い合わせフォーム用APIエンドポイント
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ContactFormViewSet

router = DefaultRouter()
router.register(r'contact', ContactFormViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
