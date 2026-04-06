export const metadata = { title: 'HIPAA Compliance — MediHost AI™' };

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span> AI<sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup>
        </a>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">HIPAA Compliance</h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-slate-400 leading-relaxed">
          <p>This page is being updated. For queries, email <a href="mailto:info@medihost.in" className="text-emerald-400 font-medium hover:underline">info@medihost.in</a></p>
        </div>
      </div>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 SmartGumastha Technologies &middot; MediHost AI&trade; &mdash; Clinic Software That Works
      </footer>
    </div>
  );
}
