-- Onda 16: Popular tabela network com afiliados existentes
-- Preencher level 1 (diretos) a partir de affiliates.sponsorId

INSERT INTO network ("userId", "sponsorId", level)
SELECT a."userId", a."sponsorId", 1
FROM affiliates a
WHERE a."sponsorId" IS NOT NULL
  AND a.status='active'
ON CONFLICT DO NOTHING;
