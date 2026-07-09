# Nexus Video Generator - Melhorias Implementadas

## Data: 15 de Junho de 2026

### 1. Novas Mutations tRPC para Geração de Roteiros

#### `video.generateScript`
Gera um roteiro usando LLM baseado na persona, nível e conteúdo do módulo.

**Input:**
```typescript
{
  projectId: number;
  moduleContent: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  script: Script;
  message: string;
}
```

**Fluxo:**
1. Valida propriedade do projeto (userId)
2. Chama `generateScriptWithLLM()` com persona e nível
3. Salva roteiro gerado no banco de dados
4. Atualiza status do projeto para `script_generated`

#### `video.updateScript`
Atualiza o conteúdo de um roteiro já gerado.

**Input:**
```typescript
{
  projectId: number;
  scriptContent: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Fluxo:**
1. Valida propriedade do projeto
2. Atualiza conteúdo do script
3. Marca como `isEdited: true`
4. Atualiza status do projeto para `script_edited`

#### `video.getScript`
Recupera o roteiro de um projeto.

**Input:**
```typescript
{
  projectId: number;
}
```

**Output:**
```typescript
Script | null
```

### 2. Serviço de Sincronização com AcademIA

Arquivo: `server/syncAcademiaScripts.ts`

**Funcionalidades:**
- Escaneia diretório `AcademIA/cursos` para roteiros existentes
- Detecta automaticamente persona (Ive, Alencar, dupla)
- Cria projetos de vídeo e scripts no banco de dados
- Mantém rastreabilidade com campo `description: "Sincronizado de AcademIA"`

**Uso:**
```typescript
import { syncAcademiaScripts } from './syncAcademiaScripts';

const result = await syncAcademiaScripts('/home/ubuntu/MMN_AI-to-AI', userId);
console.log(`Synced ${result.count} scripts`);
```

### 3. Roteiros Sincronizados da AcademIA

Total: **8 roteiros** prontos para sincronização

**Trilha Fundamental (4 roteiros):**
- 00 - Boas-vindas (7 cenas, persona: Alencar)
- 01 - Entendendo IOAID (5 cenas, persona: Ive)
- 02 - Sistema SHO (4 cenas, persona: Ive)
- 03 - Painel Afiliado (4 cenas, persona: Ive)

**Trilha Agente (4 roteiros):**
- 00 - Primeiro Agente (5 cenas, persona: Ive)
- 01 - Skills Essenciais (5 cenas, persona: Ive)
- 02 - Disparo WhatsApp (4 cenas, persona: Ive)
- 03 - Judge Revisor (4 cenas, persona: Ive)

### 4. Migrações de Banco de Dados

Arquivo: `drizzle/migrations/add_script_generation.sql`

**Alterações:**
- Adicionado campo `scriptId` em `video_projects`
- Adicionado campo `generatedAt` em `video_projects`
- Criados índices para otimização de queries
- Adicionado trigger para atualizar `updatedAt` em scripts

### 5. Manifest de Importação

Arquivo: `scripts_manifest.json`

Contém metadados de todos os roteiros disponíveis para sincronização:
```json
{
  "timestamp": "2026-06-15T00:46:13.123456",
  "totalScripts": 8,
  "byLevel": {
    "Fundamental": 4,
    "Agente": 4,
    "Master": 0,
    "Elite": 0
  },
  "scripts": [...]
}
```

## Próximas Etapas Recomendadas

### Fase 1: Testes de Integração
- [ ] Testar mutation `generateScript` com diferentes personas
- [ ] Validar salvamento de roteiros no banco de dados
- [ ] Testar edição e atualização de roteiros
- [ ] Verificar sincronização com AcademIA

### Fase 2: Frontend
- [ ] Implementar interface para visualizar roteiros gerados
- [ ] Adicionar editor inline para edição de cenas
- [ ] Criar preview de roteiro com divisão de cenas
- [ ] Implementar salvamento automático

### Fase 3: Geração de Imagens
- [ ] Implementar mutation `generateThumbnail`
- [ ] Integrar com API de geração de imagens
- [ ] Aplicar tema do módulo e persona à imagem
- [ ] Salvar imagens no S3

### Fase 4: Produção de Vídeos
- [ ] Implementar integração com serviço de síntese de voz
- [ ] Gerar vídeos a partir de roteiros
- [ ] Aplicar efeitos visuais e transições
- [ ] Exportar em múltiplos formatos

## Arquivos Modificados/Criados

```
Generate Vídeos Nexus V/
├── server/
│   ├── routers_new.ts (NOVO - com generateScript, updateScript, getScript)
│   ├── syncAcademiaScripts.ts (NOVO - sincronização com AcademIA)
│   └── llmService.ts (existente - geração de roteiros)
├── drizzle/
│   └── migrations/
│       └── add_script_generation.sql (NOVO - migrações)
└── IMPLEMENTATION_NOTES.md (NOVO - esta documentação)

/home/ubuntu/
├── import_scripts.py (NOVO - script de análise)
└── scripts_manifest.json (NOVO - manifest de roteiros)
```

## Status do Desenvolvimento

- ✅ Fase 4: Geração de Roteiro via LLM - **COMPLETA**
- ✅ Fase 5: Visualizador de Roteiro - **ESTRUTURA PRONTA**
- ✅ Fase 11: Sincronização com AcademIA - **IMPLEMENTADA**
- ⚠️ Fase 6: Geração de Imagem - **PENDENTE**
- ⚠️ Fase 12: Integração Completa - **PENDENTE**

## Notas Técnicas

### Persona Directives
O sistema mantém diretrizes de persona em `personaDirectives.ts` e `courseData.ts`:
- **Ive**: Estratégica, acolhedora, tom sereno
- **Alencar**: Técnica, prática, profundidade
- **Dupla**: Harmonia profissional com cumplicidade

Estas diretrizes são injetadas no prompt do LLM para garantir consistência.

### Estrutura de Cenas
Roteiros são estruturados em cenas com:
- Descrição visual (cenário, iluminação, enquadramento)
- Diálogos naturais
- Transições
- Elementos visuais (slides, gráficos)
- Duração estimada

### Segurança
- Todas as mutations validam propriedade do projeto (userId)
- Acesso apenas a usuários autenticados (protectedProcedure)
- Tratamento de erros com mensagens específicas
