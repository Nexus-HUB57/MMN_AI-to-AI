# Nexus Video Generator - TODO

## Fase 1: Banco de Dados e Esquema
- [x] Criar tabelas para projetos de vídeo (video_projects)
- [x] Criar tabelas para roteiros (scripts)
- [x] Criar tabelas para histórico de geração (generation_history)
- [x] Definir relacionamentos entre tabelas
- [x] Executar migrações do banco de dados

## Fase 2: Autenticação e Painel de Projetos
- [x] Implementar tRPC procedure para listar projetos do usuário
- [x] Criar página de painel de projetos (Dashboard)
- [x] Implementar listagem de projetos com status
- [x] Adicionar funcionalidade de deletar projeto
- [ ] Adicionar funcionalidade de visualizar detalhes do projeto

## Fase 3: Formulário de Criação de Vídeo
- [x] Criar página de criação de vídeo
- [x] Implementar seleção de persona (Ive, Alencar, dupla)
- [x] Implementar seleção de nível (Fundamental, Agente, Master, Elite)
- [x] Implementar seleção de módulo baseada no nível
- [x] Validar formulário antes de submeter

## Fase 4: Geração de Roteiro via LLM
- [ ] Criar procedure tRPC para gerar roteiro
- [ ] Integrar com LLM (Claude/GPT) para gerar roteiro
- [ ] Aplicar diretrizes de persona ao prompt
- [ ] Salvar roteiro gerado no banco de dados
- [ ] Implementar tratamento de erros e retry

## Fase 5: Visualizador de Roteiro com Edição Inline
- [ ] Criar componente de visualizador de roteiro
- [ ] Implementar edição inline de cenas
- [ ] Implementar salvamento de alterações
- [ ] Adicionar preview em tempo real
- [ ] Adicionar botão para avançar para geração de imagem

## Fase 6: Geração de Imagem de Thumbnail/Capa
- [ ] Criar procedure tRPC para gerar imagem de thumbnail
- [ ] Integrar com image generation API
- [ ] Aplicar tema do módulo e persona à imagem
- [ ] Salvar imagem gerada no S3
- [ ] Exibir imagem no painel de projetos

## Fase 7: Design Cyberpunk
- [ ] Aplicar cores neon (rosa #FF00FF, ciano #00FFFF) e preto profundo (#0A0E27)
- [ ] Implementar efeitos de brilho externo (text-shadow neon)
- [ ] Adicionar linhas técnicas finas e colchetes HUD
- [ ] Aplicar fontes sans-serif geométricas e bold
- [ ] Implementar animações de entrada/saída estilo cyberpunk
- [ ] Testar contraste e legibilidade

## Fase 8: Testes e Checkpoint Final
- [ ] Testar fluxo completo de criação de vídeo
- [ ] Testar geração de roteiro com diferentes personas
- [ ] Testar geração de imagem de thumbnail
- [ ] Testar edição de roteiro
- [ ] Testar painel de projetos
- [ ] Criar checkpoint final
