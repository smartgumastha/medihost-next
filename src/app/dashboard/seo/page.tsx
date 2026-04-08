export const metadata = { title: 'SEO Optimizer — MediHost' };

export default function SeoPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-900">SEO Optimizer</h1>
        <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#FAEEDA', color: '#854F0B', padding: '2px 6px', borderRadius: 4 }}>Pro</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <h2 className="text-base font-bold text-gray-700">Coming soon</h2>
        <p className="text-sm text-gray-500 mt-1">AI-powered SEO analysis, keyword optimization, and Google ranking improvements.</p>
      </div>
    </div>
  );
}
