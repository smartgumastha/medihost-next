export const metadata = { title: 'Privacy Policy — MediHost™ AI' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span><sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup> AI
        </a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-1">Last updated: April 6, 2026</p>
        <p className="text-sm text-slate-500 mb-10">Effective date: April 6, 2026</p>

        <div className="text-slate-400 leading-relaxed space-y-0">

          {/* Section 1 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">1. Who We Are</h2>
          <p className="mb-4">
            MediHost&trade; AI is a product of <strong className="text-white">SmartGumastha Technologies</strong>, a
            technology company registered in Hyderabad, India. We build cloud-based clinic management software
            including website hosting, appointment scheduling, billing, EMR, and laboratory information systems
            for healthcare providers.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-2">
            <p className="text-sm"><strong className="text-white">Legal Entity:</strong> SmartGumastha Technologies</p>
            <p className="text-sm"><strong className="text-white">Address:</strong> Hyderabad, Telangana, India</p>
            <p className="text-sm"><strong className="text-white">Email:</strong>{' '}
              <a href="mailto:privacy@medihost.in" className="text-emerald-400 hover:underline">privacy@medihost.in</a>
            </p>
          </div>

          {/* Section 2 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">2. What Data We Collect</h2>
          <p className="mb-4">
            Under the Digital Personal Data Protection (DPDP) Act, 2023, the <strong className="text-white">clinic is the Data Fiduciary</strong> (they
            decide what patient data to collect and why). <strong className="text-white">MediHost&trade; AI is the Data Processor</strong> (we
            process data on the clinic&rsquo;s behalf using our software infrastructure).
          </p>
          <p className="mb-2 text-white font-semibold">We process the following categories of data:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Account data</strong> &mdash; clinic name, owner name, email address, phone number, and login credentials.</li>
            <li><strong className="text-white">Patient data</strong> &mdash; patient names, contact details, medical history, prescriptions, lab reports, and billing records as entered by the clinic.</li>
            <li><strong className="text-white">Usage data</strong> &mdash; pages visited, features used, browser type, device information, IP address, and session duration.</li>
            <li><strong className="text-white">Payment data</strong> &mdash; transaction IDs, plan details, and billing history. Card/UPI details are processed by Razorpay and never stored on our servers.</li>
            <li><strong className="text-white">Cookies</strong> &mdash; one essential authentication cookie. See Section 8 for details.</li>
          </ul>

          {/* Section 3 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">3. Why We Collect It</h2>
          <p className="mb-4">
            In accordance with the <strong className="text-white">purpose limitation</strong> principle of the DPDP Act, 2023, we only
            collect and process personal data for the following specific, lawful purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>To provide, operate, and maintain the MediHost&trade; AI platform and its features.</li>
            <li>To create and manage your clinic account and authenticate users.</li>
            <li>To process payments, generate invoices, and manage subscriptions.</li>
            <li>To send transactional communications (appointment reminders, billing receipts, system alerts).</li>
            <li>To improve our services, fix bugs, and develop new features based on aggregated usage patterns.</li>
            <li>To comply with legal obligations including tax filings and regulatory requirements.</li>
            <li>To respond to support requests and grievances.</li>
          </ul>
          <p>We do not process data for any purpose beyond what is stated above without obtaining fresh consent.</p>

          {/* Section 4 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">4. Who We Share Data With</h2>
          <p className="mb-4">
            We <strong className="text-white">never sell your personal data</strong>. We share data only with the following
            service providers who act as sub-processors:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Railway</strong> &mdash; application hosting and database infrastructure.</li>
            <li><strong className="text-white">Vercel</strong> &mdash; front-end hosting and edge network delivery.</li>
            <li><strong className="text-white">Razorpay</strong> &mdash; payment processing (PCI DSS compliant).</li>
            <li><strong className="text-white">Resend</strong> &mdash; transactional email delivery.</li>
            <li><strong className="text-white">Twilio</strong> &mdash; SMS notifications and appointment reminders.</li>
            <li><strong className="text-white">Anthropic</strong> &mdash; AI-powered features (data sent only when AI features are used, with minimal context).</li>
          </ul>
          <p>Each sub-processor is bound by data processing agreements. We may also disclose data if required by law, court order, or government authority.</p>

          {/* Section 5 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">5. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Active account data</strong> &mdash; retained while your account is active, plus 90 days after deletion to allow recovery.</li>
            <li><strong className="text-white">Medical records</strong> &mdash; retained for 7 years as per Indian medical record-keeping guidelines.</li>
            <li><strong className="text-white">GST/tax records</strong> &mdash; retained for 8 years as required under Indian tax law.</li>
            <li><strong className="text-white">Server logs</strong> &mdash; automatically purged after 30 days.</li>
          </ul>

          {/* Section 6 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">6. Your Rights Under the DPDP Act, 2023</h2>
          <p className="mb-4">As a Data Principal, you have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Right to Access</strong> &mdash; request a summary of the personal data we process and the processing activities.</li>
            <li><strong className="text-white">Right to Correction</strong> &mdash; request correction of inaccurate or misleading personal data.</li>
            <li><strong className="text-white">Right to Erasure</strong> &mdash; request deletion of your personal data, subject to legal retention requirements.</li>
            <li><strong className="text-white">Right to Grievance Redressal</strong> &mdash; file a complaint with our Grievance Officer or escalate to the Data Protection Board of India.</li>
            <li><strong className="text-white">Right to Nominate</strong> &mdash; nominate another individual to exercise your rights in case of death or incapacity.</li>
          </ul>
          <p>To exercise any of these rights, email <a href="mailto:privacy@medihost.in" className="text-emerald-400 hover:underline">privacy@medihost.in</a> with your registered clinic email. We will respond within 72 hours.</p>

          {/* Section 7 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">7. Grievance Officer</h2>
          <p className="mb-4">In accordance with the DPDP Act, 2023, we have appointed the following Grievance Officer:</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
            <p className="text-sm"><strong className="text-white">Name:</strong> Sai Charan Kumar Pakala</p>
            <p className="text-sm"><strong className="text-white">Designation:</strong> Founder &amp; Data Protection Officer</p>
            <p className="text-sm"><strong className="text-white">Email:</strong>{' '}
              <a href="mailto:privacy@medihost.in" className="text-emerald-400 hover:underline">privacy@medihost.in</a>
            </p>
            <p className="text-sm"><strong className="text-white">Phone:</strong> +91 7993 135 689</p>
            <p className="text-sm"><strong className="text-white">Location:</strong> Hyderabad, Telangana, India</p>
          </div>
          <p>All grievances will be acknowledged within <strong className="text-white">72 hours</strong> and resolved as expeditiously as possible.</p>

          {/* Section 8 */}
          <h2 id="cookies" className="text-xl font-bold text-white mt-10 mb-4">8. Cookies</h2>
          <p className="mb-4">
            MediHost&trade; AI uses <strong className="text-white">one essential cookie</strong>:
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4 overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="text-left text-white">
                  <th className="pb-2 pr-4">Cookie</th>
                  <th className="pb-2 pr-4">Purpose</th>
                  <th className="pb-2 pr-4">Duration</th>
                  <th className="pb-2">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pr-4 font-mono text-emerald-400">medihost_auth</td>
                  <td className="pr-4">Session authentication</td>
                  <td className="pr-4">Session / 30 days</td>
                  <td>Essential</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We do <strong className="text-white">not</strong> use any tracking cookies, advertising cookies, or third-party analytics cookies.
            Because we only use a strictly necessary cookie, no opt-in consent is required for its operation &mdash; though
            we inform you of its use via our cookie banner.
          </p>

          {/* Section 9 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">9. Healthcare Data Disclaimer</h2>
          <p className="mb-4">
            MediHost&trade; AI is a <strong className="text-white">software platform</strong>, not a healthcare provider, medical
            device, or diagnostic service. We do not provide medical advice, diagnoses, or treatment
            recommendations. All clinical decisions are the sole responsibility of the licensed healthcare
            professionals using the platform. The data entered, stored, and managed through MediHost&trade; AI is
            under the full control and responsibility of the clinic (Data Fiduciary).
          </p>

          {/* Section 10 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">10. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you
            by email at least <strong className="text-white">30 days before</strong> the changes take effect. The &ldquo;Last updated&rdquo; date at
            the top of this page will always reflect the most recent revision. Continued use of the platform after
            the effective date constitutes acceptance of the updated policy.
          </p>

          {/* Section 11 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">11. Contact</h2>
          <p className="mb-4">For any privacy-related questions or concerns, reach us at:</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-sm"><strong className="text-white">Email:</strong>{' '}
              <a href="mailto:privacy@medihost.in" className="text-emerald-400 hover:underline">privacy@medihost.in</a>
            </p>
            <p className="text-sm"><strong className="text-white">Subject line:</strong> Privacy Inquiry &mdash; [Your Clinic Name]</p>
          </div>

        </div>
      </div>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 SmartGumastha Technologies &middot; MediHost&trade; AI &mdash; Clinic Software That Works
      </footer>
    </div>
  );
}
