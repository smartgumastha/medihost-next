"use client";

import Link from "next/link";
import { useState } from "react";

const STEPS = [
  "Personal",
  "Identity",
  "Professional",
  "Work Preferences",
  "Bank Details",
];

const SKILLS = [
  "Venipuncture",
  "Capillary Collection",
  "Pediatric Collection",
  "Geriatric Collection",
  "Blood Culture",
  "Urine Collection",
  "ECG",
  "Vitals Check",
];

const HYDERABAD_ZONES = [
  "Ameerpet",
  "Banjara Hills",
  "Begumpet",
  "Dilsukhnagar",
  "Gachibowli",
  "Hitech City",
  "Jubilee Hills",
  "Kukatpally",
  "LB Nagar",
  "Madhapur",
  "Mehdipatnam",
  "Miyapur",
  "Secunderabad",
  "Tarnaka",
  "Uppal",
];

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

export function PhleboOnboardForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Personal
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [photoFile, setPhotoFile] = useState("");

  // Step 2: Identity
  const [aadhaar, setAadhaar] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // Step 3: Professional
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  // Step 4: Work Preferences
  const [zones, setZones] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [shift, setShift] = useState("");
  const [vehicle, setVehicle] = useState("");

  // Step 5: Bank
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upi, setUpi] = useState("");

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!name.trim()) errs.name = "Required";
      if (!phone.trim() || phone.length < 10) errs.phone = "Valid phone required";
      if (!dob) errs.dob = "Required";
      if (!gender) errs.gender = "Required";
    } else if (step === 1) {
      if (!aadhaar.trim() || aadhaar.length < 12) errs.aadhaar = "Valid Aadhaar required";
      if (!address.trim()) errs.address = "Required";
      if (!city.trim()) errs.city = "Required";
      if (!pincode.trim() || pincode.length < 6) errs.pincode = "Valid pincode required";
    } else if (step === 2) {
      if (!experience) errs.experience = "Required";
    } else if (step === 3) {
      if (zones.length === 0) errs.zones = "Select at least one zone";
      if (!availability) errs.availability = "Required";
      if (!shift) errs.shift = "Required";
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
      `*New Phlebo Registration*\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nDOB: ${dob}\nGender: ${gender}\n\nAadhaar: ${aadhaar}\nAddress: ${address}, ${city} - ${pincode}\n\nExperience: ${experience}\nCerts: ${certifications}\nSkills: ${skills.join(", ")}\n\nZones: ${zones.join(", ")}\nAvailability: ${availability}\nShift: ${shift}\nVehicle: ${vehicle}\n\nBank: ${bankName}\nAccount: ${accountNo}\nIFSC: ${ifsc}\nUPI: ${upi}`
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
          <h2 className="mt-6 text-2xl font-bold">Application Submitted!</h2>
          <p className="mt-3 text-gray-400 leading-relaxed">
            Welcome to the Hemato collection network. Our team will contact you
            within 24 hours for verification and training.
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
          <span className="text-sm text-gray-500">Phlebo Registration</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <StepIndicator current={step} steps={STEPS} />

        {/* Step 1: Personal */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Personal Details</h2>
            <p className="text-sm text-gray-500 -mt-3">Your basic information.</p>
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                className={inputClass}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p className="text-[#DC2626] text-xs mt-1.5">{errors.name}</p>
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
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date of Birth *</label>
                <input
                  className={inputClass}
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                {errors.dob && (
                  <p className="text-[#DC2626] text-xs mt-1.5">{errors.dob}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Gender *</label>
                <select
                  className={inputClass}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" className="bg-[#0C0D0F]">
                    Select
                  </option>
                  <option value="male" className="bg-[#0C0D0F]">
                    Male
                  </option>
                  <option value="female" className="bg-[#0C0D0F]">
                    Female
                  </option>
                  <option value="other" className="bg-[#0C0D0F]">
                    Other
                  </option>
                </select>
                {errors.gender && (
                  <p className="text-[#DC2626] text-xs mt-1.5">{errors.gender}</p>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Photo</label>
              <div
                className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-[#DC2626]/30 transition"
                onClick={() => setPhotoFile("photo.jpg")}
              >
                {photoFile ? (
                  <span className="text-sm text-[#DC2626]">{photoFile}</span>
                ) : (
                  <div className="text-sm text-gray-500">
                    <p>Click to upload passport photo</p>
                    <p className="text-xs mt-1">JPG, PNG up to 2MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Identity */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Identity & Address</h2>
            <p className="text-sm text-gray-500 -mt-3">For verification purposes.</p>
            <div>
              <label className={labelClass}>Aadhaar Number *</label>
              <input
                className={inputClass}
                placeholder="12-digit Aadhaar"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
              />
              {errors.aadhaar && (
                <p className="text-[#DC2626] text-xs mt-1.5">{errors.aadhaar}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Current Address *</label>
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Full address"
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
          </div>
        )}

        {/* Step 3: Professional */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Professional Details</h2>
            <p className="text-sm text-gray-500 -mt-3">Your experience and skills.</p>
            <div>
              <label className={labelClass}>Experience *</label>
              <select
                className={inputClass}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="" className="bg-[#0C0D0F]">
                  Select experience
                </option>
                <option value="fresher" className="bg-[#0C0D0F]">
                  Fresher (trained)
                </option>
                <option value="0-1" className="bg-[#0C0D0F]">
                  Less than 1 year
                </option>
                <option value="1-3" className="bg-[#0C0D0F]">
                  1-3 years
                </option>
                <option value="3-5" className="bg-[#0C0D0F]">
                  3-5 years
                </option>
                <option value="5+" className="bg-[#0C0D0F]">
                  5+ years
                </option>
              </select>
              {errors.experience && (
                <p className="text-[#DC2626] text-xs mt-1.5">
                  {errors.experience}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Certifications</label>
              <input
                className={inputClass}
                placeholder="e.g. DMLT, BMLSc, Phlebotomy Certificate"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Skills</label>
              <div className="grid grid-cols-2 gap-2.5 mt-2">
                {SKILLS.map((skill) => (
                  <label
                    key={skill}
                    className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/[0.03] transition"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        skills.includes(skill)
                          ? "bg-[#DC2626] border-[#DC2626]"
                          : "border-white/20"
                      }`}
                      onClick={() =>
                        setSkills((prev) =>
                          prev.includes(skill)
                            ? prev.filter((s) => s !== skill)
                            : [...prev, skill]
                        )
                      }
                    >
                      {skills.includes(skill) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-300">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Work Preferences */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Work Preferences</h2>
            <p className="text-sm text-gray-500 -mt-3">Where and when do you want to work?</p>
            <div>
              <label className={labelClass}>Preferred Zones *</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {HYDERABAD_ZONES.map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() =>
                      setZones((prev) =>
                        prev.includes(zone)
                          ? prev.filter((z) => z !== zone)
                          : [...prev, zone]
                      )
                    }
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                      zones.includes(zone)
                        ? "bg-[#DC2626] text-white shadow-lg shadow-[#DC2626]/20"
                        : "bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
              {errors.zones && (
                <p className="text-[#DC2626] text-xs mt-1.5">{errors.zones}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Availability *</label>
              <select
                className={inputClass}
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="" className="bg-[#0C0D0F]">
                  Select
                </option>
                <option value="full_time" className="bg-[#0C0D0F]">
                  Full Time
                </option>
                <option value="part_time" className="bg-[#0C0D0F]">
                  Part Time
                </option>
                <option value="weekends" className="bg-[#0C0D0F]">
                  Weekends Only
                </option>
              </select>
              {errors.availability && (
                <p className="text-[#DC2626] text-xs mt-1.5">
                  {errors.availability}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Preferred Shift *</label>
              <select
                className={inputClass}
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              >
                <option value="" className="bg-[#0C0D0F]">
                  Select
                </option>
                <option value="morning" className="bg-[#0C0D0F]">
                  Morning (6AM - 12PM)
                </option>
                <option value="afternoon" className="bg-[#0C0D0F]">
                  Afternoon (12PM - 6PM)
                </option>
                <option value="flexible" className="bg-[#0C0D0F]">
                  Flexible / Both
                </option>
              </select>
              {errors.shift && (
                <p className="text-[#DC2626] text-xs mt-1.5">{errors.shift}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Vehicle</label>
              <select
                className={inputClass}
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              >
                <option value="" className="bg-[#0C0D0F]">
                  Select
                </option>
                <option value="bike" className="bg-[#0C0D0F]">
                  Two Wheeler
                </option>
                <option value="car" className="bg-[#0C0D0F]">
                  Four Wheeler
                </option>
                <option value="public" className="bg-[#0C0D0F]">
                  Public Transport
                </option>
                <option value="none" className="bg-[#0C0D0F]">
                  None
                </option>
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Bank Details */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Bank Details</h2>
            <p className="text-sm text-gray-500 -mt-3">
              For daily payout of your collection earnings.
            </p>
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
            <div>
              <label className={labelClass}>UPI ID</label>
              <input
                className={inputClass}
                placeholder="e.g. name@upi"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
              />
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
