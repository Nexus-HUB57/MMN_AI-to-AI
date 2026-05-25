# Fase 8 - Beta Launch Program

## Visão Geral

Este diretório contém a implementação do **Beta Launch Program** da Fase 8, preparando a plataforma MMN_AI-to-AI para o lançamento público.

## Estrutura

```
fase8/
├── src/
│   ├── __init__.py
│   ├── main.py              # Aplicação FastAPI
│   ├── api/
│   │   ├── __init__.py
│   │   └── beta.py          # API Router
│   ├── models/
│   │   ├── __init__.py
│   │   └── beta.py          # Modelos Pydantic
│   ├── services/
│   │   ├── __init__.py
│   │   └── beta_service.py  # Lógica de negócio
│   └── middleware/
│       └── __init__.py
├── tests/
│   └── __init__.py
├── SPEC.md                  # Especificação técnica
└── README.md                # Este arquivo
```

## Funcionalidades

- [x] Gerenciamento de Programas Beta
- [x] Cadastro e gestão de Testadores
- [x] Sistema de Feedback
- [x] Rastreamento de Bugs
- [x] Sistema de Convites
- [x] Pesquisas de Satisfação
- [x] Métricas e Analytics

## Como Usar

```bash
# Instalar dependências
pip install fastapi uvicorn pydantic

# Executar servidor
python src/main.py

# Acessar documentação
# http://localhost:8000/docs
```

## API Endpoints

### Programas
- `POST /beta/programs` - Criar programa
- `GET /beta/programs` - Listar programas
- `GET /beta/programs/{id}` - Detalhes

### Testadores
- `POST /beta/testers` - Adicionar testador
- `GET /beta/testers` - Listar testadores
- `PATCH /beta/testers/{id}/status` - Atualizar status

### Feedback
- `POST /beta/feedback` - Submeter feedback
- `GET /beta/feedback` - Listar feedbacks

### Bugs
- `POST /beta/bugs` - Reportar bug
- `GET /beta/bugs` - Listar bugs

---

**Versão**: 1.0.0
**Autor**: Nexus-HUB57 / MiniMax Agent