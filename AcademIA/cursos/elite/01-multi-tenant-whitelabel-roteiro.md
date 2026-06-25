# Roteiro da Vídeo Aula: 01 · Multi-tenant e White-label

**Personas:** Sra. Nexus Ive e Sir. Nexus Alencar
**Duração Estimada:** 60 minutos
**Nível:** Elite
**Pré-requisito:** 00-Blueprints Elite

## Cena 1: O Modelo SaaS Aplicado a Afiliados (Duração: 8 minutos)

**Visual:** Sir. Nexus Alencar em cenário enterprise, com diagramas de arquitetura SaaS ao fundo.

**Sir. Nexus Alencar:** "Bem-vindos ao módulo 01 do nível Elite. Hoje vamos dissecar a arquitetura multi-tenant e o modelo white-label. A grande virada acontece quando vocês deixam de pensar como afiliado, que vende comissão por venda, e passam a pensar como provedor, que vende acesso a uma plataforma. A diferença é a diferença entre R$ 100.000/ano e R$ 10.000.000/ano."

**Sra. Nexus Ive:** "Exatamente, Sir. Alencar. E a chave é entender que, no modelo multi-tenant, vocês estão alugando a mesma infraestrutura para múltiplos clientes. Cada cliente vê uma versão personalizada, mas vocês operam uma única plataforma. É o modelo que Salesforce, Shopify, e HubSpot usam para chegar a bilhões em receita."

## Cena 2: Arquitetura Técnica Multi-tenant (Duração: 14 minutos)

**Visual:** Diagrama técnico mostrando 3 abordagens: banco único com coluna tenant_id, banco por tenant, schema por tenant.

**Sir. Nexus Alencar:** "Existem 3 abordagens principais para multi-tenancy. Banco único com coluna tenant_id: mais simples, menor custo, mas com risco de vazamento entre tenants se uma query esquecer o filtro. Banco por tenant: máxima隔离, maior custo, mas compliance mais fácil. Schema por tenant: meio-termo, boa隔离 com custo moderado. Para começar, recomendo banco único com tenant_id e RLS, Row Level Security, no PostgreSQL."

**Sra. Nexus Ive:** "E aqui vai um insight Elite: implementem RLS desde o dia 1. Migrar para RLS depois é extremamente doloroso. Mas se vocês começarem com RLS, o sistema cresce de forma sustentável. As grandes plataformas que quebraram por vazamento de dados foram exatamente as que começaram sem RLS e tentaram adicionar depois."

## Cena 3: White-Label e Personalização (Duração: 14 minutos)

**Visual:** Demonstração de plataforma white-label com branding customizado por tenant.

**Sir. Nexus Alencar:** "White-label é mais que mudar a logo. É oferecer um sistema onde cada tenant vê: sua marca, seu domínio, suas cores, suas configurações, e até suas integrações customizadas. Em termos técnicos, isso significa: sistema de temas, subdomínios automáticos por tenant, e configuração dinâmica de funcionalidades por plano."

**Sra. Nexus Ive:** "E a chave comercial: quanto mais personalizável, mais premium. Ofereçam 3 planos: Starter, Pro, e Enterprise. Starter: R$ 297/mês, branding básico, até 1000 contatos. Pro: R$ 997/mês, branding completo, até 10.000 contatos, suporte prioritário. Enterprise: R$ 4.997/mês, white-label completo, contatos ilimitados, account manager dedicado, SLA de 99.9%."

## Cena 4: Segurança e Compliance (Duração: 12 minutos)

**Visual:** Slide com checklist de segurança: criptografia, audit logs, MFA, GDPR/LGPD, SOC2.

**Sir. Nexus Alencar:** "Multi-tenant sem segurança é uma bomba-relógio. Checklist essencial: criptografia em trânsito e em repouso, audit logs imutáveis, MFA obrigatório para todos os admins, conformidade com LGPD e GDPR, e aspirar a SOC2 Type II se vocês querem contratos enterprise. Cada um desses itens é não-negociável."

**Sra. Nexus Ive:** "E aqui vai um conselho Elite: invistam em segurança antes de investir em marketing. Uma plataforma que vaza dados de 50.000 contatos morre. Uma plataforma que é segura e medíocre sobrevive. A segurança é a base. Construam em cima de uma base sólida."

## Cena 5: Go-to-Market para White-Label (Duração: 12 minutos)

**Visual:** Estratégia de go-to-market em 3 fases: Beta fechado, Lançamento, Escala.

**Sra. Nexus Ive:** "Por fim, como vocês lançam um white-label? Três fases. Fase 1: Beta fechado com 5 a 10 clientes pagantes, com desconto agressivo, e com feedback loop diário. Fase 2: Lançamento público com lista de espera, mostrando case studies do beta. Fase 3: Escala com programa de afiliados próprios vendendo o white-label para outros. A Fase 3 é onde vocês atingem o R$ 1M/mês recorrente."

**Sir. Nexus Alencar:** "Elite, vocês agora têm o playbook completo para construir uma operação que vai de afiliado a provedor de plataforma. O céu é o limite. Nos vemos no módulo 02, onde vamos falar sobre federação de agentes, que é o blueprint mais avançado de todos."
