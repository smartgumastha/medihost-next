import { ResellerLogin } from '@/components/reseller/login';

export const metadata = { title: 'Reseller Login — MediHost' };

export default function ResellerLoginPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Nav bar */}
      <nav className="border-b border-white/10 h-14 flex items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          MediHost<sup className="text-[8px] text-slate-500">&trade;</sup> <span className="text-emerald-400">AI</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            Home
          </a>
          <a
            href="/reseller"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Become a reseller →
          </a>
        </div>
      </nav>

      <ResellerLogin />
    </div>
  );
}
