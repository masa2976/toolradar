#!/usr/bin/env python
"""
APIレスポンスの構造を確認するスクリプト
"""
import os
import django
import json

# Django設定
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from wagtail.api.v2.views import PagesAPIViewSet
from blog.models import StandardPage

# リクエストファクトリーを作成
factory = RequestFactory()
request = factory.get('/api/v2/pages/?slug=privacy&type=blog.StandardPage')

# ページを取得
page = StandardPage.objects.get(slug='privacy')

# API viewsetを作成
viewset = PagesAPIViewSet()
viewset.request = request

# シリアライザーを取得
serializer_class = viewset.get_serializer_class()
serializer = serializer_class(page, context={'request': request})

# シリアライズされたデータを取得
data = serializer.data

print('=== API Response Structure ===')
print(json.dumps({
    'title': data.get('title'),
    'body_exists': 'body' in data,
    'body_type': type(data.get('body')).__name__,
    'body_value_preview': str(data.get('body'))[:200] if data.get('body') else None,
    'body_is_string': isinstance(data.get('body'), str),
}, indent=2))
