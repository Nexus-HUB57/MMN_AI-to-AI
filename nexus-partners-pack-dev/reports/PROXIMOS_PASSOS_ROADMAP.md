# Próximos Passos: Roadmap Nexus Partners Pack

Com base na revisão técnica dos documentos de versão e do roadmap estratégico, os próximos passos para o **Nexus Partners Pack** estão divididos em três horizontes temporais, focando na transição para um modelo comercial robusto e na expansão da autonomia da plataforma.

## 1. Horizonte Imediato: Transição para v1.4.0 (Curto Prazo)

O foco principal desta fase é a consolidação da infraestrutura técnica para suportar o novo modelo de **Assinatura Comercial**.

| Categoria | Ação Prioritária | Descrição |
| :--- | :--- | :--- |
| **Persistência** | Migração Drizzle | Substituir o armazenamento *in-memory* atual por persistência real no Postgres para o XP Ledger e estados de parceiros. |
| **Arquitetura** | Unificação de Services | Migrar o `routers/partnersRouter.ts` legado para consumir o service unificado, eliminando a duplicação do `GrowthAlgorithmEngine`. |
| **Integração** | APIs White-Label | Expor endpoints REST e tRPC para permitir que parceiros integrem o Pack em suas próprias plataformas de forma transparente. |
| **Automação** | Webhooks Outbound | Implementar o disparo automático de webhooks para eventos de registro de volume e mudanças de tier. |

## 2. Horizonte de 30 a 60 Dias: Expansão SaaS e Skills

Nesta fase, o objetivo é transformar o Pack em uma oferta SaaS completa, aumentando o valor agregado para os parceiros.

*   **Multi-tenancy Real**: Implementação de workspaces totalmente isolados, permitindo que diferentes marcas gerenciem suas próprias redes de parceiros na mesma infraestrutura.
*   **Sistema de Billing Enterprise**: Lançamento dos planos *Starter*, *Pro* e *Enterprise*, com tarifação baseada em uso de API e volume de transações.
*   **Integrações de Mercado**: Conexão nativa com **Hotmart**, **Shopee** e **Mercado Livre** para sincronização automática de vendas e comissionamento.
*   **App Mobile Expo**: Lançamento da versão mobile do painel do parceiro, facilitando o acompanhamento de métricas e notificações em tempo real.

## 3. Horizonte de 90 Dias: Autonomia e Ecossistema

O objetivo final do roadmap atual é atingir a maturidade total como um ecossistema autônomo.

*   **Marketplace de Skills**: Criação de um ambiente onde desenvolvedores e parceiros podem criar e alugar novas "skills" de IA, com divisão de receita (revenue share) automatizada.
*   **Autonomy Score ≥ 85**: Otimização dos agentes de IA para que operem com intervenção humana mínima, utilizando o motor de auto-cura (rRNA) para resolver falhas de execução.
*   **Certificação Nexus**: Lançamento de um programa oficial para capacitar e certificar implementadores técnicos do Nexus Partners Pack no mercado.

---
**Status da Revisão**: Consolidado com base nos documentos `ROADMAP.md` e `NEXUS_PARTNERS_PACK_v1.3.1.md`.  
**Última Atualização**: 01 de Junho de 2026.
