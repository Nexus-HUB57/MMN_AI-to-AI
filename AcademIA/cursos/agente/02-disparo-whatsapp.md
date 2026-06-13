---
title: "02 · Disparando no WhatsApp"
level: agente
duration: 30min
prerequisites: ["01-skills-essenciais"]
tags: [whatsapp, disparo, campanha, compliance, anti-ban]
last_updated: 2026-06-13
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Disparando no WhatsApp](../../assets/ebook_covers/ACAD-apostila-08-rotina-disparo-agente.webp)

**02 · Disparando no WhatsApp**

*Trilha Agente · 30 minutos · Pré-requisito: 01-Skills Essenciais*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

Você já tem coortes, copy, e Judge configurado. Agora é hora de **disparar**. Mas disparar no WhatsApp sem estratégia é como pilotar sem bússola: pode dar certo uma vez, mas a segunda acaba em ban. Este curso ensina o protocolo seguro, o agendamento, a personalização, e as 7 regras de ouro anti-ban. Para a rotina diária, consulte a **Apostila 08** (Rotina de Disparo). Para os modelos de campanha prontos, a **Apostila 09**.

**Sumário**

> **•** 1. O que é um "disparo" no Nexus
> **•** 2. Anatomia de uma campanha de WhatsApp
> **•** 3. Configurando a primeira campanha
> **•** 4. Agendamento e frequência
> **•** 5. Personalização com placeholders
> **•** 6. As 7 regras de ouro anti-ban
> **•** 7. Monitoramento pós-disparo
> **•** 8. O que fazer se o número for banido
> **•** 9. Escala progressiva
> **•** 10. Próximo curso

---

**1. O que é um "disparo" no Nexus**

Um "disparo" no Nexus é uma **campanha de envio de mensagens** que combina:
- **Coorte**: o público (ex: 500 frios).
- **Copy**: a mensagem (gerada por copywriter ou escrita).
- **Agendamento**: quando enviar (data + hora).
- **Frequência**: única ou recorrente.
- **Judge**: revisão automática antes do envio.

O disparo é **assíncrono**: você configura, o sistema executa, e você é notificado quando termina.

**2. Anatomia de uma campanha de WhatsApp**

```
[Campanha: Reativação_Natal_2026]
  ├── Coorte: frios (60+ dias)
  ├── Copy: "Oi [nome]! ..."
  ├── Agendamento: 2026-12-20 às 10h
  ├── Frequência: única
  ├── Judge: Conservador LGPD
  ├── Rate limit: 80 msg/segundo
  ├── Personalização: nome + último_produto
  └── Notificação: e-mail + dashboard
```

**3. Configurando a primeira campanha**

**Caminho:** `/dashboard/dispatch/new`

**Passo a passo:**

1. **Nome**: use padrão `Objetivo_Coorte_Data` (ex: `Reativacao_Frios_20260613`).
2. **Coorte**: selecione uma (sugestão: 200-500 contatos para começar).
3. **Objetivo da mensagem** (linguagem natural): descreva o que quer.
4. **Gerar Copy com Skill** (botão) — copywriter cria 3 variações.
5. **Escolher a melhor** (ou editar).
6. **Configurar agendamento** (próxima seção).
7. **Configurar Judge** (template ou custom).
8. **Revisar preview** — veja como vai ficar no celular.
9. **Aprovar**.

**4. Agendamento e frequência**

**Quando agendar?**

| Horário | Janela de atenção | Boa para |
|---------|-------------------|----------|
| 8h-10h | Alta (pessoas começando o dia) | Boas-vindas, lembretes |
| 10h-12h | Média-alta | Promoções, ofertas |
| 14h-17h | Baixa (trabalho) | Evitar |
| 19h-21h | Alta (relaxamento) | Reativação, vendas |
| 21h-23h | Média, mas arriscada | Evitar (respeitar sono) |

**Recomendação:** agende 2 disparos/dia, 1 de manhã (10h) e 1 à noite (19h), com copy diferente.

**Frequência:**

- **Única**: 1 disparo, sem repetição. Use para testes ou promoções pontuais.
- **Recorrente**: a cada N dias, com mesma copy. Use para campanhas de nutrição.
- **Gatilho comportamental**: quando lead fizer X, dispara Y. Use para pós-venda e recompra.

**5. Personalização com placeholders**

A copywriter gera mensagens com **placeholders** que o sistema preenche por contato:

| Placeholder | Substituído por | Exemplo |
|-------------|------------------|---------|
| `[nome]` | Primeiro nome do contato | "Marina" |
| `[ultimo_produto]` | Produto mais recente visualizado/comprado | "Curso de Copy" |
| `[data_ultimo_contato]` | Data da última interação | "12/04/2026" |
| `[coorte]` | Nome da coorte | "Frios" |
| `[empresa]` | Nome da empresa (se cadastrado) | "Nexus Brasil" |

**Como ativar:** na config do copywriter, marque "Personalização" + escolha quais placeholders usar.

**Impacto:** mensagens personalizadas têm **+35% de taxa de abertura** vs. mensagens genéricas.

**6. As 7 regras de ouro anti-ban**

**Regra 1 — Consentimento**
Só mande para quem consentiu receber. Sem exceção. Isso é LGPD + política Meta.

**Regra 2 — Opt-out fácil**
Toda mensagem deve ter "responda SAIR para parar de receber" (ou similar).

**Regra 3 — Horário**
Nunca envie entre 21h e 8h (respeite o sono do lead).

**Regra 4 — Frequência**
Máximo 2 mensagens/dia/lead, exceto em lançamento (3-4 por 3 dias no máximo).

**Regra 5 — Volume progressivo**
Comece com 50/dia, suba para 200/dia, depois 500. Nunca saia de 0 para 1000 de uma vez (algoritmo Meta detecta).

**Regra 6 — Conteúdo**
Nunca inclua:
- Link encurtado (bit.ly, tinyurl) — Meta sinaliza como spam.
- Número de telefone na primeira mensagem.
- Anexo pesado (> 5MB).
- Pedido de senha ou dados sensíveis.

**Regra 7 — Conteúdo bloqueado**
Nunca prometa:
- Cura de doenças.
- Ganhos garantidos (ex: "ganhe R$ 10.000 por dia").
- Esquemas de pirâmide.
- Conteúdo adulto.

**Quebrar qualquer regra = ban em 7-14 dias.**

**7. Monitoramento pós-disparo**

Após o disparo, monitore em `/dashboard/dispatch/<id>`:

- **Enviadas**: contador (deve chegar ao total).
- **Bloqueadas pelo Judge**: se > 20%, copy inadequada.
- **Taxa de entrega** (em 1h): > 95% é meta.
- **Taxa de abertura** (em 24h): > 70% é meta.
- **Taxa de resposta** (em 48h): > 5% é meta.

**Sinais de alerta:**

- Latência > 10s: problema técnico.
- Entrega < 90%: número ou template banido.
- Resposta < 1%: copy ruim, reescreva.
- Bloqueio de lead > 1%: copy agressiva, suavize.

**8. O que fazer se o número for banido**

**Sintomas:**
- Mensagens não chegam mais.
- Você vê o número como "banido" no painel.
- Leads reportam "número não está no WhatsApp".

**Passo a passo:**

1. **Pare todos os disparos imediatamente**.
2. **Identifique a causa** (qual campanha ou copy foi a culpada).
3. **Abra ticket de suporte** com print do erro.
4. **Ative número backup** (se você tem 2 chips, use o segundo).
5. **Aguarde 24-72h** para Meta analisar o pedido de unban.
6. **Re-aprove** as campanhas com copy corrigida.

**Prevenção:** tenha **sempre 2 números** (titular + backup). O backup roda enquanto o titular está em risco.

**9. Escala progressiva**

**Semana 1**: 50 disparos/dia, 1 coorte, 1 horário.
**Semana 2-3**: 200 disparos/dia, 2 coortes, 2 horários.
**Semana 4+**: 500+ disparos/dia, 3+ coortes, 2 horários.

**Quando você está pronto para 1.000+ disparos/dia:** considere plano Pro e configurar shadow testing para validar mudanças.

**10. Próximo curso**

👉 [`03-judge-revisor.md`](03-judge-revisor.md) — Lendo o Judge Revisor · 30 min

**Recursos extras:**
- **Apostila 08**: Rotina de Disparo (manhã/tarde/noite + semanal).
- **Apostila 09**: Campanhas Automatizadas (3 modelos WhatsApp + 2 Instagram).
- **Playbook PB-WHATSAPP**: operação diária.

---

**02 · Disparando no WhatsApp** --- Trilha Agente

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
