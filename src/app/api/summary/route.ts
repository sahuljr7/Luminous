import { NextRequest, NextResponse } from 'next/server';
import { OllamaClient, SYSTEM_PROMPTS, buildSummaryPrompt } from '@/lib/ollama';
import { truncateTranscript } from '@/lib/youtube';
import type { SummaryData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, apiKey } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Transcript is required.' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Ollama API key is required.' },
        { status: 401 }
      );
    }

    // Use server-side key if available, fall back to client-provided
    const resolvedKey = process.env.OLLAMA_API_KEY || apiKey;

    const client = new OllamaClient(resolvedKey);

    // Truncate if too long
    const processedTranscript = truncateTranscript(transcript, 15000);

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPTS.summary },
      { role: 'user' as const, content: buildSummaryPrompt(processedTranscript) },
    ];

    const rawResponse = await client.chat(messages, false);

    // Parse JSON response
    let summaryData: SummaryData;
    try {
      // Strip potential markdown fences
      const cleaned = rawResponse
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

      summaryData = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw:', rawResponse.substring(0, 500));

      // Attempt to extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          summaryData = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            {
              success: false,
              error:
                'AI returned an invalid response format. Please try again.',
            },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse AI response. Please try again.',
          },
          { status: 502 }
        );
      }
    }

    // Validate required fields
    if (!summaryData.title || !summaryData.overview) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI response is incomplete. Please try again.',
        },
        { status: 502 }
      );
    }

    // Normalize array fields
    summaryData.detailedSummary = Array.isArray(summaryData.detailedSummary)
      ? summaryData.detailedSummary
      : [];
    summaryData.keyInsights = Array.isArray(summaryData.keyInsights)
      ? summaryData.keyInsights
      : [];
    summaryData.keyTerms = Array.isArray(summaryData.keyTerms) ? summaryData.keyTerms : [];
    summaryData.suggestedQuestions = Array.isArray(summaryData.suggestedQuestions)
      ? summaryData.suggestedQuestions.slice(0, 3)
      : [];

    return NextResponse.json({ success: true, data: summaryData });
  } catch (error: unknown) {
    console.error('Summary API error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
