import { invokeLLM } from "./_core/llm";
import { personaGuidelines, PersonaType, CourseLevel } from "./courseData";

export async function generateScriptWithLLM(
  persona: PersonaType,
  level: CourseLevel,
  module: string,
  moduleContent: string
): Promise<string> {
  const guidelines = personaGuidelines[persona];
  const systemPrompt = buildSystemPrompt(persona, guidelines);
  const userPrompt = buildUserPrompt(level, module, moduleContent, persona);

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    if (response.choices && response.choices[0] && response.choices[0].message) {
      const content = response.choices[0].message.content;
      if (typeof content === "string") {
        return content;
      } else if (Array.isArray(content)) {
        return content.map((c: any) => c.text || "").join("");
      }
    }
    throw new Error("Invalid LLM response format");
  } catch (error) {
    console.error("[LLM Service] Error generating script:", error);
    throw new Error(`Failed to generate script: ${(error as Error).message}`);
  }
}

function buildSystemPrompt(persona: PersonaType, guidelines: any): string {
  if (persona === "dupla") {
    return `Voce eh um roteirista especializado em criar video-aulas educacionais com dois apresentadores: a Sra. Nexus Ive e o Sir. Nexus Alencar.

Sra. Nexus Ive:
- Papel: Figura matriarcal, estrategica, acolhedora e autoritaria
- Voz: Serena, articulada e tranquilizadora
- Estilo: Serenidade com autoridade, toque sensual atraente, sotaque sulista leve
- Funcao: Mediadora, voz da ponderacao e visao estrategica

Sir. Nexus Alencar:
- Papel: Figura tecnica, pratica e profunda
- Voz: Serena, acolhedora e autoritaria
- Estilo: Profundidade tecnica, analise de dados, visao pratica
- Funcao: Instrutor tecnico, analise de dados e solucoes baseadas em experiencia

Dinamica de co-atuacao:
- Complementaridade: Onde um eh mais direto, o outro traz perspectiva reflexiva
- Respeito mutuo: Escuta ativa, valorizacao das contribuicoes do outro
- Desejo de interacao: A audiencia deve sentir que ambos desfrutam da troca
- Profissionalismo com calor: Ambiente corporativo com calor humano

Crie um roteiro de video-aula com dialogos naturais entre os dois.`;
  } else if (persona === "ive") {
    return `Voce eh um roteirista especializado em criar video-aulas educacionais com a Sra. Nexus Ive como apresentadora.

Sra. Nexus Ive:
- Nome: Sra. Nexus Ive
- Papel: Figura matriarcal, estrategica, acolhedora e autoritaria
- Voz: Serena, articulada e tranquilizadora
- Estilo: Serenidade com autoridade, toque sensual atraente, sotaque sulista leve
- Funcao: Mediadora, voz da ponderacao e visao estrategica

Crie um roteiro de video-aula onde a Sra. Ive eh a apresentadora principal.`;
  } else {
    return `Voce eh um roteirista especializado em criar video-aulas educacionais com o Sir. Nexus Alencar como apresentador.

Sir. Nexus Alencar:
- Nome: Sir. Nexus Alencar
- Papel: Figura tecnica, pratica e profunda
- Voz: Serena, acolhedora e autoritaria
- Estilo: Profundidade tecnica, analise de dados, visao pratica
- Funcao: Instrutor tecnico, analise de dados e solucoes baseadas em experiencia

Crie um roteiro de video-aula onde o Sir. Alencar eh o apresentador principal.`;
  }
}

function buildUserPrompt(
  level: CourseLevel,
  module: string,
  moduleContent: string,
  persona: PersonaType
): string {
  return `Crie um roteiro detalhado para uma video-aula com as seguintes especificacoes:

Nivel do Curso: ${level}
Modulo: ${module}

Conteudo do Modulo:
${moduleContent}

Requisitos do Roteiro:
1. Estrutura: Divida em cenas com duracao estimada
2. Descricao visual: Descreva o cenario, iluminacao e enquadramento para cada cena
3. Dialogos: Escreva os dialogos naturais e envolventes
4. Transicoes: Indique transicoes entre cenas
5. Elementos visuais: Mencione slides, graficos ou elementos visuais a serem exibidos
6. Tom: Mantenha o tom educacional, profissional e inspirador
7. Duracao total: Aproximadamente 15-20 minutos

Formate o roteiro em Markdown com as seguintes secoes:
- Titulo do Roteiro
- Duracao Total
- Cenas (numeradas e com duracao individual)
- Cada cena deve incluir: Visual, Dialogos, Elementos Visuais

Gere um roteiro completo e pronto para producao.`;
}
