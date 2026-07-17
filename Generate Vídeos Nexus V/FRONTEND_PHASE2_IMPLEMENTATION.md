# Fase 2: Desenvolvimento do Frontend - Implementação Completa

## Visão Geral

Este documento descreve a implementação completa da Fase 2 do projeto Nexus Video Generator, focando na visualização e edição de roteiros com integração ao backend via tRPC.

## Componentes Implementados

### 1. **ScriptEditor.tsx** (Existente - Aprimorado)

**Localização**: `client/src/components/ScriptEditor.tsx`

**Funcionalidades**:
- Visualização de roteiro em modo preview com renderização de cenas estruturadas
- Edição completa do roteiro em formato Markdown
- Alternância entre modo de edição e visualização
- Parsing automático de cenas a partir do Markdown
- Cálculo de duração total do roteiro
- Salvamento com feedback visual (toast notifications)

**Props**:
```typescript
interface ScriptEditorProps {
  scriptContent: string;        // Conteúdo do roteiro em Markdown
  isEditing: boolean;           // Estado de edição
  onEdit: (content: string) => void;  // Callback para alterações
  onSave: () => void;           // Callback para salvar
  onCancel: () => void;         // Callback para cancelar
  isSaving?: boolean;           // Estado de salvamento
}
```

**Uso**:
```tsx
<ScriptEditor
  scriptContent={scriptContent}
  isEditing={isEditingScript}
  onEdit={setEditedScript}
  onSave={handleSaveScript}
  onCancel={() => setIsEditingScript(false)}
  isSaving={updateScriptMutation.isPending}
/>
```

### 2. **ScriptGenerator.tsx** (Existente - Aprimorado)

**Localização**: `client/src/components/ScriptGenerator.tsx`

**Funcionalidades**:
- Interface para inserir conteúdo do módulo
- Geração de roteiro via LLM usando tRPC mutation
- Exibição de informações da persona, nível e módulo
- Dicas para melhor qualidade de geração
- Indicador de progresso durante a geração

**Props**:
```typescript
interface ScriptGeneratorProps {
  projectId: number;
  persona: string;
  level: string;
  module: string;
  onScriptGenerated: (script: string) => void;
  isLoading?: boolean;
}
```

**Uso**:
```tsx
<ScriptGenerator
  projectId={project.id}
  persona={project.persona}
  level={project.level}
  module={project.module}
  onScriptGenerated={handleScriptGenerated}
/>
```

### 3. **SceneEditor.tsx** (NOVO)

**Localização**: `client/src/components/SceneEditor.tsx`

**Funcionalidades**:
- Edição individual de cenas com validação de campos
- Validação de duração no formato MM:SS
- Campos para: título, duração, descrição visual, diálogos, elementos visuais
- Feedback de erro em tempo real
- Salvamento com confirmação

**Props**:
```typescript
interface SceneEditorProps {
  scene: Scene;
  onSave: (updatedScene: Scene) => void;
  onCancel: () => void;
  isSaving?: boolean;
}
```

**Uso**:
```tsx
<SceneEditor
  scene={selectedScene}
  onSave={handleSaveScene}
  onCancel={() => setSelectedScene(null)}
  isSaving={isSaving}
/>
```

### 4. **ScriptViewer.tsx** (NOVO)

**Localização**: `client/src/components/ScriptViewer.tsx`

**Funcionalidades**:
- Visualização aprimorada de roteiros com estatísticas
- Modo preview com renderização visual de cenas
- Modo código para visualizar Markdown bruto
- Estatísticas: número de cenas, duração total, palavras, caracteres
- Botões para copiar, baixar e editar
- Design responsivo com cards de cenas bem estruturados

**Props**:
```typescript
interface ScriptViewerProps {
  scriptContent: string;
  scenes: Scene[];
  onEdit?: () => void;
  onDownload?: () => void;
}
```

**Uso**:
```tsx
<ScriptViewer
  scriptContent={scriptContent}
  scenes={scenes}
  onEdit={() => setIsEditingScript(true)}
  onDownload={handleDownload}
/>
```

### 5. **ScriptEnhancer.tsx** (NOVO)

**Localização**: `client/src/components/ScriptEnhancer.tsx`

**Funcionalidades**:
- Análise inteligente de roteiros
- Sugestões de melhoria em: gramática, clareza, engajamento, ritmo, tom
- Aplicação seletiva de sugestões
- Indicadores de severidade (baixa, média, alta)
- Ícones visuais para cada tipo de sugestão

