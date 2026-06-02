-- =====================================================================
-- Migration 0006: Nexus Partners Pack — renomeação canônica de planId
-- =====================================================================
-- Esta migration normaliza os identificadores de plano da tabela
-- `subscriptions` (produto Nexus Partners Pack) para a nova convenção
-- comercial, desvinculada da nomenclatura da jornada de carreira do
-- Nexus Affil'IA'te (que continua usando `pack-a2`, `pack-ag`, ...).
--
-- Mapeamento aplicado:
--   pack-a2  ->  nexus-start
--   pack-ag  ->  nexus-growth
--   pack-aa  ->  nexus-enterprise
--
-- Escopo:
--   - subscriptions.plan_id
--   - subscription_events.from_plan_id
--   - subscription_events.to_plan_id
--
-- Esta migration é idempotente: pode ser executada múltiplas vezes
-- sem efeito colateral (rodadas subsequentes não encontram registros
-- legados e ficam no-op).
-- =====================================================================

BEGIN;

-- 1. subscriptions.plan_id ---------------------------------------------
UPDATE subscriptions
   SET plan_id = 'nexus-start',
       updated_at = NOW()
 WHERE plan_id = 'pack-a2';

UPDATE subscriptions
   SET plan_id = 'nexus-growth',
       updated_at = NOW()
 WHERE plan_id = 'pack-ag';

UPDATE subscriptions
   SET plan_id = 'nexus-enterprise',
       updated_at = NOW()
 WHERE plan_id = 'pack-aa';

-- 2. subscription_events.from_plan_id ----------------------------------
UPDATE subscription_events
   SET from_plan_id = 'nexus-start'
 WHERE from_plan_id = 'pack-a2';

UPDATE subscription_events
   SET from_plan_id = 'nexus-growth'
 WHERE from_plan_id = 'pack-ag';

UPDATE subscription_events
   SET from_plan_id = 'nexus-enterprise'
 WHERE from_plan_id = 'pack-aa';

-- 3. subscription_events.to_plan_id ------------------------------------
UPDATE subscription_events
   SET to_plan_id = 'nexus-start'
 WHERE to_plan_id = 'pack-a2';

UPDATE subscription_events
   SET to_plan_id = 'nexus-growth'
 WHERE to_plan_id = 'pack-ag';

UPDATE subscription_events
   SET to_plan_id = 'nexus-enterprise'
 WHERE to_plan_id = 'pack-aa';

-- 4. Anotar a renomeação no metadata das assinaturas afetadas ----------
--    (não-destrutivo, apenas anexa marcador de auditoria)
UPDATE subscriptions
   SET metadata = COALESCE(metadata, '{}'::jsonb)
                 || jsonb_build_object(
                      'planIdRenamedAt', NOW()::text,
                      'planIdRenamedFrom', 'legacy-pack-id'
                    )
 WHERE plan_id IN ('nexus-start', 'nexus-growth', 'nexus-enterprise')
   AND NOT (metadata ? 'planIdRenamedAt');

COMMIT;

-- =====================================================================
-- Verificação opcional (rodar manualmente após a migration):
--
--   SELECT plan_id, COUNT(*) AS total
--     FROM subscriptions
--    GROUP BY plan_id
--    ORDER BY plan_id;
--
--   -- Esperado: apenas nexus-start, nexus-growth, nexus-enterprise
-- =====================================================================
