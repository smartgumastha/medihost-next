"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";

export interface IdentifierSystem {
  system: string;
  label: string;
  regex: string;
  required: boolean;
  sensitive: boolean;
}

export interface InsuranceNetwork {
  code: string;
  name: string;
  type: string;
}

export interface LocaleConfig {
  id: string;
  country_code: string;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
  date_format: string;
  phone_country_code: string;
  phone_regex: string;
  address_schema: string[];
  postal_code_required: boolean;
  postal_code_label: string;
  postal_code_regex: string;
  state_province_label: string;
  state_province_list: string[];
  primary_id_system: string;
  primary_id_label: string;
  primary_id_regex: string;
  identifier_systems: IdentifierSystem[];
  icd_version: string;
  procedure_code_system: string;
  insurance_type: string;
  insurance_networks: InsuranceNetwork[];
  compliance_frameworks: string[];
  required_fields: string[];
  optional_fields: string[];
  extra_demographics: string[];
  emergency_contact_required: boolean;
  fhir_profile_url: string;
  rtl_language: boolean;
  is_active: boolean;
}

var cache: Record<string, LocaleConfig> = {};

export function useLocale(countryCode: string) {
  var [locale, setLocale] = useState<LocaleConfig | null>(cache[countryCode] || null);
  var [loading, setLoading] = useState(!cache[countryCode]);
  var [error, setError] = useState<string | null>(null);
  var abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!countryCode) return;

    if (cache[countryCode]) {
      setLocale(cache[countryCode]);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    var ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    // locale API is public — no auth needed
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartgumastha-backend-production.up.railway.app'}/api/locale/${countryCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ctrl.signal.aborted && data.success && data.locale) {
          cache[countryCode] = data.locale;
          setLocale(data.locale);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ctrl.signal.aborted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => ctrl.abort();
  }, [countryCode]);

  return { locale, loading, error };
}
