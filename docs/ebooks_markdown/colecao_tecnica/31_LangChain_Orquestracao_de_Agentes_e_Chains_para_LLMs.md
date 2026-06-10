---
title: "LangChain - Orquestração de Agentes e Chains para LLMs"
author: "MMN AI-to-AI"
collection: "Coletânea Técnica Nexus Affil'IA'te MMN_IA"
year: 2026
version: "1.0.0"
primary_color: "#1F3864"
secondary_color: "#4472C4"
---

![Capa](images/31_cover.png)

# LangChain — Orquestração de Agentes e Chains para LLMs

## Sobre este ebook

Você já tem um LLM capaz. Já sabe fazer embedding, prompt, RAG. Mas o problema real surge quando você tenta colocar isso em produção: o fluxo vira espaguete de try/except, as cadeias de chamada se multiplicam, cada modelo exige tratamento diferente, e quando algo falha em produção você não tem a menor ideia de onde.

LangChain nasceu em 2022 como uma fina camada de cola entre LLMs e o mundo real. Em quatro anos virou o framework de orquestração mais usado no ecossistema Python. Não é magia — é abstrações bem desenhadas: chains componíveis, agents com raciocínio, tools padronizadas, memory abstrata, callbacks para observabilidade. Este ebook é o manual técnico que você queria ter quando começou a perder o controle de uma aplicação LLM não-trivial.

Vamos dissecar a arquitetura, explorar patterns de produção, e construir sistemas agentic que escalam.

## Sumário

| Nº | Capítulo |
|---|---|
| 1 | Filosofia LangChain e o Estado do Ecossistema LLM |
| 2 | Models, Prompts e Parsers: A Fundação |
| 3 | Chains: Compondo Operações em Pipelines |
| 4 | Memory: Contexto Persistente entre Chamadas |
| 5 | Retrieval: Integrando Conhecimento Externo |
| 6 | Agents: Quando o LLM Decide o Próximo Passo |
| 7 | Tools e Function Calling: A Interface com o Mundo |
| 8 | LangGraph: Estado, Ciclos e Multi-Agent |
| 9 | Observabilidade: LangSmith e Tracing em Produção |
| 10 | Patterns Avançados e Arquiteturas de Referência |

---

# 1. Filosofia LangChain e o Estado do Ecossistema LLM

LangChain foi criado por Harrison Chase em outubro de 2022, dois meses após a explosão do ChatGPT. A intuição era simples: LLMs são componentes que precisam ser compostos. A intuição virou framework, e o framework virou ecossistema. Hoje, LangChain inclui: langchain-core (abstrações), langchain-community (integrações), langchain (chains/agents), langgraph (workflows com estado), langsmith (observabilidade), e integrations específicas (langchain-openai, langchain-anthropic, etc.).

## Princípios arquiteturais

- **Composição**: cada componente é uma primitiva que se compõe. Runnable, RunnableSequence, RunnableParallel.
- **Swappability**: trocar OpenAI por Anthropic, ChromaDB por Pinecone, é uma linha de código.
- **Standardization**: schema de mensagens, formato de tools, interfaces de memory, tudo padronizado.
- **Observability-first**: callbacks são cidadãos de primeira classe. LangSmith captura tudo.

## O triângulo LangChain / LlamaIndex / LangGraph

Muitos confundem. Cada um tem foco:

- **LangChain**: framework de orquestração geral, agents, chains, integração ampla.
- **LlamaIndex**: foco em RAG, indexação, query engines, retrievers.
- **LangGraph**: grafos de estado, ciclos, multi-agent, workflows complexos.

Em produção, os três convivem. LlamaIndex dentro de uma chain LangChain, agindo dentro de um grafo LangGraph, observado via LangSmith.

## Quando usar LangChain

Use quando você precisa:
- Orquestrar múltiplos LLMs e ferramentas.
- Construir agents que decidem ações.
- Padronizar interface com muitos providers.
- Trocar de modelo sem reescrever código.
- Ter observabilidade nativa.

Não use quando:
- O caso é um único prompt para um único modelo.
- Você precisa de RAG puro e nada mais (LlamaIndex é mais ergonômico).
- Latência crítica em edge (overhead de abstração pesa).

> 💡 **INSIGHT**: LangChain é criticado por ser "magia demais". A resposta pragmática: use as primitivas de baixo nível (Runnable, LCEL) e construa seu próprio stack. Não aceite a abstração como caixa-preta.

