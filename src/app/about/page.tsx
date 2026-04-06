export const metadata = { title: 'About MediHost AI™' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span> AI<sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup>
        </a>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">About MediHost</h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-slate-400 leading-relaxed space-y-4">
          <p>
            <strong className="text-white">MediHost AI&trade;</strong> is built by{' '}
            <strong className="text-white">SmartGumastha Technologies</strong>, Hyderabad, Telangana, India.
          </p>
          <p>
            Founded by <strong className="text-white">Sai Charan Kumar Pakala</strong> with 13 years of healthcare domain
            experience, MediHost is on a mission to give every clinic, lab, and medical practice a professional digital
            identity &mdash; powered by AI, delivered in 60 seconds.
          </p>
          <p>
            We believe healthcare providers should focus on patients, not technology. MediHost handles everything else
            &mdash; website, domain, appointments, billing, EMR, marketing &mdash; so doctors can do what they do best.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-6">
            <p className="text-sm"><strong className="text-white">Contact:</strong>{' '}
              <a href="mailto:info@medihost.in" className="text-emerald-400 hover:underline">info@medihost.in</a>
            </p>
            <p className="text-sm"><strong className="text-white">Phone:</strong>{' '}
              <a href="tel:+917993135689" className="text-emerald-400 hover:underline">+91 7993 135 689</a>
            </p>
            <p className="text-sm"><strong className="text-white">Location:</strong> Hyderabad, Telangana, India</p>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 SmartGumastha Technologies &middot; MediHost AI&trade; &mdash; Clinic Software That Works
      </footer>
    </div>
  );
}
