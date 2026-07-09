# Guia de Integração - Nexus Video Generator

## Visão Geral

O **Nexus Video Generator** é um sistema completo para geração, edição e produção de vídeos educacionais com personas de IA (Sra. Nexus Ive e Sir. Nexus Alencar).

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│         Frontend (React + TypeScript)                │
│  - Dashboard de Projetos                            │
│  - Editor de Roteiros                               │
│  - Visualizador de Cenas                            │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  tRPC API (Backend)                                 │
│  ├─ video.create                                    │
│  ├─ video.list                                      │
│  ├─ video.getById                                   │
│  ├─ video.delete                                    │
│  ├─ video.generateScript (NEW)                      │
│  ├─ video.updateScript (NEW)                        │
│  └─ video.getScript (NEW)                           │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  LLM Service     │    │  Database        │
│  - generateScript│    │  - video_projects│
│  - buildPrompt   │    │  - scripts       │
│  - invokeLLM     │    │  - generation_   │
│                  │    │    history       │
└──────────────────┘    └──────────────────┘
        ▲
        │
┌───────┴──────────────────────────────────┐
│  AcademIA Integration                     │
│  ├─ syncAcademiaScripts()                │
│  ├─ Roteiros existentes                  │
│  └─ Personas e diretrizes                │
└───────────────────────────────────────────┘
```

## Fluxo de Uso

### 1. Criar um Novo Projeto

```typescript
// Frontend
const project = await trpc.video.create.mutate({
  title: "Entendendo IOAID",
  description: "Aula sobre Infraestrutura Operacional de Inteligência Distribuída",
  persona: "Ive", // ou "Alencar" ou "dupla"
  level: "Fundamental",
  module: "01"
});
```

### 2. Gerar Roteiro com IA

```typescript
// Frontend
const result = await trpc.video.generateScript.mutate({
  projectId: project.id,
  moduleContent: "Conteúdo do módulo a ser usado como base para geração..."
});

// Backend (automático)
// 1. Valida propriedade do projeto
// 2. Chama LLM com diretrizes de persona
// 3. Salva roteiro no banco de dados
// 4. Atualiza status para 'script_generated'
```

### 3. Visualizar e Editar Roteiro

```typescript
// Frontend - Recuperar roteiro
const script = await trpc.video.getScript.query({ projectId: project.id });

// Editar roteiro
const updated = await trpc.video.updateScript.mutate({
  projectId: project.id,
  scriptContent: "Roteiro editado com alterações..."
});
```

### 4. Sincronizar Roteiros da AcademIA

```typescript
// Backend - Sincronização manual
import { syncAcademiaScripts } from './syncAcademiaScripts';

const result = await syncAcademiaScripts(
  '/home/ubuntu/MMN_AI-to-AI',
  userId
);

