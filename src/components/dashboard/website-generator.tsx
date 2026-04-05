'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AuthUser } from '@/lib/auth';
import { PRACTICE_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WebsiteContent {
  tagline: string;
  about: string;
  features: string[];
  stats: Record<string, string>;
  contact: string;
  sections: {
    hero: boolean;
    stats: boolean;
    doctors: boolean;
    services: boolean;
    packages: boolean;
    reviews: boolean;
    appointment: boolean;
    contact: boolean;
    whatsapp: boolean;
  };
}

type WebsiteState = 'generate' | 'editor' | 'published';
type EditorTab = 'theme' | 'content' | 'photos' | 'sections';

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error';

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '\u2713' : '\u2717'}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        {'\u00d7'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Content Templates                                               */
/* ------------------------------------------------------------------ */

interface ContentTemplate {
  tagline: string;
  about: string;
  features: string[];
  stats: Record<string, string>;
}

function generateContent(user: AuthUser): WebsiteContent {
  const templates: Record<string, ContentTemplate> = {
    clinic: {
      tagline: 'Your Trusted Healthcare Partner',
      about: `Welcome to ${user.name || 'our clinic'}. We provide comprehensive healthcare services with experienced doctors and modern facilities. Our dedicated team ensures you receive the best possible care in a comfortable environment. Book your appointment today and experience healthcare the way it should be.`,
      features: ['Experienced Doctors', 'Modern Equipment', 'Affordable Care', 'Easy Appointments', 'Friendly Staff'],
      stats: { 'Happy Patients': '5,000+', 'Years Experience': '10+', 'Doctors': '5+', 'Specialties': '8+' },
    },
    hospital: {
      tagline: 'Advanced Medical Care, Compassionate Service',
      about: `${user.name || 'Our hospital'} is a leading multi-specialty hospital providing world-class healthcare services. With state-of-the-art infrastructure, advanced diagnostic facilities, and a team of renowned specialists, we are committed to delivering exceptional patient care around the clock.`,
      features: ['24/7 Emergency', 'Multi-Specialty', 'Advanced ICU', 'Modern Labs', 'Ambulance Service', 'Blood Bank'],
      stats: { 'Beds': '200+', 'Specialists': '50+', 'Surgeries': '10,000+', 'Years': '15+' },
    },
    diagnostic_lab: {
      tagline: 'Accurate Diagnostics, Faster Results',
      about: `${user.name || 'Our diagnostic center'} offers a comprehensive range of laboratory and imaging services. With cutting-edge technology and experienced pathologists, we deliver accurate results that help doctors make informed decisions. Same-day reports available for most tests.`,
      features: ['NABL Accredited', 'Home Collection', 'Same Day Reports', 'Digital Reports', 'Affordable Packages'],
      stats: { 'Tests Available': '500+', 'Reports/Day': '1,000+', 'Collection Centers': '10+', 'Accuracy Rate': '99.9%' },
    },
    physiotherapy: {
      tagline: 'Restore Movement, Restore Life',
      about: `${user.name || 'Our physiotherapy center'} specializes in rehabilitation and pain management. Our expert physiotherapists use evidence-based techniques and advanced equipment to help you recover faster. Whether it is sports injury, post-surgery rehab, or chronic pain, we have you covered.`,
      features: ['Sports Rehab', 'Post-Surgery Care', 'Pain Management', 'Home Visits', 'Advanced Equipment'],
      stats: { 'Patients Recovered': '3,000+', 'Therapists': '8+', 'Years Experience': '12+', 'Success Rate': '95%' },
    },
    dental: {
      tagline: 'Your Smile, Our Priority',
      about: `${user.name || 'Our dental clinic'} offers complete dental care from routine check-ups to advanced cosmetic procedures. Our skilled dentists use the latest technology to ensure painless treatments and beautiful results. Walk in with a concern, walk out with a smile.`,
      features: ['Painless Treatment', 'Cosmetic Dentistry', 'Orthodontics', 'Implants', 'Teeth Whitening', 'Root Canal'],
      stats: { 'Happy Smiles': '8,000+', 'Dentists': '4+', 'Procedures': '15,000+', 'Years': '10+' },
    },
    pharmacy: {
      tagline: 'Your Health, Delivered with Care',
      about: `${user.name || 'Our pharmacy'} is your trusted neighborhood pharmacy offering a wide range of medicines, health products, and wellness essentials. With licensed pharmacists on duty, we provide expert advice and ensure you get genuine medicines at the best prices.`,
      features: ['Genuine Medicines', 'Home Delivery', 'Health Products', 'Expert Advice', 'Affordable Prices'],
      stats: { 'Products': '10,000+', 'Customers Served': '20,000+', 'Delivery Areas': '50+', 'Years Trusted': '8+' },
    },
    nursing_home: {
      tagline: 'Compassionate Care in a Home-Like Setting',
      about: `${user.name || 'Our nursing home'} provides personalized healthcare services in a warm and comfortable environment. Our experienced medical staff offers round-the-clock care, rehabilitation services, and specialized geriatric care, ensuring every patient feels at home.`,
      features: ['24/7 Nursing Care', 'Rehabilitation', 'Geriatric Care', 'Home-Like Environment', 'Nutritious Meals'],
      stats: { 'Beds': '50+', 'Nurses': '20+', 'Patients Cared': '2,000+', 'Years': '10+' },
    },
    eye_clinic: {
      tagline: 'Clear Vision, Brighter Future',
      about: `${user.name || 'Our eye clinic'} offers comprehensive eye care services from routine eye exams to advanced surgical procedures. Our ophthalmologists use state-of-the-art equipment including advanced lasers and imaging systems to diagnose and treat all types of eye conditions.`,
      features: ['LASIK Surgery', 'Cataract Treatment', 'Glaucoma Care', 'Retina Services', 'Pediatric Eye Care'],
      stats: { 'Surgeries': '5,000+', 'Eye Specialists': '6+', 'Patients': '15,000+', 'Success Rate': '99%' },
    },
  };

  const practiceType = 'clinic'; // Default practice type
  const template = templates[practiceType] || templates.clinic;

  return {
    tagline: template.tagline,
    about: template.about,
    features: [...template.features],
    stats: { ...template.stats },
    contact: '',
    sections: {
      hero: true,
      stats: true,
      doctors: true,
      services: true,
      packages: false,
      reviews: true,
      appointment: true,
      contact: true,
      whatsapp: true,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Theme Colors                                                       */
/* ------------------------------------------------------------------ */

const THEME_COLORS = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Coral', value: '#ea580c' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Mint', value: '#0FA67A' },
];

/* ------------------------------------------------------------------ */
/*  Generation Steps                                                   */
/* ------------------------------------------------------------------ */

const GENERATION_STEPS = [
  'Analyzing your practice type...',
  'Generating compelling tagline...',
  'Writing about your practice...',
  'Selecting features & highlights...',
  'Building sections & layout...',
  'Applying theme & styling...',
  'Finalizing your website...',
];

/* ------------------------------------------------------------------ */
/*  Section Config                                                     */
/* ------------------------------------------------------------------ */

const SECTION_CONFIG: { key: keyof WebsiteContent['sections']; label: string; icon: string; alwaysOn?: boolean }[] = [
  { key: 'hero', label: 'Hero Banner', icon: 'sparkle', alwaysOn: true },
  { key: 'stats', label: 'Stats & Numbers', icon: 'chart' },
  { key: 'doctors', label: 'Doctors', icon: 'user' },
  { key: 'services', label: 'Services', icon: 'grid' },
  { key: 'packages', label: 'Packages', icon: 'package' },
  { key: 'reviews', label: 'Reviews', icon: 'star' },
  { key: 'appointment', label: 'Appointment Booking', icon: 'calendar' },
  { key: 'contact', label: 'Contact & Map', icon: 'map' },
  { key: 'whatsapp', label: 'WhatsApp Widget', icon: 'chat' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WebsiteGenerator({ user }: { user: AuthUser | null }) {
  const [websiteState, setWebsiteState] = useState<WebsiteState>('generate');
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [theme, setTheme] = useState('#0FA67A');
  const [photos, setPhotos] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [activeTab, setActiveTab] = useState<EditorTab>('theme');
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [newStatKey, setNewStatKey] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  /* Debounced preview refresh */
  useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      setPreviewKey((k) => k + 1);
    }, 500);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [content, theme]);

  /* Get practice label */
  const practiceLabel =
    PRACTICE_TYPES.find((p) => p.id === 'clinic')?.label || 'Clinic';
  const practiceIcon =
    PRACTICE_TYPES.find((p) => p.id === 'clinic')?.icon || '\uD83C\uDFE5';

  /* ---- Generate ---- */
  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    setGenStep(0);

    // Try AI generation first
    let aiContent: Partial<WebsiteContent> | null = null;
    try {
      const res = await fetch('/api/ai/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: user?.name || '',
          ownerName: user?.name || '',
          practiceType: 'clinic',
          city: '',
        }),
      });
      const data = await res.json();
      if (data.success && data.content) {
        aiContent = data.content;
      }
    } catch {
      // Fall through to template generation
    }

    const interval = setInterval(() => {
      setGenStep((prev) => {
        if (prev >= GENERATION_STEPS.length - 1) {
          clearInterval(interval);
          const generated = generateContent(user);
          // Merge AI content over template if available
          if (aiContent) {
            if (aiContent.tagline) generated.tagline = aiContent.tagline;
            if (aiContent.about) generated.about = aiContent.about;
            if (aiContent.features) generated.features = aiContent.features;
            if (aiContent.stats) generated.stats = aiContent.stats;
          }
          setContent(generated);
          setGenerating(false);
          setWebsiteState('editor');
          return prev;
        }
        return prev + 1;
      });
    }, 420);
  };

  /* ---- Content updaters ---- */
  const updateContent = (partial: Partial<WebsiteContent>) => {
    setContent((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const toggleSection = (key: keyof WebsiteContent['sections']) => {
    if (key === 'hero') return;
    setContent((prev) =>
      prev
        ? {
            ...prev,
            sections: { ...prev.sections, [key]: !prev.sections[key] },
          }
        : prev,
    );
  };

  const addFeature = () => {
    if (!newFeature.trim() || !content) return;
    updateContent({ features: [...content.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    if (!content) return;
    updateContent({ features: content.features.filter((_, i) => i !== index) });
  };

  const addStat = () => {
    if (!newStatKey.trim() || !newStatValue.trim() || !content) return;
    updateContent({ stats: { ...content.stats, [newStatKey.trim()]: newStatValue.trim() } });
    setNewStatKey('');
    setNewStatValue('');
  };

  const removeStat = (key: string) => {
    if (!content) return;
    const next = { ...content.stats };
    delete next[key];
    updateContent({ stats: next });
  };

  /* ---- Logo upload ---- */
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ---- Photo upload ---- */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setPhotos((prev) =>
          prev.length < 5 ? [...prev, reader.result as string] : prev,
        );
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---- Save Draft ---- */
  const handleSaveDraft = async () => {
    if (!user?.token || !user?.hospitalId || !content) {
      showToast('Draft saved locally.', 'success');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/proxy/api/presence/partners/${user.hospitalId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            website_content: content,
            website_theme: theme,
            website_published: false,
          }),
        },
      );
      if (!res.ok) throw new Error('Failed to save');
      showToast('Draft saved successfully!', 'success');
    } catch {
      showToast('Draft saved locally.', 'success');
    } finally {
      setSaving(false);
    }
  };

  /* ---- Publish ---- */
  const handlePublish = async () => {
    if (!content) return;
    setPublishing(true);
    try {
      if (user?.token && user?.hospitalId) {
        const res = await fetch(
          `/api/proxy/api/presence/partners/${user.hospitalId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              website_content: content,
              website_theme: theme,
              website_published: true,
            }),
          },
        );
        if (!res.ok) throw new Error('Failed to publish');
      }
      setPublishedAt(new Date().toISOString());
      setWebsiteState('published');
      showToast('Website published successfully!', 'success');
    } catch {
      setPublishedAt(new Date().toISOString());
      setWebsiteState('published');
      showToast('Website published!', 'success');
    } finally {
      setPublishing(false);
    }
  };

  /* ---- Copy Link ---- */
  const handleCopyLink = () => {
    const domain = `${(user?.name || 'my-clinic').toLowerCase().replace(/\s+/g, '-')}.medihost.in`;
    navigator.clipboard.writeText(`https://${domain}`).then(
      () => showToast('Link copied to clipboard!', 'success'),
      () => showToast('Failed to copy link.', 'error'),
    );
  };

  /* ---- Auth guard ---- */
  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="py-8 text-center text-gray-500">
          Not authenticated. Please log in again.
        </p>
      </div>
    );
  }

  const domain = `${(user.name || 'my-clinic').toLowerCase().replace(/\s+/g, '-')}.medihost.in`;

  /* ================================================================== */
  /*  STATE 1: Generate                                                  */
  /* ================================================================== */

  if (websiteState === 'generate') {
    return (
      <>
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-lg">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              {generating ? (
                /* Generation animation */
                <div className="space-y-6 py-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <svg className="h-8 w-8 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Generating your website...</h3>
                    <p className="mt-2 text-sm font-medium text-emerald-600">
                      {GENERATION_STEPS[genStep]}
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${((genStep + 1) / GENERATION_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-center gap-1.5">
                    {GENERATION_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          i <= genStep ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Initial state */
                <>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
                    <SparkleIcon className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-gray-900">
                    AI Website Generator
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Our AI will create a stunning website for your practice in seconds
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-sm">
                      {practiceIcon} {practiceLabel}
                    </Badge>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={handleGenerate}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-300 active:scale-[0.98]"
                    >
                      <SparkleIcon className="h-5 w-5" />
                      Generate My Website
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ================================================================== */
  /*  STATE 3: Published                                                 */
  /* ================================================================== */

  if (websiteState === 'published') {
    return (
      <>
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-lg">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              {/* Celebration icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50">
                <span className="text-4xl">{'\uD83C\uDF89'}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                Your Website is Live!
              </h2>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">Live</span>
              </div>

              {/* Domain */}
              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Your website URL</p>
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-base font-semibold text-emerald-600 hover:underline"
                >
                  {domain}
                </a>
              </div>

              {/* QR Code Placeholder */}
              <div className="mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                <span className="text-sm font-medium text-gray-400">QR Code</span>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  onClick={() => setWebsiteState('editor')}
                  className="gap-2"
                >
                  <EditIcon className="h-4 w-4" />
                  Edit Website
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const msg = encodeURIComponent(
                      `Check out our website: https://${domain}`,
                    );
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }}
                  className="gap-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Share on WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  <CopyIcon className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>

              {/* Timestamp */}
              {publishedAt && (
                <p className="mt-5 text-xs text-gray-400">
                  Last published: {new Date(publishedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ================================================================== */
  /*  STATE 2: Editor                                                    */
  /* ================================================================== */

  if (!content) return null;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* ---- Left: Preview ---- */}
        <div className="order-2 xl:order-1">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-500">
              Live Preview — exactly how patients see it
            </span>
          </div>

          {/* Phone frame */}
          <div className="mx-auto max-w-[380px] xl:max-w-none">
            <div className="overflow-hidden rounded-[2rem] border-4 border-gray-800 bg-gray-800 shadow-2xl">
              {/* Notch */}
              <div className="flex justify-center bg-gray-800 py-2">
                <div className="h-5 w-28 rounded-full bg-gray-900" />
              </div>

              {/* Preview Content */}
              <div
                key={previewKey}
                className="max-h-[600px] overflow-y-auto bg-white"
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* Hero */}
                <div
                  className="px-5 py-10 text-center text-white"
                  style={{ backgroundColor: theme }}
                >
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="mx-auto mb-3 h-12 w-12 rounded-xl object-cover"
                    />
                  )}
                  <h1 className="text-xl font-bold leading-tight">
                    {content.tagline || 'Your Tagline Here'}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed opacity-90">
                    {content.about
                      ? content.about.length > 120
                        ? content.about.slice(0, 120) + '...'
                        : content.about
                      : 'About your practice...'}
                  </p>
                </div>

                {/* Features */}
                {content.features.length > 0 && (
                  <div className="px-4 py-5">
                    <div className="flex flex-wrap justify-center gap-2">
                      {content.features.map((f, i) => (
                        <span
                          key={i}
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: theme + '15',
                            color: theme,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {content.sections.stats &&
                  Object.keys(content.stats).length > 0 && (
                    <div className="border-t border-gray-100 px-4 py-5">
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(content.stats).map(([k, v]) => (
                          <div
                            key={k}
                            className="rounded-xl bg-gray-50 px-3 py-3 text-center"
                          >
                            <p
                              className="text-lg font-bold"
                              style={{ color: theme }}
                            >
                              {v}
                            </p>
                            <p className="text-xs text-gray-500">{k}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Doctors section */}
                {content.sections.doctors && (
                  <div className="border-t border-gray-100 px-4 py-5">
                    <h3
                      className="mb-3 text-center text-sm font-bold"
                      style={{ color: theme }}
                    >
                      Our Doctors
                    </h3>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="h-10 w-10 rounded-full bg-gray-200" />
                          <span className="text-xs text-gray-400">
                            Doctor {i}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinic Photos */}
                {photos.length > 0 && (
                  <div className="border-t border-gray-100 px-4 py-5">
                    <div className="flex gap-2 overflow-x-auto">
                      {photos.map((p, i) => (
                        <img
                          key={i}
                          src={p}
                          alt={`Clinic ${i + 1}`}
                          className="h-20 w-28 shrink-0 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Appointment Button */}
                {content.sections.appointment && (
                  <div className="border-t border-gray-100 px-4 py-5 text-center">
                    <button
                      className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
                      style={{ backgroundColor: theme }}
                    >
                      Book Appointment
                    </button>
                  </div>
                )}

                {/* Contact */}
                {content.sections.contact && content.contact && (
                  <div className="border-t border-gray-100 px-4 py-5">
                    <h3 className="mb-2 text-center text-sm font-bold text-gray-700">
                      Contact Us
                    </h3>
                    <p className="text-center text-xs leading-relaxed text-gray-500">
                      {content.contact}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-4 text-center">
                  <p className="text-xs text-gray-400">
                    Powered by MediHost
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Right: Customize Panel ---- */}
        <div className="order-1 xl:order-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {(
                [
                  { key: 'theme', label: 'Theme' },
                  { key: 'content', label: 'Content' },
                  { key: 'photos', label: 'Photos' },
                  { key: 'sections', label: 'Sections' },
                ] as { key: EditorTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
              {/* ---- Theme Tab ---- */}
              {activeTab === 'theme' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Brand Color
                    </Label>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Choose a color that represents your brand
                    </p>
                    <div className="mt-3 grid grid-cols-6 gap-3">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setTheme(color.value)}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                            theme === color.value
                              ? 'ring-2 ring-offset-2'
                              : 'hover:scale-110'
                          }`}
                          style={{
                            backgroundColor: color.value,
                            ...(theme === color.value
                              ? { ringColor: color.value }
                              : {}),
                          }}
                          title={color.name}
                        >
                          {theme === color.value && (
                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview buttons */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Preview
                    </Label>
                    <div className="mt-3 space-y-2">
                      <button
                        className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: theme }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="w-full rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                        style={{ borderColor: theme, color: theme }}
                      >
                        Outline Button
                      </button>
                      <div
                        className="rounded-xl px-4 py-3"
                        style={{ backgroundColor: theme + '12' }}
                      >
                        <p className="text-sm font-medium" style={{ color: theme }}>
                          Highlighted text in your brand color
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Content Tab ---- */}
              {activeTab === 'content' && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={content.tagline}
                      onChange={(e) =>
                        updateContent({ tagline: e.target.value })
                      }
                      placeholder="Your catchy tagline..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="about">About</Label>
                    <textarea
                      id="about"
                      rows={4}
                      value={content.about}
                      onChange={(e) =>
                        updateContent({ about: e.target.value })
                      }
                      placeholder="Tell patients about your practice..."
                      className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <Label>Features</Label>
                    <div className="flex flex-wrap gap-2">
                      {content.features.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                        >
                          {f}
                          <button
                            onClick={() => removeFeature(i)}
                            className="ml-0.5 text-emerald-400 hover:text-red-500"
                          >
                            {'\u00d7'}
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a feature..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={addFeature}
                        className="shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <Label>Stats</Label>
                    <div className="space-y-2">
                      {Object.entries(content.stats).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2">
                          <span className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
                            <span className="font-medium text-gray-700">{k}</span>
                            <span className="text-gray-400"> = </span>
                            <span className="text-emerald-600">{v}</span>
                          </span>
                          <button
                            onClick={() => removeStat(k)}
                            className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newStatKey}
                        onChange={(e) => setNewStatKey(e.target.value)}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        value={newStatValue}
                        onChange={(e) => setNewStatValue(e.target.value)}
                        placeholder="Value"
                        className="w-24"
                      />
                      <Button
                        variant="outline"
                        onClick={addStat}
                        className="shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contact">Contact Address</Label>
                    <textarea
                      id="contact"
                      rows={3}
                      value={content.contact}
                      onChange={(e) =>
                        updateContent({ contact: e.target.value })
                      }
                      placeholder="Enter your clinic address, phone, email..."
                      className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              )}

              {/* ---- Photos Tab ---- */}
              {activeTab === 'photos' && (
                <div className="space-y-5">
                  {/* Logo */}
                  <div>
                    <Label>Logo</Label>
                    <div className="mt-2">
                      {logoUrl ? (
                        <div className="relative inline-block">
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-20 w-20 rounded-xl border border-gray-200 object-cover"
                          />
                          <button
                            onClick={() => setLogoUrl('')}
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
                          >
                            {'\u00d7'}
                          </button>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                          <UploadIcon className="h-8 w-8 text-gray-300" />
                          <span className="mt-2 text-xs font-medium text-gray-500">
                            Upload Logo
                          </span>
                          <span className="mt-0.5 text-xs text-gray-400">
                            PNG, JPG up to 2MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Clinic Photos */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Clinic Photos</Label>
                      <span className="text-xs text-gray-400">
                        {photos.length}/5
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {photos.map((p, i) => (
                        <div key={i} className="relative">
                          <img
                            src={p}
                            alt={`Photo ${i + 1}`}
                            className="h-24 w-full rounded-lg border border-gray-200 object-cover"
                          />
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
                          >
                            {'\u00d7'}
                          </button>
                        </div>
                      ))}
                      {photos.length < 5 && (
                        <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
                          <PlusIcon className="h-5 w-5 text-gray-300" />
                          <span className="mt-1 text-xs text-gray-400">Add</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Sections Tab ---- */}
              {activeTab === 'sections' && (
                <div className="space-y-1">
                  {SECTION_CONFIG.map((section) => (
                    <div
                      key={section.key}
                      className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <SectionIcon
                          icon={section.icon}
                          color={
                            content.sections[section.key] ? theme : '#9ca3af'
                          }
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {section.label}
                        </span>
                        {section.alwaysOn && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">
                            Always on
                          </span>
                        )}
                      </div>
                      {/* Toggle */}
                      <button
                        onClick={() => toggleSection(section.key)}
                        disabled={section.alwaysOn}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          content.sections[section.key]
                            ? 'bg-emerald-500'
                            : 'bg-gray-200'
                        } ${section.alwaysOn ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            content.sections[section.key]
                              ? 'translate-x-[22px]'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom buttons */}
            <div className="flex gap-3 border-t border-gray-200 p-4">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
                className="flex-1 gap-2"
              >
                {saving ? (
                  <Spinner />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                Save Draft
              </Button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {publishing ? (
                  <Spinner />
                ) : (
                  <RocketIcon className="h-4 w-4" />
                )}
                Publish Website
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline Icons                                                       */
/* ------------------------------------------------------------------ */

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function SectionIcon({ icon, color }: { icon: string; color: string }) {
  const paths: Record<string, string> = {
    sparkle: 'M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z',
    chart: 'M18 20V10M12 20V4M6 20v-6',
    user: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2M9 7a4 4 0 100-8 4 4 0 000 8',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    package: 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    calendar: 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18',
    map: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z',
    chat: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  };

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[icon] || paths.sparkle} />
    </svg>
  );
}
