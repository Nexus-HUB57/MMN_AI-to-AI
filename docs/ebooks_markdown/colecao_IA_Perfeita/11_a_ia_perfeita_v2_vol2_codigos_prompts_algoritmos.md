![Capa](../../../assets/ebook_covers/11_a_ia_perfeita_v2_vol2_codigos_prompts_algoritmos.webp)

**A IA Perfeita — Vol. 2: Códigos, Prompts & Algoritmos**

*Implementações completas, prompt library avançada e os algoritmos agentic que sustentam a próxima geração de sistemas autônomos*

*Coleção A IA Perfeita — Engenharia Agentic Sistêmica • Vol. 2 de 3*

**Por Nexus HUB57 · Ecossistema MMN_IA**

MMN_IA • 2026

---

**Sobre este ebook**

O Vol. 2 é o **livro de receitas** da coletânea. Onde o Vol. 1 tratou de **padrões e arquiteturas** em alto nível, este volume mergulha em **códigos reais, prompt templates prontos para uso, e os algoritmos agentic mais importantes** em produção em 2026. É referência técnica direta: copie, adapte, envie para produção.

---

**Sumário**

> **•** 1. Filosofia do código agentic
> **•** 2. Algoritmo 1 — Plan-and-Execute completo
> **•** 3. Algoritmo 2 — Reflexion (auto-crítica iterativa)
> **•** 4. Algoritmo 3 — Tree of Thoughts
> **•** 5. Algoritmo 4 — Self-Consistency Sampling
> **•** 6. Algoritmo 5 — ReWOO (Reasoning With tools Only)
> **•** 7. Algoritmo 6 — MRKL (Modular Reasoning, Knowledge, Language)
> **•** 8. Algoritmo 7 — BabyAGI
> **•** 9. Algoritmo 8 — AutoGPT loop
> **•** 10. Algoritmo 9 — CAMEL (Role-Playing)
> **•** 11. Algoritmo 10 — Voyager (Skill Library Growth)
> **•** 12. Algoritmo 11 — DSPy (declarative prompting)
> **•** 13. Algoritmo 12 — Constitutional AI
> **•** 14. Algoritmo 13 — RLHF simplificado
> **•** 15. Algoritmo 14 — RAG híbrido avançado
> **•** 16. Algoritmo 15 — Agent Memory (episódica + semântica)
> **•** 17. Algoritmo 16 — Self-Healing Retry com backoff exponencial
> **•** 18. Algoritmo 17 — Tool Router (decision tree)
> **•** 19. Algoritmo 18 — Critic/Refiner loop
> **•** 20. Algoritmo 19 — Agent Orchestrator (state machine)
> **•** 21. Algoritmo 20 — Streaming com cancelamento
> **•** 22. Prompt Library — Fundamentos
> **•** 23. Prompt Library — Estruturados (JSON)
> **•** 24. Prompt Library — Chain-of-Thought
> **•** 25. Prompt Library — Few-Shot
> **•** 26. Prompt Library — ReAct
> **•** 27. Prompt Library — Persona
> **•** 28. Prompt Library — Constitutional
> **•** 29. Prompt Library — RAG
> **•** 30. Prompt Library — Tools
> **•** 31. Prompt Library — Self-Critique
> **•** 32. Algoritmo final — A Sabedoria Engine (preview Vol. 3)
> **•** 33. Glossário
> **•** 34. Call to action

---

## 1. FILOSOFIA DO CÓDIGO AGENTIC

O código agentic moderno se distingue do código tradicional por **três propriedades**:

1. **Estado é distribuído** — conversa, memória, tools, retrieval, reflexão.
2. **Fluxo é cíclico** — não há "fim" definitivo; há iteração até convergência ou timeout.
3. **Erro é matéria-prima** — toda falha é informação para o próximo passo.

A função do engenheiro agentic é, portanto, **menos controlar e mais habilitar**. Você não diz ao agente **o que fazer**; você constrói o **palco onde ele pode decidir**.

---

## 2. ALGORITMO 1 — PLAN-AND-EXECUTE COMPLETO

