export const metadata = {
  title: 'Download Desktop App — MediHost HMS',
  description: 'Download MediHost HMS desktop app for Windows.',
};

export default function DesktopDownloadPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">M</div>
            <span className="text-xl font-bold text-white tracking-tight">MediHost HMS</span>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h1 className="text-2xl font-extrabold text-white text-center mb-1">Desktop App for Windows</h1>
          <p className="text-sm text-slate-400 text-center mb-6">Your complete clinic software — runs natively on your PC</p>

          {/* Download button */}
          <a
            href="/desktop/MediHost-HMS-Setup-1.0.0.exe"
            download
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-base font-bold rounded-full hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-[0.98] mb-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10M10 13l-4-4M10 13l4-4M3 17h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download for Windows
          </a>
          <p className="text-center text-[11px] text-slate-500 mb-6">Version 1.0.0 · 96 MB · Windows 10+ (64-bit)</p>

          {/* What's included */}
          <div className="border border-white/10 rounded-2xl overflow-hidden mb-6">
            <div className="px-4 py-2.5 bg-white/5 border-b border-white/10">
              <span className="text-xs font-bold text-white">What&apos;s included</span>
            </div>
            {[
              { icon: '🎫', label: 'OPD Queue Management' },
              { icon: '📋', label: 'EMR — Electronic Medical Records' },
              { icon: '🧾', label: 'Billing & GST Invoices' },
              { icon: '🔬', label: 'LIS — Lab Information System' },
              { icon: '💊', label: 'Pharmacy POS' },
              { icon: '🔔', label: 'System tray — always accessible' },
              { icon: '🔄', label: 'Auto-updates — always latest version' },
            ].map(function (item) {
              return (
                <div key={item.label} className="px-4 py-2.5 border-b border-white/5 flex items-center gap-3">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-slate-300">{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* How to install */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-bold text-white">How to install</h3>
            {[
              'Download the .exe file above',
              'Double-click to run the installer',
              'Login with your MediHost account',
            ].map(function (step, i) {
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-xs text-slate-400">{step}</span>
                </div>
              );
            })}
          </div>

          {/* Back link */}
          <div className="text-center">
            <a href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to dashboard
            </a>
          </div>
        </div>

        {/* Don't have account */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/signup?intent=hms" className="text-emerald-400 font-semibold hover:text-emerald-300">Sign up free</a>
        </p>
      </div>
    </div>
  );
}