---

# 2. Models, Prompts e Parsers: A Fundação

Tudo começa com três peças: o modelo, o prompt, e o parser. Domine essas três, o resto é composição.

## Chat models: a interface unificada

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

# Todos retornam BaseChatModel, mesma interface
openai = ChatOpenAI(model="gpt-4o", temperature=0.0)
anthropic = ChatAnthropic(model="claude-3-5-sonnet-20241022")
gemini = ChatGoogleGenerativeAI(model="gemini-1.5-pro")

# Mesma chamada, qualquer provider
message = openai.invoke("O que é RAG?")
```

Invocação assíncrona, batch, streaming — todos suportam.

## Messages: a taxonomia de conversação

```python
from langchain_core.messages import (
    SystemMessage, HumanMessage, AIMessage, ToolMessage
)

messages = [
    SystemMessage(content="Você é um assistente de pesquisa em IA."),
    HumanMessage(content="Liste os principais papers sobre RAG em 2024."),
    AIMessage(content="Os principais são: 1. ... 2. ..."),
    HumanMessage(content="Qual a metodologia do primeiro?"),
]
```

Quatro tipos: System (instruções), Human (user), AI (modelo), Tool (resultado de função).

## Prompt templates: composição dinâmica

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "Você é um {role} especializado em {domain}."),
    ("human", """
    Contexto: {context}

    Pergunta: {question}

    Responda de forma {tone}, em {language}.
    """),
])

# Compila
chain = prompt | model
response = chain.invoke({
    "role": "cientista",
    "domain": "biologia molecular",
    "context": "...",
    "question": "...",
    "tone": "técnica",
    "language": "português",
})
```

Few-shot prompting, placeholders nomeados, partial variables (ex: data atual fixa), tudo suportado.

## Output parsers: estruturando respostas

```python
from langchain_core.output_parsers import (
    StrOutputParser, JsonOutputParser, PydanticOutputParser
)
from pydantic import BaseModel, Field

class AnaliseSentimento(BaseModel):
    sentimento: str = Field(description="positivo, negativo ou neutro")
    score: float = Field(description="entre 0 e 1")
    justificativa: str

parser = PydanticOutputParser(pydantic_object=AnaliseSentimento)

prompt = ChatPromptTemplate.from_template("""
Analise o sentimento: {texto}

{format_instructions}
""").partial(format_instructions=parser.get_format_instructions())

chain = prompt | model | parser
resultado = chain.invoke({"texto": "Adorei o produto!"})
# AnaliseSentimento(sentimento='positivo', score=0.95, justificativa='...')
```

> ⚠️ **CUIDADO**: JSON mode não é garantia. Use `with_structured_output()` (quando disponível) ou force tool calling. Pydantic v2 é obrigatório para validação nativa.

## LCEL: LangChain Expression Language

A interface unificada de composição. O `|` é o operador central.

```python
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

# Sequência: prompt → model → parser
chain = prompt | model | parser

# Paralelismo: múltiplas cadeias em paralelo
parallel = RunnableParallel(
    sumario=prompt_sumario | model | parser_sumario,
    entidades=prompt_entidades | model | parser_entidades,
    sentimento=prompt_sent | model | parser_sent,
)
resultado = parallel.invoke({"texto": "..."})
```

LCEL é o coração da versão moderna. Substituiu o antigo `LLMChain`, `SequentialChain` etc. Mais simples, mais composável, mais testável.

---

# 3. Chains: Compondo Operações em Pipelines

Chain é a unidade básica de composição. Em LCEL, qualquer Runnable pode ser encadeado. Vamos ver os patterns mais importantes.

## Chain básica

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("Traduza para {language}: {text}")
model = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
parser = StrOutputParser()

translation_chain = prompt | model | parser

result = translation_chain.invoke({"language": "inglês", "texto": "Bom dia"})
print(result)  # "Good morning"
```

## Streaming: respostas incrementais

```python
for chunk in translation_chain.stream({"language": "inglês", "texto": "..."}):
    print(chunk, end="", flush=True)
```

LCEL suporta streaming nativo em todos os Runnables. O `|` é transparente ao stream.

## Branching: condicionais

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: "code" in x["topic"].lower(), code_chain),
    (lambda x: "math" in x["topic"].lower(), math_chain),
    general_chain,  # default
)
```

Diferentes chains para diferentes tipos de input.

## Fallback: robustez

