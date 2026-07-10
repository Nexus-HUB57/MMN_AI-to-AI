#!/usr/bin/env bash
# Onda 37 retry: re-upload videos 01-08 + 14 after YouTube quota reset
set -euo pipefail
cd /var/www/oneverso/current
LOG=/var/www/oneverso/logs/youtube-onda37-retry-$(date +%Y%m%d-%H%M).log

python3 scripts/youtube/upload_academia_youtube.py --limit 10 > "$LOG" 2>&1

# Count success
OK=$(grep -c '^ok ' "$LOG" 2>/dev/null || echo 0)
echo "$(date -Iseconds) uploads_ok=$OK" >> /var/www/oneverso/logs/youtube-onda37-progress.log

# When 9 uploaded, remove cron
TOTAL_OK=$(grep -c '^ok ' /var/www/oneverso/logs/youtube-onda37-retry-*.log 2>/dev/null | awk -F: '{s+=$2} END {print s}')
if [ "${TOTAL_OK:-0}" -ge 9 ]; then
  crontab -l 2>/dev/null | grep -v cron_retry_onda37.sh | crontab -
  echo "$(date -Iseconds) COMPLETE - cron removed" >> /var/www/oneverso/logs/youtube-onda37-progress.log
fi
