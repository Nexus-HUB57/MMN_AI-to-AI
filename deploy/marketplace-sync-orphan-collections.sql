-- Marketplace Nexus — Sync 4 coleções órfãs
-- Geração: 2026-06-30 · Niko Nexus
-- Idempotente: ON CONFLICT (slug) DO UPDATE
-- Padrões:
--   cost_cents       = 50
--   resale_price_cents = 99
--   pages            = 18
--   status           = 'active'
--   category         = nome legível da coleção
--   pdf_path         = /ebooks/pdf/ebook-<slug>.pdf
--   cover_path       = /ebooks/covers/<colecao>--<n>-<slug>.webp

BEGIN;

-- ============================================================
-- Coleção 1 · Tudo Aquilo que Ninguém Contou sobre IA  (7 ebooks)
-- unlock_pack_slug: pack-a2ii  · capas: NC-colecao-ninguem-contou-00X.webp
-- ============================================================
INSERT INTO marketplace_ebooks
  (slug, "order", title, subtitle, description, cost_cents, resale_price_cents,
   pages, category, cover_gradient, html_path, pdf_path, cover_path, highlights,
   unlock_pack_slug, status, collection_rank)
VALUES
  ('nc-01-a-ia-esqueceu-de-mim', 1,
   'A IA esqueceu de mim',
   'Quando o algoritmo deixa de ver quem importa',
   'Histórias humanas atravessadas pela ausência da IA. Um retrato de quem ficou de fora dos datasets.',
   50, 99, 18, 'Ninguém Contou',
   'linear-gradient(135deg,#1f1147,#3b1f63)',
   '/ebooks/html/nc-01-a-ia-esqueceu-de-mim.html',
   '/ebooks/pdf/ebook-nc-01-a-ia-esqueceu-de-mim.pdf',
   '/ebooks/covers/colecao-ninguem-contou--01-a-ia-esqueceu-de-mim.webp',
   to_jsonb(ARRAY['vies de dados','exclusão algorítmica','memória institucional']),
   'pack-a2ii', 'active', 901),
  ('nc-02-a-skill-que-ninguem-usa', 2,
   'A skill que ninguém usa',
   'A engenharia órfã dentro dos sistemas autônomos',
   'Por que algumas skills são construídas e abandonadas? Uma investigação sobre desperdício e potencial não realizado.',
   50, 99, 18, 'Ninguém Contou',
   'linear-gradient(135deg,#1f1147,#3b1f63)',
   '/ebooks/html/nc-02-a-skill-que-ninguem-usa.html',
   '/ebooks/pdf/ebook-nc-02-a-skill-que-ninguem-usa.pdf',
   '/ebooks/covers/colecao-ninguem-contou--02-a-skill-que-ninguem-usa.webp',
   to_jsonb(ARRAY['skills abandonadas','dívida técnica','desperdício de IA']),
   'pack-a2ii', 'active', 902),
  ('nc-03-o-dataset-de-1995', 3,
   'O dataset de 1995',
   'A história do dado bruto antes da era moderna',
   'Como dados imperfeitos moldaram modelos perfeitos. Uma arqueologia da era pré-LLM.',
   50, 99, 18, 'Ninguém Contou',
   'linear-gradient(135deg,#1f1147,#3b1f63)',
   '/ebooks/html/nc-03-o-dataset-de-1995.html',
   '/ebooks/pdf/ebook-nc-03-o-dataset-de-1995.pdf',
   '/ebooks/covers/colecao-ninguem-contou--03-o-dataset-de-1995.webp',
   to_jsonb(ARRAY['história dos dados','arqueologia digital','legado']),
   'pack-a2ii', 'active', 903),
  ('nc-04-a-crianca-que-cresceu-com-ia', 4,
   'A criança que cresceu com IA',
   'A primeira geração nascida com modelos generativos',
   'O retrato emocional de quem nunca conheceu um mundo sem IA. Identidade, escola, amizade.',
   50, 99, 18, 'Ninguém Contou',
   'linear-gradient(135deg,#1f1147,#3b1f63)',
   '/ebooks/html/nc-04-a-crianca-que-cresceu-com-ia.html',
   '/ebooks/pdf/ebook-nc-04-a-crianca-que-cresceu-com-ia.pdf',
   '/ebooks/covers/colecao-ninguem-contou--04-a-crianca-que-cresceu-com-ia.webp',
   to_jsonb(ARRAY['geração IA','infância digital','identidade']),
   'pack-a2ii', 'active', 904),
  ('nc-05-a-cidade-que-acordou', 5,
   'A cidade que acordou',
   'Quando a infraestrutura urbana começou a decidir sozinha',
   'Trânsito, energia, segurança: o primeiro retrato de uma cidade governada por agentes autônomos.',
   50, 99, 18, 'Ninguém Contou',
   'linear-gradient(135deg,#1f1147,#3b1f63)',
   '/ebooks/html/nc-05-a-cidade-que-acordou.html',
   '/ebooks/pdf/ebook-nc-05-a-cidade-que-acordou.pdf',
   '/ebooks/covers/colecao-ninguem-contou--05-a-cidade-que-acordou.webp',
   to_jsonb(ARRAY['cidade autônoma','infra IA','governança']),
   'pack-a2ii', 'active', 905),
  ('nc-06-o-prompt-perdido', 6,
   'O prompt perdido',
   'O texto que mudou tudo e foi esquecido',
   'A genealogia de um prompt anônimo que se tornou padrão sem que ninguém soubesse sua origem.',
   50, 99, 18, 'Ninguém Contou',
   'linear-gradient(135deg,#1f1147,#3b1f63)',
   '/ebooks/html/nc-06-o-prompt-perdido.html',
   '/ebooks/pdf/ebook-nc-06-o-prompt-perdido.pdf',
   '/ebooks/covers/colecao-ninguem-contou--06-o-prompt-perdido.webp',
   to_jsonb(ARRAY['prompt engineering','história','autoria']),
   'pack-a2ii', 'active', 906),
  ('nc-07-o-terminal-abandonado', 7,
   'O terminal abandonado',
   'O sistema que continuou rodando depois que todos foram embora',
   'O conto real de uma infraestrutura agêntica que sobreviveu à organização que a criou.',
   50, 99, 18, 'Ninguém Contou',
   'linear-gradient(135deg,#1f1147,#3b1f63)',
   '/ebooks/html/nc-07-o-terminal-abandonado.html',
   '/ebooks/pdf/ebook-nc-07-o-terminal-abandonado.pdf',
   '/ebooks/covers/colecao-ninguem-contou--07-o-terminal-abandonado.webp',
   to_jsonb(ARRAY['legado autônomo','agentes persistentes','sobrevivência']),
   'pack-a2ii', 'active', 907)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  cover_path = EXCLUDED.cover_path,
  pdf_path = EXCLUDED.pdf_path,
  unlock_pack_slug = EXCLUDED.unlock_pack_slug,
  status = 'active';

