import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/youtube';
import type { TranscriptData, TranscriptSegment } from '@/types';

// In-memory cache (use Redis in production)
const transcriptCache = new Map<string, TranscriptData>();

async function fetchTranscriptFromYouTube(videoId: string): Promise<TranscriptSegment[]> {
  try {
    // Fetch the video page to get streaming data
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube responded with status ${response.status}`);
    }

    const html = await response.text();

    // Try multiple strategies to extract ytInitialData
    let data;
    
    // Strategy 1: Look for the exact variable assignment
    const match1 = html.match(/var ytInitialData = ({.+?})\s*;\s*window\["ytInitialData"\]/);
    if (match1) {
      try {
        data = JSON.parse(match1[1]);
      } catch (e) {
        console.log('Strategy 1 failed, trying strategy 2');
      }
    }
    
    // Strategy 2: Look for the window object assignment
    if (!data) {
      const match2 = html.match(/window\["ytInitialData"\]\s*=\s*({.+?})\s*;/);
      if (match2) {
        try {
          data = JSON.parse(match2[1]);
        } catch (e) {
          console.log('Strategy 2 failed, trying strategy 3');
        }
      }
    }

    // Strategy 3: Look for any ytInitialData assignment (less precise but might work)
    if (!data) {
      const match3 = html.match(/ytInitialData = ({.+?})\s*;/);
      if (match3) {
        // Use a more careful parsing approach for incomplete JSON
        const jsonStr = match3[1];
        try {
          data = JSON.parse(jsonStr);
        } catch (e) {
          console.log('Strategy 3 failed');
        }
      }
    }

    if (!data) {
      throw new Error('Could not extract video data from page');
    }

    // Navigate through the data structure to find captions
    const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || !Array.isArray(captionTracks) || captionTracks.length === 0) {
      throw new Error('No captions available for this video');
    }

    // Get the first caption track URL (usually auto-generated)
    const captionTrack = captionTracks[0];
    const captionTrackUrl = captionTrack?.baseUrl || captionTrack?.url;
    
    if (!captionTrackUrl) {
      throw new Error('No caption URL found in track data');
    }

    console.log(`[TRANSCRIPT] Found caption track URL: ${captionTrackUrl.substring(0, 50)}...`);

    // Fetch the caption track (XML format)
    const captionResponse = await fetch(captionTrackUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!captionResponse.ok) {
      throw new Error(`Failed to fetch caption track (status ${captionResponse.status})`);
    }

    const captionXml = await captionResponse.text();

    // Parse XML captions
    const segments: TranscriptSegment[] = [];
    const textRegex = /<text start="([\d.]+)" dur="([\d.]+)">([^<]*)<\/text>/g;
    let match_;
    
    while ((match_ = textRegex.exec(captionXml)) !== null) {
      const [, start, duration, text] = match_;
      segments.push({
        text: decodeHTMLEntities(text.replace(/<[^>]*>/g, '')),
        offset: parseFloat(start),
        duration: parseFloat(duration),
      });
    }

    if (segments.length === 0) {
      throw new Error('No caption segments could be parsed from the XML');
    }

    return segments;
  } catch (error) {
    throw error;
  }
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };
  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}

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
      console.log(`[TRANSCRIPT] Fetching transcript for video: ${videoId}`);
      
      segments = await fetchTranscriptFromYouTube(videoId);
      
      console.log(`[TRANSCRIPT] Successfully fetched ${segments.length} caption segments`);
    } catch (transcriptError: unknown) {
      const errMsg =
        transcriptError instanceof Error ? transcriptError.message : String(transcriptError);
      
      console.error(`[TRANSCRIPT] Error fetching transcript for ${videoId}:`, errMsg);

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
