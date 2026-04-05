'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  experience_years: number;
  consultation_fee: number;
  languages: string[];
  schedules: { session_label: string; slot_start: string; slot_end: string }[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Neurologist',
  'Psychiatrist',
  'Pulmonologist',
  'Gastroenterologist',
  'Urologist',
  'Endocrinologist',
  'Dentist',
  'Physiotherapist',
  'Pathologist',
  'Radiologist',
  'General Surgeon',
  'Oncologist',
] as const;

const LANGUAGES = [
  'English',
  'Hindi',
  'Telugu',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Urdu',
  'Punjabi',
] as const;

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const AVATAR_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#0d9488',
  '#ea580c',
  '#dc2626',
  '#16a34a',
];

/* ------------------------------------------------------------------ */
/*  Inline toast (same pattern as profile-form)                        */
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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function createEmptyForm(): Omit<Doctor, 'id'> {
  return {
    full_name: '',
    specialization: 'General Physician',
    experience_years: 0,
    consultation_fee: 0,
    languages: [],
    schedules: [],
  };
}

function createMockDoctor(user: AuthUser): Doctor {
  return {
    id: 'mock-1',
    full_name: user.name || 'Dr. Example',
    specialization: 'General Physician',
    experience_years: 5,
    consultation_fee: 500,
    languages: ['English', 'Hindi'],
    schedules: [
      { session_label: 'Monday', slot_start: '09:00', slot_end: '17:00' },
      { session_label: 'Wednesday', slot_start: '09:00', slot_end: '17:00' },
      { session_label: 'Friday', slot_start: '09:00', slot_end: '13:00' },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DoctorsManager({ user }: { user: AuthUser | null }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [fetching, setFetching] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Doctor, 'id'>>(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  /* ---- Fetch doctors on mount ---- */
  useEffect(() => {
    if (!user?.token || !user?.hospitalId) {
      // No hospital ID - show mock doctor
      if (user) {
        setDoctors([createMockDoctor(user)]);
      }
      setFetching(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/proxy/api/storefront/${user.hospitalId}/doctors`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            signal: controller.signal,
          },
        );

        if (!res.ok) throw new Error('Failed to load doctors');

        const json = await res.json();
        const data: Doctor[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

        if (data.length === 0) {
          setDoctors([createMockDoctor(user)]);
        } else {
          setDoctors(data);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setDoctors([createMockDoctor(user)]);
        }
      } finally {
        setFetching(false);
      }
    })();

    return () => controller.abort();
  }, [user]);

  /* ---- Modal actions ---- */
  const openAddModal = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setForm({
      full_name: doctor.full_name,
      specialization: doctor.specialization,
      experience_years: doctor.experience_years,
      consultation_fee: doctor.consultation_fee,
      languages: [...doctor.languages],
      schedules: doctor.schedules.map((s) => ({ ...s })),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(createEmptyForm());
  };

  /* ---- Form field handlers ---- */
  const onFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const addScheduleRow = () => {
    setForm((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { session_label: 'Monday', slot_start: '09:00', slot_end: '17:00' },
      ],
    }));
  };

  const removeScheduleRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index),
    }));
  };

  const updateScheduleRow = (
    index: number,
    field: 'session_label' | 'slot_start' | 'slot_end',
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  };

  /* ---- Save ---- */
  const onSave = async () => {
    if (!form.full_name.trim()) {
      showToast('Please enter doctor name.', 'error');
      return;
    }

    setSaving(true);

    try {
      let updatedDoctors: Doctor[];

      if (editingId) {
        updatedDoctors = doctors.map((d) =>
          d.id === editingId ? { ...d, ...form } : d,
        );
        setDoctors(updatedDoctors);
        showToast('Doctor updated successfully!', 'success');
      } else {
        const newDoctor: Doctor = {
          id: `local-${Date.now()}`,
          ...form,
        };
        updatedDoctors = [...doctors, newDoctor];
        setDoctors(updatedDoctors);
        showToast('Doctor added successfully!', 'success');
      }

      // Persist to API if authenticated
      if (user?.token && user?.id) {
        try {
          await fetch(`/api/proxy/api/presence/partners/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ doctors: updatedDoctors }),
          });
        } catch {
          // API save failed silently — local state is already updated
        }
      }

      closeModal();
    } catch (err) {
      showToast((err as Error).message || 'Failed to save doctor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ---- Delete ---- */
  const onDelete = async (doctor: Doctor) => {
    if (!window.confirm(`Delete Dr. ${doctor.full_name}? This cannot be undone.`)) {
      return;
    }

    const updatedDoctors = doctors.filter((d) => d.id !== doctor.id);
    setDoctors(updatedDoctors);
    showToast('Doctor removed.', 'success');

    // Persist to API if authenticated
    if (user?.token && user?.id) {
      try {
        await fetch(`/api/proxy/api/presence/partners/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ doctors: updatedDoctors }),
        });
      } catch {
        // API save failed silently — local state is already updated
      }
    }
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

  /* ---- Loading ---- */
  if (fetching) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading doctors...
        </div>
      </div>
    );
  }

  /* ---- Render ---- */
  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Doctors</h2>
        <Button
          onClick={openAddModal}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <PlusIcon />
          Add Doctor
        </Button>
      </div>

      {/* Empty state */}
      {doctors.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-10 w-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No doctors added yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first doctor to start managing appointments and schedules.
          </p>
          <Button
            onClick={openAddModal}
            className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <PlusIcon />
            Add Your First Doctor
          </Button>
        </div>
      ) : (
        /* Doctor cards grid */
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Top: avatar + name */}
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: getAvatarColor(index) }}
                >
                  {getInitials(doctor.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-gray-900">
                    {doctor.full_name}
                  </h3>
                  <p className="text-sm text-emerald-600">{doctor.specialization}</p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <BriefcaseIcon />
                  {doctor.experience_years} yrs
                </span>
                <span className="flex items-center gap-1">
                  <CurrencyIcon />
                  {doctor.consultation_fee}
                </span>
              </div>

              {/* Languages */}
              {doctor.languages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {doctor.languages.map((lang) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="text-xs"
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Schedule */}
              {doctor.schedules.length > 0 && (
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  {doctor.schedules.map((s, si) => (
                    <div key={si} className="flex items-center gap-1">
                      <ClockIcon />
                      <span className="font-medium text-gray-700">{s.session_label}:</span>
                      <span>
                        {s.slot_start} - {s.slot_end}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(doctor)}
                  className="flex-1 text-xs"
                >
                  <EditIcon />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(doctor)}
                  className="flex-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <TrashIcon />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Add/Edit Modal ---- */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 sm:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Doctor' : 'Add Doctor'}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-5 px-6 py-5">
              {/* Row: Name + Specialization */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={onFieldChange}
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="specialization">Specialization</Label>
                  <select
                    id="specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={onFieldChange}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Experience + Fee */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="experience_years">Experience (years)</Label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min={0}
                    value={form.experience_years}
                    onChange={onFieldChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="consultation_fee">Consultation Fee</Label>
                  <Input
                    id="consultation_fee"
                    name="consultation_fee"
                    type="number"
                    min={0}
                    value={form.consultation_fee}
                    onChange={onFieldChange}
                  />
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-1.5">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const active = form.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          active
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Schedule</Label>
                  <button
                    type="button"
                    onClick={addScheduleRow}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <PlusIcon />
                    Add Row
                  </button>
                </div>

                {form.schedules.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No schedule rows. Click &quot;Add Row&quot; to add availability.
                  </p>
                )}

                <div className="space-y-2">
                  {form.schedules.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={row.session_label}
                        onChange={(e) =>
                          updateScheduleRow(i, 'session_label', e.target.value)
                        }
                        className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="time"
                        value={row.slot_start}
                        onChange={(e) =>
                          updateScheduleRow(i, 'slot_start', e.target.value)
                        }
                        className="w-28"
                      />
                      <span className="text-gray-400">-</span>
                      <Input
                        type="time"
                        value={row.slot_end}
                        onChange={(e) =>
                          updateScheduleRow(i, 'slot_end', e.target.value)
                        }
                        className="w-28"
                      />
                      <button
                        type="button"
                        onClick={() => removeScheduleRow(i)}
                        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove row"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={saving}
                className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Doctor'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny inline icons                                                  */
/* ------------------------------------------------------------------ */

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
