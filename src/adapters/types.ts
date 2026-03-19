import { SeafarerProfile } from '../domain/profile.js';
import { SubmissionPlan } from '../engine/submissionPlan.js';
export interface SiteAdapter {
  readonly siteId: string;
  readonly siteUrl: string;
  buildSubmissionPlan(profile: SeafarerProfile): SubmissionPlan;
}
