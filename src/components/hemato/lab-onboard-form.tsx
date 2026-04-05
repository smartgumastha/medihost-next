"use client";

import Link from "next/link";
import { useState } from "react";

const STEPS = [
  "Lab Info",
  "Location",
  "Certifications",
  "Services",
  "Pricing & Bank",
];

const TEST_CATEGORIES = [
  "Hematology",
  "Biochemistry",
  "Microbiology",
  "Serology",
  "Histopathology",
  "Radiology",
  "Molecular Biology",
  "Immunology",
  "Cytology",
  "Urine Analysis",
];

const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const inputClass =
  "w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/20 transition text-sm";
const labelClass = "block text-sm font-medium text-gray-300 mb-2";

function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}) {
  return (
    <div className="mb-10">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-3">
        {steps.map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
            i < current ? "bg-[#DC2626]" : i === current ? "bg-[#DC2626]/60" : "bg-white/[0.08]"
          }`} />
        ))}
      </div>
      {/* Step indicators */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                i < current
                  ? "bg-[#DC2626] text-white shadow-lg shadow-[#DC2626]/30"
                  : i === current
                  ? "bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/60"
                  : "bg-white/[0.05] text-gray-500 border border-white/[0.08]"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i === current ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className="w-6 h-px bg-white/[0.08] hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LabOnboardForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1
  const [labName, setLabName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [labType, setLabType] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");

  // Step 2
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [serviceRadius, setServiceRadius] = useState("");

  // Step 3
  const [nablStatus, setNablStatus] = useState("");
  const [certFile, setCertFile] = useState("");
  const [licenseNo, setLicenseNo] = useState("");

  // Step 4
  const [categories, setCategories] = useState<string[]>([]);
  const [homeCollection, setHomeCollection] = useState(false);
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [workDays, setWorkDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);

  // Step 5
  const [priceRange, setPriceRange] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!labName.trim()) errs.labName = "Required";
      if (!ownerName.trim()) errs.ownerName = "Required";
      if (!phone.trim() || phone.length < 10) errs.phone = "Valid phone required";
      if (!email.trim() || !email.includes("@")) errs.email = "Valid email required";
      if (!labType) errs.labType = "Select lab type";
    } else if (step === 1) {
      if (!address.trim()) errs.address = "Required";
      if (!city.trim()) errs.city = "Required";
      if (!pincode.trim() || pincode.length < 6) errs.pincode = "Valid pincode required";
    } else if (step === 2) {
      if (!nablStatus) errs.nablStatus = "Select NABL status";
    } else if (step === 3) {
      if (categories.length === 0) errs.categories = "Select at least one";
    } else if (step === 4) {
      if (!bankName.trim()) errs.bankName = "Required";
      if (!accountNo.trim()) errs.accountNo = "Required";
      if (!ifsc.trim()) errs.ifsc = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function submit() {
    if (!validate()) return;
    const text = encodeURIComponent(
      `*New Lab Registration*\n\nLab: ${labName}\nOwner: ${ownerName}\nPhone: ${phone}\nEmail: ${email}\nType: ${labType}\nEst: ${establishedYear}\n\nAddress: ${address}, ${city} - ${pincode}\nMaps: ${mapsLink}\nRadius: ${serviceRadius}km\n\nNABL: ${nablStatus}\nLicense: ${licenseNo}\n\nCategories: ${categories.join(", ")}\nHome Collection: ${homeCollection ? "Yes" : "No"}\nHours: ${openTime}-${closeTime}\nDays: ${workDays.join(", ")}\n\nPrice Range: ${priceRange}\nGST: ${gstNo}\nBank: ${bankName}\nAccount: ${accountNo}\nIFSC: ${ifsc}`
    );
    window.open(`https://wa.me/917993135689?text=${text}`, "_blank");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0C0D0F] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#DC2626]/10 border-2 border-[#DC2626] flex items-center justify-center text-4xl mx-auto shadow-lg shadow-[#DC2626]/20">
            ✓
          </div>
          <h2 className="mt-6 text-2xl font-bold">Registration Submitted!</h2>
          <p className="mt-3 text-gray-400 leading-relaxed">
            Our team will review your application and contact you within 24
            hours. Check your WhatsApp for confirmation.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium px-6 py-3 rounded-xl transition"
          >
            Back to Hemato
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0D0F] text-white">
      <nav className="border-b border-white/[0.08] bg-[#0C0D0F]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#DC2626] flex items-center justify-center font-bold text-lg shadow-lg shadow-[#DC2626]/20">
              H
            </div>
            <span className="font-semibold">Hemato</span>
          </Link>
          <span className="text-sm text-gray-500">Lab Registration</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <StepIndicator current={step} steps={STEPS} />

        {/* Step 1: Lab Info */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Lab Information</h2>
            <p className="text-sm text-gray-500 -mt-3">Tell us about your diagnostic lab.</p>
            <div>
              <label className={labelClass}>Lab Name *</label>
              <input
                className={inputClass}
                placeholder="e.g. Star Diagnostics"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
              />
              {errors.labName && (
                <p className="text-[#DC2626] text-xs mt-1.5">{errors.labName}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Owner / Contact Name *</label>
              <input
                className={inputClass}
                placeholder="Full name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
              {errors.ownerName && (
                <p className="text-[#DC2626] text-xs mt-1.5">
                  {errors.ownerName}
                </p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone *</label>
                <input
                  className={inputClass}
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && (
                  <p className="text-[#DC2626] text-xs mt-1.5">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="lab@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-[#DC2626] text-xs mt-1.5">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Lab Type *</label>
                <select
                  className={inputClass}
                  value={labType}
                  onChange={(e) => setLabType(e.target.value)}
                >
                  <option value="" className="bg-[#0C0D0F]">
                    Select type
                  </option>
                  <option value="standalone" className="bg-[#0C0D0F]">
                    Standalone Lab
                  </option>
                  <option value="hospital_attached" className="bg-[#0C0D0F]">
                    Hospital Attached
                  </option>
                  <option value="collection_center" className="bg-[#0C0D0F]">
                    Collection Center
                  </option>
                  <option value="chain" className="bg-[#0C0D0F]">
                    Chain / Franchise
                  </option>
                </select>
                {errors.labType && (
                  <p className="text-[#DC2626] text-xs mt-1.5">
                    {errors.labType}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Established Year</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 2015"
                  value={establishedYear}
                  onChange={(e) => setEstablishedYear(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Location Details</h2>
            <p className="text-sm text-gray-500 -mt-3">Where is your lab located?</p>
            <div>
              <label className={labelClass}>Full Address *</label>
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Building, Street, Area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && (
                <p className="text-[#DC2626] text-xs mt-1.5">{errors.address}</p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Hyderabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                {errors.city && (
                  <p className="text-[#DC2626] text-xs mt-1.5">{errors.city}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Pincode *</label>
                <input
                  className={inputClass}
                  placeholder="6-digit pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
                {errors.pincode && (
                  <p className="text-[#DC2626] text-xs mt-1.5">
                    {errors.pincode}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Google Maps Link</label>
              <input
                className={inputClass}
                placeholder="https://maps.google.com/..."
                value={mapsLink}
                onChange={(e) => setMapsLink(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Service Radius (km)</label>
              <input
                className={inputClass}
                placeholder="e.g. 10"
                value={serviceRadius}
                onChange={(e) => setServiceRadius(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Certifications */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Certifications</h2>
            <p className="text-sm text-gray-500 -mt-3">Your accreditation details.</p>
            <div>
              <label className={labelClass}>NABL Accreditation *</label>
              <div className="space-y-2.5 mt-2">
                {["NABL Accredited", "Applied / In Progress", "Not Yet"].map(
                  (opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-white/[0.03] transition"
                      onClick={() => setNablStatus(opt)}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          nablStatus === opt
                            ? "border-[#DC2626] bg-[#DC2626]"
                            : "border-white/20"
                        }`}
                      >
                        {nablStatus === opt && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm text-gray-300">{opt}</span>
                    </label>
                  )
                )}
              </div>
              {errors.nablStatus && (
                <p className="text-[#DC2626] text-xs mt-1.5">
                  {errors.nablStatus}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Certification Upload</label>
              <div
                className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:border-[#DC2626]/30 transition"
                onClick={() => setCertFile("nabl_certificate.pdf")}
              >
                {certFile ? (
                  <div className="text-sm">
                    <span className="text-[#DC2626]">{certFile}</span>
                    <p className="text-gray-500 mt-1">Click to change</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <p>Click to upload NABL / ISO certificate</p>
                    <p className="text-xs mt-1">PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>License Number</label>
              <input
                className={inputClass}
                placeholder="Lab license / registration number"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Services */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Services Offered</h2>
            <p className="text-sm text-gray-500 -mt-3">What tests does your lab perform?</p>
            <div>
              <label className={labelClass}>Test Categories *</label>
              <div className="grid grid-cols-2 gap-2.5 mt-2">
                {TEST_CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/[0.03] transition"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        categories.includes(cat)
                          ? "bg-[#DC2626] border-[#DC2626]"
                          : "border-white/20"
                      }`}
                      onClick={() =>
                        setCategories((prev) =>
                          prev.includes(cat)
                            ? prev.filter((c) => c !== cat)
                            : [...prev, cat]
                        )
                      }
                    >
                      {categories.includes(cat) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-300">{cat}</span>
                  </label>
                ))}
              </div>
              {errors.categories && (
                <p className="text-[#DC2626] text-xs mt-1.5">
                  {errors.categories}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-white/[0.03] transition">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                    homeCollection
                      ? "bg-[#DC2626] border-[#DC2626]"
                      : "border-white/20"
                  }`}
                  onClick={() => setHomeCollection(!homeCollection)}
                >
                  {homeCollection && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span className="text-sm text-gray-300">
                  We offer home sample collection
                </span>
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Opening Time</label>
                <input
                  className={inputClass}
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Closing Time</label>
                <input
                  className={inputClass}
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Working Days</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {WORKING_DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setWorkDays((prev) =>
                        prev.includes(day)
                          ? prev.filter((d) => d !== day)
                          : [...prev, day]
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      workDays.includes(day)
                        ? "bg-[#DC2626] text-white shadow-lg shadow-[#DC2626]/20"
                        : "bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Pricing & Bank */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Pricing & Bank Details</h2>
            <p className="text-sm text-gray-500 -mt-3">For settlements and payouts.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price Range</label>
                <select
                  className={inputClass}
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="" className="bg-[#0C0D0F]">
                    Select range
                  </option>
                  <option value="budget" className="bg-[#0C0D0F]">
                    Budget (Below Market)
                  </option>
                  <option value="market" className="bg-[#0C0D0F]">
                    Market Rate
                  </option>
                  <option value="premium" className="bg-[#0C0D0F]">
                    Premium
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>GST Number</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 36AXXXX1234X1ZX"
                  value={gstNo}
                  onChange={(e) => setGstNo(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Bank Name *</label>
              <input
                className={inputClass}
                placeholder="e.g. State Bank of India"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              {errors.bankName && (
                <p className="text-[#DC2626] text-xs mt-1.5">{errors.bankName}</p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Account Number *</label>
                <input
                  className={inputClass}
                  placeholder="Account number"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                />
                {errors.accountNo && (
                  <p className="text-[#DC2626] text-xs mt-1.5">
                    {errors.accountNo}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>IFSC Code *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. SBIN0001234"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                />
                {errors.ifsc && (
                  <p className="text-[#DC2626] text-xs mt-1.5">{errors.ifsc}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
          {step > 0 ? (
            <button
              onClick={prev}
              className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1.5"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium px-8 py-3 rounded-xl transition text-sm shadow-lg shadow-[#DC2626]/20"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium px-8 py-3 rounded-xl transition text-sm shadow-lg shadow-[#DC2626]/20"
            >
              Submit via WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
