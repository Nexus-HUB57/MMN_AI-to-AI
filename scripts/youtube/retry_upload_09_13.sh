#!/usr/bin/env bash
# Retry YouTube upload for videos 09-13 after quota reset (~24h)
# Uploads as PRIVATE per Onda 33 standard
set -euo pipefail
cd /var/www/oneverso/current
python3 /tmp/update_plan.py
echo "=== Retry upload PRIVATE ==="
python3 scripts/youtube/upload_academia_youtube.py --limit 5
echo ""
echo "=== Sync DB with youtube_video_id ==="
python3 - <<'PY'
import json, subprocess
from pathlib import Path
r = json.loads(Path("AcademIA/youtube/upload_results.json").read_text())
mapping = {
    "09": "master-01", "10": "master-02", "11": "master-03",
    "12": "elite-01",  "13": "elite-02",
}
for row in r.get("uploaded", []):
    code = row.get("code")
    vid = row.get("video_id")
    if code in mapping:
        lesson = mapping[code]
        sql = f"UPDATE academia_lessons SET youtube_video_id='{vid}', youtube_status='private', youtube_channel='@NexusAffilIAte-w9p', updated_at=now(), updated_by='onda-33-retry' WHERE lesson_id='{lesson}';"
        subprocess.run(["sudo", "-u", "postgres", "psql", "nexus_prod", "-c", sql], check=False)
        print(f"synced {lesson} -> {vid}")
PY
