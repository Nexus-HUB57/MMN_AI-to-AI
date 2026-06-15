---
title: "03 · Primeiros passos no Painel do Afiliado"
level: fundamental
duration: 20min
prerequisites: ["02-sistema-sho"]
tags: [painel, ui, runtime, skills, comissoes, analytics]
last_updated: 2026-06-13
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Primeiros passos no Painel do Afiliado](../../assets/ebook_covers/ACAD-apostila-05-sete-telas-essenciais.webp)

**03 · Primeiros passos no Painel do Afiliado**

*Trilha Fundamental · 20 minutos · Pré-requisito: 02-Sistema SHO*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

Você já conhece o ecossistema, o IOAID, e o SHO. Agora é hora de colocar a mão na massa. Este curso é o seu **tour guiado pelo painel do afiliado** — onde tudo acontece no dia a dia. Em 20 minutos, você vai navegar com confiança pelas 7 telas essenciais, configurar comissões, criar seu primeiro agente, e entender onde fica cada coisa. Para o detalhamento profundo de cada tela, consulte a **Apostila 05** (7 Telas Essenciais).

**Sumário**

> **•** 1. Acesso e primeiro login
> **•** 2. As 7 telas em uma página
> **•** 3. Configurar perfil de afiliado
> **•** 4. Conectar produto e configurar comissão
> **•** 5. Importar primeira base de contatos
> **•** 6. Criar primeiro agente (versão rápida)
> **•** 7. Configurar notificações e alertas
> **•** 8. Onde encontrar ajuda dentro do painel
> **•** 9. Atalhos de teclado (power users)
> **•** 10. Próximo curso (trilha Agente)

---

**1. Acesso e primeiro login**

**Como acessar:**
- URL: `https://oneverso.com.br/login`
- Selecione "Afiliado" (não Admin).
- Login: seu e-mail + senha (ou SSO Google/Microsoft).
- Destino pós-login: `/dashboard`.

**Primeira vez no painel?**
Você verá um **wizard de 4 passos** que te guia por:
1. Configurar perfil.
2. Conectar 1 produto.
3. Importar base inicial.
4. Criar primeiro agente.

Você pode pular o wizard e fazer manualmente, mas **recomendo seguir** — ele configura tudo de forma otimizada.

**2. As 7 telas em uma página**

O painel tem 27 telas, mas 7 são essenciais:

| # | Tela | Caminho | Quando usar |
|---|------|---------|-------------|
| 1 | **Dashboard Geral** | `/dashboard` | 1ª coisa toda manhã |
| 2 | **Disparos e Campanhas** | `/dashboard/dispatch` | Criar/gerenciar campanhas |
| 3 | **Base de Contatos** | `/dashboard/contacts` | Importar/segmentar |
| 4 | **Judge Revisor** | `/dashboard/judge` | Revisar mensagens flagadas |
| 5 | **Métricas de Negócio** | `/dashboard/metrics` | Avaliar conversão/CAC |
| 6 | **Skills e Agentes** | `/dashboard/skills` | Configurar agentes |
| 7 | **Autonomia e SHO** | `/dashboard/autonomy` | Ver % autonomia + logs SHO |

**Detalhamento de cada tela** (botões, métricas, armadilhas) está na **Apostila 05** (7 Telas Essenciais). Aqui, só o overview.

**3. Configurar perfil de afiliado**

**Caminho:** `/dashboard/settings/profile`

**O que preencher:**
- Nome completo.
- CPF/CNPJ (para receber comissões).
- Banco + agência + conta (para receber pagamentos).
- Foto (opcional, mas aumenta confiança).
- Bio curta (50-100 caracteres, aparece em mensagens automáticas).
- Nicho principal (1-3 nichos para sugerir produtos).

**Dica:** preencha tudo no primeiro dia. Cada campo vazio é uma fricção futura.

**4. Conectar produto e configurar comissão**

**Caminho:** `/dashboard/products`

**Como adicionar produto:**

**Opção A — Marketplace integrado** (Hotmart, Kiwify, Eduzz, Monetizze):
1. Clique "Conectar Marketplace".
2. Faça OAuth com sua conta.
3. Selecione produtos.
4. Comissão configurada automaticamente (do marketplace).

**Opção B — Link de afiliado externo:**
1. Clique "Adicionar Manualmente".
2. Cole URL do produto.
3. Informe % de comissão esperada.
4. Salve.

