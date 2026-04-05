import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Sign In — MediHost',
  description: 'Sign in to your MediHost dashboard',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-[30%] -right-[30%] w-[80%] h-[80%] rounded-full bg-white/5" />
        <div className="absolute -bottom-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-white/5" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">MediHost</h1>
          <p className="text-lg opacity-80 mb-8">Your Clinic&apos;s Digital Identity</p>
          <div className="space-y-3 text-left text-sm opacity-70">
            <div className="flex items-center gap-3"><span>✓</span> AI-powered website in 60 seconds</div>
            <div className="flex items-center gap-3"><span>✓</span> Custom domain + storefront</div>
            <div className="flex items-center gap-3"><span>✓</span> Appointments, billing, EMR</div>
            <div className="flex items-center gap-3"><span>✓</span> Google Business + social marketing</div>
          </div>
        </div>
      </div>
      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">Medi<span className="text-emerald-600">Host</span></h1>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to your clinic dashboard</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