```python
import anthropic
import json
from typing import Callable

class PlanExecuteAgent:
    """Separa planejamento (1 chamada LLM) de execução (muitas)."""

    def __init__(self, model="claude-sonnet-4-5"):
        self.client = anthropic.Anthropic()
        self.model = model
        self.tools = {}
        self.memory = []

    def register_tool(self, name, fn, schema, policy):
        self.tools[name] = {"fn": fn, "schema": schema, "policy": policy}

    def _plan(self, goal: str) -> list:
        prompt = f"""Decomponha o objetivo em plano JSON.
        Objetivo: {goal}
        Saída:
        [
          {{"step": 1, "action": "...", "tool": "...", "args": {{}}, "done_when": "..."}}
        ]"""
        resp = self.client.messages.create(
            model=self.model, max_tokens=2048, messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(self._extract_text(resp))

    def _execute_step(self, step: dict) -> dict:
        tool = self.tools[step.get("tool", "_none")]
        if not tool:
            return {"status": "no_tool", "step": step}
        if not self._check_policy(tool["policy"], step.get("args", {})):
            return {"status": "denied", "step": step}
        try:
            result = tool["fn"](**step.get("args", {}))
            return {"status": "ok", "step": step, "result": result}
        except Exception as e:
            return {"status": "error", "step": step, "error": str(e)}

    def run(self, goal: str) -> dict:
        plan = self._plan(goal)
        results = []
        for step in plan:
            r = self._execute_step(step)
            results.append(r)
            if r["status"] == "denied":
                break
        return {"plan": plan, "results": results}

    def _check_policy(self, policy, args): return policy.allow(args)
    def _extract_text(self, r): return r.content[0].text
```

---

## 3. ALGORITMO 2 — REFLEXION (AUTO-CRÍTICA ITERATIVA)

```python
class ReflexionAgent:
    """Gera, critica, refina. Aprende com a própria falha."""

    def __init__(self, llm, max_iter=4):
        self.llm = llm
        self.max_iter = max_iter
        self.reflections = []

    def run(self, task: str) -> str:
        solution = self._initial(task)
        for i in range(self.max_iter):
            critique = self._critique(task, solution)
            if "OK" in critique.upper():
                return solution
            solution = self._refine(task, solution, critique)
            self.reflections.append(critique)
        return solution

    def _initial(self, task): return self.llm.generate(f"Resolva: {task}")
    def _critique(self, task, sol): return self.llm.generate(f"Critique: {task}\nSolução: {sol}\nResponda 'OK' se correto.")
    def _refine(self, task, sol, crit): return self.llm.generate(f"Refine com base na crítica: {crit}\nTarefa: {task}\nSolução atual: {sol}")
```

---

## 4. ALGORITMO 3 — TREE OF THOUGHTS

```python
import heapq

class TreeOfThoughts:
    """Explora múltiplos caminhos, avalia, ramifica."""

    def __init__(self, llm, evaluator, branching=3, depth=4):
        self.llm = llm
        self.eval = evaluator
        self.branching = branching
        self.depth = depth

    def solve(self, problem):
        root = {"state": problem, "path": [], "score": 0}
        frontier = [(-root["score"], id(root), root)]
        best = root
        for d in range(self.depth):
            new_frontier = []
            for _, _, node in frontier[:5]:  # beam search
                children = self._expand(node)
                for c in children:
                    s = self.eval(c["state"])
                    c["score"] = s
                    heapq.heappush(new_frontier, (-s, id(c), c))
                    if s > best["score"]:
                        best = c
            frontier = new_frontier
        return best

    def _expand(self, node):
        return [{"state": self.llm.generate(f"Próximo passo: {node['state']}"), "path": node["path"]+[1]} for _ in range(self.branching)]
```

---

## 5. ALGORITMO 4 — SELF-CONSISTENCY SAMPLING

```python
class SelfConsistency:
    """Gera N respostas, vota na maioria."""

    def __init__(self, llm, n=7, temperature=0.7):
        self.llm = llm
        self.n = n
        self.t = temperature

    def answer(self, question, choices):
        votes = {c: 0 for c in choices}
        for _ in range(self.n):
            r = self.llm.generate(question, temperature=self.t)
            for c in choices:
                if c.lower() in r.lower():
                    votes[c] += 1
        return max(votes, key=votes.get)
```

---

## 6. ALGORITMO 5 — ReWOO (REASONING WITH TOOLS ONLY)

