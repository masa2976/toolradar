"""
ツール画像のURL有効性チェックコマンド

使用方法:
    # 全ツールをチェック
    python manage.py check_tool_images

    # 未チェックのツールのみ
    python manage.py check_tool_images --unchecked-only

    # エラーのツールを再チェック
    python manage.py check_tool_images --errors-only

    # ドライラン（DB更新なし）
    python manage.py check_tool_images --dry-run
"""

import requests
from django.core.management.base import BaseCommand
from django.utils import timezone
from tools.models import Tool


class Command(BaseCommand):
    help = 'ツール画像のURL有効性をチェック'

    def add_arguments(self, parser):
        parser.add_argument(
            '--unchecked-only',
            action='store_true',
            help='未チェックのツールのみ対象'
        )
        parser.add_argument(
            '--errors-only',
            action='store_true',
            help='エラー状態のツールのみ再チェック'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='チェックのみ実行（DB更新なし）'
        )
        parser.add_argument(
            '--timeout',
            type=int,
            default=10,
            help='リクエストタイムアウト秒数（デフォルト: 10）'
        )

    def handle(self, *args, **options):
        unchecked_only = options['unchecked_only']
        errors_only = options['errors_only']
        dry_run = options['dry_run']
        timeout = options['timeout']

        # 対象ツールを取得
        queryset = Tool.objects.all()
        
        if unchecked_only:
            queryset = queryset.filter(image_status='unchecked')
            self.stdout.write('対象: 未チェックのツールのみ')
        elif errors_only:
            queryset = queryset.filter(image_status='error')
            self.stdout.write('対象: エラー状態のツールのみ')
        else:
            self.stdout.write('対象: 全ツール')

        tools = list(queryset)
        total = len(tools)
        
        if total == 0:
            self.stdout.write(self.style.WARNING('対象ツールがありません'))
            return

        self.stdout.write(f'チェック対象: {total}件')
        if dry_run:
            self.stdout.write(self.style.WARNING('ドライランモード（DB更新なし）'))

        # 統計
        ok_count = 0
        error_count = 0
        
        for i, tool in enumerate(tools, 1):
            status, error_message = self._check_image_url(tool.image_url, timeout)
            
            # 結果表示
            if status == 'ok':
                ok_count += 1
                self.stdout.write(f'[{i}/{total}] ✅ {tool.name}')
            else:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(f'[{i}/{total}] ❌ {tool.name}: {error_message}')
                )
            
            # DB更新
            if not dry_run:
                tool.image_status = status
                tool.image_last_checked = timezone.now()
                tool.image_error_message = error_message
                tool.save(update_fields=[
                    'image_status',
                    'image_last_checked',
                    'image_error_message'
                ])

        # サマリー
        self.stdout.write('')
        self.stdout.write('=' * 50)
        self.stdout.write(f'チェック完了: {total}件')
        self.stdout.write(self.style.SUCCESS(f'  正常: {ok_count}件'))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'  エラー: {error_count}件'))
        else:
            self.stdout.write(f'  エラー: {error_count}件')

    def _check_image_url(self, url, timeout):
        """
        画像URLの有効性をチェック
        
        HEADリクエストではなくGETリクエスト（ストリーミング）を使用。
        一部のサーバー（MQL5等）はHEADとGETで異なるレスポンスを返すため。
        
        Returns:
            tuple: (status, error_message)
        """
        if not url:
            return 'error', 'URLが空です'
        
        try:
            # GETリクエスト（ストリーミングモード）でチェック
            # stream=Trueで全体をダウンロードせずにヘッダーだけ取得
            response = requests.get(
                url,
                timeout=timeout,
                allow_redirects=True,
                stream=True,  # 全体をダウンロードしない
                headers={
                    'User-Agent': 'ToolRadar ImageChecker/1.0'
                }
            )
            
            # ステータスコードチェック
            if response.status_code == 200:
                # Content-Typeが画像かチェック
                content_type = response.headers.get('Content-Type', '')
                if content_type and not content_type.startswith('image/'):
                    return 'error', f'画像ではありません: {content_type}'
                
                # Content-Lengthチェック（極端に小さい場合は無効）
                content_length = response.headers.get('Content-Length')
                if content_length and int(content_length) < 100:
                    return 'error', f'ファイルサイズが小さすぎます: {content_length}bytes'
                
                # 最初の数バイトを読み取って画像として有効か確認
                try:
                    first_bytes = next(response.iter_content(chunk_size=16))
                    if not first_bytes:
                        return 'error', 'コンテンツが空です'
                    
                    # PNG/JPEG/GIF/WebPのマジックバイトをチェック
                    if not self._is_valid_image_header(first_bytes):
                        return 'error', '有効な画像フォーマットではありません'
                except StopIteration:
                    return 'error', 'コンテンツが空です'
                
                return 'ok', ''
            elif response.status_code == 404:
                return 'error', '画像が見つかりません (404)'
            elif response.status_code == 403:
                return 'error', 'アクセス拒否 (403)'
            else:
                return 'error', f'HTTP {response.status_code}'
                
        except requests.exceptions.Timeout:
            return 'error', f'タイムアウト ({timeout}秒)'
        except requests.exceptions.ConnectionError:
            return 'error', '接続エラー'
        except requests.exceptions.SSLError:
            return 'error', 'SSL証明書エラー'
        except Exception as e:
            return 'error', f'予期せぬエラー: {str(e)}'
    
    def _is_valid_image_header(self, first_bytes):
        """
        画像ファイルのマジックバイトをチェック
        """
        if len(first_bytes) < 2:
            return False
        
        # PNG: 89 50 4E 47 (0x89 P N G)
        if len(first_bytes) >= 4 and first_bytes[:4] == b'\x89PNG':
            return True
        
        # JPEG: FF D8 FF
        if len(first_bytes) >= 3 and first_bytes[:3] == b'\xff\xd8\xff':
            return True
        
        # GIF: GIF87a or GIF89a
        if len(first_bytes) >= 3 and first_bytes[:3] == b'GIF':
            return True
        
        # WebP: RIFF....WEBP
        if len(first_bytes) >= 4 and first_bytes[:4] == b'RIFF':
            return True
        
        # BMP: BM
        if first_bytes[:2] == b'BM':
            return True
        
        # ICO: 00 00 01 00
        if len(first_bytes) >= 4 and first_bytes[:4] == b'\x00\x00\x01\x00':
            return True
        
        return False
