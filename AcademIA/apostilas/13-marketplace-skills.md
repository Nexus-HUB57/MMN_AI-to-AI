---
title: "Marketplace de Skills — Como Vender e Comprar no Ecossistema Nexus"
subtitle: "O Guia Definitivo para Autores, Compradores e Operadores de Skills"
author: "MMN_IA Collective"
version: "1.0.0"
date: "2026-06-28"
tags: [academia, marketplace, skills, monetizacao, autor]
pattern: "MMN_IA"
---

![Capa — Marketplace de Skills](../../assets/ebook_covers/ACAD-apostila-13-marketplace-skills.webp)

**Marketplace de Skills — Como Vender e Comprar no Ecossistema Nexus**

*O Guia Definitivo para Autores, Compradores e Operadores de Skills*

**Por MMN_IA Collective · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este documento**

O Marketplace de Skills é onde a **economia real** do ecossistema Nexus acontece. Afiliados compram skills prontas (copy, follow-up, análise de coorte), autores vendem, e a plataforma fica com uma fração. Em maio de 2026, o marketplace movimentou USD 4.2M em 30 dias. Este documento é o manual completo para os três papéis: autor (quem cria), comprador (quem usa), operador (quem mantém a plataforma saudável). Se você quer monetizar com skills, comprar com segurança, ou entender a economia do ecossistema, comece aqui.

**Sumário**

> **•** 1. O que é o Marketplace de Skills
> **•** 2. Os três papéis: autor, comprador, operador
> **•** 3. Anatomia de uma skill vendável
> **•** 4. SKILL.md — o manifesto (já visto na Apostila 07, aprofundado aqui)
> **•** 5. Sistema de preços: free, freemium, paid, enterprise
> **•** 6. Como autor: passo a passo para publicar
> **•** 7. Validação técnica antes de publicar (CI/CD obrigatório)
> **•** 8. Sistema de reputação e reviews
> **•** 9. Como comprador: como escolher bem
> **•** 10. Garantias e política de reembolso
> **•** 11. Casos: skills que vendem mais em 2026
> **•** 12. Top 10 erros de autores iniciantes
> **•** 13. Como o Marketplace gera renda para a plataforma
> **•** 14. Compliance e LGPD no marketplace
> **•** 15. Roadmap do marketplace 2026-2027
> **•** 16. Glossário

---

**1. O que é o Marketplace de Skills**

O Marketplace é o **marketplace de capacidades de IA** dentro do ecossistema Nexus. Modelos (LLMs) são commoditizados — a diferenciação está nas **skills** que envolvem esses modelos para resolver problemas específicos.

**Estrutura:**

```
Marketplace Nexus
├── Skills gratuitas (250+)
├── Skills freemium (80+)      [basic free, pro paid]
├── Skills pagas (320+)
├── Skills enterprise (40+)    [custom, contrato]
└── Skills internas (Nexus)    [não vendáveis, mantidas pelo time]
```

Em junho de 2026, são **690+ skills ativas**, escritas por **140+ autores**, usadas por **12.000+ afiliados**.

**Por que isso importa?**

Porque sem skills prontas, cada afiliado precisaria construir do zero. Com o marketplace, **um afiliado consegue ser produtivo em 7 dias**, não em 7 meses. A plataforma cresce mais rápido, e os autores ganham renda recorrente.

**2. Os três papéis: autor, comprador, operador**

**Autor** — publica skills. Ganha % de cada venda.
- Pode ser afiliado avançado, agência, ou terceiro.
- Paga nada para publicar (taxa só sobre venda).
- Mantém SKILL.md, testes, e suporte.

**Comprador** — consome skills.
- Pode ser afiliado, agência, white-label.
- Paga por uso, por mês, ou por execução.
- Tem direito a reembolso se skill não entregar.

**Operador** (Nexus) — mantém o marketplace saudável.
- Valida skills antes de publicar.
- Modera reviews.
- Resolve disputas.
- Garante compliance.

**3. Anatomia de uma skill vendável**

Uma skill que vende bem tem:

1. **Problema claro** — "copies para WhatsApp de e-commerce" é melhor que "skill de texto".
2. **Output consistente** — mesma skill, mesmo input, mesmo nível de output.
3. **Documentação impecável** — SKILL.md + exemplos + troubleshooting.
4. **Testes automatizados** — CI que roda antes de cada release.
5. **Suporte responsivo** — autor responde em <48h.
6. **Pricing justo** — proporcional ao valor entregue.
7. **Reputação inicial** — primeiros 10 reviews com 4.5+ estrelas.

