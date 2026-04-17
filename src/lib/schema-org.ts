import type { ClinicData } from './storefront';

function countryFromDomain(domain: string): string {
  const lower = domain.toLowerCase();
  if (lower.endsWith('.co.uk')) return 'GB';
  if (lower.endsWith('.us')) return 'US';
  // TODO Sprint 16: replace with locale_config lookup
  return 'IN';
}

function nonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isNonZeroFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v !== 0;
}

export function buildMedicalBusinessSchema(
  clinic: ClinicData,
  domain: string,
  origin: string
): Record<string, unknown> | null {
  if (!nonEmptyString(clinic?.business_name)) return null;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': `${origin}/#clinic`,
    name: clinic.business_name,
    url: origin,
  };

  if (nonEmptyString(clinic.phone)) schema.telephone = clinic.phone;
  if (nonEmptyString(clinic.email)) schema.email = clinic.email;

  if (nonEmptyString(clinic.website_logo_url)) {
    schema.image = clinic.website_logo_url;
    schema.logo = clinic.website_logo_url;
  }

  const about = clinic.website_content?.about;
  if (nonEmptyString(about)) {
    schema.description = about.trim();
  }

  const city = nonEmptyString(clinic.city) ? clinic.city.trim() : null;
  const state = nonEmptyString(clinic.state) ? clinic.state.trim() : null;
  const street = nonEmptyString(clinic.website_content?.contact?.address)
    ? clinic.website_content.contact.address.trim()
    : null;

  if (city || state || street) {
    const address: Record<string, unknown> = {
      '@type': 'PostalAddress',
      addressCountry: countryFromDomain(domain),
    };
    if (street) address.streetAddress = street;
    if (city) address.addressLocality = city;
    if (state) address.addressRegion = state;
    schema.address = address;
  }

  const lat: unknown = clinic.latitude;
  const lng: unknown = clinic.longitude;
  if (isNonZeroFiniteNumber(lat) && isNonZeroFiniteNumber(lng)) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    };
  }

  if (city) {
    schema.areaServed = { '@type': 'City', name: city };
  }

  // TODO Sprint 16: medicalSpecialty from brand_dna.specialty
  // TODO Sprint 16: availableService array from website_content.services
  // TODO Sprint 16: employee array of Physician entities from doctors join

  return schema;
}
