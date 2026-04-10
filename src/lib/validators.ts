/**
 * NHS Number Modulus-11 validation.
 * Multiply first 9 digits by (10 - position), sum, check = 11 - (sum % 11).
 * If check is 11, treat as 0. If check is 10, number is invalid.
 */
export function validateNHSNumber(value: string): { valid: boolean; error: string | null } {
  var clean = value.replace(/[\s-]/g, "");
  if (!/^\d{10}$/.test(clean)) {
    return { valid: false, error: "NHS number must be exactly 10 digits" };
  }

  var sum = 0;
  for (var i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i);
  }

  var check = 11 - (sum % 11);
  if (check === 11) check = 0;
  if (check === 10) {
    return { valid: false, error: "NHS number fails Modulus-11 check (check digit 10 is invalid)" };
  }
  if (parseInt(clean[9]) !== check) {
    return { valid: false, error: "NHS number fails Modulus-11 check (expected " + check + ")" };
  }

  return { valid: true, error: null };
}

/**
 * Validate an identifier value against its system rules.
 */
export function validateIdentifier(system: string, value: string): { valid: boolean; error: string | null } {
  if (!value) return { valid: false, error: "Value is required" };

  var clean = value.replace(/[\s-]/g, "");

  switch (system) {
    case "IN_ABHA":
      if (!/^\d{14}$/.test(clean)) return { valid: false, error: "ABHA number must be exactly 14 digits" };
      return { valid: true, error: null };

    case "IN_AADHAAR":
      if (!/^\d{12}$/.test(clean)) return { valid: false, error: "Aadhaar must be exactly 12 digits" };
      return { valid: true, error: null };

    case "GB_NHS":
      return validateNHSNumber(value);

    case "US_SSN": {
      var ssn = value.replace(/[\s-]/g, "");
      if (!/^\d{9}$/.test(ssn)) return { valid: false, error: "SSN must be 9 digits (XXX-XX-XXXX)" };
      var area = parseInt(ssn.substring(0, 3));
      if (area === 0 || area === 666 || area >= 900) return { valid: false, error: "SSN has invalid area number" };
      return { valid: true, error: null };
    }

    case "US_MRN":
      if (!clean) return { valid: false, error: "MRN cannot be empty" };
      return { valid: true, error: null };

    case "AE_EMIRATES":
      if (!/^\d{15}$/.test(clean)) return { valid: false, error: "Emirates ID must be exactly 15 digits" };
      return { valid: true, error: null };

    default:
      return { valid: clean.length > 0, error: clean.length > 0 ? null : "Value is required" };
  }
}