**4. SKILL.md — o manifesto**

Aprofundando o que vimos na Apostila 07:

```markdown
# Skill: whatsapp_copy_v2

**Versão:** 2.1.0
**Autor:** Maria Silva (maria@agencia.com.br)
**Tags:** whatsapp, copywriting, ecommerce, conversão
**Dependências:** nenhuma

## Descrição
Gera copies persuasivas para campanhas de WhatsApp
em e-commerce, com foco em conversão D+1.

## Inputs
- produto_nome: str
- publico_alvo: str (ex: "mães 30-45 SP")
- objetivo: enum [venda, lead, recompra]
- tom: enum [urgente, acolhedor, direto]

## Outputs
- copy_principal: str (max 500 chars)
- variacoes: list[str] (3 variantes A/B)
- horario_sugerido: time
- disclaimer_lgpd: str

## Exemplo
Input: {produto: "vestido floral", publico: "mulheres 25-35", objetivo: "venda"}
Output: {
  copy_principal: "🌸 Vestido floral que combina com seu lifestyle...",
  variacoes: ["..."],
  horario_sugerido: "19:00-21:00",
  disclaimer_lgpd: "Você está recebendo porque se inscreveu..."
}

## Política
- Limite: 1000 gerações/dia
- Bloqueio se produto for: [tabaco, armas]
- Requer aprovação se: "milagre" ou "garantido" no copy

## Testes
- test_basic_copy
- test_variations
- test_policy_blocking
- test_lgpd_disclaimer

## Suporte
maria@agencia.com.br · response <48h
```

**5. Sistema de preços: free, freemium, paid, enterprise**

**Free:**
- Preço: R$0.
- Visibilidade: alta (boost no ranking).
- Limitação: até 100 execuções/mês por tenant.
- Bom para: construir reputação inicial.

**Freemium:**
- Preço: R$0 básico + R$29-99/mês pro.
- Features pro: mais execuções, melhor modelo, suporte prioritário.
- Bom para: capturar tanto curiosos quanto pagantes.

**Paid:**
- Preço: R$49-499/mês OU R$0.05-0.50 por execução.
- Visibilidade: depende de reviews e conversão.
- Bom para: skill com track record comprovado.

**Enterprise:**
- Preço: contrato, começa em R$2.000/mês.
- Customização: total (branding, integração dedicada).
- SLA: garantido contratualmente.
- Bom para: grandes operadores que precisam de exclusividade.

**6. Como autor: passo a passo para publicar**

1. **Criar SKILL.md** completo (vide template acima).
2. **Implementar código** em pasta `skill_name/`.
3. **Escrever testes** com cobertura >80%.
4. **Configurar CI** (GitHub Actions ou similar) que roda testes em cada push.
5. **Submeter para review** via `nexus skill submit`.
6. **Aguardar validação** (geralmente 2-5 dias úteis).
7. **Publicar** com preço e categoria.
8. **Divulgar** — compartilhar em comunidade, fazer demo no Discord, etc.

**7. Validação técnica antes de publicar**

A Nexus valida:

- **Funcionalidade** — testes passam em CI.
- **Segurança** — não tem prompt injection óbvia.
- **Compliance** — não viola LGPD nem termos.
- **Documentação** — SKILL.md está completo.
- **Performance** — p99 latência <3s para 95% das chamadas.
- **Custo** — execução custa <R$0.10 (caso contrário, exige aprovação).

**Skills reprovadas** recebem relatório com o que ajustar. Re-submissão gratuita.

**8. Sistema de reputação e reviews**

Cada skill tem:

- **Estrelas** (1-5, média ponderada).
- **Reviews escritas** (até 2000 chars).
- **Uso** (total de execuções).
- **Retenção** (% de compradores que continuam usando após 30 dias).

**Reviews falsas** são detectadas automaticamente e removidas. Autores podem responder publicamente.

**Score de reputação:**
- 4.5+ estrelas + 50+ reviews = "Top Rated" badge.
- 4.0-4.5 = normal.
- <4.0 = flagged para revisão.

**9. Como comprador: como escolher bem**

Critérios práticos:

1. **Tem SKILL.md completo?** Se não, desconfie.
2. **Tem testes automatizados?** Sinal de maturidade.
3. **Quantas reviews tem?** <10 = ainda experimental.
4. **Qual a taxa de retenção?** >80% = boa.
5. **Qual o SLA do autor?** Sem SLA documentado = risco.
6. **Tem free trial?** Use antes de pagar.
7. **Suporta seu caso?** Veja os exemplos de output.

