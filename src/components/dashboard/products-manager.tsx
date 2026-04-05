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

interface Product {
  id: string;
  name: string;
  product_type: 'test' | 'package' | 'consultation';
  category: string;
  description: string;
  mrp: number;
  price: number;
  parameters_count: number;
  report_tat_hours: number;
  sample_type: string;
  fasting_required: boolean;
  source: 'self' | 'hemato';
  is_featured: boolean;
  active: boolean;
}

type FilterTab = 'all' | 'test' | 'package' | 'consultation';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  'Blood Tests',
  'Thyroid',
  'Diabetes',
  'Cardiac',
  'Liver',
  'Kidney',
  'Full Body',
  'Vitamins',
  'Hormones',
  'Allergy',
  'Imaging',
  'Consultation',
  'Other',
] as const;

const SAMPLE_TYPES = ['N/A', 'Blood', 'Urine', 'Stool', 'Swab', 'Sputum', 'Multiple'] as const;

const MASTER_CATALOG: Product[] = [
  { id: 'p1', name: 'CBC Panel', product_type: 'test', category: 'Blood Tests', description: 'Complete Blood Count with differential. Measures red cells, white cells, hemoglobin, hematocrit, and platelets.', mrp: 599, price: 299, parameters_count: 26, report_tat_hours: 6, sample_type: 'Blood', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p2', name: 'Thyroid Profile', product_type: 'test', category: 'Thyroid', description: 'Comprehensive thyroid function panel including T3, T4, and TSH levels to evaluate thyroid health.', mrp: 899, price: 399, parameters_count: 5, report_tat_hours: 12, sample_type: 'Blood', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p3', name: 'Full Body Checkup', product_type: 'package', category: 'Full Body', description: 'Comprehensive health screening covering 72 parameters across blood, liver, kidney, thyroid, and more.', mrp: 2499, price: 999, parameters_count: 72, report_tat_hours: 24, sample_type: 'Blood', fasting_required: false, source: 'self', is_featured: true, active: true },
  { id: 'p4', name: 'Lipid Profile', product_type: 'test', category: 'Cardiac', description: 'Measures cholesterol levels including HDL, LDL, triglycerides, and VLDL for cardiovascular risk assessment.', mrp: 699, price: 349, parameters_count: 8, report_tat_hours: 6, sample_type: 'Blood', fasting_required: true, source: 'self', is_featured: false, active: true },
  { id: 'p5', name: 'LFT', product_type: 'test', category: 'Liver', description: 'Liver Function Test evaluating SGOT, SGPT, ALP, bilirubin, albumin, and other liver enzymes.', mrp: 799, price: 399, parameters_count: 12, report_tat_hours: 8, sample_type: 'Blood', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p6', name: 'KFT', product_type: 'test', category: 'Kidney', description: 'Kidney Function Test including creatinine, BUN, uric acid, and electrolyte levels.', mrp: 799, price: 399, parameters_count: 10, report_tat_hours: 8, sample_type: 'Blood', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p7', name: 'HbA1c', product_type: 'test', category: 'Diabetes', description: 'Glycated hemoglobin test for long-term blood sugar monitoring over 2-3 months.', mrp: 599, price: 349, parameters_count: 1, report_tat_hours: 6, sample_type: 'Blood', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p8', name: 'Vitamin D + B12', product_type: 'test', category: 'Vitamins', description: 'Essential vitamin panel measuring Vitamin D (25-OH) and Vitamin B12 levels.', mrp: 1799, price: 799, parameters_count: 2, report_tat_hours: 24, sample_type: 'Blood', fasting_required: false, source: 'self', is_featured: true, active: true },
  { id: 'p9', name: 'Diabetes Screening', product_type: 'package', category: 'Diabetes', description: 'Complete diabetes evaluation including fasting glucose, HbA1c, insulin, lipid profile, and kidney markers.', mrp: 1999, price: 599, parameters_count: 22, report_tat_hours: 12, sample_type: 'Blood', fasting_required: true, source: 'self', is_featured: true, active: true },
  { id: 'p10', name: 'Cardiac Risk Panel', product_type: 'package', category: 'Cardiac', description: 'Advanced cardiac risk assessment with lipid profile, hs-CRP, homocysteine, and Lp(a).', mrp: 3499, price: 1499, parameters_count: 18, report_tat_hours: 24, sample_type: 'Blood', fasting_required: true, source: 'self', is_featured: false, active: true },
  { id: 'p11', name: "Women's Health", product_type: 'package', category: 'Full Body', description: 'Comprehensive women\u2019s health panel covering hormones, thyroid, vitamins, CBC, and more.', mrp: 2999, price: 1299, parameters_count: 45, report_tat_hours: 48, sample_type: 'Blood', fasting_required: true, source: 'self', is_featured: true, active: true },
  { id: 'p12', name: 'Senior Citizen', product_type: 'package', category: 'Full Body', description: 'Full body health package designed for seniors covering 90 parameters across all major organs.', mrp: 5999, price: 2499, parameters_count: 90, report_tat_hours: 48, sample_type: 'Blood', fasting_required: true, source: 'self', is_featured: true, active: true },
  { id: 'p13', name: 'GP Consultation', product_type: 'consultation', category: 'Consultation', description: 'General Physician consultation for routine health concerns and preventive care.', mrp: 500, price: 500, parameters_count: 0, report_tat_hours: 0, sample_type: 'N/A', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p14', name: 'Specialist Consultation', product_type: 'consultation', category: 'Consultation', description: 'Consultation with a specialist doctor for specific health conditions.', mrp: 800, price: 800, parameters_count: 0, report_tat_hours: 0, sample_type: 'N/A', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p15', name: 'Urine Routine', product_type: 'test', category: 'Other', description: 'Complete urinalysis including physical, chemical, and microscopic examination.', mrp: 299, price: 149, parameters_count: 15, report_tat_hours: 4, sample_type: 'Urine', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p16', name: 'ESR', product_type: 'test', category: 'Blood Tests', description: 'Erythrocyte Sedimentation Rate to detect inflammation, infection, or autoimmune conditions.', mrp: 199, price: 99, parameters_count: 1, report_tat_hours: 4, sample_type: 'Blood', fasting_required: false, source: 'self', is_featured: false, active: true },
  { id: 'p17', name: 'Iron Studies', product_type: 'test', category: 'Blood Tests', description: 'Complete iron panel including serum iron, TIBC, ferritin, and transferrin saturation.', mrp: 1299, price: 649, parameters_count: 4, report_tat_hours: 12, sample_type: 'Blood', fasting_required: true, source: 'self', is_featured: false, active: true },
  { id: 'p18', name: 'Allergy Panel', product_type: 'test', category: 'Allergy', description: 'Comprehensive allergy screening panel covering food and environmental allergens.', mrp: 3999, price: 1999, parameters_count: 30, report_tat_hours: 72, sample_type: 'Blood', fasting_required: false, source: 'hemato', is_featured: false, active: true },
  { id: 'p19', name: 'Vitamin Panel Complete', product_type: 'test', category: 'Vitamins', description: 'Full vitamin profiling including A, B-complex, C, D, E, K, and folate levels.', mrp: 4999, price: 2499, parameters_count: 10, report_tat_hours: 48, sample_type: 'Blood', fasting_required: false, source: 'hemato', is_featured: false, active: false },
  { id: 'p20', name: 'Hormone Panel Male', product_type: 'package', category: 'Hormones', description: 'Male hormone panel covering testosterone, LH, FSH, prolactin, DHEA-S, and more.', mrp: 3499, price: 1799, parameters_count: 7, report_tat_hours: 48, sample_type: 'Blood', fasting_required: true, source: 'hemato', is_featured: false, active: false },
];

/* ------------------------------------------------------------------ */
/*  Inline toast (same pattern as doctors-manager)                     */
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

function createEmptyForm(): Omit<Product, 'id'> {
  return {
    name: '',
    product_type: 'test',
    category: 'Blood Tests',
    description: '',
    mrp: 0,
    price: 0,
    parameters_count: 0,
    report_tat_hours: 0,
    sample_type: 'Blood',
    fasting_required: false,
    source: 'self',
    is_featured: false,
    active: true,
  };
}

function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

function typeBadgeClass(t: Product['product_type']): string {
  switch (t) {
    case 'test':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'package':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'consultation':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
}

function typeLabel(t: Product['product_type']): string {
  switch (t) {
    case 'test':
      return 'Lab Test';
    case 'package':
      return 'Package';
    case 'consultation':
      return 'Consultation';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProductsManager({ user }: { user: AuthUser | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  /* ---- Fetch products on mount ---- */
  useEffect(() => {
    if (!user?.token || !user?.hospitalId) {
      setProducts([...MASTER_CATALOG]);
      setFetching(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/proxy/api/storefront/${user.hospitalId}/products`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            signal: controller.signal,
          },
        );

        if (!res.ok) throw new Error('Failed to load products');

        const json = await res.json();
        const data: Product[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

        if (data.length === 0) {
          setProducts([...MASTER_CATALOG]);
        } else {
          setProducts(data);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setProducts([...MASTER_CATALOG]);
        }
      } finally {
        setFetching(false);
      }
    })();

    return () => controller.abort();
  }, [user]);

  /* ---- Counts ---- */
  const counts = {
    all: products.length,
    test: products.filter((p) => p.product_type === 'test').length,
    package: products.filter((p) => p.product_type === 'package').length,
    consultation: products.filter((p) => p.product_type === 'consultation').length,
    active: products.filter((p) => p.active).length,
    self: products.filter((p) => p.source === 'self').length,
    hemato: products.filter((p) => p.source === 'hemato').length,
    featured: products.filter((p) => p.is_featured).length,
  };

  /* ---- Filtered products ---- */
  const filtered = products.filter((p) => {
    if (activeTab !== 'all' && p.product_type !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ---- Modal actions ---- */
  const openAddModal = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      product_type: product.product_type,
      category: product.category,
      description: product.description,
      mrp: product.mrp,
      price: product.price,
      parameters_count: product.parameters_count,
      report_tat_hours: product.report_tat_hours,
      sample_type: product.sample_type,
      fasting_required: product.fasting_required,
      source: product.source,
      is_featured: product.is_featured,
      active: product.active,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const onSelectChange = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---- Toggle active ---- */
  const toggleActive = (product: Product) => {
    // TODO: PUT to /api/proxy/api/storefront/{hospitalId}/products/{product.id}
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, active: !p.active } : p,
      ),
    );
    showToast(
      product.active ? `"${product.name}" deactivated.` : `"${product.name}" activated.`,
      'success',
    );
  };

  /* ---- Toggle featured ---- */
  const toggleFeatured = (product: Product) => {
    // TODO: PUT to /api/proxy/api/storefront/{hospitalId}/products/{product.id}
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_featured: !p.is_featured } : p,
      ),
    );
    showToast(
      product.is_featured
        ? `"${product.name}" removed from featured.`
        : `"${product.name}" marked as featured.`,
      'success',
    );
  };

  /* ---- Inline price change ---- */
  const onInlinePriceChange = (productId: string, newPrice: number) => {
    // TODO: PUT to /api/proxy/api/storefront/{hospitalId}/products/{productId}
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, price: newPrice } : p,
      ),
    );
  };

  const onInlinePriceBlur = (product: Product) => {
    showToast(`Price updated for "${product.name}".`, 'success');
  };

  /* ---- Save ---- */
  const onSave = async () => {
    if (!form.name.trim()) {
      showToast('Please enter product name.', 'error');
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // TODO: PUT to /api/proxy/api/storefront/{hospitalId}/products/{editingId}
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId ? { ...p, ...form } : p,
          ),
        );
        showToast('Product updated successfully!', 'success');
      } else {
        // TODO: POST to /api/proxy/api/storefront/{hospitalId}/products
        const newProduct: Product = {
          id: `local-${Date.now()}`,
          ...form,
        };
        setProducts((prev) => [...prev, newProduct]);
        showToast('Product added successfully!', 'success');
      }
      closeModal();
    } catch (err) {
      showToast((err as Error).message || 'Failed to save product.', 'error');
    } finally {
      setSaving(false);
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
          Loading products...
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
        <h2 className="text-xl font-bold text-gray-900">Tests &amp; Services</h2>
        <Button
          onClick={openAddModal}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <PlusIcon />
          Add Custom Package
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="mt-4 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'test', label: 'Lab Tests' },
            { key: 'package', label: 'Packages' },
            { key: 'consultation', label: 'Consultations' },
          ] as { key: FilterTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mt-3">
        <Input
          placeholder="Search tests, packages, consultations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Stats row */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          Active: {counts.active}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Self-fulfilled: {counts.self}
        </Badge>
        <Badge variant="secondary" className="bg-red-50 text-red-700 text-xs">
          Hemato Network: {counts.hemato}
        </Badge>
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-xs">
          Featured: {counts.featured}
        </Badge>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <TestTubeIcon className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`group relative rounded-xl border bg-white p-5 transition-shadow hover:shadow-md ${
                !product.active
                  ? 'border-gray-200 opacity-60'
                  : 'border-gray-200'
              }`}
            >
              {/* Featured badge */}
              {product.is_featured && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <StarIcon className="h-3 w-3" />
                    Featured
                  </span>
                </div>
              )}

              {/* Name + category + type badge */}
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass(product.product_type)}`}
                >
                  {typeLabel(product.product_type)}
                </span>
              </div>

              {/* Description */}
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                {product.description}
              </p>

              {/* Meta row */}
              {product.product_type !== 'consultation' && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {product.parameters_count > 0 && (
                    <span className="flex items-center gap-1">
                      <ParametersIcon />
                      {product.parameters_count} params
                    </span>
                  )}
                  {product.report_tat_hours > 0 && (
                    <span className="flex items-center gap-1">
                      <ClockIcon />
                      {product.report_tat_hours}h TAT
                    </span>
                  )}
                  {product.sample_type !== 'N/A' && (
                    <span className="flex items-center gap-1">
                      <TestTubeIcon className="h-3 w-3" />
                      {product.sample_type}
                    </span>
                  )}
                  {product.fasting_required && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <FastingIcon />
                      Fasting
                    </span>
                  )}
                </div>
              )}

              {/* Pricing row */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-lg font-bold text-emerald-600">
                  {'\u20B9'}{product.price}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {'\u20B9'}{product.mrp}
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {discountPercent(product.mrp, product.price)}% off
                    </span>
                  </>
                )}
              </div>

              {/* Fulfillment badge */}
              <div className="mt-2">
                {product.source === 'self' ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    Self-fulfilled
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    Hemato Network
                  </span>
                )}
              </div>

              {/* Inline price edit */}
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-gray-500">Your Price:</label>
                <input
                  type="number"
                  min={0}
                  value={product.price}
                  onChange={(e) =>
                    onInlinePriceChange(product.id, Number(e.target.value))
                  }
                  onBlur={() => onInlinePriceBlur(product)}
                  className="h-7 w-24 rounded-md border border-gray-200 px-2 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(product)}
                  className="flex-1 text-xs"
                >
                  <EditIcon />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(product)}
                  className={`text-xs ${
                    product.active
                      ? 'text-gray-600 hover:bg-gray-50'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <EyeIcon active={product.active} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeatured(product)}
                  className={`text-xs ${
                    product.is_featured
                      ? 'text-amber-600 hover:bg-amber-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <StarIcon className="h-3.5 w-3.5" />
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
                {editingId ? 'Edit Product' : 'Add Custom Package'}
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
              {/* Row: Name + Type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={onFieldChange}
                    placeholder="e.g. Full Body Checkup"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product_type">Type</Label>
                  <select
                    id="product_type"
                    name="product_type"
                    value={form.product_type}
                    onChange={onFieldChange}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="test">Lab Test</option>
                    <option value="package">Package</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={onFieldChange}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={onFieldChange}
                  rows={3}
                  placeholder="Brief description of the test or package..."
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              {/* Row: MRP + Your Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="mrp">MRP</Label>
                  <Input
                    id="mrp"
                    name="mrp"
                    type="number"
                    min={0}
                    value={form.mrp}
                    onChange={onFieldChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price">Your Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={onFieldChange}
                  />
                </div>
              </div>

              {/* Row: Parameters + TAT */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="parameters_count">Parameters Count</Label>
                  <Input
                    id="parameters_count"
                    name="parameters_count"
                    type="number"
                    min={0}
                    value={form.parameters_count}
                    onChange={onFieldChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="report_tat_hours">Report TAT (hours)</Label>
                  <Input
                    id="report_tat_hours"
                    name="report_tat_hours"
                    type="number"
                    min={0}
                    value={form.report_tat_hours}
                    onChange={onFieldChange}
                  />
                </div>
              </div>

              {/* Row: Sample Type + Fasting */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sample_type">Sample Type</Label>
                  <select
                    id="sample_type"
                    name="sample_type"
                    value={form.sample_type}
                    onChange={onFieldChange}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {SAMPLE_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fasting_required">Fasting Required</Label>
                  <select
                    id="fasting_required"
                    value={form.fasting_required ? 'yes' : 'no'}
                    onChange={(e) =>
                      onSelectChange('fasting_required', e.target.value === 'yes')
                    }
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Row: Fulfillment + Featured */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="source">Fulfillment</Label>
                  <select
                    id="source"
                    value={form.source}
                    onChange={(e) =>
                      onSelectChange('source', e.target.value)
                    }
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="self">Self</option>
                    <option value="hemato">Hemato Network</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="is_featured">Featured</Label>
                  <select
                    id="is_featured"
                    value={form.is_featured ? 'yes' : 'no'}
                    onChange={(e) =>
                      onSelectChange('is_featured', e.target.value === 'yes')
                    }
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
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
                  'Save Product'
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

function EyeIcon({ active }: { active: boolean }) {
  if (active) {
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
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
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
      <path d="M9.88 9.88a3 3 0 104.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 002 12s3 7 10 7a9.74 9.74 0 005.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function StarIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

function ParametersIcon() {
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
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 4-10" />
    </svg>
  );
}

function TestTubeIcon({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
      <path d="M8.5 2h7" />
      <path d="M14.5 16h-5" />
    </svg>
  );
}

function FastingIcon() {
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
      <path d="M4.93 4.93l14.14 14.14" />
    </svg>
  );
}
