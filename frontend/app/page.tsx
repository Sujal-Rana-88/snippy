'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000';
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || '';

export default function CreatePastePage() {
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pathFromFull = (u: string) => {
    try {
      const url = new URL(u);
      return url.pathname;                
    } catch {
      return u.startsWith('/') ? u : `/${u}`;
    }
  };

  const makeFrontendUrl = (path: string) => {
    const origin =
      SITE_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : '');
    try {
      return new URL(path, origin).toString();
    } catch {
      return `${origin}${path}`;
    }
  };

  const onSubmit = async () => {
    setError(null);
    setCreatedUrl(null);

    if (!code.trim()) {
      setError('Please add some code first.');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch(`${API_BASE}/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `Request failed with ${res.status}`);
      }

      const data = await res.json(); 
      setCode('');

      const path = pathFromFull(data.url);
      const share = makeFrontendUrl(path);
      setCreatedUrl(share);
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setCreating(false);
    }
  };

  const copyUrl = async () => {
    if (!createdUrl) return;
    await navigator.clipboard.writeText(createdUrl);
    alert('Copied!');
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Snippy</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Create a paste and get a shareable URL.
        </p>
      </header>

      <div className="rounded-2xl border border-black/10 dark:border-white/15 p-6 bg-white dark:bg-black/10 shadow-sm">
        <label htmlFor="code-area" className="block text-sm font-medium mb-2">
          Your code
        </label>
        <textarea
          id="code-area"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-neutral-50 dark:bg-neutral-900 p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
          placeholder="Paste or type your code here…"
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={onSubmit}
            disabled={creating}
            className="rounded-full px-5 h-11 text-sm font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-60"
          >
            {creating ? 'Creating…' : 'Create paste'}
          </button>

          <Link
            href="/abc123"
            className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
          >
            Try a sample: /abc123
          </Link>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {createdUrl && (
          <div className="mt-6 rounded-xl border border-black/10 dark:border-white/15 p-4 bg-neutral-50 dark:bg-neutral-900">
            <p className="text-sm mb-2">Your paste is ready:</p>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                readOnly
                value={createdUrl} // shows frontend URL
                className="flex-1 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-950 px-3 py-2 text-sm font-mono"
              />
              <button
                onClick={copyUrl}
                className="rounded-lg px-4 py-2 text-sm font-medium border border-black/10 dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Copy URL
              </button>
              <Link
                href={pathFromFull(createdUrl)} // navigate client-side via path
                className="rounded-lg px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-center"
              >
                Open
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
