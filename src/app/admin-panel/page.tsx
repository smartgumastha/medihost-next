'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/shell';
import { AdminOverview } from '@/components/admin/overview';
import { type AuthUser } from '@/lib/auth';

export default function AdminPanelPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = document.cookie.split('; ').find(r => r.startsWith('medihost_auth='));
      if (!raw) { window.location.href = '/login'; return; }
      const decoded = decodeURIComponent(raw.split('=').slice(1).join('='));
      const parsed = JSON.parse(decoded) as AuthUser;
      if (!parsed || parsed.is_super_admin !== true) {
        alert('Admin access denied. is_super_admin: ' + parsed?.is_super_admin);
        window.location.href = '/dashboard';
        return;
      }
      setUser(parsed);
    } catch (err) {
      console.error('Admin auth error:', err);
      window.location.href = '/login';
    }
  }, []);

  if (!user) return <div style={{padding:'40px',textAlign:'center',color:'#534AB7'}}>Checking admin access...</div>;

  return <AdminShell user={user}><AdminOverview /></AdminShell>;
}
