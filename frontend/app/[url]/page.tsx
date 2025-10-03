'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = { params: { url: string } };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000';

function decodeOnceIfEscaped(s: string) {
  if (!/\\u[0-9a-fA-F]{4}|\\n|\\t|\\"|\\\\/.test(s)) return s;
  try {
    return JSON.parse(`"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
  } catch {
    return s;
  }
}

export default function PastePage({ params }: Props) {
  const { url } = params;
  const [content, setContent] = useState<string>('Loading…');
  const [error, setError] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') return `${window.location.origin}/${url}`;
    return `/${url}`;
  }, [url]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setContent('Loading…');
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(url)}`, { cache: 'no-store' });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || `Request failed with ${res.status}`);
        }
        const data = await res.json(); // { code }
        if (!cancelled) setContent(data.code ?? '');
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'URL not found');
          setContent('');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  const copyShare = async () => {
    await navigator.clipboard.writeText(shareUrl);
    alert('Copied URL!');
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(error ? `// ${error}` : decodeOnceIfEscaped(content));
    alert('Copied Code!');
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-12">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold break-all">Paste: {url}</h1>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="hidden sm:block w-[280px] rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-950 px-3 py-2 text-sm font-mono"
          />
          <button
            onClick={copyShare}
            className="rounded-lg px-3 py-2 text-sm font-medium border border-black/10 dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Copy URL
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/15 p-0 overflow-hidden bg-white dark:bg-neutral-950">
        <div className="bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-xs font-mono text-neutral-600 flex items-center justify-between">
          <span>code</span>
          <div className="flex items-center gap-2">
            <span>{error ? 'error' : 'read-only'}</span>
            <button
              onClick={copyCode}
              className="rounded px-2 py-1 text-xs font-medium border border-black/10 dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Copy Code
            </button>
          </div>
        </div>
        <pre className="p-4 overflow-x-auto text-sm font-mono leading-6 whitespace-pre-wrap">
{error ? `// ${error}` : decodeOnceIfEscaped(content)}
        </pre>
      </div>
    </div>
  );
}
