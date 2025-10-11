"""
Wagtail API設定
PagePreview用のカスタムAPIエンドポイント
"""

from django.contrib.contenttypes.models import ContentType
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail_headless_preview.models import PagePreview
from rest_framework.response import Response


# APIルーター作成
api_router = WagtailAPIRouter("wagtailapi")


class PagePreviewAPIViewSet(PagesAPIViewSet):
    """
    プレビュー用のカスタムAPIビューセット
    
    wagtail-headless-previewが生成したトークンを検証し、
    プレビューページのデータを返す
    """
    
    known_query_parameters = PagesAPIViewSet.known_query_parameters.union(
        ["content_type", "token"]
    )
    
    def listing_view(self, request):
        """
        リスティングビュー
        detail_viewに委譲して同じシリアライゼーションフォーマットを使用
        """
        self.action = "detail_view"
        return self.detail_view(request, 0)
    
    def detail_view(self, request, pk):
        """
        詳細ビュー
        プレビューページのデータを返す
        """
        page = self.get_object()
        serializer = self.get_serializer(page)
        return Response(serializer.data)
    
    def get_object(self):
        """
        プレビューページオブジェクトを取得
        
        Returns:
            Page: プレビュー用のPageオブジェクト
        
        Raises:
            PagePreview.DoesNotExist: トークンが無効な場合
        """
        app_label, model = self.request.GET["content_type"].split(".")
        content_type = ContentType.objects.get(app_label=app_label, model=model)
        
        page_preview = PagePreview.objects.get(
            content_type=content_type, 
            token=self.request.GET["token"]
        )
        
        page = page_preview.as_page()
        
        if not page.pk:
            # API URLルーティングのエラーを防ぐため、偽のpkを設定
            page.pk = 0
        
        return page


# 通常のPages APIエンドポイントを登録（StandardPage等のページ取得用）
api_router.register_endpoint("pages", PagesAPIViewSet)

# PagePreviewAPIViewSetをAPIルーターに登録
api_router.register_endpoint("page_preview", PagePreviewAPIViewSet)
