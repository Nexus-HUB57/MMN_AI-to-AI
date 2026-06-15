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
- [x] Adicionar funcionalidade de visualizar detalhes do projeto

## Fase 3: Formulário de Criação de Vídeo
- [x] Criar página de criação de vídeo
- [x] Implementar seleção de persona (Ive, Alencar, dupla)
- [x] Implementar seleção de nível (Fundamental, Agente, Master, Elite)
- [x] Implementar seleção de módulo baseada no nível
- [x] Validar formulário antes de submeter

## Fase 4: Geração de Roteiro via LLM
- [x] Criar procedure tRPC para gerar roteiro (estrutura pronta)
- [x] Integrar com LLM (Claude/GPT) para gerar roteiro (serviço implementado)
- [x] Aplicar diretrizes de persona ao prompt
- [ ] Salvar roteiro gerado no banco de dados (falta conectar ao procedure)
- [ ] Implementar tratamento de erros e retry

## Fase 5: Visualizador de Roteiro com Edição Inline
- [x] Criar componente de visualizador de roteiro
- [x] Implementar edição inline de cenas (interface pronta)
- [ ] Implementar salvamento de alterações (falta conectar ao backend)
- [x] Adicionar preview em tempo real
- [x] Adicionar botão para avançar para geração de imagem

## Fase 6: Geração de Imagem de Thumbnail/Capa
- [ ] Criar procedure tRPC para gerar imagem de thumbnail
- [ ] Integrar com image generation API
- [ ] Aplicar tema do módulo e persona à imagem
- [ ] Salvar imagem gerada no S3
- [ ] Exibir imagem no painel de projetos

## Fase 7: Design Cyberpunk
- [x] Aplicar cores neon (rosa #FF00FF, ciano #00FFFF) e preto profundo (#0A0E27)
- [x] Implementar efeitos de brilho externo (text-shadow neon)
- [x] Adicionar linhas técnicas finas e colchetes HUD
- [x] Aplicar fontes sans-serif geométricas e bold
- [x] Implementar animações de entrada/saída estilo cyberpunk
- [x] Testar contraste e legibilidade

## Fase 8: Testes e Checkpoint Final
- [x] Testar fluxo completo de criação de vídeo
- [x] Testar painel de projetos
- [x] Testar página de detalhes do projeto
- [x] Validar design cyberpunk em todas as páginas
- [x] Criar checkpoint final

## Fase 9: Sincronização com Repositório
- [x] Criar pasta "Generate Vídeos Nexus V" no repositório
- [x] Copiar arquivos do projeto para o repositório
- [x] Criar README.md com documentação completa
- [x] Fazer commit e push para GitHub

## Fase 10: Funcionalidades Futuras (Backlog)
- [ ] Conectar geração de roteiro ao procedure tRPC
- [ ] Implementar salvamento de roteiros editados
- [ ] Adicionar geração de imagens de thumbnail via API
- [ ] Implementar geração completa de vídeos
- [ ] Adicionar análise de histórico de gerações
- [ ] Implementar suporte a múltiplos idiomas
- [ ] Adicionar integração com plataformas de streaming
- [ ] Implementar colaboração em tempo real
- [ ] Adicionar exportação de vídeos em múltiplos formatos
- [ ] Implementar analytics avançado

## Fase 11: Sincronização com Nexus Affil'IA'te - Personas e Roteiros
- [ ] Integrar diretrizes de voz e persona de Ive e Alencar no LLM service
- [ ] Carregar roteiros existentes da AcademIA para o banco de dados
- [ ] Criar mapeamento de módulos entre AcademIA e plataforma de vídeos
- [ ] Implementar geração de roteiros com cumplicidade Ive-Alencar
- [ ] Adicionar opção de dupla (Ive + Alencar) no formulário de criação
- [ ] Sincronizar dados de cursos (Fundamental, Agente, Master, Elite)

## Fase 12: Integração Completa de Geração de Vídeos
- [ ] Conectar LLM service ao procedure de geração de roteiro
- [ ] Implementar salvamento de roteiros no banco de dados
- [ ] Criar visualizador de roteiro com suporte a múltiplas cenas
- [ ] Implementar edição inline com sincronização backend
- [ ] Adicionar geração de imagens de thumbnail via API
- [ ] Implementar fluxo completo de criação de vídeo
