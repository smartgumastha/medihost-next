'use client';

import { useEffect, useState } from 'react';

function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

interface Order {
  id: string;
  order_ref: string;
  hospital_id: string;
  plan_id: string;
  domain_requested: string;
  amount_paise: number;
  gst_paise: number;
  total_paise: number;
  status: string;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  signup_intent: string;
  created_at: string;
  updated_at: string;
}

interface Summary {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  revenue: number;
}

var STATUS_COLORS: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  provisioning: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  var [orders, setOrders] = useState<Order[]>([]);
  var [summary, setSummary] = useState<Summary>({ total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 });
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');

  useEffect(function () {
    fetch('/api/admin/orders')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          setOrders(data.orders || []);
          setSummary(data.summary || { total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 });
        } else {
          setError(data.error || 'Failed to load orders');
        }
      })
      .catch(function () { setError('Network error'); })
      .finally(function () { setLoading(false); });
  }, []);

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">Loading orders...</div>;
  if (error) return <div className="text-red-400 text-sm py-8 text-center">{error}</div>;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Orders</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          <div className="text-xs text-gray-500 mt-1">Total Orders</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-emerald-500 p-4">
          <div className="text-2xl font-bold text-gray-900">{summary.paid}</div>
          <div className="text-xs text-gray-500 mt-1">Paid — ₹{fmt(Math.round(summary.revenue / 100))}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-amber-500 p-4">
          <div className="text-2xl font-bold text-gray-900">{summary.pending}</div>
          <div className="text-xs text-gray-500 mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-red-500 p-4">
          <div className="text-2xl font-bold text-gray-900">{summary.failed}</div>
          <div className="text-xs text-gray-500 mt-1">Failed</div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Domain</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Payment ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No orders yet</td></tr>
              )}
              {orders.map(function (order) {
                var statusClass = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500';
                var date = order.created_at ? new Date(typeof order.created_at === 'string' ? order.created_at : Number(order.created_at)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-medium text-gray-900">{order.order_ref}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{order.signup_intent || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{order.plan_id}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{order.domain_requested || '—'}</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-gray-900">₹{fmt(Math.round((order.total_paise || 0) / 100))}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ' + statusClass}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-400">{order.razorpay_payment_id || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
