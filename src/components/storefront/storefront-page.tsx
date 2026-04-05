import { BookingForm } from './booking-form';

interface ClinicData {
  id: number;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  website_theme: string;
  website_logo_url: string;
  website_content: {
    tagline: string;
    about: string;
    features: string[];
    stats: Record<string, string>;
    contact: { address: string };
  };
}

const THEMES: Record<string, { primary: string; light: string; dark: string }> = {
  blue: { primary: '#2563eb', light: '#dbeafe', dark: '#1d4ed8' },
  teal: { primary: '#0d9488', light: '#ccfbf1', dark: '#0f766e' },
  purple: { primary: '#7c3aed', light: '#ede9fe', dark: '#6d28d9' },
  coral: { primary: '#ea580c', light: '#fff7ed', dark: '#c2410c' },
  green: { primary: '#16a34a', light: '#dcfce7', dark: '#15803d' },
  mint: { primary: '#0FA67A', light: '#e6f7f0', dark: '#0B8C66' },
};

function getTheme(themeName: string) {
  return THEMES[themeName] || THEMES.mint;
}

export function StorefrontPage({ clinic, domain }: { clinic: ClinicData; domain: string }) {
  const content = clinic.website_content;

  // If no website_content, show coming soon
  if (!content || (!content.tagline && !content.about)) {
    return <ComingSoon name={clinic.business_name} />;
  }

  const theme = getTheme(clinic.website_theme);
  const features = content.features || [];
  const stats = content.stats || {};
  const contact = content.contact || { address: '' };
  const address = contact.address || [clinic.city, clinic.state].filter(Boolean).join(', ');

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: '#1f2937' }}>
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {clinic.website_logo_url && (
              <img
                src={clinic.website_logo_url}
                alt={clinic.business_name}
                style={{ height: 40, width: 40, borderRadius: 8, objectFit: 'cover' }}
              />
            )}
            <span style={{ fontSize: 20, fontWeight: 700, color: theme.primary }}>{clinic.business_name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {clinic.phone && (
              <a href={`tel:${clinic.phone}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>
                {clinic.phone}
              </a>
            )}
            <a
              href="#booking"
              style={{
                backgroundColor: theme.primary,
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Book Appointment
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ backgroundColor: theme.light, padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#111827', marginBottom: 16, lineHeight: 1.2 }}>
            {content.tagline || clinic.business_name}
          </h1>
          {content.about && (
            <p style={{ fontSize: 18, color: '#4b5563', lineHeight: 1.7, marginBottom: 32, maxWidth: 640, margin: '0 auto 32px' }}>
              {content.about}
            </p>
          )}
          {features.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
              {features.map((f, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: '#ffffff',
                    color: theme.primary,
                    border: `1px solid ${theme.primary}33`,
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <TrustBadge icon="shield" text="Verified Clinic" />
            <TrustBadge icon="clock" text="Online Booking" />
            <TrustBadge icon="star" text="Trusted by Patients" />
          </div>
        </div>
      </section>

      {/* Stats */}
      {Object.keys(stats).length > 0 && (
        <section style={{ padding: '60px 24px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, textAlign: 'center' }}>
            {Object.entries(stats).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 36, fontWeight: 800, color: theme.primary }}>{value}</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4, textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Doctors */}
      <section style={{ padding: '60px 24px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Our Doctors</h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>Meet our experienced medical professionals</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 24,
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    backgroundColor: theme.light,
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    color: theme.primary,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Doctor {i}</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Specialist</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '60px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Our Services</h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>Comprehensive healthcare services for you and your family</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {(features.length > 0 ? features : ['Consultation', 'Diagnostics', 'Treatment']).map((svc, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: theme.light,
                  borderRadius: 12,
                  padding: '24px 16px',
                  border: `1px solid ${theme.primary}1a`,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: theme.dark }}>{svc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" style={{ padding: '60px 24px', backgroundColor: theme.light }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>Book an Appointment</h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32, textAlign: 'center' }}>Fill out the form below and we will get back to you</p>
          <BookingForm theme={theme} clinicPhone={clinic.phone} domain={domain} />
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: '60px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 32, textAlign: 'center' }}>Contact Us</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            <div>
              {address && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Address</div>
                  <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{address}</div>
                </div>
              )}
              {clinic.phone && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Phone</div>
                  <a href={`tel:${clinic.phone}`} style={{ fontSize: 15, color: theme.primary, textDecoration: 'none' }}>{clinic.phone}</a>
                </div>
              )}
              {clinic.email && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email</div>
                  <a href={`mailto:${clinic.email}`} style={{ fontSize: 15, color: theme.primary, textDecoration: 'none' }}>{clinic.email}</a>
                </div>
              )}
              {clinic.phone && (
                <a
                  href={`https://wa.me/91${clinic.phone.replace(/\D/g, '').slice(-10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 14,
                    marginTop: 8,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              )}
            </div>
            <div>
              {clinic.latitude && clinic.longitude ? (
                <div
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    height: 280,
                  }}
                >
                  <iframe
                    src={`https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}&z=15&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Clinic Location"
                  />
                </div>
              ) : (
                <div
                  style={{
                    borderRadius: 12,
                    height: 280,
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: 14,
                  }}
                >
                  Map location coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>{clinic.business_name}</div>
          {address && <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 16 }}>{address}</div>}
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://medihost.in" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
              MediHost
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0FA67A" strokeWidth="2" style={{ margin: '0 auto' }}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 8 }}>{name}</h1>
        <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 32 }}>Our website is coming soon.</p>
        <a
          href="https://medihost.in"
          style={{
            backgroundColor: '#0FA67A',
            color: '#ffffff',
            padding: '12px 28px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Learn about MediHost
        </a>
      </div>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  const icons: Record<string, React.ReactNode> = {
    shield: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    clock: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    star: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14 }}>
      {icons[icon]}
      <span>{text}</span>
    </div>
  );
}
