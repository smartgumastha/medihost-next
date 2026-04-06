export const metadata = { title: 'Healthcare Compliance — MediHost™ AI' };

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span><sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup> AI
        </a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-2">Healthcare Compliance</h1>
        <p className="text-sm text-slate-500 mb-1">Last updated: April 6, 2026</p>
        <p className="text-sm text-slate-500 mb-10">Effective date: April 6, 2026</p>

        <div className="text-slate-400 leading-relaxed space-y-0">

          {/* Section 1 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">1. DPDP Act, 2023 Compliance</h2>
          <p className="mb-4">
            MediHost&trade; AI is designed to comply with the <strong className="text-white">Digital Personal Data Protection (DPDP)
            Act, 2023</strong> of India. As a Data Processor, we implement the following measures:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Purpose limitation</strong> &mdash; data is processed only for the specific purposes described in our Privacy Policy.</li>
            <li><strong className="text-white">Data minimisation</strong> &mdash; we collect only the data necessary to provide the Service.</li>
            <li><strong className="text-white">Storage limitation</strong> &mdash; data is retained only as long as necessary, with defined retention periods.</li>
            <li><strong className="text-white">Data Principal rights</strong> &mdash; we provide mechanisms for access, correction, erasure, and grievance redressal.</li>
            <li><strong className="text-white">Grievance Officer</strong> &mdash; appointed as required under the Act (see our <a href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</a>).</li>
            <li><strong className="text-white">Breach notification</strong> &mdash; we will notify the Data Protection Board and affected Data Fiduciaries within the timeframes mandated by the Act.</li>
          </ul>

          {/* Section 2 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">2. Healthcare Data Practices</h2>
          <p className="mb-4">We employ the following technical measures to protect healthcare data:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Encryption in transit</strong> &mdash; all data is transmitted over <strong className="text-white">TLS 1.3</strong> encrypted connections. No unencrypted HTTP traffic is permitted.</li>
            <li><strong className="text-white">Infrastructure security</strong> &mdash; our application is hosted on <strong className="text-white">Railway</strong>, which maintains <strong className="text-white">SOC 2 Type II</strong> compliance for their infrastructure.</li>
            <li><strong className="text-white">Role-Based Access Control (RBAC)</strong> &mdash; granular permissions ensure staff members only access data relevant to their role (doctor, receptionist, lab technician, admin).</li>
            <li><strong className="text-white">Audit logs</strong> &mdash; all significant actions (login, data access, modifications, deletions) are logged with timestamps, user identity, and IP address.</li>
            <li><strong className="text-white">LIS data segregation</strong> &mdash; laboratory data is logically segregated from general clinic data, with separate access controls and audit trails.</li>
          </ul>

          {/* Section 3 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">3. HIPAA Alignment</h2>
          <p className="mb-4">
            HIPAA (Health Insurance Portability and Accountability Act) is a <strong className="text-white">United States regulation</strong>.
            MediHost&trade; AI primarily serves clinics in India and is governed by the <strong className="text-white">DPDP Act, 2023</strong> and
            the <strong className="text-white">Information Technology Act, 2000</strong> (including the IT Rules, 2011).
          </p>
          <p className="mb-4">
            However, we recognise that many of our healthcare data protection practices <strong className="text-white">align with HIPAA
            standards</strong>, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access controls and authentication requirements</li>
            <li>Audit trail and activity logging</li>
            <li>Encryption of protected health information in transit and at rest</li>
            <li>Role-based access to patient records</li>
            <li>Breach notification procedures</li>
          </ul>
          <p>
            If you require a formal Business Associate Agreement (BAA) for US-based operations, please contact{' '}
            <a href="mailto:legal@medihost.in" className="text-emerald-400 hover:underline">legal@medihost.in</a>.
          </p>

          {/* Section 4 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">4. ABDM Readiness</h2>
          <p className="mb-4">
            We are actively working towards integration with the <strong className="text-white">Ayushman Bharat Digital Mission
            (ABDM)</strong> framework. Our planned timeline:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">ABHA (Ayushman Bharat Health Account) integration</strong> &mdash; targeted for <strong className="text-white">Q3 2026</strong>, enabling patients to link their ABHA IDs with clinic records on MediHost&trade; AI.</li>
            <li>Support for Health Information Exchange standards as defined by ABDM.</li>
            <li>Compliance with ABDM&rsquo;s consent framework for health data sharing.</li>
          </ul>

          {/* Section 5 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">5. LIS Compliance</h2>
          <p className="mb-4">
            Our Laboratory Information System (LIS) module is designed with alignment to <strong className="text-white">ISO
            15189</strong> and <strong className="text-white">NABL (National Accreditation Board for Testing and Calibration
            Laboratories)</strong> standards:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">9-step workflow</strong> &mdash; sample registration, collection, accessioning, processing, analysis, verification, reporting, dispatch, and archival.</li>
            <li><strong className="text-white">Data segregation</strong> &mdash; laboratory data is logically isolated from general clinic records with independent access controls.</li>
            <li><strong className="text-white">Dual signature</strong> &mdash; lab reports require verification by both the testing technician and the authorising pathologist before release.</li>
            <li><strong className="text-white">Rejection logging</strong> &mdash; sample rejections are logged with reasons, timestamps, and responsible personnel for quality tracking.</li>
            <li><strong className="text-white">Complete audit trail</strong> &mdash; every action on a lab order (creation, modification, verification, printing, dispatch) is logged with user identity and timestamp.</li>
          </ul>

          {/* Section 6 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">6. Security Practices</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong className="text-white">Password hashing</strong> &mdash; all passwords are hashed using <strong className="text-white">bcrypt</strong> with appropriate salt rounds. Plain-text passwords are never stored.</li>
            <li><strong className="text-white">Session management</strong> &mdash; sessions use <strong className="text-white">JWT tokens</strong> stored in <strong className="text-white">httpOnly</strong> cookies, preventing client-side JavaScript access.</li>
            <li><strong className="text-white">Rate limiting</strong> &mdash; API endpoints are rate-limited to prevent brute-force attacks and abuse.</li>
            <li><strong className="text-white">CORS policy</strong> &mdash; strict Cross-Origin Resource Sharing policies restrict API access to authorised domains only.</li>
          </ul>

          {/* Section 7 */}
          <h2 className="text-xl font-bold text-white mt-10 mb-4">7. Vulnerability Disclosure</h2>
          <p className="mb-4">
            We take security seriously. If you discover a vulnerability in MediHost&trade; AI, please report it
            responsibly:
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
            <p className="text-sm"><strong className="text-white">Email:</strong>{' '}
              <a href="mailto:security@medihost.in" className="text-emerald-400 hover:underline">security@medihost.in</a>
            </p>
            <p className="text-sm"><strong className="text-white">Response:</strong> We will acknowledge your report within <strong className="text-white">24 hours</strong>.</p>
            <p className="text-sm"><strong className="text-white">Subject line:</strong> Security Vulnerability &mdash; [Brief Description]</p>
          </div>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Please do not publicly disclose the vulnerability until we have had a reasonable opportunity to address it.</li>
            <li>Do not access, modify, or delete data belonging to other users during your research.</li>
            <li>We will not take legal action against researchers who follow responsible disclosure practices.</li>
          </ul>

        </div>
      </div>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 SmartGumastha Technologies &middot; MediHost&trade; AI &mdash; Clinic Software That Works
      </footer>
    </div>
  );
}
