export const metadata = { title: 'Welcome to MediHost' };

export default async function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to MediHost!</h1>
        <p className="text-gray-500 mb-8">Your account is ready. Your clinic&#39;s digital journey starts now.</p>
        <div className="space-y-3">
          <a href="/dashboard" className="block w-full bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold text-center hover:bg-emerald-700 transition-colors">
            Open My Dashboard
          </a>
          <a href="/" className="block text-sm text-gray-500 hover:text-emerald-600">
            Back to MediHost home
          </a>
        </div>
      </div>
    </div>
  );
}
