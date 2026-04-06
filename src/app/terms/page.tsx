export const metadata = { title: 'Terms of Service — MediHost AI™' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span> AI<sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup>
        </a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-1">Last updated: April 6, 2026</p>
        <p className="text-sm text-slate-500 mb-10">Effective date: April 6, 2026</p>

        <div className="text-slate-400 leading-relaxed space-y-0">

          {/* Section 1 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using MediHost AI&trade; (&ldquo;the Service&rdquo;), operated by SmartGumastha Technologies
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), you agree to be bound by these Terms of Service.
            If you do not agree, do not use the Service. These terms apply to all users including clinic owners,
            staff members, and any person accessing the platform.
          </p>

          {/* Section 2 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">2. The Service</h2>
          <p className="mb-4">
            MediHost AI&trade; is a cloud-based clinic management platform that provides website hosting, custom
            domains, appointment scheduling, billing &amp; invoicing, electronic medical records (EMR), laboratory
            information system (LIS), patient communication, and AI-powered features for healthcare providers
            including clinics, labs, pharmacies, and other medical practices.
          </p>

          {/* Section 3 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">3. Your Account</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>You must provide accurate, complete registration information and keep it updated.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You are responsible for all activities that occur under your account.</li>
            <li>You must notify us immediately at <a href="mailto:support@medihost.in" className="text-emerald-400 hover:underline">support@medihost.in</a> if you suspect unauthorized access.</li>
            <li>One account per clinic. Multiple staff members can be added under a single clinic account with role-based access.</li>
          </ul>

          {/* Section 4 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">4. Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Starter Plan</strong> &mdash; free forever with core features. No credit card required.</li>
            <li><strong className="text-white">Paid Plans</strong> &mdash; billed monthly or yearly in advance. Prices are in INR and subject to applicable GST (18%).</li>
            <li><strong className="text-white">Custom Domains</strong> &mdash; domain registration fees are non-refundable once the domain has been registered with the registrar.</li>
            <li><strong className="text-white">Payment Processor</strong> &mdash; all payments are processed securely through Razorpay (PCI DSS Level 1 compliant). We do not store card or UPI details on our servers.</li>
            <li>We reserve the right to change pricing with 30 days&rsquo; written notice. Existing subscriptions will be honored until their current billing period ends.</li>
          </ul>

          {/* Section 5 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">5. Patient Data Responsibility</h2>
          <p className="mb-4">
            Under the Digital Personal Data Protection (DPDP) Act, 2023, the <strong className="text-white">clinic is the Data
            Fiduciary</strong> &mdash; you determine what patient data is collected, the purposes for collection, and are
            responsible for obtaining valid consent from patients. MediHost AI&trade; acts as the <strong className="text-white">Data
            Processor</strong>, processing patient data solely on your instructions and as described in our{' '}
            <a href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</a>.
          </p>
          <p className="mb-4">
            You are responsible for ensuring that all patient data entered into the platform complies with
            applicable laws, including obtaining necessary consents and maintaining data accuracy.
          </p>

          {/* Section 6 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">6. Acceptable Use</h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Use the Service for any unlawful purpose or in violation of any applicable law or regulation.</li>
            <li>Upload or transmit malicious code, viruses, or any harmful content.</li>
            <li>Attempt to gain unauthorized access to other accounts, systems, or networks.</li>
            <li>Resell, sublicense, or redistribute the Service without written permission.</li>
            <li>Use the Service to store data unrelated to healthcare practice management.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Scrape, crawl, or use automated tools to extract data from the platform.</li>
          </ul>
          <p>Violation of these terms may result in immediate account suspension or termination.</p>

          {/* Section 7 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">7. Uptime &amp; Support</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Uptime Target</strong> &mdash; we target <strong className="text-white">99.5% uptime</strong> on a monthly basis, excluding scheduled maintenance windows.</li>
            <li><strong className="text-white">Support Response</strong> &mdash; we aim to respond to all support requests within <strong className="text-white">24 hours</strong> during business days.</li>
            <li>Scheduled maintenance will be communicated at least 24 hours in advance via email.</li>
            <li>We are not liable for downtime caused by factors beyond our reasonable control, including third-party service outages, natural disasters, or government actions.</li>
          </ul>

          {/* Section 8 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">8. Intellectual Property</h2>
          <p className="mb-4">
            The MediHost&trade; name, logo, and brand are the intellectual property of SmartGumastha Technologies.
            Trademark application filed under <strong className="text-white">Class 42 (Software as a Service)</strong>,
            Reference Number <strong className="text-white">14007693</strong>, with the Indian Trademark Registry.
          </p>
          <p className="mb-4">
            All platform code, design, documentation, and AI models are proprietary. Your content (clinic data,
            patient records) remains yours &mdash; we claim no ownership over data you enter into the platform.
          </p>

          {/* Section 9 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">9. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by applicable law, SmartGumastha Technologies and its officers,
            employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages arising out of or related to your use of the Service.
          </p>
          <p className="mb-4">
            Our total aggregate liability for any claims arising from or related to the Service shall not
            exceed the amount you paid us in the <strong className="text-white">3 months preceding the claim</strong>. For free-tier users,
            our maximum liability is INR 0.
          </p>

          {/* Section 10 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">10. Termination</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>You may cancel your subscription at any time from your dashboard or by emailing <a href="mailto:billing@medihost.in" className="text-emerald-400 hover:underline">billing@medihost.in</a>.</li>
            <li>Upon cancellation, you will retain access until the end of your current billing period.</li>
            <li>After termination, you have <strong className="text-white">30 days to export your data</strong>. We will provide data export tools and assistance.</li>
            <li>We may terminate or suspend your account immediately for violation of these Terms, with or without notice.</li>
            <li>After the 30-day data export window, your data will be permanently deleted in accordance with our data retention policy.</li>
          </ul>

          {/* Section 11 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">11. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of <strong className="text-white">India</strong>.
            Any disputes arising from these Terms or the use of the Service shall be subject to the exclusive
            jurisdiction of the courts in <strong className="text-white">Hyderabad, Telangana, India</strong>.
          </p>

          {/* Section 12 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">12. Contact</h2>
          <p className="mb-4">For questions about these Terms of Service:</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-sm"><strong className="text-white">Email:</strong>{' '}
              <a href="mailto:legal@medihost.in" className="text-emerald-400 hover:underline">legal@medihost.in</a>
            </p>
            <p className="text-sm"><strong className="text-white">Subject line:</strong> Terms Inquiry &mdash; [Your Clinic Name]</p>
          </div>

        </div>
      </div>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 SmartGumastha Technologies &middot; MediHost AI&trade; &mdash; Clinic Software That Works
      </footer>
    </div>
  );
}