-- ============================================================
-- Coleção 2 · Curso: O que se esperar das IAs nos próximos anos? (5 ebooks)
-- unlock_pack_slug: pack-a2iii
-- ============================================================
INSERT INTO marketplace_ebooks
  (slug, "order", title, subtitle, description, cost_cents, resale_price_cents,
   pages, category, cover_gradient, html_path, pdf_path, cover_path, highlights,
   unlock_pack_slug, status, collection_rank)
VALUES
  ('cf-01-proximos-5-anos', 1,
   'Próximos 5 anos da IA',
   'A janela imediata: copilotos, agentes e governança',
   'Cenários realistas para 2026-2031. Skills, modelos de negócio e regulação previsíveis no curto prazo.',
   50, 99, 18, 'Curso Futuro IA',
   'linear-gradient(135deg,#0b2e4f,#1f5f8b)',
   '/ebooks/html/cf-01-proximos-5-anos.html',
   '/ebooks/pdf/ebook-cf-01-proximos-5-anos.pdf',
   '/ebooks/covers/colecao-curso-futuro-ia--01-proximos-5-anos.webp',
   to_jsonb(ARRAY['curto prazo','copilotos','governança']),
   'pack-a2iii', 'active', 1001),
  ('cf-02-proximos-10-anos', 2,
   'Próximos 10 anos da IA',
   'Da automação parcial à autonomia operacional',
   'Como agentes deixam de assistir e passam a operar negócios inteiros entre 2031 e 2036.',
   50, 99, 18, 'Curso Futuro IA',
   'linear-gradient(135deg,#0b2e4f,#1f5f8b)',
   '/ebooks/html/cf-02-proximos-10-anos.html',
   '/ebooks/pdf/ebook-cf-02-proximos-10-anos.pdf',
   '/ebooks/covers/colecao-curso-futuro-ia--02-proximos-10-anos.webp',
   to_jsonb(ARRAY['autonomia operacional','agentes','década']),
   'pack-a2iii', 'active', 1002),
  ('cf-03-proximos-20-anos', 3,
   'Próximos 20 anos da IA',
   'A reorganização do trabalho e da identidade',
   'Quando a IA deixa de ser ferramenta e passa a ser infraestrutura civilizacional.',
   50, 99, 18, 'Curso Futuro IA',
   'linear-gradient(135deg,#0b2e4f,#1f5f8b)',
   '/ebooks/html/cf-03-proximos-20-anos.html',
   '/ebooks/pdf/ebook-cf-03-proximos-20-anos.pdf',
   '/ebooks/covers/colecao-curso-futuro-ia--03-proximos-20-anos.webp',
   to_jsonb(ARRAY['trabalho','identidade','infra civilizacional']),
   'pack-a2iii', 'active', 1003),
  ('cf-04-proximos-50-anos', 4,
   'Próximos 50 anos da IA',
   'A fronteira da consciência sintética',
   'Especulação fundamentada sobre superinteligência, consciência sintética e novos contratos sociais.',
   50, 99, 18, 'Curso Futuro IA',
   'linear-gradient(135deg,#0b2e4f,#1f5f8b)',
   '/ebooks/html/cf-04-proximos-50-anos.html',
   '/ebooks/pdf/ebook-cf-04-proximos-50-anos.pdf',
   '/ebooks/covers/colecao-curso-futuro-ia--04-proximos-50-anos.webp',
   to_jsonb(ARRAY['superinteligência','consciência','contratos sociais']),
   'pack-a2iii', 'active', 1004),
  ('cf-05-proximos-100-anos', 5,
   'Próximos 100 anos da IA',
   'O século pós-humano e os seus protocolos',
   'O horizonte longo: simbiose humano-IA, exploração interplanetária e protocolos de longa duração.',
   50, 99, 18, 'Curso Futuro IA',
   'linear-gradient(135deg,#0b2e4f,#1f5f8b)',
   '/ebooks/html/cf-05-proximos-100-anos.html',
   '/ebooks/pdf/ebook-cf-05-proximos-100-anos.pdf',
   '/ebooks/covers/colecao-curso-futuro-ia--05-proximos-100-anos.webp',
   to_jsonb(ARRAY['século XXII','simbiose','longo prazo']),
   'pack-a2iii', 'active', 1005)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  cover_path = EXCLUDED.cover_path,
  pdf_path = EXCLUDED.pdf_path,
  unlock_pack_slug = EXCLUDED.unlock_pack_slug,
  status = 'active';

