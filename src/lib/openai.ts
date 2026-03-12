/**
 * OpenAI integration for dynamic activity generation.
 *
 * Used only when template.generatorType === "llm".
 * Falls back gracefully if the API key is not configured.
 */

import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export interface LLMSuggestionFill {
  title: string;
  description: string;
  resourceUrl?: string;
}

/**
 * Ask the LLM to fill in a template for a specific interest.
 * Returns null if OpenAI is not configured or on failure.
 */
export async function fillTemplateWithLLM(
  templateName: string,
  templateDescription: string,
  interest: string,
  estimatedMinutes: number
): Promise<LLMSuggestionFill | null> {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `You are a personal productivity coach. 
Generate a specific, actionable activity suggestion for someone interested in "${interest}".

Template: ${templateName.replace("[interest]", interest)}
Base description: ${templateDescription.replace(/\[interest\]/g, interest)}
Estimated time: ${estimatedMinutes} minutes

Respond with a JSON object (no markdown) with these exact keys:
- title: a concise, motivating title (max 60 chars)
- description: 1-2 sentences of specific, actionable instructions (max 150 chars)
- resourceUrl: (optional) a relevant URL or null

Keep it concrete and inspiring. Do not invent fake URLs.`;

  try {
    const resp = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.7,
    });

    const content = resp.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<LLMSuggestionFill>;
    if (!parsed.title || !parsed.description) return null;

    return {
      title: parsed.title.slice(0, 100),
      description: parsed.description.slice(0, 300),
      resourceUrl: parsed.resourceUrl ?? undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Generate reflection prompts for a given interest using the LLM.
 */
export async function generateReflectionPrompts(
  interest: string,
  count: number = 3
): Promise<string[]> {
  const ai = getClient();
  if (!ai) {
    return [
      `What did you learn about ${interest} today?`,
      `What's one question you still have about ${interest}?`,
      `What's one thing you want to explore next in ${interest}?`,
    ];
  }

  const prompt = `Generate ${count} short, thought-provoking reflection questions for someone learning about "${interest}". 
Each question should be distinct and actionable.
Respond with a JSON array of strings (no markdown).`;

  try {
    const resp = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.8,
    });

    const content = resp.choices[0]?.message?.content;
    if (!content) throw new Error("No content");

    const parsed = JSON.parse(content) as { questions?: string[] } | string[];
    const questions = Array.isArray(parsed) ? parsed : (parsed as { questions?: string[] }).questions;
    if (!Array.isArray(questions)) throw new Error("Unexpected format");
    return questions.slice(0, count).map((q) => String(q));
  } catch {
    return [
      `What did you learn about ${interest} today?`,
      `What's one question you still have about ${interest}?`,
      `What's one thing you want to explore next in ${interest}?`,
    ];
  }
}
