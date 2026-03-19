import { validateProfile } from '../../../src/validators/profileValidator.js';
import { SeafarerProfile } from '../../../src/domain/profile.js';
const validProfile: SeafarerProfile = {
  firstName: 'Petro',
  lastName: 'Nazarenko',
  dateOfBirth: '1985-10-25',
  nationality: 'Ukrainian',
  email: 'petrnzrnk@gmail.com',
  documents: {
    passport: { number: 'PU826131', issued: '2023-06-30', validTo: '2033-06-30', country: 'Ukraine' },
  },
  certificates: [],
  seaService: [],
};
describe('validateProfile', () => {
  it('returns ok for valid profile', () => {
    const result = validateProfile(validProfile);
    expect(result.status).not.toBe('error');
    expect(result.errors).toHaveLength(0);
  });
  it('returns error when firstName is missing', () => {
    const result = validateProfile({ ...validProfile, firstName: '' });
    expect(result.status).toBe('error');
    expect(result.errors).toContain('firstName is required');
  });
  it('returns error when email is missing', () => {
    const result = validateProfile({ ...validProfile, email: '' });
    expect(result.status).toBe('error');
    expect(result.errors).toContain('email is required');
  });
  it('returns error for invalid email format', () => {
    const result = validateProfile({ ...validProfile, email: 'notanemail' });
    expect(result.status).toBe('error');
    expect(result.errors).toContain('email format is invalid');
  });
  it('returns error when passport number is missing', () => {
    const result = validateProfile({
      ...validProfile,
      documents: { passport: { number: '', issued: '2023-06-30', validTo: '2033-06-30', country: 'Ukraine' } },
    });
    expect(result.status).toBe('error');
    expect(result.errors).toContain('documents.passport.number is required');
  });
  it('returns warning when cvPath is not set', () => {
    const result = validateProfile(validProfile);
    expect(result.warnings).toContain('attachments.cvPath is not set — CV will not be uploaded');
  });
  it('returns ok status when only warnings present', () => {
    const result = validateProfile(validProfile);
    expect(result.status).toBe('warning');
  });
});