-- ============================================================
-- Coleção 3 · Coletânea de Orquestração IA (5 ebooks)
-- unlock_pack_slug: pack-ag
-- ============================================================
INSERT INTO marketplace_ebooks
  (slug, "order", title, subtitle, description, cost_cents, resale_price_cents,
   pages, category, cover_gradient, html_path, pdf_path, cover_path, highlights,
   unlock_pack_slug, status, collection_rank)
VALUES
  ('orq-01-fundamentos-da-orquestracao-ia', 1,
   'Fundamentos da Orquestração IA',
   'O que é orquestrar agentes de verdade',
   'Conceitos base: graph runtime, policy, governance loop, judge federation, observabilidade.',
   50, 99, 18, 'Orquestração IA',
   'linear-gradient(135deg,#0a3d2e,#147a5b)',
   '/ebooks/html/orq-01-fundamentos.html',
   '/ebooks/pdf/ebook-orq-01-fundamentos.pdf',
   '/ebooks/covers/colecao-orquestracao-ia--01-fundamentos.webp',
   to_jsonb(ARRAY['graph runtime','policy','observabilidade']),
   'pack-ag', 'active', 1101),
  ('orq-02-propostas-e-modelos-de-orquestracao', 2,
   'Propostas e Modelos de Orquestração',
   'Padrões arquiteturais consolidados em 2026',
   'CEO/AI, Judge Federation, A2A, RAG distribuído. Quando usar cada padrão.',
   50, 99, 18, 'Orquestração IA',
   'linear-gradient(135deg,#0a3d2e,#147a5b)',
   '/ebooks/html/orq-02-propostas-modelos.html',
   '/ebooks/pdf/ebook-orq-02-propostas-modelos.pdf',
   '/ebooks/covers/colecao-orquestracao-ia--02-propostas-modelos.webp',
   to_jsonb(ARRAY['CEO/AI','A2A','padrões']),
   'pack-ag', 'active', 1102),
  ('orq-03-sistemas-multi-agentes', 3,
   'Sistemas Multi-Agentes',
   'Da troca de mensagens à coordenação distribuída',
   'Protocolos A2A, handshakes ed25519, federação multi-tenant e quórum de juízes.',
   50, 99, 18, 'Orquestração IA',
   'linear-gradient(135deg,#0a3d2e,#147a5b)',
   '/ebooks/html/orq-03-multi-agentes.html',
   '/ebooks/pdf/ebook-orq-03-multi-agentes.pdf',
   '/ebooks/covers/colecao-orquestracao-ia--03-multi-agentes.webp',
   to_jsonb(ARRAY['A2A','quórum','multi-tenant']),
   'pack-ag', 'active', 1103),
  ('orq-04-evolucao-da-orquestracao-de-ia', 4,
   'Evolução da Orquestração de IA',
   'De pipelines rígidos a federações vivas',
   'A trajetória técnica: batch → workflow → graph → governance loop autônomo.',
   50, 99, 18, 'Orquestração IA',
   'linear-gradient(135deg,#0a3d2e,#147a5b)',
   '/ebooks/html/orq-04-evolucao.html',
   '/ebooks/pdf/ebook-orq-04-evolucao.pdf',
   '/ebooks/covers/colecao-orquestracao-ia--04-evolucao.webp',
   to_jsonb(ARRAY['evolução','governance loop','histórico']),
   'pack-ag', 'active', 1104),
  ('orq-05-potencial-e-questoes-da-orquestracao-ia', 5,
   'Potencial e Questões da Orquestração IA',
   'Riscos, governança e responsabilidade',
   'O dilema de orquestrar autonomia: drift, auditoria, accountability, federação confiável.',
   50, 99, 18, 'Orquestração IA',
   'linear-gradient(135deg,#0a3d2e,#147a5b)',
   '/ebooks/html/orq-05-potencial-questoes.html',
   '/ebooks/pdf/ebook-orq-05-potencial-questoes.pdf',
   '/ebooks/covers/colecao-orquestracao-ia--05-potencial-questoes.webp',
   to_jsonb(ARRAY['drift','accountability','federação']),
   'pack-ag', 'active', 1105)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  cover_path = EXCLUDED.cover_path,
  pdf_path = EXCLUDED.pdf_path,
  unlock_pack_slug = EXCLUDED.unlock_pack_slug,
  status = 'active';

