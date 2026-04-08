/**
 * Splits a company string in "Owner / Agent" format into owner and agent parts.
 * If no slash separator is present, the whole string is treated as the owner.
 */
export function splitCompany(company: string): { owner: string; agent: string } {
  const parts = company.split('/');
  return {
    owner: parts[0].trim(),
    agent: parts[1]?.trim() ?? '',
  };
}
