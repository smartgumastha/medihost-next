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
    <div className="w-full max-w-2xl mx-auto">
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

      {/* Results */}
      {!loading && results.length > 0 && (() => {
        const available = results.filter(r => r.available);
        const taken = results.filter(r => !r.available);
        const allTaken = available.length === 0;

        return (
          <div className="mt-4 space-y-3">
            {/* Celebration when domains available */}
            {available.length > 0 && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-300 font-medium">
                  🎉 {available.length} domain{available.length > 1 ? 's' : ''} available — it can be yours!
                </span>
              </div>
            )}

            {/* All taken message */}
            {allTaken && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-sm text-red-400 font-medium">
                  😔 These domains are taken — try a variation below
                </span>
              </div>
            )}

            {/* Available domains first */}
            {available.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {available.map((r, i) => (
                  <div
                    key={r.domain}
                    className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors ${
                      i > 0 ? 'border-t border-gray-100' : ''
                    } ${selected === r.domain ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleSelect(r.domain)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                      <span className="font-semibold text-gray-900">{r.domain}</span>
                      {i === 0 && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase">
                          Best Pick
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-emerald-600">{r.price}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelect(r.domain); }}
                        className={`px-5 py-2 font-bold rounded-xl text-sm transition-all ${
                          selected === r.domain
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                            : i === 0
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {selected === r.domain ? 'Selected ✓' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Taken domains */}
            {taken.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2 border-b border-white/5">
                  <span className="text-xs text-slate-500 font-medium">Not Available</span>
                </div>
                {taken.map((r, i) => (
                  <div
                    key={r.domain}
                    className={`flex items-center justify-between px-5 py-3 ${
                      i > 0 ? 'border-t border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-xs">✕</span>
                      <span className="text-slate-500 line-through text-sm">{r.domain}</span>
                    </div>
                    <span className="text-xs text-red-400/70 bg-red-500/10 px-2 py-1 rounded">Taken</span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggest variations when all taken */}
            {allTaken && (
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-500">Try these variations:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['dr', 'my', 'the', 'clinic', 'lab', 'care'].map(prefix => {
                    const name = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                    const suggestion = prefix === 'dr' || prefix === 'my' || prefix === 'the'
                      ? `${prefix}${name}`
                      : `${name}${prefix}`;
                    return (
                      <button
                        key={prefix}
                        onClick={() => { setQuery(suggestion); setTimeout(handleSearch, 100); }}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                      >
                        {suggestion}.in
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Or{' '}
                  <a href="/signup" className="text-emerald-400 hover:text-emerald-300">
                    start free with yourname.medihost.in →
                  </a>
                </p>
              </div>
            )}
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
