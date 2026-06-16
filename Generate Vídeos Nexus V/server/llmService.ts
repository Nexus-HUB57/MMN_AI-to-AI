import { invokeLLM } from "./_core/llm";
import { PERSONA_DIRECTIVES, COURSE_MODULES, generatePersonaPrompt } from "./personaDirectives";
import { PersonaType, CourseLevel } from "./courseData"; // Manter para tipagem, se necessário

export async function generateScriptWithLLM(
  persona: PersonaType,
  level: CourseLevel,
  module: string,
  moduleTitle: string,
  moduleContent: string
): Promise<string> {
  // Usar a função aprimorada de generatePersonaPrompt de personaDirectives.ts
  const systemPrompt = generatePersonaPrompt(persona, level, module, moduleTitle);
  const userPrompt = `Com base nas diretrizes fornecidas e no conteúdo do módulo, crie um roteiro detalhado para uma vídeo-aula. O roteiro deve ser estruturado em cenas, incluir descrições visuais, diálogos e transições. A duração total deve ser de aproximadamente 15-20 minutos.

Conteúdo do Módulo:
${moduleContent}

Formate o roteiro em Markdown com as seguintes seções:
- Título do Roteiro
- Duração Total
- Cenas (numeradas e com duração individual)
- Cada cena deve incluir: Visual, Diálogos, Elementos Visuais

Certifique-se de que o roteiro incorpore as características editoriais e publicitárias da persona selecionada, como tom de voz, estilo e exemplos de fala.`;

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

export async function refineScriptWithEditorialGuidelines(scriptContent: string, persona: PersonaType): Promise<string> {
  const personaData = PERSONA_DIRECTIVES[persona];
  const systemPrompt = `Você é um editor de vídeo-aulas altamente qualificado, com expertise editorial e publicitária, trabalhando para a Nexus Academ'IA. Sua tarefa é revisar e aprimorar um roteiro de vídeo-aula, garantindo que ele esteja perfeitamente alinhado com as diretrizes da persona ${personaData.name} e com os objetivos de comunicação da marca.

DIRETRIZES DA PERSONA ${personaData.name.toUpperCase()}:
- Tom: ${personaData.voiceProfile.tone}
- Características de Voz: ${personaData.voiceProfile.characteristics.join(", ")}
- Exemplos de Fala: ${personaData.voiceProfile.examples.map((ex: string) => `"${ex}"`).join(", ")}
- Diretrizes de Roteiro: ${personaData.scriptGuidelines}

OBJETIVOS PUBLICITÁRIOS:
- Clareza e Engajamento: O roteiro deve ser claro, conciso e manter o público engajado.
- Chamada para Ação (Call-to-Action): Se aplicável, o roteiro deve guiar sutilmente o espectador para uma próxima etapa (ex: explorar mais módulos, visitar o site).
- Consistência da Marca: O conteúdo deve refletir os valores e a estética da Nexus Affil'IA'te (cyberpunk, inovação, autoridade).
- Qualidade Profissional: Eliminar redundâncias, garantir fluidez e correção gramatical.

Revise o roteiro fornecido, aplicando estas diretrizes. Retorne apenas o roteiro aprimorado em formato Markdown, sem comentários adicionais ou introduções.`;

  const userPrompt = `Roteiro a ser revisado:
${scriptContent}`;

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
    console.error("[LLM Service] Error refining script:", error);
    throw new Error(`Failed to refine script: ${(error as Error).message}`);
  }
}
