'use client';

import { useState } from 'react';
import type { AuthUser } from '@/lib/auth';

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Urdu'];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #E5E5E3' }}>
      <span style={{ fontSize: 14, color: '#6B7280' }}>{label}</span>
      <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{children}</div>
    </div>
  );
}

export function SettingsContent({ user }: { user: AuthUser | null }) {
  const [language, setLanguage] = useState('English');
  const [notifAppointments, setNotifAppointments] = useState(true);
  const [notifTrial, setNotifTrial] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  return (
    <div style={{ maxWidth: 560 }} className="space-y-6">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Account Settings</h2>

      {/* Section 1: Login credentials */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Login credentials</h3>
        <Row label="Email">{user?.email || '—'}</Row>
        <Row label="Password">
          {showPasswordForm ? (
            <div className="flex items-center gap-2">
              <input type="password" placeholder="New password" className="border border-gray-300 rounded-md px-2 py-1 text-xs w-32" />
              <button onClick={() => { setShowPasswordForm(false); showToast('Password updated'); }} className="text-xs font-medium text-white bg-emerald-600 px-2 py-1 rounded-md">Save</button>
              <button onClick={() => setShowPasswordForm(false)} className="text-xs text-gray-500">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>**********</span>
              <button onClick={() => setShowPasswordForm(true)} style={{ fontSize: 11, color: '#0F6E56', fontWeight: 500 }}>Change password</button>
            </div>
          )}
        </Row>
        <Row label="Phone">{user?.name ? '—' : '—'}</Row>
      </div>

      {/* Section 2: Preferences */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Preferences</h3>
        <Row label="Language">
          <select value={language} onChange={e => setLanguage(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-transparent outline-none">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </Row>
        <Row label="Timezone">
          <span style={{ color: '#78776F' }}>Asia/Kolkata (IST)</span>
        </Row>
      </div>

      {/* Section 3: Notifications */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Notifications</h3>
        <Row label="Email notifications">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifAppointments} onChange={e => setNotifAppointments(e.target.checked)} className="rounded border-gray-300 text-emerald-600" />
            <span style={{ fontSize: 11 }}>New appointments</span>
          </label>
        </Row>
        <Row label="Trial reminders">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifTrial} onChange={e => setNotifTrial(e.target.checked)} className="rounded border-gray-300 text-emerald-600" />
            <span style={{ fontSize: 11 }}>Email me before trial expires</span>
          </label>
        </Row>
        <Row label="Marketing">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifMarketing} onChange={e => setNotifMarketing(e.target.checked)} className="rounded border-gray-300 text-emerald-600" />
            <span style={{ fontSize: 11 }}>Product updates and tips</span>
          </label>
        </Row>
      </div>

      {/* Section 4: Danger zone */}
      <div className="bg-white border border-red-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>Danger zone</h3>
        <p style={{ fontSize: 11, color: '#78776F', marginBottom: 12 }}>Deleting your account removes all data permanently. This cannot be undone.</p>
        <button className="text-xs font-medium text-red-600 border border-red-300 rounded-md px-3 py-1.5 hover:bg-red-50 transition-colors">
          Delete my account
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium">{toast}</div>
      )}
    </div>
  );
}