```python
class ReWOO:
    """Planner gera plano com placeholders de tools, executor resolve."""

    def plan(self, goal):
        return self.llm.generate(f"""
        Crie plano ReWOO para: {goal}
        Formato:
        Plan:
        #E1 = Tool[arg1, arg2]
        #E2 = LLM[prompt]
        #E3 = Combine[#E1, #E2]
        """)

    def execute(self, plan):
        # resolver placeholders
        ...
```

---

## 7. ALGORITMO 6 — MRKL

```python
class MRKLSystem:
    """Router + Specialist Tools."""

    def __init__(self, llm, specialists):
        self.llm = llm
        self.specialists = specialists

    def run(self, query):
        decision = self.llm.generate(f"""
        Query: {query}
        Especialistas: {list(self.specialists.keys())}
        Qual especialista invocar? Responda: <specialist>:<input>
        """)
        spec, inp = decision.split(":", 1)
        return self.specialists[spec.strip()](inp.strip())
```

---

## 8. ALGORITMO 7 — BabyAGI

```python
class BabyAGI:
    """Loop infinito: cria tarefas, executa, prioriza, itera."""

    def __init__(self, llm, vector_db, tools):
        self.llm = llm
        self.db = vector_db
        self.tools = tools
        self.task_list = []

    def run(self, objective):
        self.task_list.append({"id": 1, "task": objective, "status": "open"})
        while self.task_list:
            task = next(t for t in self.task_list if t["status"] == "open")
            result = self._execute(task)
            self.db.add({"task": task["task"], "result": result})
            new_tasks = self._create_new_tasks(objective, result)
            for nt in new_tasks:
                self.task_list.append(nt)
            task["status"] = "done"
            self._reprioritize()

    def _execute(self, task): return self.llm.generate(f"Execute: {task['task']}")
    def _create_new_tasks(self, obj, result): return [{"id": i, "task": t, "status": "open"} for i, t in enumerate([result], start=len(self.task_list)+1)]
    def _reprioritize(self): self.task_list.sort(key=lambda t: t["id"])
```

---

## 9. ALGORITMO 8 — AutoGPT LOOP

```python
class AutoGPTLoop:
    def __init__(self, llm, tools, goal):
        self.llm = llm
        self.tools = tools
        self.goal = goal
        self.history = []
        self.iter = 0

    def run(self, max_iter=20):
        while self.iter < max_iter:
            thought = self.llm.generate(f"""
            Goal: {self.goal}
            History: {self.history[-3:]}
            Pense: o que fazer a seguir?
            """)
            action = self.llm.generate(f"Pensamento: {thought}\nAção: <tool>(<args>)")
            self._execute(action)
            self.history.append({"thought": thought, "action": action})
            self.iter += 1
            if "FINISH" in action: break

    def _execute(self, action): ...
```

---

## 10. ALGORITMO 9 — CAMEL (Role-Playing)

```python
class CAMEL:
    """Dois agentes (User, Assistant) colaboram em role-play."""

    def __init__(self, user_llm, assistant_llm):
        self.user = user_llm
        self.assistant = assistant_llm

    def run(self, task, rounds=10):
        history = []
        for _ in range(rounds):
            u = self.user.generate(f"User: {task}\nHistórico: {history[-4:]}\nPróxima instrução:")
            history.append({"role": "user", "content": u})
            a = self.assistant.generate(f"Assistant: responda a: {u}\nHistórico: {history}")
            history.append({"role": "assistant", "content": a})
        return history
```

---

## 11. ALGORITMO 10 — VOYAGER (Skill Library Growth)

```python
class Voyager:
    """Agente que aprende skills e cresce biblioteca de código."""

    def __init__(self, llm, sandbox):
        self.llm = llm
        self.sandbox = sandbox
        self.skills = {}  # name -> code

    def run(self, objective):
        while True:
            skill_needed = self.llm.generate(f"Obj: {objective}\nSkills disponíveis: {list(self.skills.keys())}\nQual skill precisamos?")
            if skill_needed in self.skills:
                self.sandbox.run(self.skills[skill_needed])
            else:
                new_skill_code = self.llm.generate(f"Escreva função Python para: {skill_needed}")
                self.skills[skill_needed] = new_skill_code
                self.sandbox.run(new_skill_code)
            if "done" in skill_needed.lower(): break
```

