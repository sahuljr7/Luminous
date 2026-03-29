import { NextRequest, NextResponse } from 'next/server';
import { OllamaClient, SYSTEM_PROMPTS, buildChatPrompt } from '@/lib/ollama';
import { truncateTranscript } from '@/lib/youtube';
import type { OllamaMessage } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, messages, question, apiKey } = body;

    if (!transcript || !question) {
      return NextResponse.json(
        { success: false, error: 'Transcript and question are required.' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Ollama API key is required.' },
        { status: 401 }
      );
    }

    const resolvedKey = process.env.OLLAMA_API_KEY || apiKey;
    const client = new OllamaClient(resolvedKey);
    const processedTranscript = truncateTranscript(transcript, 12000);

    // Build conversation history
    const ollamaMessages: OllamaMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.chat },
    ];

    // Add previous conversation context (last 10 messages)
    if (Array.isArray(messages) && messages.length > 0) {
      const recentMessages = messages.slice(-10);
      for (const msg of recentMessages) {
        ollamaMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    // Add current question with transcript context
    ollamaMessages.push({
      role: 'user',
      content: buildChatPrompt(processedTranscript, question),
    });

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of client.chatStream(ollamaMessages)) {
            const data = JSON.stringify({ chunk }) + '\n';
            controller.enqueue(encoder.encode(data));
          }
          controller.enqueue(encoder.encode(JSON.stringify({ done: true }) + '\n'));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Stream error';
          controller.enqueue(
            encoder.encode(JSON.stringify({ error: message }) + '\n')
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
