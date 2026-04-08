import { SeafarerProfile } from '../domain/profile.js';
import { normalizeDate } from './dateNormalizer.js';

export function normalizeProfile(p: SeafarerProfile): SeafarerProfile {
  return {
    ...p,
    dateOfBirth: normalizeDate(p.dateOfBirth),
    availableFrom: normalizeDate(p.availableFrom),
    lastContractEnd: normalizeDate(p.lastContractEnd),
    documents: {
      ...p.documents,
      passport: {
        ...p.documents.passport,
        issued: normalizeDate(p.documents.passport.issued),
        validTo: normalizeDate(p.documents.passport.validTo),
      },
      ...(p.documents.seamanBookUA && {
        seamanBookUA: {
          ...p.documents.seamanBookUA,
          issued: normalizeDate(p.documents.seamanBookUA.issued),
          validTo: normalizeDate(p.documents.seamanBookUA.validTo),
        },
      }),
    },
    certificates: Array.isArray(p.certificates) ? p.certificates.map(c => ({
      ...c,
      issued: normalizeDate(c.issued),
      validTo: c.validTo ? normalizeDate(c.validTo) : c.validTo,
    })) : [],
    seaService: Array.isArray(p.seaService) ? p.seaService.map(s => ({
      ...s,
      from: normalizeDate(s.from),
      to: normalizeDate(s.to),
    })) : [],
  };
}