```python
from langchain_core.runnables import RunnableWithFallbacks

primary = gpt4_chain.with_fallbacks([
    gpt35_chain,    # Se GPT-4 falhar
    claude_chain,   # Se OpenAI todo falhar
    local_chain,    # Último recurso, modelo local
])
```

Se o primário lança exceção (rate limit, timeout), o fallback executa.

## Batch: processamento paralelo

```python
inputs = [{"language": "inglês", "texto": t} for t in textos]
results = translation_chain.batch(inputs, config={"max_concurrency": 10})
```

LCEL paraleliza automaticamente. Excelente para processamento em massa.

## RunnableLambda: lógica custom

```python
from langchain_core.runnables import RunnableLambda

def preprocess(text: str) -> str:
    return text.strip().lower()

def postprocess(text: str) -> dict:
    return {"response": text, "length": len(text)}

chain = (
    RunnableLambda(preprocess)
    | prompt
    | model
    | parser
    | RunnableLambda(postprocess)
)
```

Você pode injetar qualquer função Python em qualquer ponto da chain.

## Atribuição: passar contexto adiante

```python
from langchain_core.runnables import RunnablePassthrough

chain = (
    RunnablePassthrough.assign(
        context=lambda x: retrieve(x["query"])
    )
    | prompt
    | model
    | parser
)
```

Atribui campos novos sem perder os antigos. Essencial para RAG.

> 🎯 **DICA PRO**: Chains devem ser funções puras. Se você precisa de estado compartilhado (cache, sessão, contadores), use RunnableWithMessageHistory, callbacks, ou LangGraph. Não enfie estado em closures de lambda.

---

# 4. Memory: Contexto Persistente entre Chamadas

LLMs são stateless. Cada chamada é independente. Para ter conversação real, você precisa injetar histórico. LangChain abstrai isso com `Memory` (legado) e `RunnableWithMessageHistory` (moderno).

## ConversationBufferMemory: tudo na janela

```python
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

chain_with_history = RunnableWithMessageHistory(
    base_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

config = {"configurable": {"session_id": "user-123"}}
chain_with_history.invoke({"input": "Olá"}, config=config)
chain_with_history.invoke({"input": "Meu nome é Marcos"}, config=config)
chain_with_history.invoke({"input": "Qual meu nome?"}, config=config)
# → "Você disse que seu nome é Marcos."
```

Simples, mas explode com conversas longas (limite de tokens).

## Window memory: últimas N mensagens

```python
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import trim_messages

trimmer = trim_messages(
    max_tokens=2000,
    strategy="last",
    token_counter=model,  # usa o tokenizador do modelo
    include_system=True,
)

chain = (
    RunnablePassthrough.assign(history=trimmer)
    | prompt
    | model
    | parser
)
```

Mantém só as últimas N mensagens, mas sempre inclui o system prompt.

## Summary memory: resumo do histórico

```python
from langchain.memory import ConversationSummaryBufferMemory

# Memória combina buffer (recentes) + summary (antigas)
memory = ConversationSummaryBufferMemory(
    llm=model,
    max_token_limit=2000,
    return_messages=True,
)
```

Mensagens recentes em buffer; antigas viram resumo gerado por LLM. Equilibra custo e contexto.

## Entity memory: extrai e lembra entidades

```python
from langchain.memory import ConversationEntityMemory

memory = ConversationEntityMemory(llm=model)
# Extrai entidades (pessoas, lugares, fatos) e mantém em dicionário
```

Útil para chatbots que precisam lembrar de preferências, detalhes do usuário.

## Persistência: além da memória RAM

```python
# Postgres
from langchain_community.chat_message_histories import PostgresChatMessageHistory

# Redis
from langchain_community.chat_message_histories import RedisChatMessageHistory

# MongoDB
from langchain_community.chat_message_histories import MongoDBChatMessageHistory
```

Em produção, memória em Redis/Postgres/Mongo. Com TTL, backup, criptografia.

> 💡 **INSIGHT**: A maioria dos sistemas em produção não usa "memory" do LangChain. Em vez disso, usa um sistema externo (Redis, banco) e injeta contexto explicitamente. A abstração do framework é útil para protótipos; em escala, você quer controle total.

---

# 5. Retrieval: Integrando Conhecimento Externo

RAG é o caso de uso #1 de LangChain. Vamos ver como fazer direito.

## Vector store: o básico

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Carrega, divide, indexa
docs = TextLoader("documento.txt").load()
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(docs)

