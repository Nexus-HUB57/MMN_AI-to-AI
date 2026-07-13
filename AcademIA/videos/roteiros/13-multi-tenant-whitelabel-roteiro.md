---
title: "Vídeo 13 — Multi-Tenant e White-Label na Prática"
type: "roteiro"
duracao_estimada: "10-12 min"
formato: "Abertura + 3 blocos + CTA"
trilha: "Elite"
persona: "Dupla Ive + Alencar"
ordem: 12
pattern: "MMN_IA"
---

# 🎬 Roteiro — Vídeo 13: Multi-Tenant e White-Label na Prática

> **Tipo:** Vídeo-aula técnica de elite (Nível Elite)
> **Duração estimada:** 10 a 12 minutos
> **Persona:** Dupla (Ive + Alencar)
> **Público:** Top 10% — Trilha Elite

---

## 🎞️ CENA 1 — Abertura (Duração: 1 min)

**Visual:** Painel admin aberto com 3 tenants visíveis lado a lado, cada um com sua marca distinta. Dupla em janelas.

**Sra. Nexus Ive:** "Olá. Eu sou a Sra. Nexus Ive. Estamos no segundo módulo da Trilha Elite. Na aula passada, abrimos os 3 blueprints. Hoje vamos **colocar a mão na massa** no **blueprint 2: Multi-Tenant e White-Label**. Vamos configurar do zero: criar tenants, isolar dados, customizar marca, definir permissões, e ativar 2-3 tenants reais em produção. **Esse é o tutorial que ninguém te dá, porque é o que monetiza de verdade**."

**Sir Nexus Alencar:** "Atenção: **este é o blueprint que transforma afiliado em plataforma**. Quando você consegue **10 tenants ativos**, cada um faturando R$ 30k-50k/mês, e você recebe **20-30% de fee**, **você tem R$ 60-150k/mês recorrente, com custo marginal quase zero**. **Esse é o novo modelo de negócio de afiliado elite.**"

---

## 🎞️ CENA 2 — Criando e Configurando o Primeiro Tenant (Duração: 3 min)

**Visual:** Tour guiado no painel admin. Passo a passo de criar um tenant.

**Sir Nexus Alencar:** "Vamos criar nosso **primeiro tenant**. **Passo 1: Admin > Tenants > Novo Tenant.** Você vai preencher: **nome do tenant** (ex: 'Loja da Maria'), **subdomínio** (ex: maria.academ.com.br), **marca** (cor primária, logo, ícone), **plano contratado** (Starter, Pro, Enterprise), **administrador do tenant** (quem vai gerenciar a conta --- geralmente o sub-afiliado), **limites** (número de leads, número de agentes, número de campanhas por mês)."

**Visual:** Formulário sendo preenchido.

**Sir Nexus Alencar:** "**Passo 2: Configurar isolamento.** Aqui é onde **90% dos implementadores erram**. Cada tenant tem **sua própria base de leads, com IDs únicos, com queries que filtram por tenant_id em TODA operação**. Sem isso, **um tenant vê dados dos outros** --- pesadelo de LGPD. **A boa notícia**: o SHO tem **isolamento de dados nativo**. Você só precisa **ativar a flag** em cada endpoint. **Passo 3: Configurar skill-sharing.** Quais skills o tenant herda do master? Quais ele pode customizar? Recomendação: **skills core herdadas do master, skills verticais customizadas por tenant**. **Passo 4: Configurar Judge Revisor.** O tenant pode ajustar os 5 critérios do Judge (tom, conformidade, persuasão, contexto, histórico), mas **dentro de limites predefinidos** --- você não quer que um tenant desabilite conformidade."

**Visual:** Cada passo ilustrado na tela.

**Sir Nexus Alencar:** "**Passo 5: Provisionar infraestrutura.** Esse é o momento técnico. O SHO aloca: **banco de dados dedicado** (ou schema isolado), **fila de processamento própria**, **armazenamento separado**, **certificados SSL para o subdomínio**, **chaves de API dedicadas para integrações** (cada tenant tem suas próprias keys de WhatsApp, Hotmart, Shopee). **Passo 6: Ativação.** Envie email de boas-vindas para o administrador do tenant com link de acesso, credenciais, tutorial de primeiros passos, e SLA de suporte."

