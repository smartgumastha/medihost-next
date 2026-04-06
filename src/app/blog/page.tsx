export const metadata = { title: 'Blog — MediHost™ AI' };

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span><sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup> AI
        </a>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">Blog &mdash; Coming Soon</h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-slate-400 leading-relaxed space-y-4">
          <p>
            We are working on sharing our journey of building MediHost &mdash; the challenges, the decisions,
            and the lessons of building healthcare technology in India.
          </p>
          <p>
            Check back soon for articles on <strong className="text-white">healthtech</strong>,{' '}
            <strong className="text-white">clinic digitization</strong>,{' '}
            <strong className="text-white">AI in healthcare</strong>, and{' '}
            <strong className="text-white">startup building</strong>.
          </p>
          <p>
            Want to be notified?{' '}
            <a href="mailto:info@medihost.in?subject=Notify me about the blog" className="text-emerald-400 hover:underline">
              Drop us an email
            </a>{' '}
            and we&apos;ll let you know when we publish.
          </p>
        </div>
      </div>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 SmartGumastha Technologies &middot; MediHost&trade; AI &mdash; Clinic Software That Works
      </footer>
    </div>
  );
}
