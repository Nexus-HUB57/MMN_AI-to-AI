#!/usr/bin/env bash
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
echo "[safe-update] preservando arquivos locais e atualizando repo"
git fetch origin --prune
CUR_BRANCH=$(git branch --show-current)
STAMP=$(date +%Y%m%d_%H%M%S)
git branch "backup/safe-update-$STAMP" >/dev/null 2>&1 || true
git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore(repo): preserva arquivos locais antes de atualizar" || true
fi
git pull --no-rebase --no-edit origin "$CUR_BRANCH" || true
echo "[safe-update] concluído sem apagar pastas locais"
