'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { type AuthUser, getAuthFromClient } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = document.cookie.split('; ').find(r => r.startsWith('medihost_auth='));
      if (!raw) {
        router.replace('/login');
        return;
      }
      const decoded = decodeURIComponent(raw.split('=').slice(1).join('='));
      const parsed = JSON.parse(decoded) as AuthUser;

      if (!parsed || !parsed.is_super_admin) {
        console.log('Admin access denied. is_super_admin:', parsed?.is_super_admin);
        router.replace('/dashboard');
        return;
      }

      setUser(parsed);
    } catch (err) {
      console.error('Admin auth error:', err);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'#534AB7',fontSize:'14px'}}>Loading admin panel...</div>;
  }

  if (!user) {
    return null;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
