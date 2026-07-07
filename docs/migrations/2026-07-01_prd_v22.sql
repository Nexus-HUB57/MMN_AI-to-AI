-- PRD v2.2 Migration — Helena Nexus (CMO/AI) — 2026-07-01
BEGIN;

DELETE FROM marketplace_orders
 WHERE id LIKE 'd15-%' OR id LIKE 'd7-%' OR id LIKE 'ord_d16%' OR id LIKE 'ord_d17%';

DELETE FROM materials WHERE title ILIKE '%demo%' OR title ILIKE '%test%' OR title ILIKE '%exemplo%';

UPDATE settings SET
  support_email = 'equipenexus@oneverso.com.br',
  matrix_lateral_limits = '{"1":25,"2":125,"3":625,"4":3125,"5":15625}'::jsonb,
  updated_at = NOW()
WHERE id = 1;

DELETE FROM commission_rules WHERE version = 'v2.2';
INSERT INTO commission_rules (level, percentage, version, active, created_at) VALUES
  (1, 10.00, 'v2.2', true, NOW()),
  (2,  5.00, 'v2.2', true, NOW()),
  (3,  3.00, 'v2.2', true, NOW()),
  (4,  1.50, 'v2.2', true, NOW()),
  (5,  0.50, 'v2.2', true, NOW());

UPDATE commission_rules SET active = false WHERE version != 'v2.2';

UPDATE meeting_signals SET status = 'active', updated_at = NOW()
WHERE role IN ('ceo','cfo','cmo','coo','cpo','cto');

INSERT INTO audit_log (actor_id, action, target_type, snapshot, created_at)
VALUES (1, 'prd_v2.2_deploy', 'system',
  jsonb_build_object('version','v2.2.0','owner','helena_nexus','timestamp', NOW()::text),
  NOW());

COMMIT;

SELECT 'admin_count=' || COUNT(*) AS metric FROM users WHERE role='admin'
UNION ALL SELECT 'total_users=' || COUNT(*) FROM users
UNION ALL SELECT 'marketplace_orders_final=' || COUNT(*) FROM marketplace_orders
UNION ALL SELECT 'materials_final=' || COUNT(*) FROM materials
UNION ALL SELECT 'meeting_signals=' || COUNT(*) FROM meeting_signals
UNION ALL SELECT 'commission_rules_active=' || COUNT(*) FROM commission_rules WHERE active=true
UNION ALL SELECT 'settings_email=' || support_email FROM settings WHERE id=1;
