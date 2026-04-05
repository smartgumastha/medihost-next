'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error';

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '\u2713' : '\u2717'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100" aria-label="Close">
        {'\u00d7'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_SEARCH_RESULTS = [
  { domain: '.com', price: 699, available: true, bestPick: true },
  { domain: '.in', price: 399, available: true, bestPick: false },
  { domain: '.co.in', price: 299, available: true, bestPick: false },
  { domain: '.org', price: 899, available: false, bestPick: false },
  { domain: '.clinic', price: 1999, available: true, bestPick: false },
];

const DNS_RECORDS = [
  { type: 'CNAME', host: 'www', value: 'cname.vercel-dns.com', status: 'verified' as const },
  { type: 'A', host: '@', value: '76.76.21.21', status: 'pending' as const },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DomainManager({ user }: { user: AuthUser | null }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'search' | 'connect'>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH_RESULTS | null>(null);
  const [searching, setSearching] = useState(false);
  const [connectDomain, setConnectDomain] = useState('');
  const [connected, setConnected] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);
  const clearToast = useCallback(() => setToast(null), []);

  const hasDomain = !!user?.hospitalId;
  const slug = user?.hospitalId || '';
  const domain = hasDomain ? `${slug}.medihost.co.in` : '';
  const isLab = user?.role === 'LAB_TECHNICIAN';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
      showToast(`Copied ${label} to clipboard`, 'success');
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      showToast('Please enter a domain name to search', 'error');
      return;
    }
    setSearching(true);
    setTimeout(() => {
      setSearchResults(MOCK_SEARCH_RESULTS);
      setSearching(false);
    }, 1200);
  };

  const handleConnect = () => {
    if (!connectDomain.trim()) {
      showToast('Please enter your domain name', 'error');
      return;
    }
    setConnected(true);
    showToast(`Domain ${connectDomain} connected! Configure DNS records below.`, 'success');
  };

  if (!user) {
    return (
      <Card>
        <CardContent>
          <p className="py-8 text-center text-gray-500">Not authenticated. Please log in again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domain Management</h1>
          <p className="text-sm text-gray-500">Manage your custom domain and DNS settings</p>
        </div>
      </div>

      {hasDomain ? (
        /* ---- HAS DOMAIN ---- */
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <GlobeIcon className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{domain}</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Live</Badge>
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <LockIcon className="h-3 w-3" /> SSL Active
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Visit Site
                  <ExternalLinkIcon className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Storefront Links */}
          <Card>
            <CardHeader>
              <CardTitle>Storefront Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <LinkCard
                  title="Website URL"
                  url={`https://${domain}`}
                  icon={<GlobeIcon className="h-5 w-5 text-emerald-600" />}
                  onCopy={() => copyToClipboard(`https://${domain}`, 'Website URL')}
                  copied={copiedField === 'Website URL'}
                />
                <LinkCard
                  title="Profile URL"
                  url={`https://medihost.co.in/${slug}`}
                  icon={<UserIcon className="h-5 w-5 text-blue-600" />}
                  onCopy={() => copyToClipboard(`https://medihost.co.in/${slug}`, 'Profile URL')}
                  copied={copiedField === 'Profile URL'}
                />
                {isLab && (
                  <>
                    <LinkCard
                      title="Lab Partner App"
                      url={`https://${domain}/lab`}
                      icon={<BeakerIcon className="h-5 w-5 text-purple-600" />}
                      onCopy={() => copyToClipboard(`https://${domain}/lab`, 'Lab Partner App')}
                      copied={copiedField === 'Lab Partner App'}
                    />
                    <LinkCard
                      title="LIS System"
                      url={`https://${domain}/lis`}
                      icon={<ClipboardIcon className="h-5 w-5 text-orange-600" />}
                      onCopy={() => copyToClipboard(`https://${domain}/lis`, 'LIS System')}
                      copied={copiedField === 'LIS System'}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* DNS Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>DNS Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 pr-4 font-medium">Type</th>
                      <th className="pb-3 pr-4 font-medium">Host</th>
                      <th className="pb-3 pr-4 font-medium">Value</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DNS_RECORDS.map((record) => (
                      <tr key={record.host} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {record.type}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-mono text-gray-700">{record.host}</td>
                        <td className="py-3 pr-4 font-mono text-gray-700">{record.value}</td>
                        <td className="py-3 pr-4">
                          {record.status === 'verified' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Verified</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
                          )}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => copyToClipboard(record.value, record.host)}
                            className="text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            {copiedField === record.host ? 'Copied!' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Domain Info */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="Domain" value={domain} />
                <InfoItem label="Registrar" value="ResellerClub" />
                <InfoItem label="SSL" value="Let's Encrypt Auto" />
                <InfoItem label="Nameservers" value="Vercel DNS" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* ---- NO DOMAIN ---- */
        <div className="space-y-6">
          {/* Empty State */}
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <GlobeIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">No Domain Set Up Yet</h2>
                <p className="max-w-md text-sm text-gray-500">
                  Get a custom domain for your business. Search for a new domain or connect one you already own.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setActiveTab('search')}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Search New Domain
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('connect')}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    Connect Existing Domain
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain Search */}
          {activeTab === 'search' && (
            <Card>
              <CardHeader>
                <CardTitle>Search for a Domain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your desired domain name (e.g. myclinic)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searching}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {searching ? (
                      <span className="flex items-center gap-2">
                        <Spinner /> Searching...
                      </span>
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>

                {searchResults && (
                  <div className="space-y-3">
                    <Separator />
                    <h3 className="text-sm font-medium text-gray-700">Results for &ldquo;{searchQuery}&rdquo;</h3>
                    {searchResults.map((result) => (
                      <div
                        key={result.domain}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-gray-900">
                            {searchQuery}
                            {result.domain}
                          </span>
                          {result.bestPick && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Best Pick</Badge>
                          )}
                          {!result.available && (
                            <Badge className="bg-red-100 text-red-600 hover:bg-red-100">Taken</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            {'\u20b9'}{result.price}
                            <span className="text-xs font-normal text-gray-500">/yr</span>
                          </span>
                          {result.available ? (
                            <Button
                              size="sm"
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                              onClick={() => showToast(`Added ${searchQuery}${result.domain} to cart!`, 'success')}
                            >
                              Get it
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              Unavailable
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Connect Existing Domain */}
          {activeTab === 'connect' && (
            <Card>
              <CardHeader>
                <CardTitle>Connect Existing Domain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your domain (e.g. myclinic.com)"
                    value={connectDomain}
                    onChange={(e) => setConnectDomain(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleConnect}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Connect
                  </Button>
                </div>

                {connected && (
                  <div className="space-y-3">
                    <Separator />
                    <h3 className="text-sm font-medium text-gray-700">
                      Configure these DNS records at your domain registrar:
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-gray-500">
                            <th className="pb-3 pr-4 font-medium">Type</th>
                            <th className="pb-3 pr-4 font-medium">Host</th>
                            <th className="pb-3 pr-4 font-medium">Value</th>
                            <th className="pb-3 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DNS_RECORDS.map((record) => (
                            <tr key={record.host} className="border-b last:border-0">
                              <td className="py-3 pr-4">
                                <Badge variant="secondary" className="font-mono text-xs">{record.type}</Badge>
                              </td>
                              <td className="py-3 pr-4 font-mono text-gray-700">{record.host}</td>
                              <td className="py-3 pr-4 font-mono text-gray-700">{record.value}</td>
                              <td className="py-3">
                                <button
                                  onClick={() => copyToClipboard(record.value, `connect-${record.host}`)}
                                  className="text-xs text-emerald-600 hover:text-emerald-700"
                                >
                                  {copiedField === `connect-${record.host}` ? 'Copied!' : 'Copy'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500">
                      DNS changes can take up to 48 hours to propagate. We will verify automatically.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function LinkCard({
  title,
  url,
  icon,
  onCopy,
  copied,
}: {
  title: string;
  url: string;
  icon: React.ReactNode;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block truncate text-xs text-emerald-600 hover:underline"
      >
        {url}
      </a>
      <button
        onClick={onCopy}
        className="mt-2 text-xs text-gray-500 hover:text-emerald-600"
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-gray-900">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 3h15M6 3v16a2 2 0 002 2h8a2 2 0 002-2V3" />
      <path d="M6 14h12" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
