import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { SetupChecklist } from '@/components/dashboard/setup-checklist';

export const metadata = { title: 'Dashboard — MediHost' };

function StatCard({ label, value, note, accent }: { label: string; value: string; note: string; accent: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${accent} p-4`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs font-medium text-gray-500 mt-1">{label}</div>
      <div className="text-[10px] text-gray-400 mt-2">{note}</div>
    </div>
  );
}

function ActionCard({ label, icon, href, desc }: { label: string; icon: string; href: string; desc: string }) {
  return (
    <a href={href} className="group bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{label}</div>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </a>
  );
}

function BigAction({ label, icon, href, color }: { label: string; icon: string; href: string; color: string }) {
  return (
    <a href={href} className={`flex items-center gap-3 ${color} text-white px-5 py-4 rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-sm`}>
      <span className="text-xl">{icon}</span>
      {label}
    </a>
  );
}

// ── ADMIN / OWNER DASHBOARD ──────────────────────────────
function AdminDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center">
          <div className="w-1 self-stretch bg-gradient-to-b from-emerald-400 to-emerald-600 shrink-0" />
          <div className="flex items-center justify-between flex-1 p-5 sm:p-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Welcome back, {name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Your clinic control center</p>
            </div>
            <a href="/dashboard/hms?module=opd" className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              🏥 Open Clinic Software
            </a>
          </div>
        </div>
      </div>

      <SetupChecklist />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue Today" value="₹0" note="After first bill" accent="border-l-emerald-500" />
        <StatCard label="OPD Today" value="0" note="After first token" accent="border-l-blue-500" />
        <StatCard label="Website Visits" value="0" note="After go-live" accent="border-l-violet-500" />
        <StatCard label="Google Reviews" value="0" note="After go-live" accent="border-l-amber-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard label="View OPD Queue" icon="🎫" href="/dashboard/hms?module=opd" desc="See today's patient queue" />
        <ActionCard label="Collection Report" icon="📊" href="/dashboard/hms?module=billing" desc="Download today's collection" />
        <ActionCard label="Create AI Post" icon="📢" href="/dashboard/marketing" desc="Generate social media content" />
        <ActionCard label="Add New Doctor" icon="⚕️" href="/dashboard/doctors" desc="Add a doctor to your clinic" />
      </div>
    </div>
  );
}

// ── RECEPTIONIST DASHBOARD ───────────────────────────────
function ReceptionistDashboard({ name }: { name: string }) {
  var today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Good morning, {name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="OPD Today" value="0" note="Tokens issued" accent="border-l-blue-500" />
        <StatCard label="Waiting Now" value="0" note="In queue" accent="border-l-amber-500" />
        <StatCard label="Bills Pending" value="0" note="Unsettled" accent="border-l-red-500" />
        <StatCard label="Appointments" value="0" note="This hour" accent="border-l-violet-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BigAction label="Register New Patient" icon="👤" href="/dashboard/hms?module=opd" color="bg-emerald-600" />
        <BigAction label="Issue Token" icon="🎫" href="/dashboard/hms?module=opd" color="bg-blue-600" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Next in Queue</h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-2 opacity-40">🎫</div>
          <p className="text-sm text-gray-400">No patients in queue — issue a token to start</p>
        </div>
      </div>
    </div>
  );
}

// ── DOCTOR DASHBOARD ─────────────────────────────────────
function DoctorDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Dr. {name}</h1>
        <span className="inline-block mt-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Doctor</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients Waiting" value="0" note="In your queue" accent="border-l-emerald-500" />
        <StatCard label="Consultations" value="0" note="Today" accent="border-l-blue-500" />
        <StatCard label="Lab Results" value="0" note="Pending" accent="border-l-amber-500" />
        <StatCard label="Follow-ups Due" value="0" note="This week" accent="border-l-violet-500" />
      </div>

      <BigAction label="Start Consultation" icon="📋" href="/dashboard/hms?module=emr" color="bg-emerald-600" />

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">My Schedule Today</h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-2 opacity-40">📅</div>
          <p className="text-sm text-gray-400">No appointments scheduled yet</p>
        </div>
      </div>
    </div>
  );
}

// ── LAB TECHNICIAN DASHBOARD ─────────────────────────────
function LabDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Welcome, {name}</h1>
        <span className="inline-block mt-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Lab Technician</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Samples" value="0" note="To collect" accent="border-l-amber-500" />
        <StatCard label="Results to Enter" value="0" note="Awaiting input" accent="border-l-blue-500" />
        <StatCard label="TAT Alerts" value="0" note="Overdue" accent="border-l-red-500" />
        <StatCard label="Low Stock" value="0" note="Reagents" accent="border-l-violet-500" />
      </div>

      <BigAction label="Enter Lab Result" icon="🔬" href="/dashboard/hms?module=lis" color="bg-blue-600" />
    </div>
  );
}

// ── BILLING DASHBOARD ────────────────────────────────────
function BillingDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Welcome, {name}</h1>
        <span className="inline-block mt-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Billing</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Bills Today" value="0" note="Created" accent="border-l-emerald-500" />
        <StatCard label="Revenue Collected" value="₹0" note="Today" accent="border-l-blue-500" />
        <StatCard label="Pending Payments" value="₹0" note="Outstanding" accent="border-l-red-500" />
        <StatCard label="Avg Bill Value" value="₹0" note="This month" accent="border-l-amber-500" />
      </div>

      <BigAction label="Create Bill" icon="🧾" href="/dashboard/hms?module=billing" color="bg-emerald-600" />
    </div>
  );
}

// ── GENERIC DASHBOARD (Nurse, Pharmacist, Manager, Patient) ─
function GenericDashboard({ name, role }: { name: string; role: string }) {
  var roleLabel = role.replace(/_/g, ' ');
  var links: { label: string; icon: string; href: string }[] = [];

  if (role === 'NURSE') {
    links = [{ label: 'OPD Queue', icon: '🏥', href: '/dashboard/hms?module=opd' }];
  } else if (role === 'PHARMACIST') {
    links = [{ label: 'Pharmacy', icon: '💊', href: '/dashboard/hms?module=pharmacy' }];
  } else if (role === 'MANAGER') {
    links = [
      { label: 'OPD Queue', icon: '🏥', href: '/dashboard/hms?module=opd' },
      { label: 'Billing', icon: '🧾', href: '/dashboard/hms?module=billing' },
      { label: 'Analytics', icon: '📈', href: '/dashboard/analytics' },
    ];
  } else {
    links = [{ label: 'My Profile', icon: '👤', href: '/dashboard/profile' }];
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Welcome, {name}</h1>
        <span className="inline-block mt-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{roleLabel}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map(function (link) {
          return (
            <a key={link.label} href={link.href} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">{link.icon}</span>
              <span className="text-sm font-semibold text-gray-900">{link.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────
export default async function DashboardPage() {
  var cookieStore = await cookies();
  var user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  var name = user?.name?.split(' ')[0] || 'Partner';
  var role = user?.role || 'HOSPITAL_ADMIN';

  switch (role) {
    case 'SUPER_ADMIN':
    case 'HOSPITAL_ADMIN':
      return <AdminDashboard name={name} />;
    case 'RECEPTIONIST':
      return <ReceptionistDashboard name={name} />;
    case 'DOCTOR':
      return <DoctorDashboard name={name} />;
    case 'LAB_TECHNICIAN':
      return <LabDashboard name={name} />;
    case 'BILLING':
      return <BillingDashboard name={name} />;
    default:
      return <GenericDashboard name={name} role={role} />;
  }
}
