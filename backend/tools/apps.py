from django.apps import AppConfig


class ToolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tools'
    
    def ready(self):
        """
        Djangoアプリケーション起動時に実行される処理
        
        スケジューラーを自動起動します。
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # スケジューラーをインポートして起動
            from .scheduler import start_scheduler
            start_scheduler()
            logger.info("ToolsConfig: スケジューラーを起動しました")
        except Exception as e:
            logger.error(f"ToolsConfig: スケジューラー起動エラー: {e}", exc_info=True)
