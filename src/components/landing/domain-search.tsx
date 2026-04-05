'use client';

import { useState } from 'react';
import { Globe, Search, Check, X, Loader2, Star } from 'lucide-react';

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
    setAiResponse('Based on your practice, I recommend: yourname.in (₹399/yr) with the Professional plan. This includes AI website, appointments, and Google Business setup. Shall I set this up for you?');
    // TODO: Call /api/ai/chat for real response
  }

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(false);
    const name = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    // Try real API first
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

    // Fallback to mock
    setResults([
      { domain: `${name}.com`, available: true, price: '\u20B9899/yr', bestPick: true },
      { domain: `${name}.in`, available: true, price: '\u20B9699/yr' },
      { domain: `${name}clinic.com`, available: true, price: '\u20B9899/yr' },
      { domain: `dr${name}.in`, available: true, price: '\u20B9699/yr' },
      { domain: `${name}.co.in`, available: false, price: '\u2014' },
    ]);
    setSearching(false);
    setSearched(true);
  };

  const handleSelectDomain = (domain: string) => {
    window.location.href = `/signup?domain=${encodeURIComponent(domain)}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab Toggle */}
      <div className="flex items-center justify-center gap-1 mb-4 bg-white/5 backdrop-blur-xl rounded-full p-1 border border-white/10 mx-auto w-fit">
        <button
          onClick={() => setSearchMode('domain')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            searchMode === 'domain'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {'\uD83C\uDF10'} Search Domain
        </button>
        <button
          onClick={() => setSearchMode('ai')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            searchMode === 'ai'
              ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {'\u2728'} AI Assistant
        </button>
      </div>

      {searchMode === 'ai' ? (
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden h-14 focus-within:border-violet-500/50 transition-colors">
            <span className="pl-5 text-xl">{'\u2728'}</span>
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              placeholder="Describe your practice... e.g., 'I'm a dentist in Hyderabad wanting to go online'"
              className="flex-1 bg-transparent text-white placeholder:text-slate-500 px-4 py-3 text-base outline-none"
            />
            <button
              onClick={handleAiSearch}
              className="m-1.5 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold rounded-full text-sm hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              Ask AI {'\u2192'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">AI will suggest the best domain, plan, and setup for your practice</p>
          {aiResponse && (
            <div className="mt-4 bg-violet-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed animate-[fadeInUp_0.5s_ease-out]">
              <span className="text-violet-400 font-semibold">{'\u2728'} AI Recommendation:</span>{' '}
              {aiResponse}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-full border border-white/20 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400/50 focus-within:border-emerald-400/50 transition-all shadow-2xl shadow-emerald-500/10">
            <div className="pl-6 text-slate-400">
              <Globe className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Find your domain \u2014 e.g. drsharma"
              className="flex-1 px-4 h-14 text-lg outline-none bg-transparent text-white placeholder:text-slate-500"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="mr-1.5 px-7 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>
        </>
      )}

      {/* Trust icons below search */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 text-xs text-slate-500">
        {['NABL', 'HIPAA', 'ABDM', 'GST', 'ISO'].map((badge, i) => (
          <span key={badge} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-700 mr-1">{'\u00B7'}</span>}
            {badge}
          </span>
        ))}
      </div>

      {/* Free subdomain note */}
      <p className="text-center text-sm text-slate-500 mt-3">
        Or start free with{' '}
        <span className="font-semibold text-emerald-400">yourname.medihost.in</span>
      </p>

      {/* Results */}
      {searched && results.length > 0 && (
        <div className="mt-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl animate-[fadeInUp_0.5s_ease-out]">
          <div className="px-5 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white/80">Domain Results</p>
          </div>
          <ul className="divide-y divide-white/5">
            {results.map((r) => (
              <li
                key={r.domain}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors ${r.bestPick ? 'bg-emerald-500/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {r.available ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`font-semibold ${r.available ? 'text-white' : 'text-slate-600 line-through'}`}>
                    {r.domain}
                  </span>
                  {r.bestPick && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white rounded-full uppercase tracking-wider animate-pulse">
                      <Star className="w-2.5 h-2.5" />
                      Best Pick
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${r.available ? 'bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent' : 'text-slate-600'}`}>
                    {r.price}
                  </span>
                  {r.available && (
                    <button
                      onClick={() => handleSelectDomain(r.domain)}
                      className="px-5 py-1.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                    >
                      Buy &rarr;
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
