from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.asp.models import ASPAd


class Command(BaseCommand):
    help = 'ASP広告のテストデータを投入'

    def handle(self, *args, **options):
        self.stdout.write('=' * 60)
        self.stdout.write('ASP広告テストデータ投入開始')
        self.stdout.write('=' * 60)
        
        # 既存データを削除
        deleted_count = ASPAd.objects.all().delete()[0]
        self.stdout.write(f'既存データ削除: {deleted_count}件')
        
        # テストデータ
        test_ads = [
            {
                'name': 'DMM FX 口座開設キャンペーン 2025/10',
                'ad_code': '''<a href="https://px.a8.net/svt/ejp?a8mat=XXXXX&a8ejpredirect=https%3A%2F%2Ffx.dmm.com%2F" rel="nofollow noopener" target="_blank">
  <img border="0" width="300" height="250" alt="DMM FX - 口座開設キャンペーン実施中" src="https://www18.a8.net/0.gif?a8mat=XXXXX">
</a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=XXXXX" alt="">''',
                'placement': 'homepage-middle',
                'priority': 1,
                'weight': 30,
                'is_active': True,
            },
            {
                'name': 'GMOクリック証券 新規口座開設',
                'ad_code': '''<a href="https://px.a8.net/svt/ejp?a8mat=YYYYY&a8ejpredirect=https%3A%2F%2Fwww.click-sec.com%2F" rel="nofollow noopener" target="_blank">
  <img border="0" width="300" height="250" alt="GMOクリック証券 - 業界最安水準の手数料" src="https://www18.a8.net/0.gif?a8mat=YYYYY">
</a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=YYYYY" alt="">''',
                'placement': 'homepage-middle',
                'priority': 2,
                'weight': 20,
                'is_active': True,
            },
            {
                'name': 'SBI証券 総合口座開設',
                'ad_code': '''<a href="https://px.a8.net/svt/ejp?a8mat=ZZZZZ&a8ejpredirect=https%3A%2F%2Fwww.sbisec.co.jp%2F" rel="nofollow noopener" target="_blank">
  <img border="0" width="300" height="250" alt="SBI証券 - ネット証券No.1" src="https://www18.a8.net/0.gif?a8mat=ZZZZZ">
</a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=ZZZZZ" alt="">''',
                'placement': 'sidebar-top',
                'priority': 1,
                'weight': 25,
                'is_active': True,
            },
            {
                'name': '楽天証券 口座開設プログラム',
                'ad_code': '''<a href="https://px.a8.net/svt/ejp?a8mat=AAAAA&a8ejpredirect=https%3A%2F%2Fwww.rakuten-sec.co.jp%2F" rel="nofollow noopener" target="_blank">
  <img border="0" width="300" height="250" alt="楽天証券 - 楽天ポイントが貯まる" src="https://www18.a8.net/0.gif?a8mat=AAAAA">
</a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=AAAAA" alt="">''',
                'placement': 'blog-middle',
                'priority': 1,
                'weight': 15,
                'is_active': True,
            },
            {
                'name': 'マネックス証券 新規口座開設',
                'ad_code': '''<a href="https://px.a8.net/svt/ejp?a8mat=BBBBB&a8ejpredirect=https%3A%2F%2Fwww.monex.co.jp%2F" rel="nofollow noopener" target="_blank">
  <img border="0" width="728" height="90" alt="マネックス証券 - 米国株取引なら" src="https://www18.a8.net/0.gif?a8mat=BBBBB">
</a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=BBBBB" alt="">''',
                'placement': 'blog-bottom',
                'priority': 1,
                'weight': 10,
                'is_active': True,
            },
            {
                'name': 'テスト広告（非アクティブ）',
                'ad_code': '<p>この広告は表示されません</p>',
                'placement': 'homepage-bottom',
                'priority': 99,
                'weight': 1,
                'is_active': False,
            },
        ]
        
        # データ投入
        created_ads = []
        for ad_data in test_ads:
            ad = ASPAd.objects.create(**ad_data)
            created_ads.append(ad)
            status = '✓' if ad.is_active else '✗'
            self.stdout.write(
                f'  {status} {ad.name} (placement: {ad.placement}, priority: {ad.priority}, weight: {ad.weight})'
            )
        
        self.stdout.write('')
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS(f'✓ {len(created_ads)}件のテストデータを投入しました'))
        self.stdout.write('=' * 60)
        self.stdout.write('')
        
        # サマリー表示
        self.stdout.write('配置場所別の広告数:')
        for placement, label in ASPAd.PLACEMENT_CHOICES:
            count = ASPAd.objects.filter(placement=placement, is_active=True).count()
            if count > 0:
                self.stdout.write(f'  - {label}: {count}件')
