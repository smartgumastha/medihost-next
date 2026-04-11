import type { LocaleConfig } from "@/hooks/useLocale";

export interface PatientFormData {
  firstName: string;
  lastName: string;
  suffix?: string;
  maidenName?: string;
  gpName?: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
  maritalStatus: string;
  language: string;
  race?: string;
  ethnicity?: string;
  identifiers: Record<string, string>;
  address: {
    line1: string;
    line2: string;
    line3?: string;
    city: string;
    district?: string;
    stateProvince: string;
    stateCode?: string;
    postalCode: string;
    countryCode: string;
  };
  insurance: {
    type: string;
    networkCode: string;
    networkName: string;
    policyNumber: string;
    memberId: string;
    groupNumber?: string;
    subscriberName: string;
    relationship: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export function buildFHIRPatient(formData: PatientFormData, locale: LocaleConfig) {
  var identifiers: object[] = [];

  for (var sys of Object.keys(formData.identifiers)) {
    var val = formData.identifiers[sys];
    if (!val) continue;
    var sysDef = locale.identifier_systems.find(function(s) { return s.system === sys; });
    var entry: Record<string, unknown> = {
      system: "https://medihost.in/id/" + sys.toLowerCase(),
      value: val,
      type: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/v2-0203",
          code: sys === locale.primary_id_system ? "MR" : "SB",
          display: sysDef?.label || sys,
        }],
      },
    };
    if (sysDef?.sensitive) {
      entry.extension = [{ url: "https://medihost.in/fhir/sensitive", valueBoolean: true }];
    }
    identifiers.push(entry);
  }

  var telecom: object[] = [];
  if (formData.phone) {
    telecom.push({ system: "phone", value: locale.phone_country_code + formData.phone, use: "mobile" });
  }
  if (formData.email) {
    telecom.push({ system: "email", value: formData.email, use: "home" });
  }

  var address: object[] = [];
  if (formData.address.line1 || formData.address.city) {
    var lines = [formData.address.line1, formData.address.line2, formData.address.line3].filter(Boolean);
    address.push({
      use: "home",
      type: "physical",
      line: lines,
      city: formData.address.city || undefined,
      district: formData.address.district || undefined,
      state: formData.address.stateProvince || undefined,
      postalCode: formData.address.postalCode || undefined,
      country: formData.address.countryCode || locale.country_code,
    });
  }

  var contact: object[] = [];
  if (formData.emergencyContact.name) {
    contact.push({
      relationship: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0131", code: "C", display: formData.emergencyContact.relationship || "Emergency Contact" }] }],
      name: { text: formData.emergencyContact.name },
      telecom: formData.emergencyContact.phone ? [{ system: "phone", value: locale.phone_country_code + formData.emergencyContact.phone, use: "mobile" }] : [],
    });
  }

  var resource: Record<string, unknown> = {
    resourceType: "Patient",
    meta: { profile: locale.fhir_profile_url ? [locale.fhir_profile_url] : [] },
    identifier: identifiers,
    name: [{ use: "official", given: [formData.firstName], family: formData.lastName || undefined, text: [formData.firstName, formData.lastName].filter(Boolean).join(" ") }],
    telecom: telecom,
    gender: formData.gender || "unknown",
    birthDate: formData.dob || undefined,
    address: address,
    contact: contact,
    communication: formData.language ? [{ language: { coding: [{ system: "urn:ietf:bcp:47", code: formData.language }], text: formData.language }, preferred: true }] : [],
  };

  if (formData.race || formData.ethnicity) {
    resource.extension = [];
    if (formData.race) {
      (resource.extension as object[]).push({ url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race", extension: [{ url: "text", valueString: formData.race }] });
    }
    if (formData.ethnicity) {
      (resource.extension as object[]).push({ url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity", extension: [{ url: "text", valueString: formData.ethnicity }] });
    }
  }

  return resource;
}
