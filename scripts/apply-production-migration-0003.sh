#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATION_FILE="$ROOT_DIR/database/migrations/0003_agent_extras.sql"

if ! command -v psql >/dev/null 2>&1; then
  echo "[ERROR] psql não encontrado. Instale o cliente PostgreSQL antes de executar." >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[ERROR] DATABASE_URL não definido no ambiente." >&2
  echo "Exemplo: export DATABASE_URL='postgres://user:password@host:5432/database'" >&2
  exit 1
fi

if [[ ! -f "$MIGRATION_FILE" ]]; then
  echo "[ERROR] Migration não encontrada em $MIGRATION_FILE" >&2
  exit 1
fi

echo "[INFO] Aplicando migration 0003_agent_extras.sql..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION_FILE"

echo "[INFO] Validando tabelas criadas..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "\dt generated_images recommended_products agent_skills_runtime agent_evolution_history"

echo "[OK] Migration 0003 aplicada e validada com sucesso."
