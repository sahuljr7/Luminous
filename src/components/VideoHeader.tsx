'use client';

import { ExternalLink, Copy, Download } from 'lucide-react';
import { useAppStore } from '@/store';
import { buildThumbnailUrl, buildYouTubeUrl } from '@/lib/youtube';
import { useState } from 'react';

export function VideoHeader() {
  const { currentVideoId, currentUrl, summary } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!currentVideoId || !summary) return null;

  const thumbUrl = buildThumbnailUrl(currentVideoId);
  const ytUrl = buildYouTubeUrl(currentVideoId);

  const handleCopy = async () => {
    const text = [
      `# ${summary.title}`,
      '',
      `## Overview`,
      summary.overview,
      '',
      `## Summary`,
      summary.detailedSummary.map((p) => `• ${p}`).join('\n'),
      '',
      `## Key Insights`,
      summary.keyInsights.map((p) => `• ${p}`).join('\n'),
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined') return;
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    const content = document.getElementById('summary-content');
    if (!content) return;

    html2pdf()
      .set({
        margin: 12,
        filename: `${summary.title.slice(0, 40)}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(content)
      .save();
  };

  return (
    <div className="card p-5 flex gap-4 items-start">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden">
        <img
          src={thumbUrl}
          alt={summary.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
              <path d="M4 2.5L9.5 6L4 9.5V2.5Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-display text-xl font-semibold leading-snug mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {summary.title}
        </h2>
        <p className="text-sm line-clamp-1 mb-3" style={{ color: 'var(--text-muted)' }}>
          {currentUrl}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            <ExternalLink size={12} />
            Watch on YouTube
          </a>
          <button onClick={handleCopy} className="btn-ghost text-xs">
            <Copy size={12} />
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
          <button onClick={handleDownloadPDF} className="btn-ghost text-xs">
            <Download size={12} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
