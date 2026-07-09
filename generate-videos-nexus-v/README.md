# Nexus Video Generator - Sistema de Geração de Vídeos com IA

Plataforma web de geração de vídeo-aulas educacionais com estética cyberpunk de alto impacto, desenvolvida para a AcademIA Nexus.

## Visão Geral

O **Nexus Video Generator** é uma plataforma inovadora que permite a criação de vídeos educacionais personalizados utilizando inteligência artificial. A plataforma integra personas especializadas (Ive, Alencar e dupla), múltiplos níveis de curso (Fundamental, Agente, Master, Elite) e geração automática de roteiros via LLM.

## Características Principais

### 1. **Roteiros Automáticos com LLM**
- Geração inteligente de roteiros baseada em conteúdo do módulo
- Diretrizes específicas para cada persona
- Suporte a edição inline dos roteiros gerados

### 2. **Personas Especializadas**
- **Sra. Nexus Ive**: Figura matriarcal, estratégica, acolhedora e autoritária
- **Sir. Nexus Alencar**: Figura técnica, prática e profunda
- **Dupla**: Harmonia profissional com cumplicidade implícita

### 3. **Múltiplos Níveis de Curso**
- **Fundamental**: Introdução ao Nexus e conceitos básicos
- **Agente**: Desenvolvimento de agentes de IA
- **Master**: Otimização avançada e análise de dados
- **Elite**: Implementações corporativas e federação

### 4. **Geração de Imagens**
- Thumbnails personalizadas com tema do módulo
- Integração com API de geração de imagens
- Armazenamento em S3

### 5. **Painel de Projetos**
- Histórico completo de projetos
- Status de geração em tempo real
- Gerenciamento de projetos com delete e visualização

### 6. **Autenticação de Usuário**
- Integração com Manus OAuth
- Gerenciamento seguro de projetos por usuário
- Proteção de rotas autenticadas

## Design Cyberpunk

A plataforma apresenta uma estética cyberpunk de alto impacto com:

- **Cores Neon**: Rosa vibrante (#FF00FF) e Ciano elétrico (#00FFFF)
- **Fundo Profundo**: Preto profundo (#0A0E27) com efeito de grid
- **Tipografia Bold**: Fontes sans-serif geométricas com efeito de brilho neon
- **Elementos HUD**: Linhas técnicas finas e colchetes de canto emoldurando conteúdo
- **Animações**: Transições suaves e efeitos de fade-in

## Estrutura do Projeto

```
nexus_video_generator/
├── client/                    # Frontend React 19
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Home.tsx      # Página inicial
│   │   │   ├── Create.tsx    # Criação de vídeo
│   │   │   ├── Dashboard.tsx # Painel de projetos
│   │   │   └── Project.tsx   # Detalhes do projeto
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/              # Utilitários e configurações
│   │   └── index.css         # Estilos globais com cyberpunk
│   └── index.html            # HTML base
├── server/                    # Backend Express + tRPC
│   ├── routers.ts            # Procedures tRPC
│   ├── db.ts                 # Funções de banco de dados
│   ├── llmService.ts         # Integração com LLM
│   ├── courseData.ts         # Dados de cursos e personas
│   └── _core/                # Infraestrutura do servidor
├── drizzle/                  # Schema e migrações do banco
│   ├── schema.ts             # Definição de tabelas
│   └── migrations/           # Arquivos de migração
├── shared/                   # Código compartilhado
└── references/               # Documentação de integrações
```

## Banco de Dados

### Tabelas Principais

**users**
- Usuários autenticados via Manus OAuth
- Campos: id, openId, name, email, role, timestamps

**video_projects**
- Projetos de vídeo criados pelos usuários
- Campos: id, userId, title, description, persona, level, module, status, thumbnailUrl, timestamps

**scripts**
- Roteiros gerados para cada projeto
- Campos: id, projectId, content, isEdited, timestamps

**generation_history**
- Histórico de gerações (roteiros e imagens)
- Campos: id, projectId, type, status, result, error, createdAt

## Fluxo de Uso

1. **Autenticação**: Usuário faz login via Manus OAuth
2. **Criação de Projeto**: Seleciona persona, nível e módulo
3. **Geração de Roteiro**: LLM gera roteiro automático
4. **Edição**: Usuário pode editar o roteiro inline
5. **Geração de Imagem**: Sistema gera thumbnail personalizado
6. **Gerenciamento**: Projeto aparece no dashboard com histórico

## Tecnologias Utilizadas

### Frontend
- **React 19**: Framework UI
- **Tailwind CSS 4**: Estilização com design cyberpunk
- **Wouter**: Roteamento leve
- **tRPC**: Comunicação type-safe com backend
- **Sonner**: Notificações toast
- **Lucide React**: Ícones

### Backend
- **Express 4**: Servidor HTTP
- **tRPC 11**: API type-safe
- **Drizzle ORM**: Gerenciamento de banco de dados
- **MySQL/TiDB**: Banco de dados relacional

### Integrações
- **Manus OAuth**: Autenticação
- **Manus LLM API**: Geração de roteiros
- **Manus Image Generation**: Criação de thumbnails
- **AWS S3**: Armazenamento de arquivos

## Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 22+
- pnpm 10+
- Acesso ao banco de dados MySQL/TiDB

### Setup

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações do banco
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Testes

```bash
# Executar testes com Vitest
pnpm test

# Verificar tipos TypeScript
pnpm check
```

## Roadmap Futuro

- [ ] Geração completa de vídeos via IA
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com plataformas de streaming
- [ ] Analytics avançado de visualizações
- [ ] Colaboração em tempo real
- [ ] Exportação de vídeos em múltiplos formatos

## Contribuindo

Este projeto faz parte da iniciativa AcademIA Nexus. Para contribuir:

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto é propriedade da Nexus Affil'IA'te e está sob a licença MIT.

## Contato

Para dúvidas ou sugestões sobre o projeto, entre em contato através da plataforma OneVerso ou do repositório GitHub.

---

**Desenvolvido com IA para a AcademIA Nexus** 🚀
