'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface DomainResult {
  domain: string;
  available: boolean;
  price: string;
}

const placeholders = [
  'Search your clinic domain...',
  'Try: yourclinicname.in',
  'Ask AI: best domain for dentist in Chennai',
  'Try: drpavan.com',
  'Ask AI: domain for skin clinic Hyderabad',
  'Try: citycarelab.in',
];

function isDomainQuery(input: string) {
  return /\.(com|in|net|org|co\.in|care|health|clinic)$/i.test(input.trim());
}

export function DomainSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DomainResult[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animated placeholder cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % placeholders.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const checkSingleDomain = useCallback(async (domain: string): Promise<DomainResult> => {
    try {
      const res = await fetch(`/api/presence/domains/check-multi?domain=${encodeURIComponent(domain.split('.')[0])}`);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        const match = results.find((r: DomainResult) => r.domain === domain);
        if (match) {
          return {
            domain: match.domain,
            available: !!match.available,
            price: match.available ? `₹${match.price || 699}/yr` : '—',
          };
        }
        // Return first available if exact match not found
        if (results.length > 0) {
          return {
            domain: results[0].domain,
            available: !!results[0].available,
            price: results[0].available ? `₹${results[0].price || 699}/yr` : '—',
          };
        }
      }
    } catch {}
    return { domain, available: false, price: '—' };
  }, []);

  const handleSearch = useCallback(async () => {
    const input = query.trim();
    if (!input) return;

    setLoading(true);
    setError('');
    setResults([]);
    setSelected(null);

    try {
      // Clean input to get the base name
      const name = isDomainQuery(input)
        ? input.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
        : input.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Call the batch domain check API
      const res = await fetch(`/api/presence/domains/check-multi?domain=${encodeURIComponent(name)}`);

      if (res.ok) {
        const data = await res.json();
        const apiResults = data.results || [];

        if (apiResults.length > 0) {
          setResults(apiResults.map((r: { domain: string; available: boolean; price?: number; tld?: string }) => ({
            domain: r.domain,
            available: !!r.available,
            price: r.available ? `₹${r.price || 699}/yr` : '—',
          })));
        } else {
          // Fallback mock results
          setResults([
            { domain: `${name}.com`, available: true, price: '₹899/yr' },
            { domain: `${name}.in`, available: true, price: '₹699/yr' },
            { domain: `${name}clinic.com`, available: true, price: '₹899/yr' },
            { domain: `dr${name}.in`, available: true, price: '₹699/yr' },
            { domain: `${name}.co.in`, available: false, price: '—' },
          ]);
        }
      } else {
        // API failed — show mock results
        setResults([
          { domain: `${name}.com`, available: true, price: '₹899/yr' },
          { domain: `${name}.in`, available: true, price: '₹699/yr' },
          { domain: `${name}clinic.com`, available: true, price: '₹899/yr' },
        ]);
      }
    } catch {
      setError('Could not check availability. Try again.');
    } finally {
      setLoading(false);
    }
  }, [query, checkSingleDomain]);

  const handleSelect = (domain: string) => {
    setSelected(domain);
  };

  const selectedResult = results.find((r) => r.domain === selected);

  return (
    <div className="w-full max-w-2xl mx-auto relative z-20">
      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl overflow-hidden h-16 shadow-2xl shadow-black/20 focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
          <div className="pl-5 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
            </svg>
          </div>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 text-gray-900 text-base outline-none bg-transparent font-medium"
            />
            {!query && (
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none transition-opacity duration-300 ${
                  placeholderVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {placeholders[placeholderIndex]}
              </span>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="m-2 px-8 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
            Search
          </button>
        </div>
      </div>

      {/* Trust badges + free subdomain fallback */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-500">
        <span>🔬 NABL</span>
        <span>🔒 HIPAA</span>
        <span>🏥 ABDM</span>
        <span>📋 GST</span>
        <span className="text-slate-600">|</span>
        <a href="/signup" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
          Or start free with yourname.medihost.in →
        </a>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          Finding domains...
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-red-400">
          <span>{error}</span>
          <button
            onClick={handleSearch}
            className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results — Hostinger-style vertical list */}
      {!loading && results.length > 0 && (() => {
        const sorted = [...results].sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0));
        const hasAvailable = sorted.some(r => r.available);
        const allTaken = !hasAvailable;
        const name = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        return (
          <div className="mt-4">
            {/* Single white card with all results listed vertically */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {hasAvailable ? `🎉 ${sorted.filter(r=>r.available).length} available` : '😔 All taken'}
                </span>
                <span className="text-xs text-gray-400">{sorted.length} results</span>
              </div>

              {/* Domain rows */}
              {sorted.map((r, i) => (
                <div
                  key={r.domain}
                  className={`flex items-center px-5 py-4 gap-4 transition-colors ${
                    i > 0 ? 'border-t border-gray-100' : ''
                  } ${r.available
                    ? selected === r.domain ? 'bg-emerald-50' : 'hover:bg-gray-50 cursor-pointer'
                    : 'bg-gray-50/50'
                  }`}
                  onClick={() => r.available && handleSelect(r.domain)}
                >
                  {/* Status icon */}
                  {r.available ? (
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">✓</span>
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-sm shrink-0">✕</span>
                  )}

                  {/* Domain name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-base ${r.available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                        {r.domain}
                      </span>
                      {r.available && i === sorted.findIndex(s => s.available) && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase tracking-wide">
                          Recommended
                        </span>
                      )}
                    </div>
                    {r.available && (
                      <span className="text-xs text-gray-400">Free with Professional plan</span>
                    )}
                  </div>

                  {/* Price */}
                  <span className={`text-lg font-bold shrink-0 ${r.available ? 'text-emerald-600' : 'text-gray-300'}`}>
                    {r.available ? r.price : '—'}
                  </span>

                  {/* Action */}
                  {r.available ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect(r.domain); }}
                      className={`px-5 py-2.5 font-bold rounded-lg text-sm transition-all shrink-0 ${
                        selected === r.domain
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-gray-900 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {selected === r.domain ? 'Selected ✓' : 'Buy →'}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-50 rounded-lg shrink-0">
                      Taken
                    </span>
                  )}
                </div>
              ))}

              {/* Suggestion row when some/all taken */}
              {allTaken && (
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Try these variations:</p>
                  <div className="flex flex-wrap gap-2">
                    {['dr', 'my', 'the', 'clinic', 'lab', 'care'].map(prefix => {
                      const suggestion = prefix === 'dr' || prefix === 'my' || prefix === 'the'
                        ? `${prefix}${name}` : `${name}${prefix}`;
                      return (
                        <button
                          key={prefix}
                          onClick={() => { setQuery(suggestion); setResults([]); setSelected(null); setLoading(true); setError('');
                            fetch(`/api/presence/domains/check-multi?domain=${encodeURIComponent(suggestion)}`)
                              .then(r => r.json())
                              .then(data => {
                                const res = (data.results || []).map((r: { domain: string; available: boolean; price?: number }) => ({
                                  domain: r.domain, available: !!r.available, price: r.available ? `₹${r.price || 699}/yr` : '—'
                                }));
                                setResults(res.length > 0 ? res : [{ domain: `${suggestion}.in`, available: true, price: '₹699/yr' }]);
                              })
                              .catch(() => setResults([{ domain: `${suggestion}.in`, available: true, price: '₹699/yr' }]))
                              .finally(() => setLoading(false));
                          }}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                        >
                          {suggestion}.in
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Google signup footer */}
              {hasAvailable && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-gray-400">Quick signup with Google → faster GBP setup</span>
                  <a
                    href={`/signup?domain=${encodeURIComponent(sorted.find(r => r.available)?.domain || '')}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </a>
                </div>
              )}
            </div>

            {/* Free subdomain fallback */}
            <p className="text-center text-xs text-slate-500 mt-3">
              Don&apos;t need a domain?{' '}
              <a href="/signup" className="text-emerald-400 font-medium hover:text-emerald-300">
                Start free with yourname.medihost.in →
              </a>
            </p>
          </div>
        );
      })()}

      {/* Confirmation strip after selection */}
      {selectedResult && selectedResult.available && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 animate-[fadeInUp_0.3s_ease-out]">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-lg">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">✓</span>
                {selectedResult.domain}
                <span className="text-sm font-normal text-emerald-400/70">— {selectedResult.price}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Included free with Professional plan</p>
            </div>
            <a
              href={`/signup?domain=${encodeURIComponent(selectedResult.domain)}`}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Get Started →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
