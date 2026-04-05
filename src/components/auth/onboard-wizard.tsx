"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuthUser } from '@/lib/auth';

const MODULES = [
  { id: 'appointments', name: 'Appointments', icon: '📅', desc: 'Online booking & scheduling for patients' },
  { id: 'billing', name: 'Billing', icon: '💳', desc: 'Invoices, receipts & payment tracking' },
  { id: 'emr', name: 'EMR', icon: '📋', desc: 'Electronic medical records & prescriptions' },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊', desc: 'Inventory, sales & purchase management' },
  { id: 'lis', name: 'LIS', icon: '🔬', desc: 'Lab information system & test reports' },
  { id: 'teleconsultation', name: 'Teleconsultation', icon: '📹', desc: 'Video consultations with patients' },
] as const;

const BRAND_COLORS = [
  { id: 'emerald', value: '#10b981', label: 'Emerald' },
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'purple', value: '#8b5cf6', label: 'Purple' },
  { id: 'coral', value: '#f97316', label: 'Coral' },
  { id: 'teal', value: '#14b8a6', label: 'Teal' },
  { id: 'amber', value: '#f59e0b', label: 'Amber' },
];

interface Props {
  user: AuthUser;
}

export function OnboardWizard({ user }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 state
  const [clinicName, setClinicName] = useState(user.name || '');
  const [ownerName, setOwnerName] = useState(user.name || '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 2 state
  const [selectedModules, setSelectedModules] = useState<string[]>(['appointments', 'billing']);

  // Step 3 state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [brandColor, setBrandColor] = useState('#10b981');

  function toggleModule(id: string) {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function handleLogoDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processLogoFile(file);
    }
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  }

  function processLogoFile(file: File) {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function validateStep(): boolean {
    setError('');
    if (step === 1) {
      if (!clinicName || !ownerName || !city) {
        setError('Please fill in Clinic Name, Owner Name, and City');
        return false;
      }
    }
    if (step === 2) {
      if (selectedModules.length === 0) {
        setError('Please select at least one module');
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  function handleBack() {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleComplete() {
    setLoading(true);
    setError('');

    try {
      const payload = {
        clinic_name: clinicName,
        owner_name: ownerName,
        phone,
        city,
        pincode,
        modules: selectedModules,
        brand_color: brandColor,
        has_logo: !!logoFile,
      };

      const res = await fetch('/api/proxy/api/presence/onboard/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success !== false) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Setup failed. Please try again.');
      }
    } catch {
      // Even on network error, redirect to dashboard since account is already created
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  const stepLabels = ['Clinic Details', 'Select Modules', 'Branding', 'Review & Launch'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-gray-900">
            Medi<span className="text-emerald-600">Host</span>
          </h1>
          <span className="text-sm text-gray-500">Step {step} of 4</span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isCompleted = step > stepNum;
              const isCurrent = step === stepNum;
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <span
                      className={`text-xs mt-1 hidden sm:block ${
                        isCurrent ? 'text-emerald-600 font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        step > stepNum ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6 sm:p-12">
        <div className="w-full max-w-3xl">
          {/* Step 1: Clinic Details */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Clinic Details</h2>
                <p className="text-sm text-gray-500 mt-1">Tell us about your practice</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ob_clinic">Clinic / Hospital Name *</Label>
                  <Input
                    id="ob_clinic"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g. Smile Dental Clinic"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob_owner">Owner Name *</Label>
                  <Input
                    id="ob_owner"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Dr. Sharma"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob_phone">Phone</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">+91</span>
                  <Input
                    id="ob_phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="h-11 pl-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ob_city">City *</Label>
                  <Input
                    id="ob_city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob_pincode">Pincode</Label>
                  <Input
                    id="ob_pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Modules */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Modules</h2>
                <p className="text-sm text-gray-500 mt-1">Choose the features you need. You can change these later.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODULES.map((mod) => {
                  const checked = selectedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${
                        checked
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{mod.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{mod.name}</span>
                          {checked && (
                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{mod.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Branding */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Branding</h2>
                <p className="text-sm text-gray-500 mt-1">Customize the look and feel of your clinic website</p>
              </div>

              {/* Logo upload */}
              <div className="space-y-2">
                <Label>Clinic Logo</Label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleLogoDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-400 transition-colors"
                >
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-24 h-24 object-contain rounded-lg"
                      />
                      <span className="text-xs text-gray-500">Click or drag to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📁</span>
                      <p className="text-sm text-gray-600">Drag & drop your logo here, or click to browse</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Brand color */}
              <div className="space-y-3">
                <Label>Brand Color</Label>
                <div className="flex flex-wrap gap-3">
                  {BRAND_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setBrandColor(color.value)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                        brandColor === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-900 bg-gray-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs text-gray-600">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Launch */}
          {step === 4 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Review & Launch</h2>
                <p className="text-sm text-gray-500 mt-1">Confirm your details and launch your clinic</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-3">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-12 h-12 rounded-lg object-contain" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-xl">🏥</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{clinicName}</h3>
                    <p className="text-sm text-gray-500">{ownerName}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">City</span>
                    <span className="font-medium text-gray-900">{city}{pincode ? ` - ${pincode}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-900">{phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Brand Color</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brandColor }} />
                      <span className="font-medium text-gray-900">
                        {BRAND_COLORS.find((c) => c.value === brandColor)?.label || brandColor}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Modules</span>
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                      {selectedModules.map((id) => {
                        const mod = MODULES.find((m) => m.id === id);
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
                          >
                            {mod?.icon} {mod?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-11 px-6"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleComplete}
                disabled={loading}
                className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-base font-bold"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