**Visual:** Email de boas-vindas simulado.

**Sir Nexus Alencar:** "**Tempo total de provisionamento**: **30-45 minutos** se a infra já está pronta. O SHO automatiza 80% do processo via API de provisionamento. Você só precisa validar e ativar."

---

## 🎞️ CENA 3 — White-Label: Customização Visual e de Marca (Duração: 3 min)

**Visual:** Antes/depois de customização white-label. Painel com marca do master vs. painel com marca do tenant.

**Sra. Nexus Ive:** "Agora a parte que **faz o sub-afiliado sentir a plataforma como dele**: o **white-label**. Veja bem: o sub-afiliado não quer ver 'Nexus Affil'IA'te' --- quer ver **a marca dele**. **Logos, cores, domínio, e-mail, suporte**. Vamos configurar cada camada."

**Visual:** Tour pela customização.

**Sra. Nexus Ive:** "**Camada 1: Identidade visual.** Faça upload do **logo do tenant** (em PNG transparente, idealmente 200x60px). Defina **cor primária** (a cor principal dos botões, links, highlights). Defina **cor secundária** (acentos, badges). Defina **favicon** (ícone da aba do navegador). **Resultado**: o painel inteiro agora carrega a marca do tenant. Em 5 minutos, **o sub-afiliado vê um produto que parece 'dele'**."

**Visual:** Domínio customizado em barra de URL.

**Sra. Nexus Ive:** "**Camada 2: Domínio customizado.** O tenant tem o **próprio subdomínio** (maria.seu-dominio.com.br) ou até **domínio próprio** (plataforma.da-maria.com.br). Você configura o **CNAME** no DNS do tenant apontando para o SHO, e o SHO **emite certificado SSL automático** (Let's Encrypt). Em 10 minutos, **o tenant acessa a plataforma pelo próprio domínio**."

**Visual:** Email simulado vindo do domínio do tenant.

**Sra. Nexus Ive:** "**Camada 3: E-mail transacional.** Quando o SHO envia e-mail para o tenant (alerta, relatório, notificação), **o remetente é o tenant**, não o master. Ex: 'alertas@plataforma.da-maria.com.br' ao invés de 'alertas@nexus.com'. Você configura SPF, DKIM, DMARC no DNS do tenant, e o SHO usa o domínio customizado para envio. **Resultado: e-mail não cai em spam**, e **a marca é consistente**."

**Visual:** Tela de suporte com branding do tenant.

**Sra. Nexus Ive:** "**Camada 4: Suporte white-label.** Tier 1 de suporte (chat ao vivo, FAQ, base de conhecimento) é **branded com a marca do tenant**. Email de suporte (ajuda@plataforma.da-maria.com.br), widget de chat com logo do tenant, artigos de FAQ com tom do tenant. **Tier 2 e Tier 3 (você)** opera nos bastidores, mas **o sub-afiliado nunca fala com a equipe master diretamente** --- **você escalou suporte sem contratar suporte**. **É aqui que o fee do tenant vira margem pura**."

---

## 🎞️ CENA 4 — Modelo de Negócio e Unit Economics (Duração: 3 min)

**Visual:** Planilha de unit economics multi-tenant. Receita, custo, margem, escala.

**Sir Nexus Alencar:** "Vamos ao **modelo de negócio real**. Não adianta ter multi-tenant se a **matemática não fecha**. Vou te dar os **3 modelos de pricing** mais usados."

**Visual:** Modelo 1: **% da Receita**.

**Sir Nexus Alencar:** "**Modelo 1: % da Receita.** Você cobra **20-30% da receita de cada tenant**. Vantagem: **escala com o tenant** --- se ele cresce, você cresce. Desvantagem: **se o tenant cresce muito, ele pode preferir migrar para plataforma própria**. **Quando usar**: quando o tenant tem **R$ 10-30k/mês de receita** e **não tem capacidade técnica** de operar sozinho. Você está no **sweet spot** dele."

