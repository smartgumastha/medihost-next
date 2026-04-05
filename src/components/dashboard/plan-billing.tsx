'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
/*  Plan data                                                          */
/* ------------------------------------------------------------------ */

interface PlanFeatures {
  website: string;
  doctors: string;
  products: string;
  appointments: string;
  emr: string;
  lis: string;
  pharmacy: string;
  marketing: string;
  analytics: string;
  support: string;
}

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  trial: string;
  popular: boolean;
  features: PlanFeatures;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    trial: '\u2014',
    popular: false,
    features: {
      website: 'Basic',
      doctors: '1',
      products: '10',
      appointments: '50/mo',
      emr: 'Basic',
      lis: '\u2014',
      pharmacy: '\u2014',
      marketing: '\u2014',
      analytics: 'Basic',
      support: 'Email',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 999,
    yearlyPrice: 9999,
    trial: '14 days',
    popular: false,
    features: {
      website: 'Custom domain',
      doctors: '5',
      products: '50',
      appointments: '500/mo',
      emr: 'Full',
      lis: 'Basic',
      pharmacy: '\u2014',
      marketing: 'GBP only',
      analytics: 'Standard',
      support: 'Email + Chat',
    },
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 2999,
    yearlyPrice: 29999,
    trial: '14 days',
    popular: true,
    features: {
      website: 'Custom domain',
      doctors: '15',
      products: '200',
      appointments: 'Unlimited',
      emr: 'Full + AI',
      lis: 'Full',
      pharmacy: 'Basic',
      marketing: 'GBP + Social',
      analytics: 'Advanced',
      support: 'Priority',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 9999,
    yearlyPrice: 99999,
    trial: '14 days',
    popular: false,
    features: {
      website: 'White label',
      doctors: 'Unlimited',
      products: 'Unlimited',
      appointments: 'Unlimited',
      emr: 'Full + AI',
      lis: 'Full',
      pharmacy: 'Full',
      marketing: 'Full AI Marketing',
      analytics: 'Custom Reports',
      support: 'Dedicated Manager',
    },
  },
];

const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  website: 'Website',
  doctors: 'Doctors',
  products: 'Products',
  appointments: 'Appointments',
  emr: 'EMR',
  lis: 'LIS',
  pharmacy: 'Pharmacy',
  marketing: 'Marketing',
  analytics: 'Analytics',
  support: 'Support',
};

