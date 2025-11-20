@echo off
REM ============================================================
REM ToolRadar - EventLog自動クリーンアップ (Windows用)
REM ============================================================

REM プロジェクトディレクトリに移動
cd /d C:\Users\kwwit\Desktop\trading-tools-platform

REM ログディレクトリ作成
if not exist logs mkdir logs

REM 現在時刻をログファイル名に含める
set LOGFILE=logs\cleanup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.log
set LOGFILE=%LOGFILE: =0%

echo [%date% %time%] Cleanup started >> %LOGFILE%

REM Docker Composeでcleanup_eventsを実行
docker compose exec -T backend python manage.py cleanup_events >> %LOGFILE% 2>&1

echo [%date% %time%] Cleanup completed >> %LOGFILE%
echo. >> %LOGFILE%
