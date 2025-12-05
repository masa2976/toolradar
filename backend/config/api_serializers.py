"""
Wagtail API用カスタムシリアライザー
RichTextFieldを正しいHTMLに変換する

公式推奨方法：
https://docs.wagtail.org/en/stable/advanced_topics/api/v2/configuration.html
"""

from rest_framework.fields import CharField
from wagtail.api.v2.serializers import PageSerializer
from wagtail.rich_text import expand_db_html


class RichTextSerializer(CharField):
    """
    RichTextFieldの内部リンクを実際のURLに変換するカスタムフィールドシリアライザー
    
    例: <a linktype="page" id="6"> → <a href="/contact/">
    
    使い方:
        class CustomPageSerializer(PageSerializer):
            body = RichTextSerializer()
    """
    
    def to_representation(self, value):
        """
        データベース形式のRichTextを実際のHTMLに変換
        
        Args:
            value: RichTextField の値（データベース形式）
        
        Returns:
            str: 内部リンクが変換されたHTML文字列
        """
        # 親クラス（CharField）の処理を実行
        representation = super().to_representation(value)
        
        if representation:
            try:
                # expand_db_html()で内部リンクを実際のURLに変換
                return expand_db_html(representation)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error expanding RichText HTML: {e}")
                # エラー時は元の値を返す
                return representation
        
        return representation


class CustomPageSerializer(PageSerializer):
    """
    カスタムページシリアライザー
    
    RichTextFieldを持つページ用のシリアライザー
    BasicPage, ContactPage, StandardPageなどで使用
    """
    
    # BasicPage, StandardPageのbodyフィールド
    body = RichTextSerializer(required=False)
    
    # ContactPageのthank_you_textフィールド
    thank_you_text = RichTextSerializer(required=False)