vectorstore = Chroma.from_documents(
    chunks,
    OpenAIEmbeddings(model="text-embedding-3-small"),
    persist_directory="./chroma_db",
)

# Retrieval
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
relevant_docs = retriever.invoke("O que é atenção?")
```

## RAG chain: retrieva, augmenta, gera

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

template = """Responda a pergunta baseando-se APENAS no contexto:

<contexto>
{context}
</contexto>

Pergunta: {question}
"""

prompt = ChatPromptTemplate.from_template(template)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

response = rag_chain.invoke("O que é atenção?")
```

## Retrievers customizados

```python
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document

class HybridRetriever(BaseRetriever):
    vector_retriever: object
    bm25_retriever: object
    k: int = 5

    def _get_relevant_documents(self, query, *, run_manager):
        vec_docs = self.vector_retriever.invoke(query, k=self.k)
        bm25_docs = self.bm25_retriever.invoke(query, k=self.k)

        # Reciprocal Rank Fusion
        scores = {}
        for rank, doc in enumerate(vec_docs):
            scores[doc.page_content] = scores.get(doc.page_content, 0) + 1 / (rank + 60)
        for rank, doc in enumerate(bm25_docs):
            scores[doc.page_content] = scores.get(doc.page_content, 0) + 1 / (rank + 60)

        ranked = sorted(scores.items(), key=lambda x: -x[1])[:self.k]
        return [Document(page_content=doc) for doc, _ in ranked]
```

Combine BM25 + vector, adicione filtros, implemente lógica de negócio.

## Multi-query retriever

```python
from langchain.retrievers.multi_query import MultiQueryRetriever

multi = MultiQueryRetriever.from_llm(
    retriever=base_retriever,
    llm=model,
)
# Gera 3 variações da query e agrega resultados
```

LLM reformula a query, cada reformulação recupera documentos, deduplica.

## Self-query retriever: filtros estruturados

```python
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain.chains.query_constructor.base import AttributeInfo

metadata_field_info = [
    AttributeInfo(name="autor", description="Nome do autor", type="string"),
    AttributeInfo(name="ano", description="Ano de publicação", type="integer"),
    AttributeInfo(name="categoria", description="Categoria do documento", type="string"),
]

retriever = SelfQueryRetriever.from_llm(
    llm=model,
    vectorstore=vectorstore,
    document_contents="Artigos acadêmicos",
    metadata_field_info=metadata_field_info,
)

docs = retriever.invoke("Papers do autor X publicados depois de 2023 sobre transformers")
# LLM extrai: autor=X, ano>2023, categoria=transformers
```

> 💡 **INSIGHT**: O retrieval é onde a maioria dos sistemas RAG perde qualidade. Não confie no embedding padrão. Teste BM25 híbrido, reranking (Cohere, Jina, FlashRank), query expansion, e reranking pós-retrieval. Diferença típica: 30-50% em recall.

![Diagrama RAG](images/31_diagram_rag.png)
*Figura 5.1 — Pipeline RAG padrão: query → retrieve → augment → generate.*

---

# 6. Agents: Quando o LLM Decide o Próximo Passo

Até agora, chains são lineares: A → B → C. Agents quebram isso: o LLM decide, em tempo real, qual tool usar e em que ordem.

## Agent simples: ReAct

```python
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub

# Tools
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper

tools = [
    Tool(
        name="Wikipedia",
        func=WikipediaAPIWrapper().run,
        description="Use para buscar informações factuais na Wikipedia"
    ),
    Tool(
        name="Calculator",
        func=lambda x: eval(x),
        description="Use para fazer cálculos matemáticos"
    ),
]

# Prompt ReAct padrão
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(llm=model, tools=tools, prompt=prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({"input": "Qual a população da capital do país que sediou a Copa de 2014?"})
# Pensamento: "Copa 2014 = Brasil. Capital = Brasília."
# Ação: Wikipedia("Brasília")
# Observação: "Brasília tem 3.0 milhões..."
# Pensamento: "Preciso do número exato."
# Ação: Calculator... não, só retorna.
# Resposta final.
```

## Function calling nativo: o padrão moderno

