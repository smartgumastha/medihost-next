"use client";

import { useState, useMemo } from "react";
import { useLocale } from "@/hooks/useLocale";
import { validateIdentifier } from "@/lib/validators";
import { buildFHIRPatient, type PatientFormData } from "@/lib/fhir/patientBuilder";

var STEPS = ["Demographics", "Identifiers", "Address", "Insurance", "Emergency", "Review"];
var FLAGS: Record<string, string> = { IN: "\u{1F1EE}\u{1F1F3}", US: "\u{1F1FA}\u{1F1F8}", GB: "\u{1F1EC}\u{1F1E7}" };

var GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "unknown", label: "Unknown" },
];

var BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
var MARITAL = ["Single", "Married", "Divorced", "Widowed", "Separated", "Unknown"];
var LANGUAGES = [
  { code: "en", label: "English" }, { code: "hi", label: "Hindi" }, { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" }, { code: "te", label: "Telugu" }, { code: "ta", label: "Tamil" },
  { code: "gu", label: "Gujarati" }, { code: "ur", label: "Urdu" }, { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
];
var RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Guardian", "Other"];
var INS_RELATIONSHIPS = ["self", "spouse", "child", "parent", "other"];

var EMPTY_FORM: PatientFormData = {
  firstName: "", lastName: "", dob: "", gender: "", phone: "", email: "",
  bloodGroup: "", maritalStatus: "", language: "en", race: "", ethnicity: "",
  identifiers: {},
  address: { line1: "", line2: "", line3: "", city: "", district: "", stateProvince: "", stateCode: "", postalCode: "", countryCode: "IN" },
  insurance: { type: "self_pay", networkCode: "", networkName: "", policyNumber: "", memberId: "", groupNumber: "", subscriberName: "", relationship: "self" },
  emergencyContact: { name: "", phone: "", relationship: "" },
};

export default function DynamicPatientForm() {
  var [countryCode, setCountryCode] = useState("IN");
  var [countryOpen, setCountryOpen] = useState(false);
  var { locale, loading: localeLoading } = useLocale(countryCode);
  var [step, setStep] = useState(0);
  var [form, setForm] = useState<PatientFormData>({ ...EMPTY_FORM });
  var [errors, setErrors] = useState<Record<string, string>>({});
  var [showFhir, setShowFhir] = useState(false);
  var [visibleSensitive, setVisibleSensitive] = useState<Record<string, boolean>>({});

  var fhirJson = useMemo(function() {
    if (!locale) return null;
    return buildFHIRPatient(form, locale);
  }, [form, locale]);

  function setField<K extends keyof PatientFormData>(key: K, value: PatientFormData[K]) {
    setForm(function(prev) { return { ...prev, [key]: value }; });
    setErrors(function(prev) { var n = { ...prev }; delete n[key as string]; return n; });
  }

  function setAddress(key: string, value: string) {
    setForm(function(prev) { return { ...prev, address: { ...prev.address, [key]: value } }; });
  }

  function setInsurance(key: string, value: string) {
    setForm(function(prev) { return { ...prev, insurance: { ...prev.insurance, [key]: value } }; });
  }

  function setEmergency(key: string, value: string) {
    setForm(function(prev) { return { ...prev, emergencyContact: { ...prev.emergencyContact, [key]: value } }; });
  }

  function setIdentifier(system: string, value: string) {
    setForm(function(prev) { return { ...prev, identifiers: { ...prev.identifiers, [system]: value } }; });
    setErrors(function(prev) { var n = { ...prev }; delete n["id_" + system]; return n; });
  }

  function validateStep(): boolean {
    var errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.firstName.trim()) errs.firstName = "First name is required";
      if (!form.dob) errs.dob = "Date of birth is required";
      if (!form.gender) errs.gender = "Gender is required";
      if (!form.phone.trim()) errs.phone = "Phone is required";
      if (locale?.phone_regex && form.phone) {
        var re = new RegExp(locale.phone_regex);
        if (!re.test(form.phone)) errs.phone = "Invalid phone number format";
      }
    }
    if (step === 1 && locale) {
      for (var sys of locale.identifier_systems) {
        var val = form.identifiers[sys.system] || "";
        if (sys.required && !val) {
          errs["id_" + sys.system] = sys.label + " is required";
        } else if (val) {
          var v = validateIdentifier(sys.system, val);
          if (!v.valid) errs["id_" + sys.system] = v.error || "Invalid";
        }
      }
    }
    if (step === 2 && locale) {
      if (locale.postal_code_required && !form.address.postalCode) {
        errs.postalCode = locale.postal_code_label + " is required";
      }
      if (form.address.postalCode && locale.postal_code_regex) {
        var re2 = new RegExp(locale.postal_code_regex);
        if (!re2.test(form.address.postalCode)) errs.postalCode = "Invalid " + locale.postal_code_label;
      }
    }
    if (step === 4 && locale?.emergency_contact_required) {
      if (!form.emergencyContact.name.trim()) errs.ecName = "Emergency contact name is required";
      if (!form.emergencyContact.phone.trim()) errs.ecPhone = "Emergency contact phone is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() { if (validateStep()) setStep(function(s) { return Math.min(s + 1, 5); }); }
  function prev() { setStep(function(s) { return Math.max(s - 1, 0); }); }

  function handleSubmit() {
    console.log("Patient form data:", form);
    console.log("FHIR R4 Patient:", JSON.stringify(fhirJson, null, 2));
    alert("Patient data logged to console. Backend save coming in Phase 3.");
  }

  if (localeLoading || !locale) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", color: "#9ca3af" }}>Loading locale configuration...</div>;
  }

  // Shared input style
  var inputStyle: React.CSSProperties = { width: "100%", minHeight: 44, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#fff" };
  var selectStyle: React.CSSProperties = { ...inputStyle, appearance: "auto" as const };
  var labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 4, display: "block" };
  var errorStyle: React.CSSProperties = { fontSize: 12, color: "#dc2626", marginTop: 2 };
  var chipBase: React.CSSProperties = { minHeight: 44, padding: "8px 16px", borderRadius: 999, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" };
  var chipActive: React.CSSProperties = { ...chipBase, background: "#0f172a", color: "#fff", borderColor: "#0f172a" };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Register Patient</h1>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {locale.compliance_frameworks.map(function(f) {
              return <span key={f} style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 999, border: "1px solid #e2e8f0", color: "#6b7280" }}>{f.replace(/_/g, " ")}</span>;
            })}
          </div>
        </div>
        {/* Country pill */}
        <div style={{ position: "relative" }}>
          <button onClick={function() { setCountryOpen(!countryOpen); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 500, cursor: "pointer", background: "#fff" }}>
            <span>{FLAGS[countryCode] || ""}</span><span>{countryCode}</span>
          </button>
          {countryOpen && (
            <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden" }}>
              {(["IN", "US", "GB"] as const).map(function(cc) {
                return <button key={cc} onClick={function() { setCountryCode(cc); setCountryOpen(false); setForm({ ...EMPTY_FORM, address: { ...EMPTY_FORM.address, countryCode: cc } }); setStep(0); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", fontSize: 14, cursor: "pointer", border: "none", background: cc === countryCode ? "#f1f5f9" : "#fff" }}>
                  <span>{FLAGS[cc]}</span><span>{cc === "IN" ? "India" : cc === "US" ? "United States" : "United Kingdom"}</span>
                </button>;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Step tabs */}
      <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", marginBottom: 16 }}>
        {STEPS.map(function(name, i) {
          var done = i < step;
          var active = i === step;
          return (
            <button key={name} onClick={function() { if (done) setStep(i); }}
              style={{ flex: 1, padding: "10px 4px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "none", cursor: done ? "pointer" : "default",
                background: active ? "#fff" : "transparent", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                color: active ? "#0f172a" : done ? "#059669" : "#9ca3af" }}>
              {done ? "\u2713 " : ""}{name}
            </button>
          );
        })}
      </div>

      {/* Form card */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 16 }}>

        {/* Step 0: Demographics */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>First Name *</label><input style={inputStyle} value={form.firstName} onChange={function(e) { setField("firstName", e.target.value); }} />{errors.firstName && <p style={errorStyle}>{errors.firstName}</p>}</div>
              <div><label style={labelStyle}>Last Name</label><input style={inputStyle} value={form.lastName} onChange={function(e) { setField("lastName", e.target.value); }} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>Date of Birth *</label><input type="date" style={inputStyle} value={form.dob} onChange={function(e) { setField("dob", e.target.value); }} />{errors.dob && <p style={errorStyle}>{errors.dob}</p>}</div>
              <div><label style={labelStyle}>Gender *</label><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{GENDERS.map(function(g) { return <button key={g.value} type="button" onClick={function() { setField("gender", g.value); }} style={form.gender === g.value ? chipActive : chipBase}>{g.label}</button>; })}</div>{errors.gender && <p style={errorStyle}>{errors.gender}</p>}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>Phone * ({locale.phone_country_code})</label><div style={{ display: "flex" }}><span style={{ display: "flex", alignItems: "center", padding: "0 12px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: 14, color: "#6b7280" }}>{locale.phone_country_code}</span><input style={{ ...inputStyle, borderRadius: "0 8px 8px 0" }} value={form.phone} onChange={function(e) { setField("phone", e.target.value); }} /></div>{errors.phone && <p style={errorStyle}>{errors.phone}</p>}</div>
              <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email} onChange={function(e) { setField("email", e.target.value); }} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>Blood Group</label><select style={selectStyle} value={form.bloodGroup} onChange={function(e) { setField("bloodGroup", e.target.value); }}><option value="">Select</option>{BLOOD_GROUPS.map(function(b) { return <option key={b} value={b}>{b}</option>; })}</select></div>
              <div><label style={labelStyle}>Marital Status</label><select style={selectStyle} value={form.maritalStatus} onChange={function(e) { setField("maritalStatus", e.target.value); }}><option value="">Select</option>{MARITAL.map(function(m) { return <option key={m} value={m}>{m}</option>; })}</select></div>
              <div><label style={labelStyle}>Language</label><select style={selectStyle} value={form.language} onChange={function(e) { setField("language", e.target.value); }}>{LANGUAGES.map(function(l) { return <option key={l.code} value={l.code}>{l.label}</option>; })}</select></div>
            </div>
            {locale.extra_demographics.includes("race") && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={labelStyle}>Race <span style={{ fontSize: 9, padding: "1px 6px", border: "1px solid #e2e8f0", borderRadius: 999, color: "#6b7280" }}>USCDI v3</span></label><input style={inputStyle} value={form.race || ""} onChange={function(e) { setField("race", e.target.value); }} /></div>
                <div><label style={labelStyle}>Ethnicity <span style={{ fontSize: 9, padding: "1px 6px", border: "1px solid #e2e8f0", borderRadius: 999, color: "#6b7280" }}>USCDI v3</span></label><input style={inputStyle} value={form.ethnicity || ""} onChange={function(e) { setField("ethnicity", e.target.value); }} /></div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Identifiers */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>National and hospital identifiers for {locale.country_name}</p>
            {locale.identifier_systems.map(function(sys) {
              return (
                <div key={sys.system}>
                  <label style={labelStyle}>{sys.label} {sys.required && "*"} {sys.sensitive && <span style={{ fontSize: 9, padding: "1px 6px", background: "#fef2f2", color: "#dc2626", borderRadius: 999, marginLeft: 4 }}>PHI</span>}</label>
                  <div style={{ position: "relative" }}>
                    <input type={sys.sensitive && !visibleSensitive[sys.system] ? "password" : "text"} style={{ ...inputStyle, paddingRight: sys.sensitive ? 40 : 12 }} value={form.identifiers[sys.system] || ""} onChange={function(e) { setIdentifier(sys.system, e.target.value); }} placeholder={sys.system === "US_MRN" ? "Auto-generated" : ""} disabled={sys.system === "US_MRN"} />
                    {sys.sensitive && <button type="button" onClick={function() { setVisibleSensitive(function(p) { return { ...p, [sys.system]: !p[sys.system] }; }); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14 }}>{visibleSensitive[sys.system] ? "\u{1F648}" : "\u{1F441}"}</button>}
                  </div>
                  {errors["id_" + sys.system] && <p style={errorStyle}>{errors["id_" + sys.system]}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label style={labelStyle}>Address Line 1</label><input style={inputStyle} value={form.address.line1} onChange={function(e) { setAddress("line1", e.target.value); }} /></div>
            <div><label style={labelStyle}>Address Line 2</label><input style={inputStyle} value={form.address.line2} onChange={function(e) { setAddress("line2", e.target.value); }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>City</label><input style={inputStyle} value={form.address.city} onChange={function(e) { setAddress("city", e.target.value); }} /></div>
              {locale.address_schema.includes("district") && <div><label style={labelStyle}>District</label><input style={inputStyle} value={form.address.district || ""} onChange={function(e) { setAddress("district", e.target.value); }} /></div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>{locale.state_province_label}</label><select style={selectStyle} value={form.address.stateProvince} onChange={function(e) { setAddress("stateProvince", e.target.value); }}><option value="">Select {locale.state_province_label}</option>{locale.state_province_list.map(function(s) { return <option key={s} value={s}>{s}</option>; })}</select></div>
              {locale.postal_code_required && <div><label style={labelStyle}>{locale.postal_code_label} *</label><input style={inputStyle} value={form.address.postalCode} onChange={function(e) { setAddress("postalCode", e.target.value); }} />{errors.postalCode && <p style={errorStyle}>{errors.postalCode}</p>}</div>}
            </div>
          </div>
        )}

        {/* Step 3: Insurance */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {locale.insurance_type === "national_health" && <div style={{ padding: 12, borderRadius: 8, background: "#ecfdf5", border: "1px solid #a7f3d0", fontSize: 14, color: "#065f46" }}><strong>NHS Coverage:</strong> All residents are covered under the National Health Service. Add optional private insurance below.</div>}
            {locale.insurance_type !== "national_health" && (
              <div><label style={labelStyle}>Insurance Type</label><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["government", "private", "employer", "self_pay"] as const).map(function(t) { return <button key={t} type="button" onClick={function() { setInsurance("type", t); }} style={form.insurance.type === t ? chipActive : chipBase}>{t.replace("_", " ")}</button>; })}
              </div></div>
            )}
            {form.insurance.type !== "self_pay" && (<>
              <div><label style={labelStyle}>Insurance Network</label><select style={selectStyle} value={form.insurance.networkCode} onChange={function(e) { var net = locale!.insurance_networks.find(function(n) { return n.code === e.target.value; }); setInsurance("networkCode", e.target.value); setInsurance("networkName", net?.name || ""); }}><option value="">Select network</option>{locale!.insurance_networks.filter(function(n) { return form.insurance.type === "government" ? n.type === "government" : true; }).map(function(n) { return <option key={n.code} value={n.code}>{n.name}</option>; })}</select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={labelStyle}>Policy Number</label><input style={inputStyle} value={form.insurance.policyNumber} onChange={function(e) { setInsurance("policyNumber", e.target.value); }} /></div>
                <div><label style={labelStyle}>Member ID</label><input style={inputStyle} value={form.insurance.memberId} onChange={function(e) { setInsurance("memberId", e.target.value); }} /></div>
              </div>
              {locale.country_code === "US" && <div><label style={labelStyle}>Group Number</label><input style={inputStyle} value={form.insurance.groupNumber || ""} onChange={function(e) { setInsurance("groupNumber", e.target.value); }} /></div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={labelStyle}>Subscriber Name</label><input style={inputStyle} value={form.insurance.subscriberName} onChange={function(e) { setInsurance("subscriberName", e.target.value); }} /></div>
                <div><label style={labelStyle}>Relationship</label><select style={selectStyle} value={form.insurance.relationship} onChange={function(e) { setInsurance("relationship", e.target.value); }}>{INS_RELATIONSHIPS.map(function(r) { return <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>; })}</select></div>
              </div>
            </>)}
          </div>
        )}

        {/* Step 4: Emergency Contact */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {locale.emergency_contact_required ? <div style={{ padding: 12, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 14, color: "#991b1b" }}><strong>Required:</strong> Emergency contact is mandatory for {locale.country_name} compliance.</div> : <div style={{ padding: 12, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 14, color: "#6b7280" }}>Emergency contact is optional but recommended.</div>}
            <div><label style={labelStyle}>Contact Name {locale.emergency_contact_required && "*"}</label><input style={inputStyle} value={form.emergencyContact.name} onChange={function(e) { setEmergency("name", e.target.value); }} />{errors.ecName && <p style={errorStyle}>{errors.ecName}</p>}</div>
            <div><label style={labelStyle}>Phone {locale.emergency_contact_required && "*"} ({locale.phone_country_code})</label><div style={{ display: "flex" }}><span style={{ display: "flex", alignItems: "center", padding: "0 12px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: 14, color: "#6b7280" }}>{locale.phone_country_code}</span><input style={{ ...inputStyle, borderRadius: "0 8px 8px 0" }} value={form.emergencyContact.phone} onChange={function(e) { setEmergency("phone", e.target.value); }} /></div>{errors.ecPhone && <p style={errorStyle}>{errors.ecPhone}</p>}</div>
            <div><label style={labelStyle}>Relationship</label><select style={selectStyle} value={form.emergencyContact.relationship} onChange={function(e) { setEmergency("relationship", e.target.value); }}><option value="">Select</option>{RELATIONSHIPS.map(function(r) { return <option key={r} value={r}>{r}</option>; })}</select></div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Demographics</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}><div><span style={{ color: "#9ca3af" }}>Name:</span> {form.firstName} {form.lastName}</div><div><span style={{ color: "#9ca3af" }}>DOB:</span> {form.dob}</div><div><span style={{ color: "#9ca3af" }}>Gender:</span> {form.gender}</div><div><span style={{ color: "#9ca3af" }}>Phone:</span> {locale.phone_country_code}{form.phone}</div>{form.email && <div><span style={{ color: "#9ca3af" }}>Email:</span> {form.email}</div>}</div></div>
              <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Address</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{form.address.line1 && <div>{form.address.line1}</div>}{form.address.city && <div>{form.address.city}, {form.address.stateProvince}</div>}{form.address.postalCode && <div>{form.address.postalCode}</div>}</div></div>
              <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Insurance</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}><div><span style={{ color: "#9ca3af" }}>Type:</span> {form.insurance.type.replace("_", " ")}</div>{form.insurance.networkName && <div><span style={{ color: "#9ca3af" }}>Network:</span> {form.insurance.networkName}</div>}{form.insurance.policyNumber && <div><span style={{ color: "#9ca3af" }}>Policy:</span> {form.insurance.policyNumber}</div>}</div></div>
              <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Emergency Contact</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{form.emergencyContact.name ? <><div>{form.emergencyContact.name}</div><div>{locale.phone_country_code}{form.emergencyContact.phone}</div><div>{form.emergencyContact.relationship}</div></> : <div style={{ color: "#9ca3af" }}>Not provided</div>}</div></div>
            </div>
            <button type="button" onClick={function() { setShowFhir(!showFhir); }} style={{ alignSelf: "flex-start", padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#fff" }}>{showFhir ? "Hide" : "Preview"} FHIR R4 JSON</button>
            {showFhir && <pre style={{ maxHeight: 320, overflow: "auto", borderRadius: 8, background: "#f8fafc", padding: 16, fontSize: 12, border: "1px solid #e2e8f0" }}>{JSON.stringify(fhirJson, null, 2)}</pre>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button type="button" onClick={prev} disabled={step === 0} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 500, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.4 : 1, background: "#fff" }}>&larr; Back</button>
        {step < 5 ? (
          <button type="button" onClick={next} style={{ padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", background: "#0f172a", color: "#fff" }}>Next &rarr;</button>
        ) : (
          <button type="button" onClick={handleSubmit} style={{ padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "#059669", color: "#fff" }}>&check; Register Patient</button>
        )}
      </div>
    </div>
  );
}