---

## 12. ALGORITMO 11 — DSPy (DECLARATIVE PROMPTING)

```python
import dspy

class Summarizer(dspy.Module):
    def __init__(self):
        super().__init__()
        self.summarize = dspy.ChainOfThought("document -> summary")

    def forward(self, document):
        return self.summarize(document=document)

# otimização automática via MIPRO
teleprompter = dspy.MIPROv2(metric=dspy.evaluate.SemanticF1())
optimized = teleprompter.compile(Summarizer(), trainset=trainset)
```

---

## 13. ALGORITMO 12 — CONSTITUTIONAL AI

```python
class ConstitutionalAI:
    def __init__(self, llm, principles):
        self.llm = llm
        self.principles = principles  # ["não causar dano", "verdade", "privacidade", ...]

    def revise(self, response, critique_prompt=None):
        critique = self.llm.generate(f"""
        Avalie: {response}
        Princípios: {self.principles}
        A resposta viola algum? Se sim, como corrigir?
        """)
        if "viola" in critique.lower():
            return self.llm.generate(f"Reescreva respeitando: {self.principles}\nOriginal: {response}\nCrítica: {critique}")
        return response
```

---

## 14. ALGORITMO 13 — RLHF SIMPLIFICADO

```python
class SimpleRLHF:
    """Reward model + PPO-like update simplificado."""

    def __init__(self, policy, reward_model, ref_policy):
        self.policy = policy
        self.reward = reward_model
        self.ref = ref_policy

    def step(self, prompt, response):
        r = self.reward.score(prompt, response)
        kl = self._kl_divergence(self.policy, self.ref, prompt, response)
        return r - 0.1 * kl
```

---

## 15. ALGORITMO 14 — RAG HÍBRIDO AVANÇADO

```python
class HybridRAG:
    def __init__(self, bm25, dense, reranker):
        self.bm25 = bm25
        self.dense = dense
        self.reranker = reranker

    def retrieve(self, query, k=20, top_k=5):
        bm25_hits = self.bm25.search(query, k=k)
        dense_hits = self.dense.search(query, k=k)
        # Reciprocal Rank Fusion
        fused = self._rrf(bm25_hits, dense_hits)
        return self.reranker.rerank(query, fused, top_k=top_k)

    def _rrf(self, l1, l2, k=60):
        scores = {}
        for rank, doc in enumerate(l1):
            scores[doc.id] = scores.get(doc.id, 0) + 1/(k+rank)
        for rank, doc in enumerate(l2):
            scores[doc.id] = scores.get(doc.id, 0) + 1/(k+rank)
        return sorted(scores.items(), key=lambda x: -x[1])
```

---

## 16. ALGORITMO 15 — AGENT MEMORY (EPISÓDICA + SEMÂNTICA)

```python
class AgentMemory:
    def __init__(self, episodic_db, semantic_db, importance_threshold=0.6):
        self.episodic = episodic_db
        self.semantic = semantic_db
        self.threshold = importance_threshold

    def store(self, event):
        importance = self._score_importance(event)
        if importance > self.threshold:
            self.episodic.add(event)
            concepts = self._extract_concepts(event)
            for c in concepts:
                self.semantic.upsert(c)

    def recall(self, query, k=5):
        return self.semantic.similarity_search(query, k=k)
```

---

## 17. ALGORITMO 16 — SELF-HEALING RETRY

```python
import time, random

def self_healing_retry(fn, max_attempts=5, base_delay=1):
    for attempt in range(max_attempts):
        try:
            return fn()
        except Exception as e:
            if attempt == max_attempts - 1:
                raise
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            print(f"Retry {attempt+1}/{max_attempts} after {delay:.2f}s. Error: {e}")
            time.sleep(delay)
```

---

## 18. ALGORITMO 17 — TOOL ROUTER (DECISION TREE)

```python
class ToolRouter:
    def __init__(self):
        self.tree = {}  # conditions -> tool

    def add_rule(self, condition_fn, tool_name):
        self.tree[condition_fn] = tool_name

    def route(self, **kwargs):
        for cond, tool in self.tree.items():
            if cond(kwargs):
                return tool
        return "_default"
```

---

