"""
URL routing for Blog API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPageViewSet, BlogCategoryViewSet, InvestmentTypeViewSet

router = DefaultRouter()
router.register(r'blog/posts', BlogPageViewSet, basename='blogpage')
router.register(r'blog/categories', BlogCategoryViewSet, basename='blogcategory')
router.register(r'blog/investment-types', InvestmentTypeViewSet, basename='investmenttype')

urlpatterns = router.urls
