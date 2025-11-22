'use client';

import { useEffect, useState } from 'react';

interface Link {
  id: number;
  short_code: string;
  original_url: string;
  created_at: string;
  total_clicks: number;
  last_clicked_at: string | null;
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        setLinks(await res.json());
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: url, customCode: code || undefined }),
      });

      if (res.ok) {
        setUrl('');
        setCode('');
        setMsg('✓ Link created successfully!');
        setMsgType('success');
        setTimeout(() => setMsg(''), 3000);
        fetchLinks();
      } else {
        const data = await res.json();
        setMsg(`✕ ${data.error || 'Failed to create link'}`);
        setMsgType('error');
      }
    } catch (err) {
      setMsg('✕ Error creating link');
      setMsgType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const res = await fetch(`/api/links/${c}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg('✓ Link deleted');
        setMsgType('success');
        setTimeout(() => setMsg(''), 3000);
        fetchLinks();
      } else {
        setMsg('✕ Failed to delete');
        setMsgType('error');
      }
    } catch (err) {
      setMsg('✕ Error deleting link');
      setMsgType('error');
    }
  };

  // const copyToClipboard = (c: string) => {
  //   const fullUrl = `${window.location.origin}/${c}`;
  //   navigator.clipboard.writeText(fullUrl);
  //   setMsg('✓ Copied to clipboard!');
  //   setMsgType('success');
  //   setTimeout(() => setMsg(''), 2000);
  // };
  "use client";

const copyToClipboard = (c: string) => {
  const fullUrl = `${window.location.origin}/${c}`;
  
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(fullUrl);
    setMsg("✓ Copied to clipboard!");
    setMsgType("success");
    setTimeout(() => setMsg(""), 2000);
  } else {
    alert("Clipboard API not supported.");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container-max py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TinyLink
          </h1>
          <p className="text-gray-600 mt-2">Create, manage, and track your shortened URLs</p>
        </div>
      </header>

      <main className="container-max py-12">
        {/* Alert Messages */}
        {msg && (
          <div className={`mb-6 animate-slide-in ${msgType === 'success' ? 'alert-success' : 'alert-error'}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create Link Form */}
          <div className="md:col-span-1">
            <div className="card-hover">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Link</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Long URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/very/long/url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={submitting}
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be a valid HTTP/HTTPS URL</p>
                </div>

                <div>
                  <label className="label">Short Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., docs, api, blog"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={submitting}
                    maxLength={8}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">6-8 alphanumeric characters only</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? (
                    <>
                      <span className="spinner mr-2">⟳</span>
                      Creating...
                    </>
                  ) : (
                    'Create Short Link'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Links List */}
          <div className="md:col-span-2">
            <div className="card-hover">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Links</h2>
                <button
                  onClick={fetchLinks}
                  className="btn-secondary text-sm"
                >
                  ↻ Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="spinner text-4xl text-blue-600 mb-4">↻</div>
                  <p className="text-gray-600">Loading links...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <p className="text-gray-600 text-lg">No links created yet</p>
                  <p className="text-gray-500 text-sm mt-1">Create your first shortened link above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th className="text-left">Code</th>
                        <th className="text-left">URL</th>
                        <th className="text-center">Clicks</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link) => (
                        <tr key={link.id}>
                          <td className="font-mono font-bold text-blue-600">{link.short_code}</td>
                          <td>
                            <a
                              href={link.original_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 truncate max-w-xs block"
                              title={link.original_url}
                            >
                              {link.original_url.substring(0, 50)}
                              {link.original_url.length > 50 ? '...' : ''}
                            </a>
                          </td>
                          <td className="text-center">
                            <span className="badge-info">{link.total_clicks}</span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => copyToClipboard(link.short_code)}
                              className="btn-small btn-secondary text-xs mr-2"
                              title="Copy short URL"
                            >
                              📋 Copy
                            </button>
                            <a
                              href={`/code/${link.short_code}`}
                              className="btn-small bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs mr-2 inline-block"
                            >
                              📊 Stats
                            </a>
                            <button
                              onClick={() => handleDelete(link.short_code)}
                              className="btn-small btn-danger text-xs"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container-max py-8 text-center text-gray-600 text-sm">
          <p>© 2025 TinyLink. Built with Next.js, TypeScript, and Tailwind CSS</p>
          <p className="mt-2">
            <a href="https://github.com/Abhishek2122-star/Tiny-Link" className="text-blue-600 hover:text-blue-700">
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
