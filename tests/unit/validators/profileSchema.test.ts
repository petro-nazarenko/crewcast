import { validateProfileSchema } from '../../../src/validators/profileSchema.js';

const validRaw = {
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

describe('validateProfileSchema', () => {
  it('returns null for a valid profile', () => {
    expect(validateProfileSchema(validRaw)).toBeNull();
  });

  it('returns error message when firstName is missing', () => {
    const result = validateProfileSchema({ ...validRaw, firstName: '' });
    expect(result).not.toBeNull();
    expect(result).toContain('firstName');
  });

  it('returns error message when email is invalid', () => {
    const result = validateProfileSchema({ ...validRaw, email: 'notanemail' });
    expect(result).not.toBeNull();
    expect(result).toContain('email');
  });

  it('returns error when dateOfBirth is not ISO format', () => {
    const result = validateProfileSchema({ ...validRaw, dateOfBirth: '25/10/1985' });
    expect(result).not.toBeNull();
    expect(result).toContain('dateOfBirth');
  });

  it('returns error when certificates is not an array', () => {
    const result = validateProfileSchema({ ...validRaw, certificates: 'not-an-array' });
    expect(result).not.toBeNull();
    expect(result).toContain('certificates');
  });

  it('returns error when seaService is not an array', () => {
    const result = validateProfileSchema({ ...validRaw, seaService: null });
    expect(result).not.toBeNull();
    expect(result).toContain('seaService');
  });

  it('returns error when passport number is missing', () => {
    const result = validateProfileSchema({
      ...validRaw,
      documents: {
        passport: { number: '', issued: '2023-06-30', validTo: '2033-06-30', country: 'Ukraine' },
      },
    });
    expect(result).not.toBeNull();
    expect(result).toContain('documents.passport.number');
  });

  it('returns null when optional fields are omitted', () => {
    const minimal = {
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
    expect(validateProfileSchema(minimal)).toBeNull();
  });

  it('returns error message with field path and description', () => {
    const result = validateProfileSchema({ ...validRaw, email: 'bad' });
    expect(result).toMatch(/Profile schema validation failed/);
    expect(result).toMatch(/•/);
  });

  it('returns error when the whole input is not an object', () => {
    expect(validateProfileSchema(null)).not.toBeNull();
    expect(validateProfileSchema(42)).not.toBeNull();
    expect(validateProfileSchema('string')).not.toBeNull();
  });
});
