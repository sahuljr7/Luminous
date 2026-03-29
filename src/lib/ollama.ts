import type { OllamaMessage, OllamaChatRequest } from '@/types';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'https://api.ollama.com';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export class OllamaClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = OLLAMA_BASE_URL;
    this.model = OLLAMA_MODEL;
  }

  async chat(messages: OllamaMessage[], stream: boolean = false): Promise<string> {
    const body: OllamaChatRequest = {
      model: this.model,
      messages,
      stream,
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Ollama API key.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 404) {
        throw new Error(`Model "${this.model}" not found. Please check your Ollama configuration.`);
      }
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    if (stream) {
      return this.handleStream(response);
    }

    const data = await response.json();
    return data.message?.content || data.choices?.[0]?.message?.content || '';
  }

  async *chatStream(messages: OllamaMessage[]): AsyncGenerator<string> {
    const body: OllamaChatRequest = {
      model: this.model,
      messages,
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const content = parsed.message?.content || parsed.choices?.[0]?.delta?.content || '';
          if (content) yield content;
          if (parsed.done) return;
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }

  private async handleStream(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const content = parsed.message?.content || '';
          fullContent += content;
          if (parsed.done) return fullContent;
        } catch {
          // Skip malformed
        }
      }
    }

    return fullContent;
  }
}

// System prompts
export const SYSTEM_PROMPTS = {
  summary: `You are an expert video content analyst. Your task is to analyze video transcripts and provide structured, insightful summaries.

CRITICAL RULES:
1. Only use information from the provided transcript. Never hallucinate or add external information.
2. Return ONLY valid JSON — no markdown fences, no preamble, no explanation outside JSON.
3. Be concise but comprehensive.
4. Use clear, accessible language.`,

  chat: `You are an intelligent video content assistant. You answer questions based EXCLUSIVELY on the provided video transcript.

CRITICAL RULES:
1. ONLY answer based on the transcript content. If the answer isn't in the transcript, clearly say so.
2. Never hallucinate or add information not in the transcript.
3. Be conversational but accurate.
4. When quoting or referencing the video, be specific.
5. Keep answers focused and helpful.`,
};

// Prompt templates
export function buildSummaryPrompt(transcript: string): string {
  return `Analyze this video transcript and respond with a JSON object in exactly this structure:

{
  "title": "A compelling, accurate title for this video content",
  "overview": "A clear 2-3 sentence overview of what this video covers",
  "detailedSummary": [
    "First key point or section summary",
    "Second key point or section summary",
    "..."
  ],
  "keyInsights": [
    "Most important insight or takeaway",
    "Second insight",
    "..."
  ],
  "keyTerms": [
    {
      "term": "Important term or concept",
      "explanation": "Simple ELI5 explanation of what this means",
      "context": "How this term is used/relevant in this video"
    }
  ],
  "suggestedQuestions": [
    "Smart follow-up question 1?",
    "Smart follow-up question 2?",
    "Smart follow-up question 3?"
  ]
}

Generate 5-8 detailed summary points, 3-5 key insights, 4-7 key terms, and exactly 3 suggested questions.

TRANSCRIPT:
${transcript}

Respond ONLY with the JSON object, no other text.`;
}

export function buildChatPrompt(transcript: string, question: string): string {
  return `VIDEO TRANSCRIPT:
---
${transcript}
---

USER QUESTION: ${question}

Answer the question based only on the transcript above. If the answer cannot be found in the transcript, say "I couldn't find information about that in this video." Be helpful and conversational.`;
}
