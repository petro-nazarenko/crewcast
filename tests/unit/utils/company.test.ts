import { splitCompany } from '../../../src/utils/company.js';

describe('splitCompany', () => {
  it('splits owner and agent on slash separator', () => {
    const result = splitCompany('BRITOIL / Atlas NextWave');
    expect(result.owner).toBe('BRITOIL');
    expect(result.agent).toBe('Atlas NextWave');
  });

  it('returns empty agent when no slash present', () => {
    const result = splitCompany('North Sea Shipping Ltd');
    expect(result.owner).toBe('North Sea Shipping Ltd');
    expect(result.agent).toBe('');
  });

  it('trims whitespace from owner and agent', () => {
    const result = splitCompany('  OwnerCo  /  AgentCo  ');
    expect(result.owner).toBe('OwnerCo');
    expect(result.agent).toBe('AgentCo');
  });

  it('handles company with slash but no agent', () => {
    const result = splitCompany('OwnerCo/');
    expect(result.owner).toBe('OwnerCo');
    expect(result.agent).toBe('');
  });
});
