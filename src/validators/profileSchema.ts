import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be an ISO date (YYYY-MM-DD)');

const ProfileDocumentSchema = z.object({
  number: z.string().min(1, 'Document number is required'),
  issued: isoDate,
  validTo: isoDate,
  country: z.string().min(1, 'Country is required'),
});

const CertificateSchema = z.object({
  name: z.string().min(1),
  number: z.string().optional(),
  issued: isoDate.optional(),
  issuedBy: z.string().optional(),
  validTo: z.union([isoDate, z.null()]).optional(),
});

const SeaServiceRecordSchema = z.object({
  rank: z.string().min(1),
  vessel: z.string().min(1),
  dwt: z.union([z.number(), z.null()]).optional(),
  type: z.string().min(1),
  area: z.string().optional(),
  from: isoDate,
  to: isoDate,
  company: z.string().min(1),
});

export const SeafarerProfileSchema = z.object({
  firstName: z.string().min(1, 'firstName is required'),
  lastName: z.string().min(1, 'lastName is required'),
  fullName: z.string().optional(),
  dateOfBirth: isoDate,
  gender: z.string().optional(),
  nationality: z.string().min(1, 'nationality is required'),
  citizenship: z.string().optional(),
  maritalStatus: z.string().optional(),
  placeOfBirth: z.string().optional(),
  englishLevel: z.string().optional(),
  email: z.string().email('email format is invalid'),
  phone: z.string().optional(),
  residence: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  airport: z.string().optional(),
  availableFrom: isoDate.optional(),
  salary: z.string().optional(),
  position: z.string().optional(),
  preferredRank: z.string().optional(),
  preferredVessel: z.string().optional(),
  vesselType: z.string().optional(),
  documents: z.object({
    passport: ProfileDocumentSchema,
    seamanBookUA: ProfileDocumentSchema.optional(),
    seamanBookCY: ProfileDocumentSchema.optional(),
    seamanBookLU: ProfileDocumentSchema.optional(),
    usaVisaC1D: ProfileDocumentSchema.omit({ country: true }).optional(),
  }).passthrough(),
  certificates: z.array(CertificateSchema),
  seaService: z.array(SeaServiceRecordSchema),
  experience: z.string().optional(),
  skills: z.array(z.string()).optional(),
  notes: z.string().optional(),
  lastVessel: z.string().optional(),
  lastVesselType: z.string().optional(),
  lastCompany: z.string().optional(),
  lastCrewingAgent: z.string().optional(),
  lastContractEnd: isoDate.optional(),
  attachments: z.object({
    cvPath: z.string().optional(),
    photoPath: z.string().optional(),
  }).optional(),
});

export type ParsedSeafarerProfile = z.infer<typeof SeafarerProfileSchema>;

/**
 * Validates raw JSON against the SeafarerProfile schema.
 * Returns a user-friendly error message or null if valid.
 */
export function validateProfileSchema(raw: unknown): string | null {
  const result = SeafarerProfileSchema.safeParse(raw);
  if (result.success) return null;
  const issues = result.error.issues.map(i => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
  return `Profile schema validation failed:\n${issues}`;
}
