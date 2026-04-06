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
      const res = await fetch(`/api/proxy/domain/check?domain=${encodeURIComponent(domain)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          domain: data.domain || domain,
          available: !!data.available,
          price: data.price || '₹399/yr',
        };
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
      if (isDomainQuery(input)) {
        // Direct domain check
        const result = await checkSingleDomain(input);
        setResults([result]);
      } else {
        // AI suggestion flow
        const res = await fetch('/api/proxy/ai-suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input }),
        });

        if (!res.ok) throw new Error('AI request failed');

        const data = await res.json();
        const suggestions: string[] = data.suggestions || data.domains || [];

        if (suggestions.length === 0) {
          setError('No suggestions found. Try a different description.');
          setLoading(false);
          return;
        }

        // Check availability for all suggestions in parallel
        const checked = await Promise.all(suggestions.map(checkSingleDomain));
        setResults(checked);
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

      {/* Results — horizontal scrollable pill row */}
      {!loading && results.length > 0 && (
        <div className="mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 min-w-min">
            {results.map((r) => (
              <button
                key={r.domain}
                onClick={() => r.available && handleSelect(r.domain)}
                disabled={!r.available}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  selected === r.domain
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0F172A]'
                    : r.available
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer'
                    : 'bg-white/5 text-slate-500 border border-white/10 line-through cursor-not-allowed'
                }`}
              >
                <span>{r.domain}</span>
                {r.available && <span className="text-xs opacity-80">{r.price}</span>}
                {r.available ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium no-underline" style={{ textDecoration: 'none' }}>
                    Taken
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* "Try AI suggestions" hint when a single domain is taken */}
      {!loading && results.length === 1 && !results[0].available && (
        <div className="mt-2 text-center">
          <p className="text-xs text-slate-500">
            This domain is taken. Try describing your practice instead —{' '}
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
            >
              Ask AI for suggestions
            </button>
          </p>
        </div>
      )}

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