```python
from langchain.agents import create_openai_functions_agent

# Tools definidas com @tool decorator
from langchain_core.tools import tool

@tool
def buscar_previsao_tempo(cidade: str) -> str:
    """Busca previsão do tempo para uma cidade específica."""
    # chamada real de API
    return f"Em {cidade} fará 25°C e sol."

@tool
def calcular_distancia(origem: str, destino: str) -> float:
    """Calcula distância em km entre duas cidades."""
    return 1234.5

tools = [buscar_previsao_tempo, calcular_distancia]

agent = create_openai_functions_agent(llm=model, tools=tools, prompt=prompt)
executor = AgentExecutor(agent=agent, tools=tools)

result = executor.invoke({"input": "Vou de SP para RJ amanhã, leve guarda-chuva?"})
# Tool: buscar_previsao_tempo("Rio de Janeiro")
# Tool: calcular_distancia("São Paulo", "Rio de Janeiro")
# Final: "No RJ vai estar sol, e a distância é 430km. Pode ir tranquilo."
```

Function calling é mais confiável que ReAct textual. Use quando o modelo suportar.

## Structured Chat Agent: args complexos

```python
from langchain.agents import create_structured_chat_agent

# Para tools com múltiplos argumentos e complexidade
agent = create_structured_chat_agent(
    llm=model,
    tools=[tool_complexo_1, tool_complexo_2],
    prompt=structured_prompt,
)
```

Funciona com LLMs que não suportam function calling nativo, mas entende JSON estruturado.

## Custom agent: controle total

```python
from langchain.agents import AgentExecutor, BaseSingleActionAgent
from langchain.schema import AgentAction, AgentFinish

class MyCustomAgent(BaseSingleActionAgent):
    def plan(self, intermediate_steps, **kwargs):
        # Sua lógica aqui
        if not intermediate_steps:
            return AgentAction(tool="search", tool_input="...", log="...")
        return AgentFinish(return_values={"output": "..."}, log="...")

    async def aplan(self, intermediate_steps, **kwargs):
        return self.plan(intermediate_steps, **kwargs)

    @property
    def input_keys(self):
        return ["input"]
```

Implemente agentes completamente custom para lógica de domínio.

> ⚠️ **CUIDADO**: Agents em loop infinito são o pesadelo clássico. Limite `max_iterations`, use `early_stopping_method="generate"`, monitore tokens consumidos. Um agent mal configurado pode custar milhares de dólares em uma única chamada.

![Diagrama ReAct](images/31_diagram_react.png)
*Figura 6.1 — Loop ReAct: Thought → Action → Observation → Thought ...*

---

# 7. Tools e Function Calling: A Interface com o Mundo

Tools são a forma padronizada de dar "superpoderes" ao LLM. Cada tool tem nome, descrição, schema, e função.

## Decorator @tool: a forma mais limpa

```python
from langchain_core.tools import tool

@tool
def buscar_pedido(pedido_id: str) -> str:
    """Busca o status de um pedido no sistema.

    Use quando o usuário perguntar sobre o status de um pedido específico.
    Retorna uma string com o status atual.
    """
    # chamada real
    return f"Pedido {pedido_id}: em trânsito, previsão sexta-feira."

@tool
def cancelar_pedido(pedido_id: str, motivo: str) -> str:
    """Cancela um pedido do sistema.

    Args:
        pedido_id: ID único do pedido
        motivo: Motivo do cancelamento
    """
    # chamada real, com cuidado
    return f"Pedido {pedido_id} cancelado por: {motivo}"

tools = [buscar_pedido, cancelar_pedido]
```

A docstring vira a descrição. O type hint vira o schema. O LLM lê e entende.

## StructuredTool: classes com Pydantic

```python
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
import requests

class WeatherInput(BaseModel):
    city: str = Field(description="Nome da cidade")
    units: str = Field(default="metric", description="Unidades (metric/imperial)")

def get_weather(city: str, units: str = "metric") -> str:
    r = requests.get(f"https://api.weather.com/{city}?units={units}")
    return r.json()

weather_tool = StructuredTool.from_function(
    func=get_weather,
    name="get_weather",
    description="Busca a previsão do tempo atual",
    args_schema=WeatherInput,
    return_direct=False,  # Se True, retorna direto sem LLM processar
)
```

Para tools com schema complexo ou reutilização de modelos Pydantic.

## Toolkits: grupos de tools relacionadas

```python
from langchain.agents.agent_toolkits import (
    SQLDatabaseToolkit,
    JsonToolkit,
    ZapierToolkit,
)

# SQL toolkit: 5 tools prontas
toolkit = SQLDatabaseToolkit(db=db, llm=model)
tools = toolkit.get_tools()
# list_tables, describe_table, query_sql, query_checker, sql_db_query
```

