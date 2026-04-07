'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

var HMS_BASE = 'https://app.hemato.in';

var MODULE_LABELS: Record<string, string> = {
  opd: 'OPD Queue',
  emr: 'EMR',
  billing: 'Billing',
  lis: 'LIS — Lab Reports',
  pharmacy: 'Pharmacy',
  appointments: 'Appointments',
};

function HmsIframe() {
  var searchParams = useSearchParams();
  var moduleName = searchParams.get('module') || 'opd';

  var [iframeSrc, setIframeSrc] = useState('');
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');

  useEffect(function () {
    // Call backend to get HMS token (signed with HMS secret)
    fetch('/api/auth/hms-token', { method: 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success && data.hms_token) {
          var hmsToken = data.hms_token;
          var hospitalId = String(data.hospital_id || '');

          // Build login data for HMS auto-login
          var loginData = encodeURIComponent(JSON.stringify({
            token: hmsToken,
            hospitalId: hospitalId,
            userid: String(data.user_id || ''),
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            role: data.role || 'HOSPITAL_ADMIN',
            role_id: 2,
          }));

          var src = HMS_BASE
            + '?module=' + encodeURIComponent(moduleName)
            + '&mw_token=' + encodeURIComponent(hmsToken)
            + '&mw_hospital_id=' + encodeURIComponent(hospitalId)
            + '&mw_login_data=' + loginData;

          setIframeSrc(src);
        } else {
          setError(data.error || 'Could not connect to HMS. Please complete onboarding first.');
        }
      })
      .catch(function () {
        setError('Network error. Please try again.');
      })
      .finally(function () {
        setLoading(false);
      });
  }, [moduleName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-gray-400 text-sm">
        <div className="text-center">
          <div className="animate-pulse mb-2">Connecting to {MODULE_LABELS[moduleName] || 'HMS'}...</div>
          <div className="text-xs text-gray-300">Authenticating with clinic software</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-3">🏥</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">HMS Not Connected</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={function () { window.location.reload(); }}
              className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Try again
            </button>
            <p className="text-xs text-gray-400">
              Or click &quot;Clinic Software&quot; in the top bar to open HMS in a new tab.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Module header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-white border-b border-gray-200">
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
        style={{ height: 'calc(100vh - 6rem)', minHeight: '500px' }}
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
