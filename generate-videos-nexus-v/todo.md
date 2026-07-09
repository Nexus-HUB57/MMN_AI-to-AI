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

## Fase 10: Estrutura de Produção Profissional ✅
- [x] Criar pasta `AcademIA/producao/` com subpastas
- [x] Documentar pipeline completo (PIPELINE_PRODUCAO.md)
- [x] Criar templates de roteiro (Ive, Alencar, Dupla)
- [x] Criar checklist de qualidade (CHECKLIST_QUALIDADE.md)
- [x] Criar catálogo de módulos (CATALOGO_MODULOS.md)
- [x] Documentar assets necessários
- [x] Criar ficha técnica completa da Sra. Nexus Ive
- [x] Criar esqueleto da ficha do Sir. Nexus Alencar (aguardando material)
- [x] Gerar roteiro de exemplo: 00-boas-vindas (Ive)

## Fase 11: Sincronização com Nexus Affil'IA'te - Personas e Roteiros
- [x] Integrar diretrizes de voz e persona de Ive e Alencar no LLM service
- [x] Criar mapeamento de módulos entre AcademIA e plataforma de vídeos
- [x] Adicionar opção de dupla (Ive + Alencar) no formulário de criação
- [x] Sincronizar dados de cursos (Fundamental, Agente, Master, Elite)
- [ ] Carregar roteiros existentes da AcademIA para o banco de dados

## Fase 12: Integração Completa de Geração de Vídeos
- [ ] Conectar LLM service ao procedure de geração de roteiro
- [ ] Implementar salvamento de roteiros no banco de dados
- [ ] Criar visualizador de roteiro com suporte a múltiplas cenas
- [ ] Implementar edição inline com sincronização backend
- [ ] Adicionar geração de imagens de thumbnail via API
- [ ] Implementar fluxo completo de criação de vídeo

## Fase 13: Renderização de Vídeos (Pipeline Real)
- [ ] Integrar MiniMax image-to-video
- [ ] Renderizar primeiro vídeo piloto (00-boas-vindas Ive)
- [ ] Validar qualidade visual do avatar
- [ ] Implementar batch rendering
- [ ] Configurar CDN para distribuição

## Fase 14: TTS Clonado (Voz)
- [ ] Integrar MiniMax TTS com voice cloning
- [ ] Testar com voz de referência da Sra. Nexus Ive
- [ ] Configurar pipeline de geração de áudio por cena
- [ ] Implementar validação automática de qualidade
- [ ] Testar com voz do Sir. Nexus Alencar (quando disponível)

## Fase 15: Publicação e Analytics
- [ ] Upload automatizado para S3
- [ ] Versionamento de vídeos
- [ ] Geração de thumbnails em 3 formatos
- [ ] Analytics de retenção por cena
- [ ] A/B testing de thumbnails
- [ ] Feedback loop automatizado

## Fase 16: Backlog e Melhorias Futuras
- [ ] Adicionar suporte a múltiplos idiomas
- [ ] Adicionar integração com plataformas de streaming
- [ ] Implementar colaboração em tempo real
- [ ] Adicionar exportação de vídeos em múltiplos formatos
- [ ] Implementar analytics avançado
- [ ] Avatar neural em tempo real
- [ ] Lip-sync automático com TTS
- [ ] Tradução multi-idioma automática
- [ ] Personalização de trilha sonora por módulo

---

**Última atualização:** 2026-06-17 · v1.1
