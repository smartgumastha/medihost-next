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

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(false);

    setTimeout(() => {
      const name = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      setResults([
        { domain: `${name}.com`, available: true, price: '\u20B9899/yr', bestPick: true },
        { domain: `${name}.in`, available: true, price: '\u20B9699/yr' },
        { domain: `${name}clinic.com`, available: true, price: '\u20B9899/yr' },
        { domain: `dr${name}.in`, available: true, price: '\u20B9699/yr' },
        { domain: `${name}.co.in`, available: false, price: '\u2014' },
      ]);
      setSearching(false);
      setSearched(true);
    }, 1200);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
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
                    <button className="px-5 py-1.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                      Select
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
