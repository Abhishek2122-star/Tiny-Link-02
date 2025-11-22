'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LinkStats {
  id: number;
  short_code: string;
  original_url: string;
  created_at: string;
  total_clicks: number;
  last_clicked_at: string | null;
}

export default function StatsPage({ params }: { params: Promise<{ code: string }> }) {
  const [link, setLink] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then((p) => {
      fetch(`/api/links/${p.code}`)
        .then((res) => (res.ok ? res.json() : Promise.reject('Not found')))
        .then(setLink)
        .catch(() => setError('Link not found'))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="spinner text-4xl text-blue-600 mb-4">↻</div>
          <p className="text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="card-hover max-w-md">
          <div className="alert-error mb-4">{error}</div>
          <Link href="/" className="btn-secondary inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  if (!link) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container-max py-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Link Statistics</h1>
        </div>
      </header>
      <main className="container-max py-12">
        <div className="card-hover max-w-2xl mx-auto">
          {/* Short Code */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="label uppercase mb-3">Short Code</h3>
            <code className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {link.short_code}
            </code>
            <p className="text-sm text-gray-600 mt-4">
              Full URL:{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">
                {window.location.origin}/{link.short_code}
              </code>
            </p>
          </div>

          {/* Click Stats */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="label uppercase mb-3">Total Clicks</h3>
            <div className="text-7xl font-bold text-blue-600">{link.total_clicks}</div>
            <p className="text-sm text-gray-600 mt-2">
              {link.total_clicks === 0
                ? 'No clicks yet'
                : link.total_clicks === 1
                  ? '1 click recorded'
                  : `${link.total_clicks} clicks recorded`}
            </p>
          </div>

          {/* Original URL */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="label uppercase mb-3">Original URL</h3>
            <a
              href={link.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all hover:underline font-mono text-sm"
            >
              {link.original_url}
            </a>
          </div>

          {/* Timestamps */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="label uppercase mb-3">Created At</h3>
              <p className="text-gray-900 font-medium">{new Date(link.created_at).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(link.created_at).toDateString()}</p>
            </div>
            <div>
              <h3 className="label uppercase mb-3">Last Clicked</h3>
              <p className="text-gray-900 font-medium">
                {link.last_clicked_at ? new Date(link.last_clicked_at).toLocaleString() : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {link.last_clicked_at ? new Date(link.last_clicked_at).toDateString() : 'Never clicked'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex gap-3">
            <Link href="/" className="btn-secondary flex-1 text-center">
              ← Back to Dashboard
            </Link>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(`${window.location.origin}/${link.short_code}`).then(() => {
                    alert('Short URL copied to clipboard!');
                  }).catch(() => {
                    alert('Failed to copy. Please try again.');
                  });
                } else {
                  alert('Copy not supported in this browser');
                }
              }}
              className="btn-primary flex-1"
            >
              📋 Copy Short URL
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
