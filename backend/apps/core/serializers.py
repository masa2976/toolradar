"""
Core app serializers
お問い合わせフォーム用シリアライザー
"""

from rest_framework import serializers


class ContactFormSerializer(serializers.Serializer):
    """
    お問い合わせフォーム送信用シリアライザー

    フィールド:
    - name: お名前（必須、最大100文字）
    - email: メールアドレス（必須、Email形式）
    - subject: 件名（必須、最大200文字）
    - message: お問い合わせ内容（必須、最大2000文字）
    - honeypot: ハニーポット（Bot検出用、非表示）
    - recaptcha_token: reCAPTCHA v3トークン（スパム対策）
    """

    name = serializers.CharField(
        max_length=100,
        required=True,
        error_messages={
            'required': 'お名前を入力してください',
            'blank': 'お名前を入力してください',
            'max_length': 'お名前は100文字以内で入力してください',
        }
    )

    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'メールアドレスを入力してください',
            'blank': 'メールアドレスを入力してください',
            'invalid': '有効なメールアドレスを入力してください',
        }
    )

    subject = serializers.CharField(
        max_length=200,
        required=True,
        error_messages={
            'required': '件名を入力してください',
            'blank': '件名を入力してください',
            'max_length': '件名は200文字以内で入力してください',
        }
    )

    message = serializers.CharField(
        max_length=2000,
        required=True,
        error_messages={
            'required': 'お問い合わせ内容を入力してください',
            'blank': 'お問い合わせ内容を入力してください',
            'max_length': 'お問い合わせ内容は2000文字以内で入力してください',
        }
    )

    # ハニーポット（Bot検出用）
    # 人間のユーザーには見えない隠しフィールド
    # Botが自動で埋めることを想定し、値が入っていたらスパムと判定
    # required=False: 必須ではない
    # write_only=True: レスポンスには含めない
    # allow_blank=True: 空白を許可（正常な送信時は空）
    honeypot = serializers.CharField(
        required=False,
        write_only=True,
        allow_blank=True,
        help_text='Bot検出用ハニーポット（人間のユーザーは入力不要）'
    )

    # Google reCAPTCHA v3トークン（スパム対策）
    # フロントエンドから送信されるトークンを受け取る
    # 必須ではない（古いクライアントとの互換性維持）
    # write_only=True: レスポンスには含めない
    recaptcha_token = serializers.CharField(
        required=False,
        write_only=True,
        allow_blank=True,
        help_text='Google reCAPTCHA v3トークン'
    )

    def validate_name(self, value):
        """お名前のカスタムバリデーション"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError('お名前は2文字以上で入力してください')
        return value.strip()

    def validate_message(self, value):
        """お問い合わせ内容のカスタムバリデーション"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError('お問い合わせ内容は10文字以上で入力してください')
        return value.strip()

    def validate_email(self, value):
        """
        メールアドレスのカスタムバリデーション
        使い捨てメールアドレスをブロック
        """
        # 使い捨てメールサービスのドメインリスト
        # 参考: https://github.com/disposable/disposable-email-domains
        disposable_domains = [
            # よく使われる使い捨てメールサービス
            'guerrillamail.com',
            'guerrillamail.net',
            'guerrillamail.org',
            'guerrillamailblock.com',
            'tempmail.com',
            'temp-mail.org',
            'temp-mail.io',
            '10minutemail.com',
            '10minutemail.net',
            'mailinator.com',
            'maildrop.cc',
            'throwaway.email',
            'getnada.com',
            'trashmail.com',
            'mohmal.com',
            'yopmail.com',
            'yopmail.fr',
            'yopmail.net',
            'cool.fr.nf',
            'jetable.fr.nf',
            'nospam.ze.tc',
            'nomail.xl.cx',
            'mega.zik.dj',
            'speed.1s.fr',
            'courriel.fr.nf',
            'moncourrier.fr.nf',
            'monmail.fr.nf',
            'hide.biz.st',
            'mymail.infos.st',
        ]

        # メールアドレスからドメイン部分を抽出
        domain = value.lower().split('@')[-1]

        # 使い捨てメールドメインチェック
        if domain in disposable_domains:
            raise serializers.ValidationError(
                '使い捨てメールアドレスは使用できません。正規のメールアドレスを入力してください。'
            )

        return value.lower()

    def validate_honeypot(self, value):
        """
        ハニーポットのバリデーション
        値が入力されている場合はBotと判定してエラー
        """
        if value:
            # Botが検出された場合、エラーメッセージは曖昧にする
            # （Bot開発者にハニーポットの存在を気づかせないため）
            raise serializers.ValidationError(
                'フォームの送信に失敗しました。もう一度お試しください。'
            )
        return value