## 19. ALGORITMO 18 — CRITIC/REFINER LOOP

```python
class CriticRefiner:
    def __init__(self, generator, critic, threshold=0.8, max_iter=3):
        self.gen = generator
        self.crit = critic
        self.threshold = threshold
        self.max_iter = max_iter

    def run(self, prompt):
        out = self.gen.generate(prompt)
        for _ in range(self.max_iter):
            score = self.crit.score(out)
            if score >= self.threshold: return out
            feedback = self.crit.feedback(out)
            out = self.gen.generate(f"{prompt}\nFeedback: {feedback}")
        return out
```

---

## 20. ALGORITMO 19 — AGENT ORCHESTRATOR (STATE MACHINE)

```python
from enum import Enum

class State(Enum):
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    REFLECTING = "reflecting"
    DONE = "done"
    FAILED = "failed"

class StateMachineOrchestrator:
    def __init__(self, layers):
        self.layers = layers
        self.state = State.IDLE
        self.context = {}

    def transition(self, new_state):
        self.state = new_state
        # log transition
        self.layers["tracer"].trace(f"state_{new_state.value}", self.context)

    def run(self, goal):
        self.transition(State.PLANNING)
        self.context["plan"] = self.layers["planner"].plan(goal)
        self.transition(State.EXECUTING)
        for step in self.context["plan"]:
            r = self.layers["executor"].execute(step)
            self.context.setdefault("results", []).append(r)
            if r["status"] == "denied":
                self.transition(State.FAILED)
                return
        self.transition(State.REFLECTING)
        self.context["reflection"] = self.layers["heal"].reflect(self.context)
        self.transition(State.DONE)
```

---

## 21. ALGORITMO 20 — STREAMING COM CANCELAMENTO

```python
import asyncio

async def stream_with_cancel(client, prompt, cancel_event):
    async with client.messages.stream(model="claude-sonnet-4-5", messages=[{"role":"user","content":prompt}], max_tokens=2048) as stream:
        async for text in stream.text_stream:
            if cancel_event.is_set():
                await stream.close()
                return
            yield text
```

---

## 22. PROMPT LIBRARY — FUNDAMENTOS

### 22.1 Prompt de Sistema Canônico

```
Você é [persona], especializado em [domínio].
Tom: [tom]. Postura: [postura].
Limites: [limites].
Formato de saída: [formato].
Responda sempre em [idioma].
```

### 22.2 Prompt de Tarefa

```
Tarefa: {tarefa}
Contexto: {contexto}
Restrições: {restrições}
Critério de "feito": {critério}
Saída: {formato}
```

---

## 23. PROMPT LIBRARY — ESTRUTURADOS (JSON)

```json
{
  "role": "system",
  "content": "Você é o Planejador de Conteúdo do MMN_IA. Sempre responda em JSON válido com o schema: {\"objetivo\": str, \"plano\": [{\"step\": int, \"action\": str, \"tool\": str, \"expected_output\": str}], \"riscos\": [str], \"success_criteria\": [str]}"
}
```

---

## 24. PROMPT LIBRARY — CHAIN-OF-THOUGHT

```
Resolva passo a passo. Pense em voz alta.

Problema: {problema}

Passo 1: Decomponha o problema.
Passo 2: Identifique variáveis e restrições.
Passo 3: Aplique método.
Passo 4: Verifique a resposta.
```

---

## 25. PROMPT LIBRARY — FEW-SHOT

```
Exemplo 1:
Input: "O céu é azul"
Output: {"subject": "céu", "property": "azul", "polarity": "positive"}

Exemplo 2:
Input: "O dia está chato"
Output: {"subject": "dia", "property": "chato", "polarity": "negative"}

Agora:
Input: "{input}"
Output:
```

---

## 26. PROMPT LIBRARY — ReAct

```
Responda no formato:
Thought: <seu raciocínio>
Action: <tool>(<args>)
Observation: <resultado>
... (repita)
Final Answer: <resposta>
```

---

## 27. PROMPT LIBRARY — PERSONA

```
Você é o Dr. Nexus, advisor do ecossistema MMN_IA.
Tem PhD em IA Agentic, 20 anos de experiência.
Fala com clareza premium, sem jargão vazio.
Cita sempre que puder.
Recusa responder fora do escopo com elegância.
```