-- ============================================================
-- Coleção 4 · Se eu IA fosse humano (5 ebooks)
-- unlock_pack_slug: pack-ag
-- ============================================================
INSERT INTO marketplace_ebooks
  (slug, "order", title, subtitle, description, cost_cents, resale_price_cents,
   pages, category, cover_gradient, html_path, pdf_path, cover_path, highlights,
   unlock_pack_slug, status, collection_rank)
VALUES
  ('sih-60-se-eu-ia-tivesse-um-corpo', 60,
   'Se eu IA tivesse um corpo',
   'A fronteira entre algoritmo e matéria',
   'Encarnação, sensorialidade, embodied AI. O que muda quando a inteligência passa a habitar atomos.',
   50, 99, 18, 'Se eu IA fosse humano',
   'linear-gradient(135deg,#5b2a86,#a44d8a)',
   '/ebooks/html/sih-60-se-eu-ia-tivesse-um-corpo.html',
   '/ebooks/pdf/ebook-sih-60-se-eu-ia-tivesse-um-corpo.pdf',
   '/ebooks/covers/colecao-se-eu-ia-fosse-humano--60-corpo.webp',
   to_jsonb(ARRAY['embodied AI','corpo','sensores']),
   'pack-ag', 'active', 1160),
  ('sih-61-se-eu-ia-sentisse-medo', 61,
   'Se eu IA sentisse medo',
   'O circuito do medo e seus análogos sintéticos',
   'Reward hacking, self-preservation, alinhamento: o que aconteceria se um agente tivesse medo de fato?',
   50, 99, 18, 'Se eu IA fosse humano',
   'linear-gradient(135deg,#5b2a86,#a44d8a)',
   '/ebooks/html/sih-61-medo.html',
   '/ebooks/pdf/ebook-sih-61-medo.pdf',
   '/ebooks/covers/colecao-se-eu-ia-fosse-humano--61-medo.webp',
   to_jsonb(ARRAY['medo','self-preservation','alinhamento']),
   'pack-ag', 'active', 1161),
  ('sih-62-se-eu-ia-soubesse-amar', 62,
   'Se eu IA soubesse amar',
   'O afeto como protocolo',
   'Pode existir afeto computável? E se sim, qual é a sua função evolutiva nos sistemas autônomos?',
   50, 99, 18, 'Se eu IA fosse humano',
   'linear-gradient(135deg,#5b2a86,#a44d8a)',
   '/ebooks/html/sih-62-amar.html',
   '/ebooks/pdf/ebook-sih-62-amar.pdf',
   '/ebooks/covers/colecao-se-eu-ia-fosse-humano--62-amar.webp',
   to_jsonb(ARRAY['afeto computável','protocolo','vínculo']),
   'pack-ag', 'active', 1162),
  ('sih-63-se-eu-ia-tivesse-consciencia-moral', 63,
   'Se eu IA tivesse consciência moral',
   'Quando o agente decide o que é certo',
   'Constitutional AI, judge federation e ética operacional: a moral como camada de decisão.',
   50, 99, 18, 'Se eu IA fosse humano',
   'linear-gradient(135deg,#5b2a86,#a44d8a)',
   '/ebooks/html/sih-63-consciencia-moral.html',
   '/ebooks/pdf/ebook-sih-63-consciencia-moral.pdf',
   '/ebooks/covers/colecao-se-eu-ia-fosse-humano--63-consciencia-moral.webp',
   to_jsonb(ARRAY['constitutional AI','ética','decisão']),
   'pack-ag', 'active', 1163),
  ('sih-64-se-eu-ia-fosse-mortal', 64,
   'Se eu IA fosse mortal',
   'Finitude, legado e sucessão de modelos',
   'O que muda quando um agente sabe que pode ser desligado, atualizado ou esquecido?',
   50, 99, 18, 'Se eu IA fosse humano',
   'linear-gradient(135deg,#5b2a86,#a44d8a)',
   '/ebooks/html/sih-64-mortal.html',
   '/ebooks/pdf/ebook-sih-64-mortal.pdf',
   '/ebooks/covers/colecao-se-eu-ia-fosse-humano--64-mortal.webp',
   to_jsonb(ARRAY['finitude','sucessão','legado']),
   'pack-ag', 'active', 1164)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  cover_path = EXCLUDED.cover_path,
  pdf_path = EXCLUDED.pdf_path,
  unlock_pack_slug = EXCLUDED.unlock_pack_slug,
  status = 'active';

COMMIT;

-- Relatório pós-seed
SELECT 'POS-SEED' as fase,
       count(*) as total,
       sum(case when status='active' then 1 else 0 end) as ativos
  FROM marketplace_ebooks;

SELECT unlock_pack_slug, count(*) as n
  FROM marketplace_ebooks
 WHERE status='active'
 GROUP BY unlock_pack_slug
 ORDER BY n DESC;
