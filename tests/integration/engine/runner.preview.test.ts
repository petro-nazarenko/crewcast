import { EngineRunner } from '../../../src/engine/runner.js';
import { SailingaAdapter } from '../../../src/adapters/sailinga/index.js';
import { SeafarerProfile } from '../../../src/domain/profile.js';

const profile: SeafarerProfile = {
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

describe('EngineRunner preview mode', () => {
  it('returns a SubmissionResult without launching browser', async () => {
    const adapter = new SailingaAdapter();
    const plan = adapter.buildSubmissionPlan(profile);
    const runner = new EngineRunner();
    const result = await runner.run(plan, profile, 'preview');

    expect(result.mode).toBe('preview');
    expect(result.siteId).toBe('sailinga');
    expect(result.profileId).toBe('Nazarenko_Petro');
    expect(result.skippedCount).toBe(plan.actions.length);
    expect(result.succeededCount).toBe(0);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns error result when profile is invalid', async () => {
    const adapter = new SailingaAdapter();
    const badProfile = { ...profile, firstName: '' };
    const plan = adapter.buildSubmissionPlan(badProfile);
    const runner = new EngineRunner();
    const result = await runner.run(plan, badProfile, 'preview');

    expect(result.validationStatus).toBe('error');
    expect(result.success).toBe(false);
    expect(result.validationErrors.length).toBeGreaterThan(0);
  });
});
