import { CrewInspectorAdapter } from '../../../../src/adapters/crewinspector/index.js';
import { SeafarerProfile } from '../../../../src/domain/profile.js';
const adapter = new CrewInspectorAdapter('orca');
const profile: SeafarerProfile = {
  firstName: 'Petro',
  lastName: 'Nazarenko',
  dateOfBirth: '1985-10-25',
  nationality: 'UKRAINE',
  citizenship: 'Citizen',
  maritalStatus: 'Married',
  email: 'petrnzrnk@gmail.com',
  phone: '+380964462605',
  residence: 'Moldova',
  city: 'Chisinau',
  country: 'Moldova',
  preferredRank: 'AB',
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
describe('CrewInspectorAdapter.buildSubmissionPlan', () => {
  it('returns plan with correct siteId', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    expect(plan.siteId).toBe('crewinspector-orca');
  });
  it('converts ISO date to dd.mm.yyyy format', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsFill' && a.name === 'available_from');
    expect(action).toBeDefined();
    if (action?.type === 'jsFill') expect(action.value).toBe('10.03.2026');
  });
  it('maps AB rank correctly', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsSelect' && a.name === 'rank_id');
    expect(action).toBeDefined();
    if (action?.type === 'jsSelect') expect(action.text).toBe('Able Seaman');
  });
  it('reads citizenship from profile', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsSelect' && a.name === 'citizenship_id');
    expect(action).toBeDefined();
    if (action?.type === 'jsSelect') expect(action.text).toBe('Citizen');
  });
  it('uses default citizenship when not set in profile', () => {
    const profileNoCitizenship: SeafarerProfile = { ...profile, citizenship: undefined };
    const plan = adapter.buildSubmissionPlan(profileNoCitizenship);
    const action = plan.actions.find(a => a.type === 'jsSelect' && a.name === 'citizenship_id');
    expect(action).toBeDefined();
    if (action?.type === 'jsSelect') expect(action.text).toBe('Citizen');
  });
  it('reads maritalStatus from profile', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const action = plan.actions.find(a => a.type === 'jsSelect' && a.name === 'marital_id');
    expect(action).toBeDefined();
    if (action?.type === 'jsSelect') expect(action.text).toBe('Married');
  });
  it('uses default maritalStatus when not set in profile', () => {
    const profileNoMarital: SeafarerProfile = { ...profile, maritalStatus: undefined };
    const plan = adapter.buildSubmissionPlan(profileNoMarital);
    const action = plan.actions.find(a => a.type === 'jsSelect' && a.name === 'marital_id');
    expect(action).toBeDefined();
    if (action?.type === 'jsSelect') expect(action.text).toBe('Single');
  });
  it('includes certificate actions for mapped certs', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const certActions = plan.actions.filter(a => a.type === 'jsFill' && a.name === 'licence_number');
    expect(certActions.length).toBeGreaterThan(0);
  });
  it('includes sea service actions', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const vesselAction = plan.actions.find(a => a.type === 'jsFill' && a.name === 'vessel_name');
    expect(vesselAction).toBeDefined();
    if (vesselAction?.type === 'jsFill') expect(vesselAction.value).toBe('BOS BASE');
  });
  it('uses waitForFunction instead of wait(1500) after personal save', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    // After #save_button click in personal tab, the next action must be a waitForFunction (not a raw wait)
    const saveIdx = plan.actions.findIndex(a => a.type === 'click' && a.locator === '#save_button');
    expect(saveIdx).toBeGreaterThan(-1);
    const afterSave = plan.actions[saveIdx + 1];
    expect(afterSave?.type).toBe('waitForFunction');
  });

  it('uses waitForFunction instead of wait(1000) before cert loop', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const certTabIdx = plan.actions.findIndex(a => a.type === 'click' && a.locator === '#a-cert');
    expect(certTabIdx).toBeGreaterThan(-1);
    const afterCertTab = plan.actions[certTabIdx + 1];
    expect(afterCertTab?.type).toBe('waitForFunction');
  });

  it('uses waitForFunction instead of wait(1000) before sea service loop', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const seaTabIdx = plan.actions.findIndex(a => a.type === 'click' && a.locator === '#a-seaservice');
    expect(seaTabIdx).toBeGreaterThan(-1);
    const afterSeaTab = plan.actions[seaTabIdx + 1];
    expect(afterSeaTab?.type).toBe('waitForFunction');
  });

  it('no raw wait(1500) actions in the plan for post-save delays', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const longWaits = plan.actions.filter(a => a.type === 'wait' && a.ms >= 1000);
    expect(longWaits).toHaveLength(0);
  });

  it('splits company at slash for owner/agent', () => {
    const plan = adapter.buildSubmissionPlan(profile);
    const ownerAction = plan.actions.find(a => a.type === 'jsFill' && a.name === 'owner_name');
    if (ownerAction?.type === 'jsFill') expect(ownerAction.value).toBe('BRITOIL');
    const agentAction = plan.actions.find(a => a.type === 'jsFill' && a.name === 'agent_name');
    if (agentAction?.type === 'jsFill') expect(agentAction.value).toBe('Atlas NextWave');
  });
});