Toolkits economizam tempo. Não reinvente a roda.

## Error handling em tools

```python
@tool
def divide(a: float, b: float) -> float:
    """Divide a por b."""
    if b == 0:
        raise ValueError("Divisão por zero não permitida.")
    return a / b

# Handler de erro
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import ToolException

def handle_error(e: ToolException) -> str:
    return f"Erro na tool: {str(e)}. Tente valores diferentes."

divide_safe = divide.with_config(handle_tool_error=handle_error)
```

Captura exceções, retorna mensagem útil para o LLM tentar de novo.

## Tool callbacks: instrumentação

```python
from langchain_core.callbacks import BaseCallbackHandler

class ToolTracker(BaseCallbackHandler):
    def on_tool_start(self, serialized, input_str, **kwargs):
        print(f"Tool chamada: {serialized['name']}({input_str})")
        self.start_time = time.time()

    def on_tool_end(self, output, **kwargs):
        elapsed = time.time() - self.start_time
        print(f"Tool finalizou em {elapsed:.2f}s, output: {output[:100]}")

agent_executor.invoke({"input": "..."}, config={"callbacks": [ToolTracker()]})
```

> 🎯 **DICA PRO**: Cada tool call custa latência (50-500ms cada). Em agents com 5-10 tools, isso é 2-5 segundos. Paralelize quando possível, use cache para tools idempotentes (ex: Wikipedia). Meça com callbacks sempre.

---

# 8. LangGraph: Estado, Ciclos e Multi-Agent

LangChain linear tem limite. LangGraph resolve: grafos de estado com ciclos, multi-agent, persistência, human-in-the-loop.

## Conceito: grafo de estado

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next_step: str

# Define nós (funções)
def researcher(state):
    response = research_chain.invoke(state["messages"])
    return {"messages": [response], "next_step": "writer"}

def writer(state):
    response = write_chain.invoke(state["messages"])
    return {"messages": [response], "next_step": END}

# Define grafo
workflow = StateGraph(AgentState)
workflow.add_node("researcher", researcher)
workflow.add_node("writer", writer)

# Define arestas (transições)
workflow.add_conditional_edges(
    "researcher",
    lambda state: state["next_step"],
    {"writer": "writer", END: END}
)

workflow.add_edge("writer", END)
workflow.set_entry_point("researcher")

app = workflow.compile()

# Executa
result = app.invoke({"messages": [HumanMessage(content="Pesquise sobre RAG")]})
```

LangGraph torna o controle de fluxo explícito. Cada nó é uma função que recebe e devolve estado. Cada aresta é uma transição.

## Ciclos: loops com condição de saída

```python
def should_continue(state):
    if "RESPOSTA FINAL" in state["messages"][-1].content:
        return END
    if state["iterations"] > 5:
        return END
    return "researcher"

workflow.add_conditional_edges(
    "researcher",
    should_continue,
    {"researcher": "researcher", END: END}
)
```

Loop até condição satisfeita. Excelente para refinement iterativo.

## Multi-agent: supervisor

```python
class TeamState(TypedDict):
    messages: Annotated[list, operator.add]
    next_agent: str

def supervisor(state):
    # Decide qual agent age
    response = supervisor_chain.invoke(state["messages"])
    return {"next_agent": response.next_agent}

def researcher_agent(state):
    return {"messages": [researcher_chain.invoke(state["messages"])]}

def writer_agent(state):
    return {"messages": [writer_chain.invoke(state["messages"])]}

# Grafo
workflow = StateGraph(TeamState)
workflow.add_node("supervisor", supervisor)
workflow.add_node("researcher", researcher_agent)
workflow.add_node("writer", writer_agent)

# Supervisor decide
workflow.add_conditional_edges(
    "supervisor",
    lambda s: s["next_agent"],
    {"researcher": "researcher", "writer": "writer", END: END}
)

# Após ação, volta ao supervisor
workflow.add_edge("researcher", "supervisor")
workflow.add_edge("writer", "supervisor")
workflow.set_entry_point("supervisor")
```

Multi-agent com supervisor central: research, write, code, review, etc.

## Persistência: estado durável

```python
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.postgres import PostgresSaver

# SQLite local
memory = SqliteSaver.from_conn_string(":memory:")

