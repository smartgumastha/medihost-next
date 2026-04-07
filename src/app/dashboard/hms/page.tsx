'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

var HMS_BASE = 'https://app.hemato.in';

function HmsIframe() {
  var searchParams = useSearchParams();
  var moduleName = searchParams.get('module') || 'opd';

  var [iframeSrc, setIframeSrc] = useState('');
  var [loading, setLoading] = useState(true);

  useEffect(function () {
    // Read auth from cookie
    var token = '';
    var hospitalId = '';
    var match = document.cookie.split('; ').find(function (r) { return r.startsWith('medihost_auth='); });
    if (match) {
      try {
        var auth = JSON.parse(decodeURIComponent(match.split('=')[1]));
        token = auth.hmsToken || auth.token || '';
        hospitalId = String(auth.hospitalId || '');
      } catch { /* silent */ }
    }
    if (!token) {
      try { token = localStorage.getItem('medihost_token') || ''; } catch { /* silent */ }
    }

    var src = HMS_BASE + '?module=' + encodeURIComponent(moduleName);
    if (token) src += '&mw_token=' + encodeURIComponent(token);
    if (hospitalId) src += '&mw_hospital_id=' + encodeURIComponent(hospitalId);

    setIframeSrc(src);
    setLoading(false);
  }, [moduleName]);

  var MODULE_LABELS: Record<string, string> = {
    opd: 'OPD Queue',
    emr: 'EMR',
    billing: 'Billing',
    lis: 'LIS — Lab Reports',
    pharmacy: 'Pharmacy',
    appointments: 'Appointments',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-gray-400 text-sm">
        Loading {MODULE_LABELS[moduleName] || 'HMS'}...
      </div>
    );
  }

  return (
    <div className="-m-6">
      {/* Module header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{MODULE_LABELS[moduleName] || 'HMS'}</span>
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Live</span>
        </div>
        <a
          href={iframeSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Open in new tab →
        </a>
      </div>

      {/* HMS iframe */}
      <iframe
        src={iframeSrc}
        className="w-full border-0"
        style={{ height: 'calc(100vh - 3.5rem - 2.5rem)' }}
        allow="clipboard-write; clipboard-read"
        title={MODULE_LABELS[moduleName] || 'HMS'}
      />
    </div>
  );
}

export default function HmsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-gray-400 text-sm">
        Loading HMS...
      </div>
    }>
      <HmsIframe />
    </Suspense>
  );
}
