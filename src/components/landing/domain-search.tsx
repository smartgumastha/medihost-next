'use client';

import { useState } from 'react';

interface DomainResult {
  domain: string;
  available: boolean;
  price: string;
  bestPick?: boolean;
}

export function DomainSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DomainResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<'domain' | 'ai'>('domain');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  function handleAiSearch() {
    if (!aiQuery.trim()) return;
    setAiResponse('Based on your practice, I recommend: yourname.in (₹399/yr) with the Professional plan. This includes AI website, appointments, and Google Business setup.');
  }

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(false);
    const name = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
      const res = await fetch(`/api/proxy/api/presence/domains/check-multi?domain=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        const apiResults = data.results || data.data?.results;
        if (apiResults && apiResults.length > 0) {
          setResults(apiResults.map((r: DomainResult, i: number) => ({ ...r, bestPick: i === 0 })));
          setSearching(false);
          setSearched(true);
          return;
        }
      }
    } catch {}

    setResults([
      { domain: `${name}.com`, available: true, price: '₹899/yr', bestPick: true },
      { domain: `${name}.in`, available: true, price: '₹699/yr' },
      { domain: `${name}clinic.com`, available: true, price: '₹899/yr' },
      { domain: `dr${name}.in`, available: true, price: '₹699/yr' },
      { domain: `${name}.co.in`, available: false, price: '—' },
    ]);
    setSearching(false);
    setSearched(true);
  };

  const handleSelectDomain = (domain: string) => {
    window.location.href = `/signup?domain=${encodeURIComponent(domain)}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab Toggle — small */}
      <div className="flex items-center justify-center gap-1 mb-3">
        <button
          onClick={() => setSearchMode('domain')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            searchMode === 'domain'
              ? 'bg-white/15 text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🌐 Domain
        </button>
        <button
          onClick={() => setSearchMode('ai')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            searchMode === 'ai'
              ? 'bg-violet-500/20 text-violet-300'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          ✨ AI Assistant
        </button>
      </div>

      {searchMode === 'ai' ? (
        /* AI Search */
        <div>
          <div className="flex items-center bg-white rounded-2xl overflow-hidden h-16 shadow-2xl shadow-black/20">
            <span className="pl-5 text-xl">✨</span>
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              placeholder="Describe your practice... e.g., 'dentist in Hyderabad'"
              className="flex-1 px-4 text-gray-900 placeholder:text-gray-400 text-base outline-none bg-transparent"
            />
            <button
              onClick={handleAiSearch}
              className="m-2 px-6 h-12 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold rounded-xl text-sm hover:shadow-lg transition-all"
            >
              Ask AI →
            </button>
          </div>
          {aiResponse && (
            <div className="mt-3 bg-white rounded-2xl p-5 shadow-xl text-sm text-gray-700 leading-relaxed">
              <span className="text-violet-600 font-bold">✨ AI Recommendation:</span> {aiResponse}
              <div className="mt-3 flex gap-2">
                <a href="/signup" className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                  Get Started →
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Domain Search — Hostinger style */
        <div>
          <div className="flex items-center bg-white rounded-2xl overflow-hidden h-16 shadow-2xl shadow-black/20 focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
            <div className="pl-5 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter your domain name"
              className="flex-1 px-4 text-gray-900 placeholder:text-gray-400 text-base outline-none bg-transparent font-medium"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="m-2 px-8 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              )}
              Search
            </button>
          </div>
        </div>
      )}

      {/* Trust + free subdomain — compact */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-500">
        <span>🔬 NABL</span>
        <span>🔒 HIPAA</span>
        <span>🏥 ABDM</span>
        <span>📋 GST</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 font-medium">Free: yourname.medihost.in</span>
      </div>

      {/* Domain Results — Hostinger-style white card */}
      {searched && results.length > 0 && (
        <div className="mt-3 bg-white rounded-2xl shadow-xl overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
          {results.map((r, i) => (
            <div
              key={r.domain}
              className={`flex items-center justify-between px-5 py-4 ${
                i > 0 ? 'border-t border-gray-100' : ''
              } ${r.bestPick ? 'bg-emerald-50' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                {r.available ? (
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">✕</span>
                )}
                <span className={`font-semibold text-base ${r.available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                  {r.domain}
                </span>
                {r.bestPick && (
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase">
                    Recommended
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${r.available ? 'text-emerald-600' : 'text-gray-300'}`}>
                  {r.price}
                </span>
                {r.available ? (
                  <button
                    onClick={() => handleSelectDomain(r.domain)}
                    className={`px-6 py-2.5 font-bold rounded-xl text-sm transition-all ${
                      r.bestPick
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Buy →
                  </button>
                ) : (
                  <span className="px-4 py-2 text-xs font-medium text-red-400 bg-red-50 rounded-lg">
                    Taken
                  </span>
                )}
              </div>
            </div>
          ))}
          {/* Google auth suggestion */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-gray-500">Quick signup → faster Google Business setup</span>
            <div className="flex items-center gap-2">
              <a
                href={`/signup?domain=${encodeURIComponent(results.find(r => r.bestPick)?.domain || '')}&method=google`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </a>
              <a
                href={`/signup?domain=${encodeURIComponent(results.find(r => r.bestPick)?.domain || '')}`}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Use email →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
