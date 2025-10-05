"""
URL routing for Tools API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ToolViewSet
from .views_stats import WeeklyRankingViewSet, track_event

router = DefaultRouter()
router.register(r'tools', ToolViewSet, basename='tool')
router.register(r'ranking/weekly', WeeklyRankingViewSet, basename='weekly-ranking')

urlpatterns = [
    path('events/track/', track_event, name='track-event'),
] + router.urls
