from django.db import models
from django.utils import timezone
from django.db.models import Q



class ASPAd(models.Model):
    """ASP広告管理（業界標準設計 - WordPress Advanced Ads/AdRotate方式）"""
    
    # 配置場所の選択肢
    PLACEMENT_CHOICES = [
        # === ASP広告（高収益） ===
        ('homepage-middle', 'トップページ 中盤（ASP）'),
        ('sidebar-top', 'サイドバー ランキング直後（ASP）'),
        ('tool-detail-bottom', 'ツール詳細 下部（ASP）'),
        
        # === AdSense（汎用） ===
        ('tool-detail-middle', 'ツール詳細 中盤（AdSense）'),
        ('homepage-bottom', 'トップページ 下部（AdSense）'),
    ]
    
    # ===== 基本情報 =====
    name = models.CharField(
        max_length=200,
        verbose_name='広告名',
        help_text='管理用の名前（例: DMM FX 新規口座開設キャンペーン 2025/10）'
    )
    
    # ===== 広告コード（最重要） =====
    ad_code = models.TextField(
        verbose_name='広告コード',
        help_text='A8.netなどのASPからコピーしたHTMLタグをそのまま貼り付けてください'
    )
    
    # ===== 配置設定 =====
    placement = models.CharField(
        max_length=50,
        choices=PLACEMENT_CHOICES,
        verbose_name='配置場所',
        help_text='広告を表示する場所を選択',
        db_index=True
    )
    
    # ===== 期限設定 =====
    start_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='開始日時',
        help_text='この日時から広告を表示（未設定の場合は即時表示）'
    )
    
    end_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='終了日時',
        help_text='この日時で広告を自動停止（未設定の場合は無期限）'
    )
    
    # ===== ローテーション制御 =====
    priority = models.IntegerField(
        default=1,
        verbose_name='優先度',
        help_text='数字が小さいほど優先表示（1が最優先）'
    )
    
    weight = models.IntegerField(
        default=10,
        verbose_name='重み',
        help_text='ランダム表示時の出現確率（1-100）'
    )
    
    # ===== 効果測定 =====
    impressions = models.IntegerField(
        default=0,
        editable=False,
        verbose_name='表示数（Impression）',
        help_text='広告が表示された回数'
    )
    
    clicks = models.IntegerField(
        default=0,
        editable=False,
        verbose_name='クリック数（Click）',
        help_text='広告がクリックされた回数'
    )
    
    # ===== ステータス =====
    is_active = models.BooleanField(
        default=True,
        verbose_name='有効',
        help_text='チェックを外すと非表示になります'
    )
    
    # タイムスタンプ
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='作成日時'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新日時'
    )
    
    class Meta:
        ordering = ['placement', 'priority', '-weight']
        verbose_name = 'ASP広告'
        verbose_name_plural = 'ASP広告'
        indexes = [
            models.Index(fields=['placement', 'is_active', 'priority']),
            models.Index(fields=['is_active', 'start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_placement_display()})"
    
    @property
    def ctr(self):
        """クリック率（CTR）を計算"""
        if self.impressions == 0:
            return 0.0
        return (self.clicks / self.impressions) * 100
    
    def is_valid_period(self):
        """現在が有効期間内かチェック"""
        from django.utils import timezone
        now = timezone.now()
        
        # 開始日チェック
        if self.start_date and now < self.start_date:
            return False
        
        # 終了日チェック
        if self.end_date and now > self.end_date:
            return False
        
        return True
    
    def increment_impressions(self):
        """表示数をインクリメント"""
        self.impressions += 1
        self.save(update_fields=['impressions'])
    
    def increment_clicks(self):
        """クリック数をインクリメント"""
        self.clicks += 1
        self.save(update_fields=['clicks'])
