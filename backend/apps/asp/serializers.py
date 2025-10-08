from rest_framework import serializers
from .models import Broker


class BrokerSerializer(serializers.ModelSerializer):
    """ASP証券会社シリアライザー"""
    
    class Meta:
        model = Broker
        fields = [
            'id',
            'name',
            'logo',
            'features',
            'bonus',
            'cta_url',
            'tracking_id',
            'rank',
        ]
        read_only_fields = ['id']
