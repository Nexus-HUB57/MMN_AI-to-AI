import { OpenAI } from "openai";

const client = new OpenAI();

export async function invokeLLM(options: {
  messages: any[];
  response_format?: any;
}) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: options.messages,
      response_format: options.response_format,
    });
    return response;
  } catch (error) {
    console.error("[LLM] Error invoking LLM:", error);
    throw error;
  }
}
