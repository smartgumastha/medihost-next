export const metadata = { title: 'Careers — MediHost AI™' };

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span> AI<sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup>
        </a>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">Careers</h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-slate-400 leading-relaxed space-y-4">
          <p>
            We are a small but growing team building the future of healthcare technology in India.
          </p>
          <p>
            If you are passionate about <strong className="text-white">healthcare technology</strong>, love building products
            that make a real difference, and want to be part of an early-stage startup with massive potential &mdash;
            we&apos;d love to hear from you.
          </p>
          <p>
            We value builders who ship fast, think from first principles, and care about the end user (doctors and patients).
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-6">
            <p className="text-sm"><strong className="text-white">Write to us:</strong>{' '}
              <a href="mailto:careers@medihost.in" className="text-emerald-400 hover:underline">careers@medihost.in</a>
            </p>
            <p className="text-sm mt-2 text-slate-500">Include your resume, a link to something you&apos;ve built, and why MediHost excites you.</p>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 SmartGumastha Technologies &middot; MediHost AI&trade; &mdash; Clinic Software That Works
      </footer>
    </div>
  );
}
