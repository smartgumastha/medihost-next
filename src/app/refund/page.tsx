export const metadata = { title: 'Refund Policy — MediHost™ AI' };

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span><sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup> AI
        </a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-2">Refund Policy</h1>
        <p className="text-sm text-slate-500 mb-1">Last updated: April 6, 2026</p>
        <p className="text-sm text-slate-500 mb-10">Effective date: April 6, 2026</p>

        <div className="text-slate-400 leading-relaxed space-y-0">

          {/* Section 1 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">1. Monthly Subscriptions</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>You may cancel your monthly subscription at any time from your dashboard or by emailing <a href="mailto:billing@medihost.in" className="text-emerald-400 hover:underline">billing@medihost.in</a>.</li>
            <li>No refund will be issued for the current billing month &mdash; your access continues until the end of the paid period.</li>
            <li>After the billing period ends, your account will be downgraded to the free Starter plan.</li>
            <li>No partial or pro-rata refunds are provided for monthly plans.</li>
          </ul>

          {/* Section 2 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">2. Yearly Subscriptions</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Within 7 days</strong> &mdash; if you cancel within 7 days of your yearly subscription purchase, you are eligible for a <strong className="text-white">full refund</strong>.</li>
            <li><strong className="text-white">After 7 days</strong> &mdash; a pro-rata refund will be calculated based on the unused full months remaining in your subscription period.</li>
            <li>Refunds are processed within <strong className="text-white">5&ndash;7 business days</strong> to your original payment method via Razorpay.</li>
            <li>Any discounts, coupons, or promotional pricing applied at the time of purchase will be factored into the refund calculation.</li>
          </ul>

          {/* Section 3 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">3. Custom Domain Registrations</h2>
          <p className="mb-4">
            Domain name registrations are <strong className="text-white">non-refundable</strong> once the domain has been registered.
            This is because domain registrations are processed through third-party registrars (ICANN/ResellerClub)
            and cannot be reversed once completed. This policy applies regardless of whether the domain was
            registered as part of a subscription plan or as a standalone purchase.
          </p>

          {/* Section 4 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">4. Free Plan (Starter)</h2>
          <p className="mb-4">
            The Starter plan is free and does not involve any payment. Therefore, no refund policy applies to the
            free tier. You may continue using the Starter plan indefinitely at no cost.
          </p>

          {/* Section 5 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">5. How to Request a Refund</h2>
          <p className="mb-4">To request a refund, email us with the following details:</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
            <p className="text-sm"><strong className="text-white">Email:</strong>{' '}
              <a href="mailto:billing@medihost.in" className="text-emerald-400 hover:underline">billing@medihost.in</a>
            </p>
            <p className="text-sm"><strong className="text-white">Subject:</strong> Refund Request &mdash; [Your Clinic Name]</p>
            <p className="text-sm mt-2"><strong className="text-white">Include:</strong></p>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-1">
              <li>Your registered clinic email address</li>
              <li>Razorpay transaction/order ID</li>
              <li>Reason for refund</li>
              <li>Plan type (monthly/yearly)</li>
            </ul>
          </div>
          <p>We will acknowledge your request within 24 hours and process eligible refunds within 5&ndash;7 business days.</p>

          {/* Section 6 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">6. Disputes</h2>
          <p className="mb-4">
            If you have a billing dispute, please contact us first at{' '}
            <a href="mailto:billing@medihost.in" className="text-emerald-400 hover:underline">billing@medihost.in</a> before
            initiating a chargeback or dispute with your payment provider. We resolve <strong className="text-white">95% of billing
            issues within 24 hours</strong>.
          </p>
          <p className="mb-4">
            Chargebacks initiated without first contacting us may result in account suspension until the dispute
            is resolved. We are committed to fair resolution and will work with you to address any concerns.
          </p>

        </div>
      </div>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 SmartGumastha Technologies &middot; MediHost&trade; AI &mdash; Clinic Software That Works
      </footer>
    </div>
  );
}
