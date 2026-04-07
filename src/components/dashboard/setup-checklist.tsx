'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { getTokenFromClient } from '@/lib/auth';

interface SetupStep {
  id: string;
  label: string;
  done: boolean;
  href?: string | null;
  external?: string | null;
  badge?: string | null;
  order_ref?: string | null;
}

interface SetupStatus {
  steps: SetupStep[];
  completedCount: number;
  totalSteps: number;
  progressPercent: number;
  pendingOrder: { order_ref: string; plan_id: string; status: string } | null;
  hospital: { name: string; plan_id: string; domain: string | null };
}

export function SetupChecklist() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getTokenFromClient();
    if (!token) { setLoading(false); return; }
    apiGet('/api/dashboard/setup-status', token)
      .then((data) => setStatus(data))
      .catch(() => {/* silent — fallback to static */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
      <div className="h-2 bg-gray-100 rounded mb-4" />
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-50 rounded" />)}
      </div>
    </div>
  );

  if (!status) return null;

  const { steps, completedCount, totalSteps, progressPercent, pendingOrder } = status;
  const allDone = completedCount === totalSteps;

  if (allDone) return null;

  function handleStep(step: SetupStep) {
    if (step.external) {
      const match = document.cookie.split('; ').find(r => r.startsWith('medihost_auth='));
      if (match) {
        try {
          const auth = JSON.parse(decodeURIComponent(match.split('=')[1]));
          window.location.href = `${step.external}?mw_token=${encodeURIComponent(auth.token)}&mw_hospital_id=${encodeURIComponent(auth.hospitalId)}`;
          return;
        } catch { /* fallback */ }
      }
      window.location.href = step.external;
    } else if (step.href) {
      window.location.href = step.href;
    }
  }

  return (
    <div className="space-y-3">
      {/* Pending payment retry banner */}
      {pendingOrder && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-amber-800">
              Incomplete payment — Order {pendingOrder.order_ref}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your order is saved. Complete payment to activate your plan.
            </p>
          </div>
          <a
            href={`/payment?plan=${pendingOrder.plan_id}`}
            className="shrink-0 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Retry →
          </a>
        </div>
      )}

      {/* Checklist card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Set up your clinic
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {completedCount} of {totalSteps} steps completed
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-600">
              {progressPercent}%
            </span>
          </div>

          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => !step.done && (step.href || step.external) && handleStep(step)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${step.done
                    ? 'bg-emerald-50 border border-emerald-100'
                    : (step.href || step.external)
                      ? 'bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer'
                      : 'bg-gray-50 border border-gray-100 opacity-60'
                  }`}
              >
                {/* Check circle */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors
                  ${step.done
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-gray-300'
                  }`}>
                  {step.done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>

                {/* Label */}
                <span className={`flex-1 text-sm ${step.done ? 'text-emerald-700 font-medium line-through decoration-emerald-300' : 'text-gray-700 font-medium'}`}>
                  {step.label}
                </span>

                {/* Order ref pill */}
                {step.order_ref && (
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {step.order_ref}
                  </span>
                )}

                {/* Badge */}
                {step.badge && !step.done && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {step.badge}
                  </span>
                )}

                {/* Arrow for actionable steps */}
                {!step.done && (step.href || step.external) && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
