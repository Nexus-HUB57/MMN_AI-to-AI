#!/usr/bin/env bash
# Roda upload em loop ate conseguir - executa a cada 6h via cron
cd /var/www/oneverso/current
LOG=/var/www/oneverso/logs/republish-$(date +%Y%m%d-%H%M).log
mkdir -p /var/www/oneverso/logs
python3 scripts/youtube/republish_academia.py upload >> "$LOG" 2>&1
# Se todos 11 uploads ok, remove o cron
DONE=$(grep -c "^\[ok\]" "$LOG")
if [ "$DONE" -ge "11" ]; then
    crontab -l 2>/dev/null | grep -v cron_republish.sh | crontab -
    echo "$(date): TODOS OS 11 UPLOADS CONCLUIDOS - cron removido" >> /var/www/oneverso/logs/republish-final.log
fi