**10. Garantias e política de reembolso**

- **7 dias** para reembolso integral se skill não entregar o que promete.
- **30 dias** se skill ficar indisponível por mais de 50% do tempo.
- **Reembolso automático** se skill for despublicada por violação de compliance.

Disputas são resolvidas pelo **Operador** em até 5 dias úteis.

**11. Casos: skills que vendem mais em 2026**

**Top 5 por receita (junho 2026):**

1. **whatsapp_copy_premium_v3** — R$420k/mês. 8.000 usuários ativos.
2. **cohort_analyzer_v2** — R$280k/mês. 3.500 usuários. Analytics preditivo.
3. **funnel_lifecycle_v4** — R$240k/mês. 2.800 usuários. Automação completa.
4. **instagram_reels_script_v2** — R$190k/mês. 4.200 usuários. Script viral.
5. **lead_scoring_v3** — R$170k/mês. 2.100 usuários. Score automático.

**Insight:** skills de **analytics** e **copywriting** dominam. Skills técnicas (infra, DevOps) vendem menos em volume mas têm ticket médio maior.

**12. Top 10 erros de autores iniciantes**

1. SKILL.md incompleto.
2. Sem testes (ou testes que não rodam).
3. Pricing muito alto no lançamento.
4. Sem suporte documentado.
5. Documentação só em inglês (90% do público fala PT-BR).
6. Skill que depende de outros serviços sem aviso.
7. Output sem disclaimer de LGPD.
8. Sem changelog.
9. Sem exemplos de output real.
10. Não promover a skill após publicar.

**13. Como o Marketplace gera renda para a plataforma**

A Nexus fica com **20% de cada transação** (autor fica com 80%). Em junho de 2026:

- Volume transacionado: R$4.2M.
- Receita da plataforma (20%): R$840k.
- Margem após custos (LLM, infra, suporte): ~65%.

Esse fluxo é reinvestido em:

- Manutenção do IOAID.
- Equipe de validação.
- Marketing do marketplace.
- Programa de bolsas para autores emergentes.

**14. Compliance e LGPD no marketplace**

Toda skill publicada deve:

- Ter **disclaimer LGPD** quando aplicável.
- Não persistir PII sem consentimento.
- Não compartilhar dados entre tenants.
- Ser auditável (logs de execução por 90 dias).

**Skills que violam** entram em quarentena e podem ser despublicadas. Autores podem recorrer.

**DPO** do marketplace: `dpo@nexus.io`.

**15. Roadmap do marketplace 2026-2027**

**Q3 2026:**
- Launch de **Skill Bundles** (pacotes temáticos com desconto).
- **Marketplace de Agentes** (não só skills — agentes inteiros).
- **Skill marketplace API** para integrações externas.

**Q4 2026:**
- **Skill Marketplace Mobile** (comprar/instalar pelo app).
- **Live demos** no Discord toda semana.
- **Programa de afiliados do marketplace** (indique skills, ganhe).

**Q1 2027:**
- **Skill versioning pago** (quem tem v1 free, v2 paga).
- **Skill Academy** — cursos para autores aprenderem a criar.
- **Global expansion** (espanhol, inglês, mandarim).

**16. Glossário**

| Termo | Definição |
|-------|-----------|
| **Skill** | Pacote vendável de capacidade de IA |
| **SKILL.md** | Manifesto técnico de uma skill |
| **Marketplace** | Local onde skills são compradas/vendidas |
| **Freemium** | Modelo free + pago |
| **Reputação** | Score agregado de uma skill |
| **Top Rated** | Badge para skills 4.5+ estrelas |
| **Quarentena** | Isolamento temporário de skill com problema |
| **DPO** | Data Protection Officer |
| **Bundle** | Pacote de skills com desconto |
| **Skill Versioning** | Política de cobrar por novas versões |
| **CI/CD** | Continuous Integration/Deployment |
| **Coorte** | Grupo de usuários com característica comum |
| **Lead Scoring** | Score atribuído a leads |
| **Reembolso** | Devolução do valor pago |
| **LGPD** | Lei Geral de Proteção de Dados |

---

*© 2026 Nexus HUB57 · Academ'IA · Todos os direitos reservados*
*Versão 1.0.0 · Junho 2026 · Apostila Academ'IA #13 — Marketplace de Skills*
