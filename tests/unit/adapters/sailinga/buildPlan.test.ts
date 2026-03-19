import { SailingaAdapter } from '../../../../src/adapters/sailinga/index.js';
import { SeafarerProfile } from '../../../../src/domain/profile.js';
const adapter = new SailingaAdapter();
const profile: SeafarerProfile = {
  firstName: 'Petro',
  lastName: 'Nazarenko',
  dateOfBirth: '1985-10-25',
  nationality: 'Ukrainian',
  email: 'petrnzrnk@gmail.com',
  phone: '+380964462605',
  residence: 'Moldova',
  city: 'Chisinau',
  country: 'Moldova',
  englishLevel: 'Intermediate',
  preferredRank: 'AB',
  salary: 'Discussable',
  availableFrom: '2026-03-10',
  documents: {
    passport: { number: 'PU826131', issued: '2023-06-30', validTo: '2033-06-30', country: 'Ukraine' },
  },
  certificates: [
    { name: 'Able Seafarer Deck', number: '10380/2014/08', issued: '2014-05-29', issuedBy: 'Ukraine', validTo: null },
    { name: 'Basic Safety Training (STCW)', number: '17872', issued: '2024-03-11', issuedBy: 'Ukraine', validTo: '2029-03-11' },
  ],
  seaService: [
    { rank: 'AB/B/S', vessel: 'BOS BASE', dwt: 3265, type: 'OSV', from: '2026-01-27', to: '2026-03-03', company: 'BRITOIL / Atlas NextWave' },
  ],
};
describe('SailingaAdapter.buildSubmissionPlan', () => {
  it('returns a plan with siteId sailinga', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    expect(plan.siteId).toBe('sailinga');
  });
  it('reads nationality from profile, not hardcoded', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsSelect' && a.name === 'Nationality');
    expect(action).toBeDefined();
    if (action?.type === 'jsSelect') expect(action.text).toBe('Ukrainian');
  });
  it('reads COC number from certificates array', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsFill' && a.name === 'LicencsNo');
    expect(action).toBeDefined();
    if (action?.type === 'jsFill') expect(action.value).toBe('10380/2014/08');
  });
  it('builds address from profile fields', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsFill' && a.name === 'Address');
    expect(action).toBeDefined();
    if (action?.type === 'jsFill') expect(action.value).toBe('Moldova, Chisinau');
  });
  it('maps englishLevel Intermediate to Satisfact.', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsSelect' && a.name === 'English');
    expect(action).toBeDefined();
    if (action?.type === 'jsSelect') expect(action.text).toBe('Satisfact.');
  });
  it('splits company name at slash for sea service', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsFill' && a.name === 'Company1');
    expect(action).toBeDefined();
    if (action?.type === 'jsFill') expect(action.value).toBe('BRITOIL');
  });
  it('does not include upload action when no attachments', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const uploads = plan.actions.filter(a => a.type === 'upload');
    expect(uploads).toHaveLength(0);
  });
  it('plan has submitAction and declareAction', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    expect(plan.submitAction.type).toBe('click');
    expect(plan.declareAction?.type).toBe('jsCheck');
  });
});
