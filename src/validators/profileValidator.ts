import { SeafarerProfile } from '../domain/profile.js';
export type ValidationStatus = 'ok' | 'warning' | 'error';
export interface ValidationResult {
  status: ValidationStatus;
  errors: string[];
  warnings: string[];
}
export function validateProfile(p: SeafarerProfile): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  // Required fields
  if (!p.firstName?.trim()) errors.push('firstName is required');
  if (!p.lastName?.trim()) errors.push('lastName is required');
  if (!p.dateOfBirth?.trim()) errors.push('dateOfBirth is required');
  if (!p.nationality?.trim()) errors.push('nationality is required');
  if (!p.email?.trim()) errors.push('email is required');
  // Email format
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
    errors.push('email format is invalid');
  }
  // Required documents
  if (!p.documents?.passport?.number?.trim()) {
    errors.push('documents.passport.number is required');
  }
  if (!p.documents?.passport?.issued?.trim()) {
    errors.push('documents.passport.issued is required');
  }
  // Arrays
  if (!Array.isArray(p.certificates)) {
    errors.push('certificates must be an array');
  }
  if (!Array.isArray(p.seaService)) {
    errors.push('seaService must be an array');
  }
  // Warnings
  if (!p.attachments?.cvPath) {
    warnings.push('attachments.cvPath is not set — CV will not be uploaded');
  }
  if (!p.phone?.trim()) {
    warnings.push('phone is not set');
  }
  if (!p.availableFrom?.trim()) {
    warnings.push('availableFrom is not set');
  }
  const status: ValidationStatus =
    errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'ok';
  return { status, errors, warnings };
}