/* ------------------------------------------------------------------ */
/*  Mock billing data                                                  */
/* ------------------------------------------------------------------ */

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'Paid' | 'Pending';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'inv-001', date: 'Apr 1, 2026', description: 'Domain Registration \u2014 rajithadental.com', amount: '\u20b9699', status: 'Paid' },
  { id: 'inv-002', date: 'Mar 1, 2026', description: 'Professional Plan \u2014 Monthly', amount: '\u20b9999', status: 'Paid' },
  { id: 'inv-003', date: 'Feb 1, 2026', description: 'Professional Plan \u2014 Monthly', amount: '\u20b9999', status: 'Paid' },
  { id: 'inv-004', date: 'Jan 15, 2026', description: 'SMS Pack \u2014 500 credits', amount: '\u20b9249', status: 'Paid' },
  { id: 'inv-005', date: 'Jan 1, 2026', description: 'Professional Plan \u2014 Monthly', amount: '\u20b9999', status: 'Pending' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(amount: number): string {
  if (amount === 0) return 'Free';
  return `\u20b9${amount.toLocaleString('en-IN')}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PlanBilling({ user }: { user: AuthUser | null }) {
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan] = useState<string>('starter'); // TODO: fetch from API
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  /* ---- Plan selection handler ---- */
  const handleSelectPlan = (planId: string) => {
    // TODO: Integrate with Razorpay for payment processing
    // TODO: Call API to update subscription: POST /api/proxy/api/presence/subscriptions
    if (planId === currentPlan) return;
    if (planId === 'enterprise') {
      showToast('Our team will contact you shortly for Enterprise setup.', 'success');
      return;
    }
    showToast('Plan change will take effect on next billing cycle.', 'success');
  };

  /* ---- Invoice download handler ---- */
  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Call API to download invoice: GET /api/proxy/api/presence/invoices/:id/download
    void invoiceId;
    showToast('Invoice downloaded.', 'success');
  };

  /* ---- Payment method handler ---- */
  const handleAddPaymentMethod = () => {
    // TODO: Integrate Razorpay customer portal / tokenization
    showToast('Payment method setup will be available soon.', 'error');
  };

  const activePlan = PLANS.find((p) => p.id === currentPlan) || PLANS[0];

  if (!user) {
    return (
      <Card>
        <CardContent>
          <p className="py-8 text-center text-gray-500">
            Not authenticated. Please log in again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      {/* ---- Current Plan Card ---- */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 text-white">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-100">Current Plan</p>
              <h2 className="text-2xl font-bold">{activePlan.name}</h2>
              <p className="mt-1 text-sm text-emerald-100">
                {activePlan.monthlyPrice === 0
                  ? `${activePlan.name} \u2014 Free forever`
                  : `${activePlan.name} \u2014 ${formatPrice(isYearly ? activePlan.yearlyPrice : activePlan.monthlyPrice)}/${isYearly ? 'yr' : 'mo'}`}
              </p>
              {activePlan.trial !== '\u2014' && (
                <p className="mt-1 text-xs text-emerald-200">14 days remaining</p>
              )}
            </div>
            {activePlan.monthlyPrice === 0 && (
              <Button
                onClick={() => {
                  const el = document.getElementById('plan-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-2 bg-white text-emerald-700 hover:bg-emerald-50 sm:mt-0"
              >
                Upgrade to unlock more features
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ---- Monthly / Yearly Toggle ---- */}
      <div id="plan-grid" className="flex items-center justify-center gap-3 py-2">
        <span className={`text-sm font-medium ${!isYearly ? 'text-emerald-700' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isYearly}
          onClick={() => setIsYearly(!isYearly)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            isYearly ? 'bg-emerald-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
              isYearly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${isYearly ? 'text-emerald-700' : 'text-gray-500'}`}>
          Yearly
          <Badge className="ml-1.5 bg-emerald-100 text-emerald-700 text-xs">Save 15%+</Badge>
        </span>
      </div>

      {/* ---- Plan Comparison Grid ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-500' : ''
              } ${isCurrent ? 'ring-2 ring-emerald-500' : ''}`}
            >
              {/* Badges */}
              {plan.popular && !isCurrent && (
                <div className="absolute top-0 right-0 rounded-bl-lg bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-0 right-0 rounded-bl-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  Current Plan
                </div>
              )}

              <CardHeader className="pb-2 pt-6">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-gray-500">
                      /{isYearly ? 'yr' : 'mo'}
                    </span>
                  )}
                </div>
                {plan.trial !== '\u2014' && (
                  <p className="mt-1 text-xs text-gray-500">{plan.trial} free trial</p>
                )}
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <Separator className="mb-4" />

                {/* Feature list */}
                <ul className="flex-1 space-y-2.5 text-sm">
                  {(Object.keys(FEATURE_LABELS) as (keyof PlanFeatures)[]).map((key) => {
                    const value = plan.features[key];
                    const isAvailable = value !== '\u2014';

                    return (
                      <li key={key} className="flex items-start gap-2">
                        {isAvailable ? (
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <CrossIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                        )}
                        <span className={isAvailable ? 'text-gray-700' : 'text-gray-400'}>
                          <span className="font-medium">{FEATURE_LABELS[key]}:</span>{' '}
                          {value}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Action button */}
                <div className="mt-6">
                  {isCurrent ? (
                    <Button disabled className="w-full bg-emerald-100 text-emerald-700">
                      Current Plan
                    </Button>
                  ) : plan.id === 'enterprise' ? (
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      Select Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ---- Billing History ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Description</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-700">{tx.date}</td>
                    <td className="py-3 pr-4 text-gray-700">{tx.description}</td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{tx.amount}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={
                          tx.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDownloadInvoice(tx.id)}
                        className="text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Payment Method ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Conditionally render saved payment method when available */}
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <CreditCardIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-700">No payment method added</p>
              <p className="mt-1 text-sm text-gray-500">
                Add a payment method to enable automatic billing.
              </p>
            </div>
            <Button
              onClick={handleAddPaymentMethod}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline icons                                                       */
/* ------------------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
