title: "04 · Mapa de Persona"
description: "Template completo de Buyer Persona com dados demográficos, psicográficos e jornada"
tags: [lab-nexus, marketing, persona, icp, buyer-persona]
category: marketing
level: fundamental
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: audience-segmenter
course_anchor: cursos/fundamental/01-entendendo-ioaid.md
👤 04 · Mapa de Persona (Buyer Persona)
Template de Buyer Persona em 8 seções + prompt gerador. Cria clareza absoluta sobre quem você está falando.

🎯 Spec
Atributo	Valor
O que é	1 persona detalhada por produto/segmento + framework para criar N personas
Quando usar	Antes de criar copy, anúncios, e-mails, conteúdo. Use sempre.
Pré-requisitos	Nível 🥉 Fundamental; dados de clientes (pesquisa/entrevistas)
Tempo estimado	30 min para criar 1 persona
Skill que executa	audience-segmenter
Judge que valida	judge-revisor
📋 Playbook — As 8 Seções da Persona
Estrutura canônica
yaml

Copy
# 1. IDENTIFICAÇÃO

nome_ficticio: "Maria, 32, Empreendedora Digital"

foto: "URL ou descrição visual"


# 2. DEMOGRÁFICOS

idade: "28-38"

genero: "F (predominante)"

localizacao: "Sudeste/Brasil"

escolaridade: "Superior completo"

renda: "R$ 5-15k/mês"

estado_civil: "Casada, 1 filho"


# 3. PROFISSIONAL

cargo: "Afiliada digital em transição"

empresa: "Presta consultoria, mas quer escalar"

tempo_de_carreira: "3 anos"

desafios_profissionais:

  - "Faturamento instável (R$ 0 a R$ 30k/mês)"

  - "Tráfego caro, lead frio"

  - "Dificuldade de delegar"

  - "Sem tempo para estratégia"


# 4. PSICOGRÁFICOS

valores: "Autonomia, aprendizado contínuo, impacto"

personalidade: "Introvertida, analítica, perfeccionista"

hobbies: "Leitura, podcasts, yoga"

motivacoes: "Liberdade financeira, reconhecimento, propósito"

medos: "Fracasso público, perder tempo, desperdiçar dinheiro"

frustracoes: "Conteúdo genérico, promessas vazias, suporte lento"


# 5. COMPORTAMENTAIS

canais_preferidos: ["Instagram", "YouTube", "E-mail"]

horario_pico: "21h-23h (depois do filho dormir)"

dispositivo: "80% mobile, 20% desktop"

gasto_com_curso: "R$ 500-2000 (anual: R$ 3-8k)"


# 6. DORES (PAS — Problem, Agitation, Solution)

dor_principal: "Não consegue escalar além de R$ 20k/mês"

consequencia: "Trabalha 14h/dia sem ver resultado proporcional"

solucao_desejada: "Sistema automatizado que escale sem ela fazer tudo"


# 7. DESEJOS

desejo_principal: "Faturar R$ 50k/mês trabalhando 6h/dia"

desejo_secundario: "Ter equipe, ser referência no nicho, palestrar"

visao_de_sucesso: "Citar seu nome como caso de sucesso da mentoria dela"


# 8. MENSAGEM IDEAL

mensagem: "Afiliada, pare de trabalhar 14h/dia. Em 90 dias, eu te mostro o sistema que escalou 12 alunas de R$ 20k para R$ 60k/mês, automatizando 80% do operacional."

tom: "Direto, com prova, sem promessa vazia"

canal: "Reels + e-mail nutrição + VSL"
📦 Asset (3 Personas Modelo)
🎯 Persona 1 — Maria, 32 (Afiliada em Escala)
yaml

Copy
nome: "Maria Escala"

descricao: "Já fatura R$ 10-30k/mês, quer chegar a R$ 100k"

dor_principal: "Sem tempo, processo manual, equipe não performa"

canal_preferido: "Instagram Reels, podcasts, mentorias 1:1"

mensagem_ideal: "Você já validou o produto. Agora precisa de SISTEMA, não de mais tática."

objecoes:

  - "Já tentei mentoria e não funcionou"

  - "Não tenho tempo pra implementar"

  - "Minha equipe é fraca"
🎯 Persona 2 — João, 28 (Iniciante Ambicioso)
yaml

Copy
nome: "João Iniciante"

descricao: "Quer começar do zero, tem R$ 1-3k para investir"

dor_principal: "Não sabe por onde começar, tem medo de errar"

canal_preferido: "YouTube, Instagram, blog"

mensagem_ideal: "Não precisa de mais 1 ano planejando. Em 60 dias, você tem sua 1ª venda online."

objecoes:

  - "Será que funciona pra mim?"

  - "Não tenho dinheiro"

  - "Não entendo nada de tech"
🎯 Persona 3 — Carla, 45 (Empresária Tradicional)
yaml

Copy
nome: "Carla PME"

descricao: "Tem negócio físico, quer expandir pra online"

dor_principal: "Não entende o digital, tem equipe tradicional"

canal_preferido: "LinkedIn, e-mail, eventos"

mensagem_ideal: "Seu negócio físico não é o problema. O digital é o atalho para dobrar o faturamento em 6 meses."

objecoes:

  - "Meu público não está online"

  - "Não entendo nada disso"

  - "Já tentei agência e foi caro e ruim"
📦 Asset (Prompt Gerador)
text

Copy
# Contexto

Você é um estrategista de marketing com expertise em buyer research.


# Objetivo

Criar 3 Buyer Personas para o produto {{produto}}, considerando:

- Clientes atuais (top 10%)

- Leads qualificados que não converteram

- Dados demográficos e psicográficos


# Estilo

Detalhado, específico, baseado em dados reais.


# Tom

Profissional, prescritivo.


# Público

Time de marketing + vendas + produto.


# Formato

Para cada persona, markdown com as 8 seções + frase-resumo.


# Guardrail

- SEMPRE basear em dados (não inventar números)

- Incluir PII apenas se for fictício e anonimizado

- Mínimo 2 personas (primária + secundária)

- 1 frase "mensagem ideal" por persona
📊 Métricas de Sucesso
Métrica	Antes	Depois
CTR de ads	variável	+20%
Conversão LP	variável	+15%
Tempo de copy	variável	-50%
Alinhamento time	baixo	alto
Feedback "entendi o cliente"	30%	90%
⚠️ Riscos & Anti-patterns

❌ Persona genérica ("homens, 25-45, classe média") → inútil

❌ 1 persona só para produto com 2+ públicos

❌ Sem dados reais (achismo) → copy desconectada

❌ Persona que muda mensalmente → instabilidade

❌ PII real em vez de fictícia

✅ 3 personas no máximo (primária + 2 secundárias)

✅ Base em dados (10+ entrevistas, analytics, CRM)

✅ Persona cabe em 1 página (se é maior, é confusa)

✅ Revisar trimestralmente com dados novos

🔗 Próximas ferramentas

→ tools/marketing/03-mapa-jornada-cliente.md — combine com CJM

→ tools/copy/01-headline-persuasiva.md — use a persona

→ cursos/fundamental/01-entendendo-ioaid.md — contexto IOAID

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus