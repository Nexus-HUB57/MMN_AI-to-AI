---
title: "Conformidade ANATEL · Nexus Affil'IA'te"
description: "Marco regulatório de telecomunicações para agentes WhatsApp/SMS/Voice"
tags: [anatel, telecom, whatsapp, sms, voz, regulacao, conformidade, lgpd]
version: 1.0
author: Equipo Nexus · C-Suite
date: 2026-07-07
---

# 📡 Conformidade ANATEL · Nexus Affil'IA'te

> Marco regulatório para uso de agentes de IA que operam canais de telecom (WhatsApp Business API, SMS, Voice, RCS) no Brasil.

## 🎯 Por que isso importa

A **ANATEL (Agência Nacional de Telecomunicações)** regula o uso de recursos de telecom no Brasil. Mesmo que você use "WhatsApp Business API" (que é da Meta), existem regras brasileiras que se aplicam:

- **Numeração**: como você identifica quem está mandando mensagem
- **Opt-in**: como você coletou o consentimento do destinatário
- **Opt-out**: como o usuário pode parar de receber
- **Horários**: quando você pode ou não disparar
- **Volume**: limites anti-spam
- **Conteúdo**: vedações (golpes, desinformação, produtos proibidos)

Multas podem chegar a **R$ 50 milhões** (art. 173 LGT) ou **suspensão do número/canal**.

## 📋 Leis e Regulamentos Aplicáveis

### 1. **LGT (Lei Geral de Telecomunicações · Lei 9.472/97)**
- Regula todo o setor de telecom
- Art. 173: penalidades (advertência, multa, suspensão, caducidade)
- Art. 3º: princípios constitucionais do setor

### 2. **Resolução ANATEL 632/2014**
- Regulamento Geral de Direitos do Consumidor de Telecom
- Aplicável a relações B2C mesmo via mensageria

### 3. **Resolução ANATEL 749/2022**
- Regulamento de Mensagens Curtas (SMS)
- Vedações específicas, opt-in/opt-out

### 4. **Marco Civil da Internet (Lei 12.965/14)**
- Art. 7º: inviolabilidade de comunicações (salvo ordem judicial)
- Art. 10: proteção de registros/dados pessoais
- Aplicável a WhatsApp/web messaging via interpretação analógica

### 5. **LGPD (Lei 13.709/18)**
- Base legal para tratamento de dados
- Opt-in como consentimento (art. 7º, I)
- Direito de revogação (art. 8º, §5º)

### 6. **Código de Defesa do Consumidor (Lei 8.078/90)**
- Práticas abusivas
- Direito de arrependimento (art. 49)
- Publicidade enganosa (art. 36)

## ✅ Requisitos Obrigatórios para Nexus

### A. **Identificação Clara (Quem está mandando)**

```
✓ Permitido:
  - "Nexus Academy · CNPJ 00.000.000/0001-00"
  - "[Nome Fantasia] · Atendimento via WhatsApp"
  - Header com razão social completa

✗ Proibido:
  - Mensagens anônimas
  - Número pessoal como canal comercial
  - Identidade falsa de empresa
```

### B. **Opt-in (Consentimento Prévio)**

Antes de disparar a primeira mensagem, o usuário deve ter consentido explicitamente. Aceitar:

| Forma | Válido? | Observação |
|---|---|---|
| Checkbox "Aceito receber mensagens" no formulário | ✅ | Com opt-in separado do aceite de termos |
| Aceite duplo (double opt-in) | ✅✅ | Melhor prática, prova forte |
| Mensagem espontânea do usuário | ✅ | Se for início de conversa comercial |
| "Inclua-me na lista" verbal | ⚠️ | Risco, precisa registro auditável |
| Compra de lista de terceiros | ❌ | Ilegal mesmo com opt-in da fonte original |
| Indicação de outro usuário | ⚠️ | Só se o indicado consentiu explicitamente |

**Sempre registrar:**
- Timestamp do opt-in
- IP/Origem
- Texto exato do aceite
- Forma de coleta (formulário, verbal, etc)

### C. **Opt-out (Como Sair)**

Toda mensagem precisa ter mecanismo fácil de descadastro:

```
MENSAGEM EXEMPLO:
"Oi {{nome}}! Aqui é da Nexus Academy. 
Recebeu essa msg porque baixou nosso e-book. 
Responda SAIR para não receber mais mensagens."
```

**Requisitos:**
- Mecanismo **gratuito** para o usuário
- **Imediato** (não "em até 5 dias úteis")
- Sem perguntas ou friction adicional
- Deve parar TODOS os canais (não só email)

### D. **Horários Permitidos**

| Canal | Permitido | Vedado |
|---|---|---|
| WhatsApp Business | 8h-20h (qualquer dia) | 20h-8h + (acima de 50k msg/mês em algumas interpretações) domingos à noite |
| SMS marketing | 8h-21h dias úteis | 21h-8h, finais de semana |
| SMS transacional (boleto, código) | 24h (urgência justifica) | Disfarçar marketing como transacional |
| Voice/Voz | 8h-21h (LGPD + Código Defesa Consumidor) | Antes 8h, depois 21h, domingos |
| Email marketing | 24h com descadastro | Spam sem opt-in |

### E. **Conteúdo Vedado**

A ANATEL + ANVISA + CADE + CONAR vetam vários conteúdos:

```
❌ Golpes, pirâmides, esquemas fraudulentos
❌ Conteúdo adulto/sexual sem restrição de idade
❌ Produtos de tabacaria
❌ Bebidas alcoólicas para menores de 18
❌ Medicamentos sem registro ANVISA
❌ Conteúdo que incite violência ou discriminação
❌ Desinformação de saúde pública
❌ Propaganda enganosa
❌ Marketing multinível sem registro
❌ Crypto/NFTs sem aviso de risco
❌ Cobranças disfarçadas de transacionais
```

### F. **Limites Anti-Spam**

| Métrica | Limite saudável | Risco |
|---|---|---|
| Mensagens/usuário/dia | 1-2 | > 3 = denúncia provável |
| Mensagens/usuário/semana | 3-5 | > 7 = bloqueio |
| Taxa de bloqueio reportada | < 1% | > 5% = investigação ANATEL |
| Taxa de descadastro (opt-out) | < 5% | > 10% = problema sério |
| Reclamações no Reclame Aqui | < 0.5% | > 2% = campanha pode ser suspensa |

## 🔧 Implementação Prática no Nexus

### 1. **Webhook de Opt-out Universal**

```typescript
// /api/optout.ts
export async function POST(req: Request) {
  const { userId, channel } = await req.json();
  
  await db.userPreferences.update({
    where: { userId },
    data: {
      optoutChannels: { push: channel }, // whatsapp, sms, email, voice
      optoutAt: new Date(),
    }
  });
  
  // Propagar para todas as ferramentas
  await Promise.all([
    disableWhatsAppCampaigns(userId),
    disableSmsCampaigns(userId),
    disableEmailCampaigns(userId),
    logOptOutToAudit(userId, channel),
  ]);
  
  return { ok: true, effectiveFrom: new Date().toISOString() };
}
```

### 2. **Validação de Horário**

```typescript
// /lib/send-window.ts
export function isWithinAllowedWindow(now: Date = new Date()): boolean {
  const hour = now.getHours();
  const day = now.getDay(); // 0 = dom, 6 = sáb
  
  // WhatsApp: 8h-20h todos os dias
  if (hour < 8 || hour >= 20) return false;
  
  return true;
}

export function nextSendWindow(from: Date = new Date()): Date {
  // Calcula próximo horário válido (8h do próximo dia se necessário)
  // ...
}
```

### 3. **Consent Audit Trail**

```sql
-- Tabela consent_log (Postgres)
CREATE TABLE consent_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  channel TEXT NOT NULL, -- whatsapp, sms, email
  action TEXT NOT NULL, -- optin, optout, modification
  source TEXT NOT NULL, -- landing-page, manual, api
  ip_address INET,
  user_agent TEXT,
  consent_text TEXT, -- texto exato que foi aceito
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_user ON consent_log(user_id, created_at DESC);
```

### 4. **Templates Pré-aprovados Meta (WhatsApp)**

Para WhatsApp Business API, Meta exige templates pré-aprovados. Cada template precisa ter:
- Categoria (marketing, utility, authentication)
- Idioma
- Conteúdo com variáveis `{{1}}`, `{{2}}`
- Opt-out automático para marketing

## 📊 Checklist de Auditoria Mensal

```
□ % opt-out por canal está abaixo dos limites saudáveis?
□ Algum número foi reportado como spam pelo WhatsApp?
□ Todas as campanhas têm horário respeitado?
□ Opt-out foi processado em < 5 minutos após solicitação?
□ Base legal de tratamento está documentada?
□ Templates Meta estão todos aprovados?
□ Conteúdo não inclui vedações?
□ Logs de consentimento estão preservados por 5+ anos?
□ DPO (Data Protection Officer) revisou novas campanhas?
```

## 🆘 Em Caso de Denúncia/Reclamação

### Passo 1: Acusação Recebida
- Registrar timestamp
- Identificar campanha/usuário

### Passo 2: Análise Interna (24h)
- Verificar logs de opt-in
- Confirmar que tinha consentimento válido
- Avaliar conteúdo vs. vedações

### Passo 3: Resposta
- **Se legítima acusação:** parar campanha, pedir desculpas, oferecer opt-out reforçado
- **Se indevida:** contestar com provas de opt-in documentado

### Passo 4: Notificação ANATEL (se grave)
- Prazo: 5 dias úteis para infração grave
- Documentar tudo

## 🔗 Recursos Externos

- **ANATEL**: https://www.gov.br/anatel/
- **LGPD**: https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd
- **Meta WhatsApp Business Policy**: https://www.whatsapp.com/legal/business-policy
- **CONAR**: https://www.conar.org.br/
- **PROCON**: para reclamações de consumidores

## 📚 Materiais Internos Relacionados

- `tutoriais/18-configurar-backup-automatico.md` (preservação de logs)
- `tutoriais/15-auditoria-lgpd-automatizada.md` (DPIA automatizada)
- `apostilas/18-seguranca-ofensiva-pentest-agentes-ia.md` (vetores de ataque)
- `Lib-Nexus/knowledge-base/03-conformidade-lgpd.md` (LGPD base)
- `playbooks/PB-LGPD-direitos-titular.md` (operação direitos titular)
- `governanca/C-SUITE-AI.md` (governance loop para decisões críticas)

## ⚖️ Responsabilidades por Papel

| Papel | Responsabilidade ANATEL |
|---|---|
| **CTO/AI (Ravi)** | Implementar controles técnicos (horário, opt-out) |
| **CMO/AI (Helena)** | Garantir conteúdo permitido, copy compliance |
| **CFO/AI (Otto)** | Provisionar budget para compliance (DPO, auditoria) |
| **COO/AI (Otavio)** | Operação dos SLAs de opt-out e resposta a reclamações |
| **CEO/AI (Niko)** | Decisões estratégicas, comunicação com regulador |

---

*Lib-Nexus · Knowledge Base · 04 · 2026*