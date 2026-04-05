'use client';

import { useState } from 'react';
import { Globe, Search, Check, X, Loader2 } from 'lucide-react';

interface DomainResult {
  domain: string;
  available: boolean;
  price: string;
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

    // Mock search with a short delay
    setTimeout(() => {
      const name = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      setResults([
        { domain: `${name}.com`, available: true, price: '₹899/yr' },
        { domain: `${name}.in`, available: true, price: '₹699/yr' },
        { domain: `${name}clinic.com`, available: true, price: '₹899/yr' },
        { domain: `dr${name}.in`, available: true, price: '₹699/yr' },
        { domain: `${name}.co.in`, available: false, price: '—' },
      ]);
      setSearching(false);
      setSearched(true);
    }, 1200);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
        <div className="pl-5 text-gray-400">
          <Globe className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Find your domain — e.g. drsharma"
          className="flex-1 px-4 py-4 text-lg outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="mr-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          NABL Certified
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          HIPAA Ready
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          ABDM Connected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          GST Compliant
        </span>
      </div>

      {/* Free subdomain note */}
      <p className="text-center text-sm text-gray-500 mt-3">
        Or start with a free subdomain —{' '}
        <span className="font-medium text-emerald-700">yourname.medihost.in</span>
      </p>

      {/* Results */}
      {searched && results.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">Domain Results</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {results.map((r) => (
              <li
                key={r.domain}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {r.available ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`font-medium ${r.available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                    {r.domain}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{r.price}</span>
                  {r.available && (
                    <button className="px-4 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
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
