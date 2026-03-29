import { NextRequest, NextResponse } from 'next/server';
import TranscriptClient from 'youtube-transcript-api';
import { extractVideoId } from '@/lib/youtube';
import type { TranscriptData, TranscriptSegment } from '@/types';

// In-memory cache (use Redis in production)
const transcriptCache = new Map<string, TranscriptData>();
const client = new TranscriptClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'YouTube URL is required.' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid YouTube URL. Please paste a valid YouTube video link (e.g., https://youtube.com/watch?v=...).',
        },
        { status: 400 }
      );
    }

    // Check cache
    const cacheTTL = parseInt(process.env.TRANSCRIPT_CACHE_TTL || '3600') * 1000;
    const cached = transcriptCache.get(videoId);
    if (cached && Date.now() - cached.fetchedAt < cacheTTL) {
      return NextResponse.json({ success: true, data: cached });
    }

    // Fetch transcript
    let segments: TranscriptSegment[] = [];

    try {
      await client.ready;
      const rawSegments = await client.getTranscript(videoId);

      segments = rawSegments.map((s: { text: string; start?: number; duration?: number }) => ({
        text: s.text,
        duration: s.duration || 0,
        offset: s.start || 0,
      }));
    } catch (transcriptError: unknown) {
      const errMsg =
        transcriptError instanceof Error ? transcriptError.message : String(transcriptError);

      // Handle known error cases
      if (errMsg.includes('invalid video ID') || errMsg.includes('disabled')) {
        return NextResponse.json(
          {
            success: false,
            error:
              'No transcript available for this video. The video may have captions disabled or may not support auto-generated captions. Try a different video.',
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to fetch transcript for this video. The video may be private, age-restricted, or have captions disabled.',
        },
        { status: 422 }
      );
    }

    if (!segments.length) {
      return NextResponse.json(
        { success: false, error: 'Transcript is empty for this video.' },
        { status: 422 }
      );
    }

    // Clean and join transcript
    const transcript = segments
      .map((s) => s.text)
      .join(' ')
      .replace(/\[.*?\]/g, '') // Remove [Music], [Applause] etc.
      .replace(/\s+/g, ' ')
      .trim();

    const data: TranscriptData = {
      videoId,
      transcript,
      segments,
      fetchedAt: Date.now(),
    };

    // Cache it
    transcriptCache.set(videoId, data);

    // Cleanup old cache entries (keep max 100)
    if (transcriptCache.size > 100) {
      const firstKey = transcriptCache.keys().next().value;
      if (firstKey) transcriptCache.delete(firstKey);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Transcript API error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
