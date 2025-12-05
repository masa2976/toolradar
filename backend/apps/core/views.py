"""
Core app views
お問い合わせフォーム用APIビュー
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from django.core.mail import send_mail
from django.conf import settings
import logging
import requests  # reCAPTCHA検証用

from .serializers import ContactFormSerializer
from .models import ContactPage

logger = logging.getLogger(__name__)


class ContactBurstRateThrottle(AnonRateThrottle):
    """
    お問い合わせフォーム専用のバーストレート制限
    短時間での連続送信を防止（1分間に3回まで）
    """
    rate = '3/min'
    scope = 'contact_burst'


class ContactSustainedRateThrottle(AnonRateThrottle):
    """
    お問い合わせフォーム専用の継続的レート制限
    長期的なスパム攻撃を防止（1時間に10回まで）
    """
    rate = '10/hour'
    scope = 'contact_sustained'


class ContactFormViewSet(viewsets.ViewSet):
    """
    お問い合わせフォーム送信用ViewSet
    
    Endpoints:
    - POST /api/contact/submit/ - フォーム送信
    
    スパム対策:
    - reCAPTCHA v3検証
    - ハニーポット（Bot検出）
    - 使い捨てメールブロック
    - レート制限（1分3回、1時間10回）
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [ContactBurstRateThrottle, ContactSustainedRateThrottle]
    
    @action(detail=False, methods=['post'])
    def submit(self, request):
        """
        お問い合わせフォーム送信
        
        Request body:
        {
            "name": "お名前",
            "email": "email@example.com",
            "subject": "件名",
            "message": "お問い合わせ内容"
        }
        
        Returns:
            200: 送信成功
            400: バリデーションエラー
            500: サーバーエラー
        """
        serializer = ContactFormSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = serializer.validated_data
        
        # Google reCAPTCHA v3検証（スパム対策）
        recaptcha_token = validated_data.pop('recaptcha_token', None)
        if recaptcha_token:
            if not self._verify_recaptcha(recaptcha_token, request):
                logger.warning(f'reCAPTCHA verification failed for {request.META.get("REMOTE_ADDR")}')
                return Response(
                    {
                        'success': False,
                        'message': 'スパム対策のため、送信できませんでした。ページを再読み込みしてもう一度お試しください。'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            contact_page = ContactPage.objects.live().first()
            
            if not contact_page:
                logger.error('ContactPage not found')
                return Response(
                    {
                        'success': False,
                        'message': 'お問い合わせページが見つかりません'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            email_subject = f"{contact_page.subject} - {validated_data['subject']}"
            
            email_body = f"""
お問い合わせがありました。

【お名前】
{validated_data['name']}

【メールアドレス】
{validated_data['email']}

【件名】
{validated_data['subject']}

【お問い合わせ内容】
{validated_data['message']}
"""
            
            send_mail(
                subject=email_subject,
                message=email_body,
                from_email=contact_page.from_address or settings.DEFAULT_FROM_EMAIL,
                recipient_list=[contact_page.to_address],
                fail_silently=False,
            )
            
            logger.info(f'Contact form submitted: {validated_data["email"]}')
            
            return Response(
                {
                    'success': True,
                    'message': 'お問い合わせを受け付けました',
                    'thank_you_text': str(contact_page.thank_you_text)  # RichTextをHTML文字列に変換
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f'Contact form error: {str(e)}', exc_info=True)
            
            return Response(
                {
                    'success': False,
                    'message': 'メール送信中にエラーが発生しました。しばらく経ってから再度お試しください。'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _verify_recaptcha(self, token, request):
        """
        Google reCAPTCHA v3トークンを検証
        
        Args:
            token (str): フロントエンドから送信されたreCAPTCHAトークン
            request (Request): DRFリクエストオブジェクト
        
        Returns:
            bool: 検証成功時True、失敗時False
        """
        # シークレットキーが設定されていない場合はスキップ（開発環境用）
        if not settings.RECAPTCHA_SECRET_KEY:
            logger.info('reCAPTCHA secret key not set, skipping verification')
            return True
        
        try:
            # Google reCAPTCHA API呼び出し
            response = requests.post(
                settings.RECAPTCHA_VERIFY_URL,
                data={
                    'secret': settings.RECAPTCHA_SECRET_KEY,
                    'response': token,
                    'remoteip': self._get_client_ip(request),
                },
                timeout=5
            )
            result = response.json()
            
            # デバッグログ
            logger.info(f'reCAPTCHA response: success={result.get("success")}, score={result.get("score")}')
            
            # 検証結果チェック
            if not result.get('success'):
                logger.warning(f'reCAPTCHA verification failed: {result.get("error-codes")}')
                return False
            
            # スコアチェック（0.5未満はスパムの可能性が高い）
            score = result.get('score', 0)
            if score < settings.RECAPTCHA_SCORE_THRESHOLD:
                logger.warning(f'reCAPTCHA score too low: {score}')
                return False
            
            return True
            
        except requests.exceptions.Timeout:
            # タイムアウト時は可用性優先で通過させる
            logger.error('reCAPTCHA verification timeout')
            return True
        except Exception as e:
            # その他のエラー時も可用性優先で通過させる
            logger.error(f'reCAPTCHA verification error: {str(e)}', exc_info=True)
            return True
    
    def _get_client_ip(self, request):
        """
        クライアントのIPアドレスを取得
        
        Args:
            request (Request): DRFリクエストオブジェクト
        
        Returns:
            str: クライアントIPアドレス
        """
        # プロキシ経由の場合はX-Forwarded-Forヘッダーから取得
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            # 複数のプロキシを経由している場合は最初のIPを使用
            return x_forwarded_for.split(',')[0].strip()
        
        # 直接接続の場合
        return request.META.get('REMOTE_ADDR', '')
