"""
Wagtail API カスタムシリアライザー
RichTextFieldをHTML文字列として返すためのシリアライザー
"""
from rest_framework import serializers


class RichTextSerializer(serializers.CharField):
    """
    RichTextFieldをHTML文字列にシリアライズ
    
    Wagtail APIでRichTextFieldを公開する際、
    デフォルトではRichTextオブジェクトが返されるため、
    このシリアライザーでHTML文字列に変換する。
    """
    def to_representation(self, value):
        """
        RichTextオブジェクトをHTML文字列に変換
        """
        return str(value)
