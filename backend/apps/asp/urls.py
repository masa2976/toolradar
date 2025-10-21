from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ASPAdViewSet

router = DefaultRouter()
router.register(r'ads', ASPAdViewSet, basename='aspad')

urlpatterns = [
    path('', include(router.urls)),
]