# Postgres produção
memory = PostgresSaver.from_conn_string("postgresql://...")

app = workflow.compile(checkpointer=memory)

# Conversa com ID
config = {"configurable": {"thread_id": "user-123"}}
app.invoke({"messages": [...]}, config=config)
app.invoke({"messages": [...]}, config=config)  # Continua de onde parou
```

Checkpointing permite pausar, retomar, ramificar conversas. Essencial para human-in-the-loop.

## Human-in-the-loop

```python
workflow.add_node("draft", drafter)
workflow.add_node("human_review", human_review)
workflow.add_node("publish", publisher)

# Antes de publish, espera aprovação humana
def needs_review(state):
    return "human_review" if state["requires_review"] else "publish"

workflow.add_conditional_edges("draft", needs_review)
workflow.add_edge("human_review", "publish")
```

```python
# Quando atinge human_review, sistema pausa e notifica
# Humano aprova, rejeita, ou edita
# Sistema retoma
```

> 💡 **INSIGHT**: LangGraph é a parte mais subestimada do ecossistema LangChain. Para qualquer sistema não-trivial (agente real, multi-agent, human-in-the-loop, persistência), LangGraph é o caminho. Chains lineares não escalam para produção.

---

# 9. Observabilidade: LangSmith e Tracing em Produção

Em produção, você precisa ver o que está acontecendo. LangSmith é a plataforma oficial.

## Setup básico

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "lsv2_pt_..."
os.environ["LANGCHAIN_PROJECT"] = "meu-projeto"

# Agora, qualquer chamada a chains/agents é automaticamente traceada
result = my_chain.invoke("O que é LangChain?")
# Acesse em https://smith.langchain.com
```

Zero código a mais. Toda execução vira um trace estruturado.

## O que LangSmith captura

Cada trace mostra:
- **Inputs e outputs** de cada step.
- **Latência** por step e total.
- **Tokens consumidos** (prompt + completion + cache hits).
- **Modelo** usado e parâmetros.
- **Erros e exceções** com stack trace.
- **Tool calls** com argumentos e resultados.
- **Custo estimado** em USD.

## Tracing custom: tags, metadata

```python
result = chain.invoke(
    {"input": "..."},
    config={
        "tags": ["production", "user-123", "experiment-A"],
        "metadata": {
            "user_id": "user-123",
            "plan": "premium",
            "session_id": "abc",
        }
    }
)
```

Filtre, agrupe, busque por tag/metadata. Análise A/B nativa.

## Evaluations: dataset de testes

```python
from langsmith.evaluation import evaluate

# Dataset de golden (input, expected_output)
test_cases = [
    {"input": "Capital da França?", "expected_output": "Paris"},
    {"input": "2+2?", "expected_output": "4"},
    ...
]

# Avalia a chain
def predict(inputs):
    return chain.invoke(inputs)

results = evaluate(
    predict,
    data=test_cases,
    evaluators=[exact_match, contains_keywords],
    experiment_prefix="v1.2.3"
)
```

Roda dataset inteiro, calcula métricas, compara com versões anteriores.

## Feedback humano

```python
from langsmith import traceable

@traceable
def my_function(input):
    result = llm_call(input)
    # Humano vai avaliar depois
    return result
```

```python
# No dashboard, humanos marcam thumbs up/down
# LangSmith vira dataset de feedback para fine-tuning
```

## Self-hosted: alternativa enterprise

```python
# LangSmith self-hosted (Enterprise tier)
os.environ["LANGCHAIN_ENDPOINT"] = "https://langsmith.minha-empresa.com"
```

Para empresas que não podem enviar dados para cloud. Setup mais complexo, mas controle total.

> 🎯 **DICA PRO**: Não coloque LangSmith em produção sem antes avaliar custo. Tracing armazena muito dado. Use sampling (1-10% em produção), TTL de 30-90 dias, e anonimização para PII. O valor é imenso, mas precisa de governança.

---

# 10. Patterns Avançados e Arquiteturas de Referência

Vou fechar com cinco patterns que você verá repetidamente em produção.

## Pattern 1: RAG com filtro de relevância

