# Infraestrutura de IA Proprietária - MMN AI-to-AI

Este documento detalha a infraestrutura implementada para a transição de modelos de IA genéricos para modelos proprietários especializados via fine-tuning.

## 1. Arquitetura do Sistema de IA

A nova arquitetura de IA foi projetada para ser modular e suportar múltiplos modelos e provedores através de um sistema de **Roteamento Dinâmico**.

### Componentes Principais:

*   **Serviço de LLM (v2)**: Localizado em `backend/src/services/llm-v2.ts`, este serviço gerencia o roteamento de requisições. Ele permite definir modelos específicos para diferentes tarefas (ex: copywriting, estratégia) e possui um sistema automático de fallback para modelos genéricos caso o modelo proprietário não esteja disponível.
*   **Pipeline de Dados**: Scripts localizados em `scripts/extract_finetuning_data.py` automatizam a extração de dados de alta conversão do banco de dados para criar datasets de treinamento.
*   **Gerenciador de Treinamento**: O utilitário `ai_models/training_scripts/train_finetuned_model.py` gerencia o ciclo de vida do fine-tuning, desde a validação do dataset até o monitoramento do job de treinamento na nuvem.

## 2. Estrutura de Diretórios

A estrutura de arquivos dedicada à IA foi organizada da seguinte forma:

```text
/home/ubuntu/MMN_AI-to-AI/ai_models/
├── configs/           # Configurações de modelos e hiperparâmetros
├── datasets/          # Datasets gerados para fine-tuning (JSONL)
├── models/            # Referências e metadados de modelos treinados
├── reports/           # Relatórios de performance e treinamento
└── training_scripts/  # Scripts de automação de treinamento
```

## 3. Pipeline de Fine-tuning

O processo de criação de um novo modelo proprietário segue estas etapas:

| Etapa | Ferramenta | Descrição |
| :--- | :--- | :--- |
| **Extração** | `extract_finetuning_data.py` | Coleta interações de sucesso do banco de dados. |
| **Validação** | `train_finetuned_model.py --action validate` | Verifica se o dataset segue o formato JSONL correto. |
| **Upload** | `train_finetuned_model.py --action upload` | Envia o dataset para o provedor de treinamento (ex: OpenAI). |
| **Treinamento** | `train_finetuned_model.py --action train` | Inicia o job de fine-tuning com os hiperparâmetros configurados. |
| **Ativação** | `llm-v2.ts` | Após o término, o modelo é ativado no roteador para uso em produção. |

## 4. Modelos Planejados

| Modelo | Especialidade | Base | Status |
| :--- | :--- | :--- | :--- |
| `mmn-copywriting-v1` | Geração de conteúdo persuasivo | gpt-4.1-mini | Em Preparação |
| `mmn-strategy-v1` | Análise de mercado e rede | gpt-4.1-mini | Em Preparação |
| `llama-2` | Operações gerais (Self-hosted) | Llama 2 70B | Planejado |

## 5. Próximos Passos

1.  **Popular Datasets Reais**: Executar o script de extração em um ambiente com dados históricos reais de vendas e reflexões de agentes.
2.  **Primeiro Job de Fine-tuning**: Iniciar o treinamento do `mmn-copywriting-v1`.
3.  **Benchmarking**: Criar uma suíte de testes para comparar a performance do novo modelo em relação ao modelo genérico atual.
4.  **Hospedagem Própria**: Explorar a implantação do `llama-2-mmn` em infraestrutura dedicada para reduzir custos de API.
