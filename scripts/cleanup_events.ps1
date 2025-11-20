# ============================================================
# ToolRadar - EventLog自動クリーンアップ (PowerShell版)
# ============================================================

# プロジェクトディレクトリ
$ProjectDir = "C:\Users\kwwit\Desktop\trading-tools-platform"
Set-Location $ProjectDir

# ログディレクトリ作成
$LogDir = Join-Path $ProjectDir "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

# ログファイル名（日時付き）
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "cleanup_$Timestamp.log"

# ログ開始
"[$(Get-Date)] Cleanup started" | Out-File -Append $LogFile

# Docker Composeでcleanup_eventsを実行
docker compose exec -T backend python manage.py cleanup_events | Out-File -Append $LogFile

# ログ終了
"[$(Get-Date)] Cleanup completed`n" | Out-File -Append $LogFile

# 古いログファイルを削除（30日以上前）
Get-ChildItem $LogDir -Filter "cleanup_*.log" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
    Remove-Item -Force

Write-Host "Cleanup completed. Log: $LogFile"