console.log(`Synced ${result.count} scripts`);
// Output: Synced 8/8 scripts from AcademIA
```

## Estrutura de Dados

### Video Project
```typescript
{
  id: number;
  userId: number;
  title: string;
  description?: string;
  persona: "Ive" | "Alencar" | "dupla";
  level: "Fundamental" | "Agente" | "Master" | "Elite";
  module: string;
  status: "draft" | "script_generated" | "script_edited" | "image_generated" | "completed";
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Script
```typescript
{
  id: number;
  projectId: number;
  content: string; // Markdown com estrutura de cenas
  isEdited: "true" | "false";
  createdAt: Date;
  updatedAt: Date;
}
```

### Generation History
```typescript
{
  id: number;
  projectId: number;
  type: "script" | "image";
  status: "pending" | "success" | "failed";
  result?: any;
  error?: string;
  createdAt: Date;
}
```

## Personas e Diretrizes

### Sra. Nexus Ive
- **Papel**: Figura matriarcal, estratégica, acolhedora
- **Voz**: Serena, articulada e tranquilizadora
- **Estilo**: Serenidade com autoridade, toque sensual
- **Função**: Mediadora, visão estratégica

### Sir. Nexus Alencar
- **Papel**: Figura técnica, prática e profunda
- **Voz**: Serena, acolhedora e autoritária
- **Estilo**: Profundidade técnica, análise de dados
- **Função**: Instrutor técnico, soluções práticas

### Dupla (Ive + Alencar)
- **Dinâmica**: Harmonia profissional com cumplicidade
- **Complementaridade**: Estratégia + Técnica
- **Interação**: Respeito mútuo, desejo de colaboração
- **Resultado**: Experiência envolvente e inspiradora

## Roteiros Disponíveis para Sincronização

### Trilha Fundamental
| Módulo | Título | Persona | Cenas |
|--------|--------|---------|-------|
| 00 | Boas-vindas | Alencar | 7 |
| 01 | Entendendo IOAID | Ive | 5 |
| 02 | Sistema SHO | Ive | 4 |
| 03 | Painel Afiliado | Ive | 4 |

### Trilha Agente
| Módulo | Título | Persona | Cenas |
|--------|--------|---------|-------|
| 00 | Primeiro Agente | Ive | 5 |
| 01 | Skills Essenciais | Ive | 5 |
| 02 | Disparo WhatsApp | Ive | 4 |
| 03 | Judge Revisor | Ive | 4 |

## Implementação de Funcionalidades

### Fase 1: Geração de Roteiro ✅
- [x] Integração com LLM
- [x] Diretrizes de persona
- [x] Salvamento em banco de dados
- [x] Validação de propriedade

### Fase 2: Edição de Roteiro ✅
- [x] Recuperação de roteiro
- [x] Atualização de conteúdo
- [x] Rastreamento de edições
- [x] Sincronização com backend

### Fase 3: Sincronização com AcademIA ✅
- [x] Leitura de roteiros existentes
- [x] Detecção automática de persona
- [x] Importação para banco de dados
- [x] Manifest de roteiros

### Fase 4: Geração de Imagens ⏳
- [ ] API de geração de imagens
- [ ] Aplicação de tema e persona
- [ ] Salvamento em S3
- [ ] Thumbnail para projetos

### Fase 5: Produção de Vídeos ⏳
- [ ] Síntese de voz (TTS)
- [ ] Composição de vídeo
- [ ] Efeitos visuais
- [ ] Exportação em múltiplos formatos

## Exemplo de Roteiro Gerado

```markdown
# Entendendo o IOAID

**Duração Total:** 15 minutos

## Cena 1: Introdução (2 minutos)

**Visual:** Sra. Nexus Ive em estúdio corporativo, iluminação suave, fundo com elementos de rede.

**Sra. Nexus Ive:** "Bem-vindos à aula sobre IOAID. Hoje vamos explorar a Infraestrutura Operacional de Inteligência Distribuída, o coração da plataforma Nexus."

**Elementos Visuais:** Slide com título "IOAID" e subtítulo "Infraestrutura Operacional de Inteligência Distribuída"

---

## Cena 2: O que é IOAID? (3 minutos)

**Visual:** Transição para slide com diagrama de arquitetura distribuída.

**Sra. Nexus Ive:** "IOAID é a camada que permite que cada agente de IA funcione de forma autônoma, mas conectado a uma rede maior..."

...
```

## Próximas Melhorias

1. **Suporte a Múltiplos Idiomas**
   - Adicionar idiomas além de português
   - Tradução automática de roteiros

2. **Colaboração em Tempo Real**
   - Edição simultânea de roteiros
   - Comentários e sugestões

3. **Análise de Qualidade**
   - Verificação de coerência
   - Análise de tempo de leitura
   - Sugestões de melhoria

4. **Integração com Plataformas**
   - YouTube
   - Vimeo
   - Streaming platforms

5. **Analytics Avançado**
   - Rastreamento de engajamento
   - Análise de performance
   - Recomendações de otimização

## Troubleshooting

### Erro: "Project not found"
- Verifique se o `projectId` está correto
- Confirme que você é o proprietário do projeto

### Erro: "Failed to generate script"
- Verifique se a chave de API do LLM está configurada
- Confirme que o `moduleContent` não está vazio
- Verifique os logs do servidor

### Sincronização não encontra roteiros
- Confirme que o caminho para AcademIA está correto
- Verifique se os arquivos de roteiro existem
- Confirme que os nomes dos arquivos seguem o padrão `{id}-{nome}-roteiro.md`

## Suporte e Contribuições

Para reportar bugs, sugerir melhorias ou contribuir com código:
1. Abra uma issue no repositório
2. Descreva o problema ou melhoria
3. Forneça exemplos de código se aplicável
4. Aguarde feedback da equipe

---

**Última atualização:** 15 de Junho de 2026
**Versão:** 1.0.0
**Status:** Production Ready (Fase 4 e 11 completas)