**Como funciona a comissão:**
- O sistema rastreia cliques e vendas via link de afiliado.
- Cada venda registrada vira linha em `/dashboard/commissions`.
- Pagamento processado mensalmente (entre dia 5 e 10).

**5. Importar primeira base de contatos**

**Caminho:** `/dashboard/contacts/import`

**3 formas de importar:**

**A — Upload CSV:**
1. Baixe template em `/dashboard/contacts/template.csv`.
2. Preencha com: nome, telefone, e-mail (opcional), data_entrada (opcional).
3. Faça upload.
4. Sistema valida e remove duplicatas/inválidos.

**B — Webhook de CRM:**
1. Vá em `/dashboard/integrations`.
2. Conecte HubSpot, RD Station, etc.
3. Sincronização automática.

**C — Captura direta:**
1. Crie formulário de captura (lead magnet).
2. Cole em landing page.
3. Contatos vão direto pra base.

**Mínimo recomendado:** 100 contatos. Se tiver menos, use o **modo demo** com base de exemplo.

**6. Criar primeiro agente (versão rápida)**

**Caminho:** `/dashboard/agents/new`

**Passo a passo resumido (versão detalhada na Apostila 06):**

1. Nome: `agente_pessoal_<seu_nome>`.
2. Objetivo: "Atender leads do nicho [X], qualificar, e direcionar para compra."
3. Skills iniciais: escolha 3 (copywriter, segmenter, judge).
4. Judge: template "Conservador LGPD".
5. Teste: crie 1 campanha com 50 contatos.
6. Aprove.

**Tempo total:** ~15-20 minutos para o básico.

**7. Configurar notificações e alertas**

**Caminho:** `/dashboard/settings/notifications`

**5 tipos de notificação:**

1. **Crítico SHO** (sempre ligado): incidentes graves (quarentena).
2. **Alerta SHO** (sempre ligado): contenções e anomalias.
3. **Judge Reprovação** (configurável): quando Judge reprova mensagem.
4. **Venda confirmada** (recomendado): notificação imediata de cada venda.
5. **Resumo diário** (recomendado): resumo às 22h do dia.

**Canais:** e-mail, dashboard, Slack, SMS (apenas para críticos).

**Recomendação para iniciante:** e-mail + dashboard. Adicione Slack quando tiver 1.000+ contatos.

**8. Onde encontrar ajuda dentro do painel**

- **Ícone `?` no canto superior direito**: busca global + FAQ.
- **Botão "Ajuda"** (canto inferior direito): chat com agente de suporte.
- **Tooltips** (ao passar mouse): explicações curtas em cada campo.
- **Atalho `Cmd/Ctrl + K`**: busca global de contatos, skills, campanhas.
- **Documentação inline**: `/docs` (acesso pelo menu lateral).

**Para suporte humano:**
- `/dashboard/support/new` (cria ticket).
- SLA 2h úteis (Pro) ou 30min (Elite).

**9. Atalhos de teclado (power users)**

- `Cmd/Ctrl + K` — Busca global.
- `Cmd/Ctrl + D` — Disparos.
- `Cmd/Ctrl + J` — Judge.
- `Cmd/Ctrl + M` — Métricas.
- `Cmd/Ctrl + A` — Agentes.
- `Cmd/Ctrl + N` — Nova campanha.
- `Cmd/Ctrl + /` — Comandos (paleta).
- `Esc` — Fechar modal atual.

**10. Próximo curso (trilha Agente)**

Você completou a **Trilha Fundamental**. Próximo passo:

👉 [`../agente/00-primeiro-agente.md`](../agente/00-primeiro-agente.md) — Seu primeiro agente · 30 min

**O que você vai aprender na trilha Agente:**
- Configurar agente com 5 skills (vs. 3).
- Disparar no WhatsApp com segurança.
- Ler o Judge Revisor com fluência.
- Configurar Judge permissivo após calibração.

**Recursos extras (opcional):**
- **Apostila 05**: 7 Telas Essenciais (deep dive em cada tela).
- **Apostila 06**: Setup Completo do Agente Pessoal (tutorial 90min).
- **Apostila 08**: Rotina de Disparo (manhã/tarde/noite).

---

**03 · Primeiros passos no Painel do Afiliado** --- Trilha Fundamental

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
