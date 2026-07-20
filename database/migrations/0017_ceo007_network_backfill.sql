-- ============================================================================
-- CEO-007: Backfill rede binaria — vincular afiliados existentes aos seus sponsors
-- ============================================================================
-- Problema: authRouter.signUp recebia sponsorCode mas NUNCA inseria na tabela
-- `network` nem setava `affiliates.sponsorId`. Este script repara os dados
-- existentes usando o log do niko_operational_memory (que gravava sponsorCode
-- em JSON no campo `decision`).
--
-- Como usar (via psql ou no backend):
--   psql $DATABASE_URL -f database/migrations/0017_ceo007_network_backfill.sql
--
-- IMPORTANTE: Este script é idempotente — pode ser rodado multiplas vezes.
-- ============================================================================

BEGIN;

-- 1. Cria tabela temporaria com os pares (userId, sponsorCode) extraidos do log
CREATE TEMPORARY TABLE _signup_log_extract AS
SELECT DISTINCT
  (payload->>'userId')::int AS user_id,
  payload->>'sponsorCode' AS sponsor_code
FROM (
  SELECT decision::json AS payload
  FROM niko_operational_memory
  WHERE episode_type = 'signup'
    AND decision LIKE '%sponsorCode%'
    AND decision NOT LIKE '%"sponsorCode":null%'
    AND decision NOT LIKE '%"sponsorCode":""%'
) sub
WHERE (payload->>'userId')::int > 0
  AND payload->>'sponsorCode' IS NOT NULL
  AND payload->>'sponsorCode' != '';

-- 2. Para cada par, resolve o sponsorCode → sponsor.affiliates.id e cria o link
-- Atualiza affiliates.sponsorId (se ainda NULL)
UPDATE affiliates dst
SET "sponsorId" = src_spon.id,
    "updatedAt" = NOW()
FROM _signup_log_extract log
JOIN affiliates src_spon ON src_spon."affiliateCode" = log.sponsor_code
WHERE dst."userId" = log.user_id
  AND (dst."sponsorId" IS NULL OR dst."sponsorId" = 0);

-- 3. Insere na tabela network (nivel 1 = direto) se nao existir
INSERT INTO network ("userId", "sponsorId", level, "createdAt")
SELECT DISTINCT
  log.user_id,
  src_spon.id AS sponsor_id,
  1,
  NOW()
FROM _signup_log_extract log
JOIN affiliates src_spon ON src_spon."affiliateCode" = log.sponsor_code
WHERE NOT EXISTS (
  SELECT 1 FROM network n
  WHERE n."userId" = log.user_id
    AND n."sponsorId" = src_spon.id
);

-- 4. Log de auditoria
INSERT INTO niko_operational_memory (episode_type, subject, decision, rationale, autonomy_level)
SELECT
  'backfill',
  'network_backfill_executed',
  json_build_object(
    'total_extracted', COUNT(*),
    'affiliates_updated', (SELECT count(*) FROM _signup_log_extract log JOIN affiliates src_spon ON src_spon."affiliateCode" = log.sponsor_code JOIN affiliates dst ON dst."userId" = log.user_id),
    'network_inserted', (SELECT count(*) FROM _signup_log_extract log JOIN affiliates src_spon ON src_spon."affiliateCode" = log.sponsor_code WHERE NOT EXISTS (SELECT 1 FROM network n WHERE n."userId" = log.user_id AND n."sponsorId" = src_spon.id))
  )::text,
  'CEO-007: Backfill automatico de rede binaria via niko_operational_memory',
  'execute_medium';

DROP TABLE _signup_log_extract;

COMMIT;

-- ============================================================================
-- Verificacao: quantos diretos cada sponsor tem agora
-- ============================================================================
SELECT
  s."affiliateCode" AS sponsor_code,
  u_spon.name AS sponsor_name,
  COUNT(n.id) AS direct_count,
  STRING_AGG(u_dir.name, ', ' ORDER BY n."createdAt") AS directs
FROM affiliates s
LEFT JOIN network n ON n."sponsorId" = s.id AND n.level = 1
LEFT JOIN users u_spon ON u_spon.id = s."userId"
LEFT JOIN users u_dir ON u_dir.id = n."userId"
GROUP BY s.id, s."affiliateCode", u_spon.name
HAVING COUNT(n.id) > 0
ORDER BY direct_count DESC;