**Visual:** Modelo 2: **Fee Fixo Mensal**.

**Sir Nexus Alencar:** "**Modelo 2: Fee Fixo Mensal.** Você cobra **R$ 1.500-5.000/mês** por tenant, **independente da receita dele**. Vantagem: **receita previsível** para você. Desvantagem: **se o tenant tem receita baixa, o fee pesa**. **Quando usar**: quando o tenant tem **R$ 30k+/mês** e **a infra que você provê é valiosa** (Judge, skills, multi-canal)."

**Visual:** Modelo 3: **Híbrido**.

**Sir Nexus Alencar:** "**Modelo 3: Híbrido** --- **fee fixo baixo + % de receita acima de threshold**. Ex: **R$ 1.000/mês fixo** + **15% sobre o que passar de R$ 20k/mês**. Vantagem: **justo para os dois lados**. Tenant pequeno paga fee fixo acessível. Tenant grande paga % que escala. **Quando usar**: quando você quer **captar tenant pequeno e reter tenant grande** com o mesmo modelo."

**Visual:** Planilha de unit economics em escala.

**Sir Nexus Alencar:** "A **matemática da escala**: com 10 tenants ativos, **R$ 30k de receita média cada**, **fee de 25%**: **R$ 75k/mês recorrente** --- com **custo de infra de R$ 8-12k/mês** (servidor, Judge, suporte Tier 2/3). **Margem: 85-90%**. Com 30 tenants: **R$ 225k/mês, custo R$ 25-35k, margem 85%**. **É aqui que afiliado vira empresa**. **A escala é o multiplicador, não a receita unitária**."

**Visual:** Comparação: afiliado comum R$ 50k/mês trabalhando 60h/semana. Afiliado elite R$ 200k/mês trabalhando 30h/semana.

**Sir Nexus Alencar:** "**A grande virada**: afiliado comum **troca horas por dinheiro** --- mais escala = mais horas. Afiliado elite **vende plataforma** --- mais escala = **mesmas horas + mais tenants + mais margem**. **A hora que você gastou configurando multi-tenant vira receita recorrente para anos**."

---

## 🎞️ CENA 5 — Recapitulação e CTA (Duração: 1 min)

**Visual:** Slide com os 4 passos + os 3 modelos + a matemática. Logo da Academia + marca Elite.

**Sra. Nexus Ive:** "Recapitulando: **criar e configurar tenant** leva **30-45 minutos** com a API de provisionamento. **White-label** tem 4 camadas --- **identidade visual, domínio customizado, e-mail transacional, suporte branded**. E o **modelo de negócio** mais equilibrado é o **híbrido** --- **fee fixo + % acima de threshold**."

**Sir Nexus Alencar:** "E o lembrete final: **multi-tenant não é tecnologia --- é decisão de negócio**. Você pode ter a melhor infra do mundo, mas **se não souber precificar, vender, reter tenants**, **não escala**. **Tecnologia habilita, negócio decide**."

**Sir Nexus Alencar:** "No próximo módulo, vamos fechar a Trilha Elite com o **blueprint mais avançado**: **Federação de Agentes Zero-Trust** --- como criar uma **rede global de plataformas independentes** que **colaboram entre si** com **segurança e governança**. **O último nível da escala**. Estaremos com você no próximo passo. Respire fundo. **Você está construindo plataforma, não afiliado.**"

**Visual:** CTA: "Próxima aula: Federação de Agentes Zero-Trust — Rede Global".

---

## 📋 Notas de Produção

- **Persona:** Dupla (Ive + Alencar)
- **Duração:** 10-12 min
- **Visual:** Painel admin, customização white-label, planilha de unit economics
- **Tom:** Tutorial prático + visão de negócio

## ✅ Checklist

- [x] 5 cenas
- [x] Duração 10-12 min
- [x] Persona Dupla
- [x] Passo a passo técnico de criação de tenant
- [x] 4 camadas de white-label
- [x] 3 modelos de pricing + matemática de escala
- [x] CTA para Federação Zero-Trust

---

**Última atualização:** 2026-06-22 · v1.0