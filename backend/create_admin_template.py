#\!/usr/bin/env python3
"""Admin テンプレートファイル作成スクリプト"""
import os
from pathlib import Path

# ディレクトリ作成
template_dir = Path('tools/templates/admin/tools/eventlog')
template_dir.mkdir(parents=True, exist_ok=True)

# テンプレート内容
template_content = '''{% extends "admin/change_list.html" %}
{% load i18n humanize %}

{% block content_title %}
    {{ block.super }}
    
    {% if db_stats %}
    <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 15px 0;">
        <h2 style="margin-top: 0; font-size: 16px; color: #333;">
            📊 EventLog データベース統計
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
            <div style="background: white; padding: 12px; border-radius: 4px; border-left: 4px solid #007bff;">
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">💾 テーブルサイズ</div>
                <div style="font-size: 20px; font-weight: bold; color: #007bff;">{{ db_stats.table_size }}</div>
            </div>
            
            <div style="background: white; padding: 12px; border-radius: 4px; border-left: 4px solid #28a745;">
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">📈 総イベント数</div>
                <div style="font-size: 20px; font-weight: bold; color: #28a745;">{{ db_stats.total_events|intcomma }}件</div>
            </div>
            
            <div style="background: white; padding: 12px; border-radius: 4px; border-left: 4px solid #ffc107;">
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">📅 直近7日間</div>
                <div style="font-size: 20px; font-weight: bold; color: #ffc107;">{{ db_stats.week_events|intcomma }}件</div>
            </div>
            
            <div style="background: white; padding: 12px; border-radius: 4px; border-left: 4px solid #17a2b8;">
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">📆 直近30日間</div>
                <div style="font-size: 20px; font-weight: bold; color: #17a2b8;">{{ db_stats.month_events|intcomma }}件</div>
            </div>
        </div>
        
        {% if db_stats.event_stats %}
        <div style="margin-top: 15px; background: white; padding: 12px; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">📊 イベント種別内訳</h3>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                {% for stat in db_stats.event_stats %}
                <div style="padding: 8px 12px; background: #f8f9fa; border-radius: 4px;">
                    <span style="font-weight: bold; color: #495057;">{{ stat.event_type }}</span>: 
                    <span style="color: #007bff;">{{ stat.count|intcomma }}件</span>
                </div>
                {% endfor %}
            </div>
        </div>
        {% endif %}
        
        {% if db_stats.oldest_date %}
        <div style="margin-top: 10px; font-size: 12px; color: #6c757d;">
            🕐 最古のレコード: {{ db_stats.oldest_date|date:"Y年m月d日 H:i" }}
        </div>
        {% endif %}
        
        <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
            <div style="font-size: 12px; font-weight: bold; color: #856404; margin-bottom: 5px;">
                🧹 クリーンアップコマンド
            </div>
            <code style="font-size: 11px; color: #495057; background: white; padding: 4px 8px; border-radius: 3px; display: inline-block;">
                docker compose exec backend python manage.py cleanup_events
            </code>
        </div>
    </div>
    {% endif %}
{% endblock %}
'''

# ファイル書き込み
template_file = template_dir / 'change_list.html'
with open(template_file, 'w', encoding='utf-8') as f:
    f.write(template_content)

print(f'✅ テンプレートファイル作成完了: {template_file}')
print(f'   フルパス: {template_file.absolute()}')
