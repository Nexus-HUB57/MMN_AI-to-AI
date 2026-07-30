-- CEO-018: Constraint unica defensiva para email normalizado (case-insensitive)
-- Bloqueia cadastros duplicados como manus.ia@outlook.com vs MANUS.IA@Outlook.com.
-- Nao remove dados; falha explicitamente se ja existirem duplicatas nao resolvidas.

BEGIN;

-- Cria indice unico sobre lower(email) somente para linhas com email nao nulo.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
  ON users ((lower(email)))
  WHERE email IS NOT NULL;

COMMIT;
