export const metadata = { title: 'Welcome to MediHost' };

export default async function WelcomePage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] overflow-hidden p-6">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />

      {/* Floating orbs */}
      <div className="absolute top-16 left-[15%] w-3 h-3 rounded-full bg-emerald-400/30 animate-pulse" />
      <div className="absolute top-[35%] right-[10%] w-2 h-2 rounded-full bg-blue-400/30 animate-pulse" />
      <div className="absolute bottom-28 left-[25%] w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-pulse" />
      <div className="absolute bottom-20 right-[30%] w-2 h-2 rounded-full bg-blue-400/20 animate-pulse" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 text-center">
          <div className="text-6xl mb-6">&#127881;</div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Welcome to MediHost!</h1>
          <p className="text-slate-400 mb-8">Your account is ready. Your clinic&#39;s digital journey starts now.</p>
          <div className="space-y-3">
            <a
              href="/dashboard"
              className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 px-6 rounded-full font-bold text-center hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Open My Dashboard
            </a>
            <a href="/" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">
              Back to MediHost home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
