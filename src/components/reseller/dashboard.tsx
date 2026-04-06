'use client';

import { useEffect, useState } from 'react';

// TODO: Replace mock data with API calls
const MOCK_REFERRALS = [
  { clinic: 'Dr. Sharma Clinic', plan: 'Professional', status: 'Active', date: 'Mar 15', commission: '₹500' },
  { clinic: 'City Dental Care', plan: 'Starter', status: 'Active', date: 'Mar 20', commission: '₹500' },
  { clinic: 'LifeCare Diagnostics', plan: 'Free', status: 'Trial', date: 'Mar 25', commission: '₹100' },
  { clinic: 'Dr. Patel ENT', plan: 'Professional', status: 'Pending', date: 'Apr 1', commission: '—' },
  { clinic: 'Sunrise Physiotherapy', plan: 'Starter', status: 'Active', date: 'Feb 10', commission: '₹500' },
];

const BRAND_KIT_ITEMS = [
  { name: 'Logo Pack', icon: '🎨' },
  { name: 'WhatsApp Status Images', icon: '📱' },
  { name: 'Instagram Templates', icon: '📸' },
  { name: 'Pitch Deck', icon: '📊' },
];

interface AIContent {
  whatsapp: string;
  linkedin: string;
  instagram: string;
}

export function ResellerDashboard() {
  const [refCode, setRefCode] = useState('');
  const [resellerName, setResellerName] = useState('');
  const [copied, setCopied] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [aiContent, setAiContent] = useState<AIContent | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const code = localStorage.getItem('reseller_ref_code') || 'MH-DEMO1234';
    const name = localStorage.getItem('reseller_name') || 'Reseller';
    setRefCode(code);
    setResellerName(name);
  }, []);

  const refLink = `medihost.in/signup?ref=${refCode}`;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey! MediHost AI gives clinics a professional website + appointments + billing — all free to start. Sign up: https://${refLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareLinkedIn = () => {
    const url = encodeURIComponent(`https://${refLink}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const generateContent = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/reseller-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty, city, refLink: `https://${refLink}` }),
      });
      const data = await res.json();
      if (data.success) setAiContent(data.content);
    } catch {
      // Silently fail — user can retry
    } finally {
      setAiLoading(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'Active') return 'text-emerald-400 bg-emerald-500/10';
    if (status === 'Trial') return 'text-yellow-400 bg-yellow-500/10';
    return 'text-slate-400 bg-white/5';
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <nav className="border-b border-white/10 h-14 flex items-center px-6 justify-between">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span><sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup> AI
        </a>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{resellerName}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
            {refCode}
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Reseller Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Signups This Month', value: '3', sub: '' },
            { label: 'Active Clients', value: '8', sub: '' },
            { label: 'Total Earned', value: '₹4,200', sub: '' },
            { label: 'Pending Payout', value: '₹1,200', sub: 'Payout on 10th' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-sm text-slate-400 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              {s.sub && <p className="text-xs text-emerald-400 mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Referral Link */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Your Referral Link</h2>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 mb-4">
            <span className="text-sm text-slate-300 flex-1 truncate">https://{refLink}</span>
            <button
              onClick={() => copyText(`https://${refLink}`, 'link')}
              className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0"
            >
              {copied === 'link' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
            >
              Share on WhatsApp
            </button>
            <button
              onClick={shareLinkedIn}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Share on LinkedIn
            </button>
          </div>
        </div>

        {/* AI Content Generator */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Generate Marketing Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Specialty (e.g. Dental Clinic, General Physician)"
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-purple-500/50 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Hyderabad)"
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-purple-500/50 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={generateContent}
            disabled={aiLoading}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
          >
            {aiLoading ? 'Generating...' : 'Generate with AI'}
          </button>

          {aiContent && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {([
                { key: 'whatsapp' as const, label: 'WhatsApp Message', color: 'emerald' },
                { key: 'linkedin' as const, label: 'LinkedIn Post', color: 'blue' },
                { key: 'instagram' as const, label: 'Instagram Caption', color: 'pink' },
              ]).map((item) => (
                <div key={item.key} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">{item.label}</span>
                    <button
                      onClick={() => copyText(aiContent[item.key], item.key)}
                      className="text-xs px-2 py-1 rounded bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      {copied === item.key ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{aiContent[item.key]}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referral History */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Referral History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Clinic Name</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Signed Up</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Commission</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REFERRALS.map((r) => (
                  <tr key={r.clinic} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{r.clinic}</td>
                    <td className="py-3 px-4 text-slate-300">{r.plan}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{r.date}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{r.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'This Month', value: '₹1,200', sub: '3 referrals' },
              { label: 'Last Month', value: '₹2,500', sub: '5 referrals' },
              { label: 'Total All-Time', value: '₹4,200', sub: '' },
              { label: 'Next Payout', value: '₹1,200', sub: 'Apr 10' },
            ].map((e) => (
              <div key={e.label} className="text-center">
                <p className="text-sm text-slate-400 mb-1">{e.label}</p>
                <p className="text-xl font-bold text-white">{e.value}</p>
                {e.sub && <p className="text-xs text-slate-500 mt-0.5">{e.sub}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Brand Kit */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Download Brand Kit</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BRAND_KIT_ITEMS.map((item) => (
              <div
                key={item.name}
                className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:border-emerald-500/30 transition-colors cursor-pointer"
              >
                <span className="text-2xl block mb-2">{item.icon}</span>
                <p className="text-sm text-white mb-2">{item.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
