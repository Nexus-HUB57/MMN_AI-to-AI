BEGIN;
ALTER TABLE marketplace_ebooks ADD COLUMN IF NOT EXISTS collection_rank INTEGER DEFAULT 999;
UPDATE marketplace_ebooks SET collection_rank = CASE category
  WHEN 'Nexus Affil''IA''te Store'         THEN 1
  WHEN 'Coleção MAESTRIA IA APLICADA'      THEN 2
  WHEN 'Coleção GNOXS'                     THEN 3
  WHEN 'Coleção AXIOMA PRIME'              THEN 4
  WHEN 'Coleção AgenticAI Revolução'       THEN 5
  WHEN 'Curso Futuro IA'                   THEN 6
  WHEN 'Coleção Criadores da IA'           THEN 7
  WHEN 'Coleção HUMAN_IA'                  THEN 8
  WHEN 'Coleção Se Eu IA Fosse Humano'     THEN 9
  WHEN 'Coleção NEXUS PROTOCOL'            THEN 10
  WHEN 'Coletânea Orquestração IA'         THEN 11
  WHEN 'Coleção IAs para Todos e Tudo'     THEN 12
  WHEN 'Coleção As Novas Profissões da IA' THEN 13
  WHEN 'Coleção A IA Perfeita'             THEN 14
  WHEN 'Coleção IA se Descreve'            THEN 15
  WHEN 'Coleção Ninguém Contatado'         THEN 16
  WHEN 'Coleção FORJA AGÊNTICA'            THEN 17
  WHEN 'Coleção MMN_IA'                    THEN 18
  WHEN 'Curso Universo IA'                 THEN 19
  ELSE 999
END;
CREATE INDEX IF NOT EXISTS idx_marketplace_ebooks_rank ON marketplace_ebooks (collection_rank, "order");
COMMIT;
