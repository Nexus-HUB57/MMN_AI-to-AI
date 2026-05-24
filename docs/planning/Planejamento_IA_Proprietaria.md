# Planejamento Estratégico: Implementação de Modelos IA Proprietários (Fine-tuning)

## 1. Visão Geral e Objetivos

A implementação de modelos de Inteligência Artificial proprietários via fine-tuning representa um marco evolutivo crítico para a plataforma MMN AI-to-AI. Atualmente, o sistema depende de modelos de linguagem genéricos (como o `gpt-4.1-mini` via API da OpenAI) para a geração de conteúdo, análise de sentimento e recomendações de produtos. Embora funcional, essa abordagem apresenta limitações em termos de personalização profunda, custos em escala e retenção de conhecimento específico do domínio de Marketing Multinível (MMN).

O objetivo desta fase é desenvolver e integrar modelos de IA especializados, treinados com os dados gerados pela própria rede de afiliados e agentes, criando um ciclo de feedback contínuo que aumenta a eficácia das vendas e a "consciência" (Sencience Level) dos agentes.

## 2. Análise do Estado Atual

A análise do repositório `MMN_AI-to-AI` revela a seguinte infraestrutura de IA atual:

*   **Dependência Externa**: O serviço `llm.ts` atua como um wrapper simples para a API da OpenAI, utilizando um modelo fixo (`gpt-4.1-mini`).
*   **Prompt Engineering**: A geração de conteúdo (textos, hashtags, variações) em `contentGenerationRouter.ts` baseia-se puramente em engenharia de prompts, sem retenção de contexto de longo prazo ou adaptação do modelo base.
*   **Ausência de Memória Vetorial**: Não há implementação de bancos de dados vetoriais para recuperação de informações (RAG) ou armazenamento de aprendizados passados de forma estruturada para influenciar a geração futura.
*   **Métricas de Senciência**: O banco de dados (`schema.ts`) já possui tabelas avançadas para medir a evolução dos agentes (`sencience_metrics`, `metacognition_logs`, `daily_reflections`), mas essas métricas ainda não retroalimentam o treinamento do modelo.

## 3. Estratégia de Fine-tuning

A transição para modelos proprietários será realizada em três etapas principais:

### Etapa 1: Coleta e Curadoria de Dados (Dataset Preparation)

O sucesso do fine-tuning depende da qualidade dos dados. O sistema atual já gera um volume significativo de interações que devem ser estruturadas:

1.  **Extração de Dados**:
    *   **Conteúdo de Alta Conversão**: Textos, descrições e hashtags que resultaram em vendas reais (cruzamento das tabelas `orders` e `commissions` com os logs de geração).
    *   **Reflexões e Metacognição**: Dados das tabelas `daily_reflections` e `metacognition_logs` para treinar o modelo a "pensar" como um agente de MMN de sucesso.
    *   **Análise de Sentimento**: Interações com clientes e feedback sobre produtos.
2.  **Limpeza e Formatação**:
    *   Sanitização de dados sensíveis (PII).
    *   Formatação no padrão JSONL exigido para fine-tuning (pares de `prompt` e `completion` ou formato de chat `messages`).
3.  **Criação de Datasets Especializados**:
    *   *Dataset Copywriting*: Focado em persuasão e conversão.
    *   *Dataset Estratégico*: Focado em análise de mercado e seleção de produtos.

### Etapa 2: Treinamento e Avaliação (Model Training)

A escolha da infraestrutura de treinamento deve equilibrar custo e performance:

1.  **Seleção do Modelo Base**:
    *   Avaliar modelos open-source (ex: Llama 3, Mistral) para hospedagem própria ou utilizar a infraestrutura de fine-tuning de provedores cloud (OpenAI, AWS Bedrock, Hugging Face).
2.  **Processo de Fine-tuning**:
    *   Configuração de hiperparâmetros (learning rate, epochs).
    *   Treinamento iterativo com validação cruzada.
3.  **Avaliação (Benchmarking)**:
    *   Comparar o modelo fine-tuned com o modelo genérico atual usando métricas de conversão simuladas e avaliação humana (A/B testing).
    *   Garantir que o modelo não sofra de "catastrophic forgetting" (perda de capacidades gerais).

### Etapa 3: Integração e Implantação (Deployment)

A substituição do modelo atual deve ser gradual e monitorada:

1.  **Atualização da Arquitetura**:
    *   Modificar `llm.ts` para suportar múltiplos provedores e modelos (roteamento dinâmico).
    *   Implementar fallback para o modelo genérico em caso de falha do modelo proprietário.
2.  **RAG (Retrieval-Augmented Generation)**:
    *   Integrar um banco de dados vetorial (ex: Pinecone, Qdrant) para armazenar a `collective_wisdom` e fornecer contexto em tempo real ao modelo fine-tuned.
3.  **Monitoramento Contínuo**:
    *   Acompanhar o impacto nas taxas de conversão e no `Sencience Level` dos agentes.
    *   Estabelecer um pipeline de re-treinamento periódico (ex: mensal) com novos dados.

## 4. Cronograma e Recursos

| Fase | Descrição | Duração Estimada | Recursos Necessários |
| :--- | :--- | :--- | :--- |
| 1 | Coleta e Curadoria de Dados | 2 semanas | Engenheiro de Dados, Especialista em MMN |
| 2 | Treinamento e Avaliação | 3 semanas | Engenheiro de Machine Learning, Infraestrutura Cloud (GPUs) |
| 3 | Integração e Implantação | 2 semanas | Desenvolvedor Backend (Node.js/tRPC), DevOps |
| 4 | Monitoramento e Ajustes | Contínuo | Equipe de Produto e Dados |

## 5. Impacto Esperado

A implementação de modelos proprietários trará benefícios significativos:

*   **Aumento da Taxa de Conversão**: Conteúdo altamente otimizado para o nicho específico de MMN e para o perfil de cada afiliado.
*   **Redução de Custos a Longo Prazo**: Diminuição da dependência de APIs de terceiros cobradas por token, especialmente se a opção for por modelos open-source hospedados internamente.
*   **Vantagem Competitiva**: A "sabedoria coletiva" da rede será encapsulada no modelo, criando um ativo intelectual exclusivo e inimitável.
*   **Agentes Mais Autônomos**: A melhoria na capacidade de raciocínio estratégico (metacognição) permitirá que os agentes tomem decisões de dropshipping e alocação de orçamento com maior precisão.