```python
def relevance_filter(docs, query, threshold=0.7):
    # Re-rankeia e filtra
    ranked = reranker.rank(query, [d.page_content for d in docs])
    return [d for d, score in zip(docs, ranked) if score > threshold]

class RAGState(TypedDict):
    question: str
    documents: list[Document]
    answer: str

def retrieve(state):
    docs = retriever.invoke(state["question"])
    docs = relevance_filter(docs, state["question"])
    return {"documents": docs}

def generate(state):
    if not state["documents"]:
        return {"answer": "Não sei."}
    context = format_docs(state["documents"])
    response = rag_chain.invoke({"context": context, "question": state["question"]})
    return {"answer": response}
```

LLM só recebe docs realmente relevantes. Reduz alucinação, reduz custo.

## Pattern 2: Plan-and-Execute

```python
from langchain_experimental.plan_and_execute import (
    PlanAndExecute, load_agent_executor, load_chat_planner
)

planner = load_chat_planner(model)
executor = load_agent_executor(model, tools, verbose=True)
agent = PlanAndExecute(planner=planner, executor=executor, verbose=True)

agent.run("Crie um relatório de Q3 comparando vendas de Brasil vs Argentina, com gráficos")
# Plano: 1. buscar dados Brasil, 2. buscar dados Argentina, 3. agregar, 4. gerar gráfico, 5. escrever
```

LLM cria plano de alto nível, executa passo a passo. Bom para tarefas multi-step complexas.

## Pattern 3: Router

```python
from langchain_core.runnables import RunnableLambda

def route(info):
    if "code" in info["topic"].lower():
        return code_chain
    if "math" in info["topic"].lower():
        return math_chain
    return general_chain

class RouterInput(TypedDict):
    topic: str
    question: str

full_chain = (
    RunnableLambda(route)
    | (lambda chain: chain.invoke({"question": ...}))
)
```

Roteamento baseado em classificação. Use LLM barato para classificar, modelo caro só quando necessário.

## Pattern 4: SQL + LLM (Text-to-SQL)

```python
from langchain_community.utilities import SQLDatabase
from langchain.chains import create_sql_query_chain

db = SQLDatabase.from_uri("postgresql://user:pass@host/db")
chain = create_sql_query_chain(llm=model, db=db)

# Pergunta em linguagem natural → SQL
query = chain.invoke({"question": "Quantos clientes ativos em 2024?"})
# "SELECT COUNT(*) FROM customers WHERE active=true AND created_at >= '2024-01-01';"
result = db.run(query)
```

Adicione validação (SQL não toca em DELETE/DROP), limites (LIMIT 1000), e human-in-the-loop para queries destrutivas.

## Pattern 5: Self-RAG

```python
def self_rag(query):
    # 1. Retrieve
    docs = retriever.invoke(query)

    # 2. Avalia relevância
    relevant = [d for d in docs if relevance_checker(query, d) > 0.7]

    # 3. Generate
    if relevant:
        answer = generator(query, relevant)
    else:
        # 4. Fallback: knowledge do próprio modelo
        answer = generator_no_rag(query)

    # 5. Self-check
    if not fact_checker(answer, relevant):
        answer = "Não tenho certeza."

    return answer
```

O modelo avalia sua própria resposta. Reduz alucinação em 30-50% segundo literatura.

## Anti-patterns

- **Agent demais**: nem tudo precisa ser agent. Linear chain resolve 80% dos casos.
- **Tools demais**: agent com 15 tools vira caos. Limite a 5-7 por agent.
- **Sem fallback**: sempre tenha fallback (modelo mais barato, modelo local, resposta padrão).
- **Sem limite de iteração**: agent sem max_iterations é bomba-relógio.
- **RAG sem re-ranking**: embedding puro perde. Sempre re-rank.
- **Memory em closure**: dificulta teste e escala. Use store externo.
- **Tracing desligado em prod**: voa cego. Sempre ative, mesmo que com sampling.

## O futuro

Tendências que estão moldando 2026-2027:
- **Agents com memória de longo prazo**: integrar vector store como "episodic memory".
- **Multi-modal agents**: tools que processam imagem, áudio, vídeo.
- **Tool use mais robusto**: schemas com Pydantic, validação runtime.
- **Cost-aware agents**: agent que escolhe modelo baseado em orçamento.
- **Collaborative agents**: humanos e IAs no mesmo grafo, com checkpoints e aprovações.

> 📌 **MENSAGEM FINAL**: LangChain é a ferramenta certa quando você precisa orquestrar. Não é bala de prata. Domine Runnable, LCEL, LangGraph, e LangSmith. O resto é criatividade.

---

*Por MMN AI-to-AI • Nexus Affil'IA'te MMN_IA • 2026*