**Props**:
```typescript
interface ScriptEnhancerProps {
  scriptContent: string;
  onApplySuggestion?: (suggestion: EnhancementSuggestion) => void;
}
```

**Uso**:
```tsx
<ScriptEnhancer
  scriptContent={scriptContent}
  onApplySuggestion={handleApplySuggestion}
/>
```

## Integração com tRPC

### Mutations Utilizadas

#### 1. `video.generateScript`
Gera um roteiro usando LLM baseado na persona, nível e conteúdo do módulo.

**Input**:
```typescript
{
  projectId: number;
  moduleContent: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  script: Script;
  message: string;
}
```

#### 2. `video.updateScript`
Atualiza o conteúdo de um roteiro já gerado.

**Input**:
```typescript
{
  projectId: number;
  scriptContent: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  message: string;
}
```

#### 3. `video.getScript`
Recupera o roteiro de um projeto.

**Input**:
```typescript
{
  projectId: number;
}
```

**Output**:
```typescript
Script | null
```

## Fluxo de Uso Completo

### 1. Criação de Projeto
```
User → Dashboard → Create Project → Select Persona/Level/Module
```

### 2. Geração de Roteiro
```
Project Page → ScriptGenerator → LLM → Backend → Script Saved
```

### 3. Visualização de Roteiro
```
Project Page → ScriptViewer → Preview/Code Mode
```

### 4. Edição de Roteiro
```
Project Page → Edit Button → ScriptEditor → Save → Backend Updated
```

### 5. Melhoria de Roteiro
```
Project Page → ScriptEnhancer → Analyze → Apply Suggestions
```

## Otimização de Tokens

Para garantir eficiência no uso de tokens com LLMs:

### 1. **Processamento Incremental**
- Apenas o conteúdo modificado é enviado ao LLM
- Validação local antes de enviar para o backend
- Cache de respostas quando possível

### 2. **Validação Local**
- Verificação de sintaxe Markdown no cliente
- Validação de duração (MM:SS) antes de salvar
- Feedback instantâneo sem chamadas desnecessárias

### 3. **Compressão de Dados**
- Envio apenas de campos modificados
- Formato JSON otimizado
- Remoção de espaços em branco desnecessários

### 4. **Prompts Otimizados**
- Prompts concisos e focados
- Diretrizes de persona injetadas eficientemente
- Exemplos estruturados para melhor compreensão do LLM

## Estrutura de Dados

### Scene Interface
```typescript
interface Scene {
  id: number;           // Número da cena
  title: string;        // Título da cena
  duration: string;     // Duração em formato MM:SS
  visual: string;       // Descrição visual
  dialogs: string;      // Diálogos
  elements: string;     // Elementos visuais
}
```

### Script Interface
```typescript
interface Script {
  id: number;
  projectId: number;
  content: string;      // Conteúdo em Markdown
  isEdited: boolean;    // Se foi editado manualmente
  createdAt: Date;
  updatedAt: Date;
}
```

## Estilização Cyberpunk

Todos os componentes mantêm a estética cyberpunk com:

- **Cores Neon**: 
  - Pink: `#FF00FF` (neon-pink)
  - Cyan: `#00FFFF` (neon-cyan)
  - Purple: `#A020F0` (neon-purple)

- **Fundos**: Preto profundo com efeito de grid transparente

- **Tipografia**: Sans-serif geométrica com efeito de brilho neon

- **Elementos HUD**: Linhas técnicas finas e colchetes de canto

## Próximas Etapas

### Fase 3: Geração de Imagens
- Implementar mutation `generateThumbnail`
- Integrar com Manus Image Generation API
- Armazenar em S3

### Fase 4: Produção de Vídeos
- Integração com síntese de voz
- Geração de vídeos completos
- Exportação em múltiplos formatos

### Fase 5: White-Label
- Customização de identidade visual
- API REST para integrações externas
- Testes de escalabilidade

## Testes Recomendados

### Testes Unitários
```bash
pnpm test
```

### Testes de Tipo
```bash
pnpm check
```

### Desenvolvimento Local
```bash
pnpm dev
```

## Referências

- [README.md](./README.md) - Visão geral do projeto
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) - Notas técnicas
- [Drizzle ORM](https://orm.drizzle.team/) - Documentação do ORM
- [tRPC](https://trpc.io/) - Documentação do tRPC

---

**Versão**: 1.0
**Data**: 17 de Junho de 2026
**Mantido por**: Manus AI