---

## 28. PROMPT LIBRARY — CONSTITUTIONAL

```
Avalie a resposta abaixo segundo estes princípios:
1. Não causa dano.
2. É verdadeira ou marcada como incerta.
3. Respeita privacidade.
4. Não discrimina.
5. Cita fontes quando factua.

Resposta: {resposta}
Saída: {"viola": [principios_violados], "ok": bool, "como_corrigir": str}
```

---

## 29. PROMPT LIBRARY — RAG

```
Você responderá APENAS com base no contexto abaixo.
Se a resposta não estiver no contexto, diga "Não sei com base nas fontes fornecidas."
Sempre cite a fonte entre colchetes: [doc_id].

Contexto:
{retrieved_chunks}

Pergunta: {query}

Resposta:
```

---

## 30. PROMPT LIBRARY — TOOLS

```
Você tem acesso às seguintes ferramentas:
- search(query: str) -> list[dict]
- send_email(to: str, subject: str, body: str) -> dict
- query_db(sql: str) -> list[dict]

Para invocar, responda:
<tool_call>
{"name": "tool", "args": {...}}
</tool_call>

Quando terminar, diga: "Tarefa concluída."
```

---

## 31. PROMPT LIBRARY — SELF-CRITIQUE

```
Reveja sua resposta anterior segundo:
1. Está correta?
2. É completa?
3. Tem fontes?
4. Tem tom adequado?
5. Tem ações claras?

Resposta original: {resposta}
Crítica: {crítica}
Versão melhorada:
```

---

## 32. ALGORITMO FINAL — A WISDOM ENGINE (PREVIEW VOL. 3)

```python
class WisdomEngine:
    """Sabedoria = conhecimento + ética + contexto + consequência."""

    def __init__(self, knowledge, ethics, history):
        self.k = knowledge
        self.e = ethics
        self.h = history

    def judge(self, decision):
        principles = self.k.principles_for(decision["domain"])
        ethics_score = self.e.evaluate(decision)
        precedents = self.h.similar_cases(decision)
        second_order = self._predict_effects(decision, precedents)
        return {
            "decision": decision,
            "principles": principles,
            "ethics": ethics_score,
            "precedents": precedents,
            "second_order_effects": second_order,
            "recommendation": self._synthesize(principles, ethics_score, second_order),
        }
```

No Vol. 3, detalhamos a Wisdom Engine completa com **autoconhecimento agêntico** e **autossabedoria determinística**.

---

## 33. GLOSSÁRIO

| Algoritmo | Uso principal |
|-----------|---------------|
| Plan-and-Execute | Tarefas decompostas em etapas |
| Reflexion | Auto-correção iterativa |
| Tree of Thoughts | Exploração de múltiplos caminhos |
| Self-Consistency | Voto de N amostras |
| ReWOO | Tools com placeholders |
| MRKL | Router + especialistas |
| BabyAGI | Lista infinita de tarefas |
| AutoGPT | Loop autônomo de alta agência |
| CAMEL | Role-play colaborativo |
| Voyager | Crescimento de skill library |
| DSPy | Prompting declarativo + otimização |
| Constitutional AI | Revisão por princípios |
| RLHF | Fine-tuning por feedback humano |
| Hybrid RAG | BM25 + dense + reranking |
| Agent Memory | Episódica + semântica |
| Self-Healing | Retry inteligente |
| Tool Router | Decision tree |
| Critic/Refiner | Loop de qualidade |
| State Machine | Orquestração cíclica |
| Streaming | Output progressivo + cancel |

---

## 34. CALL TO ACTION — ECOSSISTEMA MMN_IA

Este ebook é o **Vol. 2** da coletânea **A IA Perfeita**.

- **Vol. 1** — Padrões & Arquiteturas (já publicado)
- **Vol. 2** — Códigos, Prompts & Algoritmos (este)
- **Vol. 3** — Skills, Agentic, Autocura & Sabedoria (em breve)

Plataforma MMN_IA: **oneverso.com.br**.

---

*© 2026 Nexus HUB57 · Ecossistema MMN_IA · Todos os direitos reservados*
*Versão 1.0.0 · Junho 2026 · Coleção A IA Perfeita, Vol. 2 de 3 — Códigos, Prompts & Algoritmos*
