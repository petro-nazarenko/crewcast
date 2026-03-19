import { SubmissionAction } from './submissionPlan.js';

export type RunMode = 'preview' | 'submit';
export type ValidationStatus = 'ok' | 'warning' | 'error';

export interface ActionResult {
  action: SubmissionAction;
  status: 'ok' | 'failed' | 'skipped';
  error?: string;
}

export interface SubmissionResult {
  runId: string;
  siteId: string;
  profileId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  mode: RunMode;
  validationStatus: ValidationStatus;
  validationErrors: string[];
  validationWarnings: string[];
  actionResults: ActionResult[];
  totalActions: number;
  succeededCount: number;
  failedCount: number;
  skippedCount: number;
  screenshots: string[];
  uploadedFiles: string[];
  success: boolean;
  errors: string[];
}
