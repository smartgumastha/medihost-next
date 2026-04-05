import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = { title: 'Reset Password — MediHost' };

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Medi<span className="text-emerald-600">Host</span></h1>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Reset your password</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your email and we&#39;ll send you a reset link</p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
