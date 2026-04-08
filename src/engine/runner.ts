import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SubmissionPlan, SubmissionAction } from './submissionPlan.js';
import { SubmissionResult, ActionResult, RunMode } from './result.js';
import { BrowserRuntime } from '../runtime/browser.js';
import { SeafarerProfile } from '../domain/profile.js';
import { validateProfile } from '../validators/profileValidator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getActionId(action: SubmissionAction): string {
  if (action.type === 'jsFill' || action.type === 'jsSelect' || action.type === 'jsCheck') return action.name;
  if (action.type === 'click' || action.type === 'upload') return action.locator;
  if (action.type === 'waitForFunction') return action.expression.slice(0, 40);
  return `${action.ms}ms`;
}

export class EngineRunner {
  private artifactsDir: string;

  constructor(artifactsDir?: string) {
    this.artifactsDir = artifactsDir ?? path.join(__dirname, '../../artifacts');
  }

  async run(
    plan: SubmissionPlan,
    profile: SeafarerProfile,
    mode: RunMode = 'submit'
  ): Promise<SubmissionResult> {
    const runId = new Date().toISOString().replace(/[:.]/g, '-');
    const startedAt = new Date().toISOString();
    const profileId = `${profile.lastName}_${profile.firstName}`;
    const validation = validateProfile(profile);

    if (validation.status === 'error') {
      const finishedAt = new Date().toISOString();
      return {
        runId, siteId: plan.siteId, profileId,
        startedAt, finishedAt,
        durationMs: 0,
        mode,
        validationStatus: 'error',
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        actionResults: [],
        totalActions: 0,
        succeededCount: 0,
        failedCount: 0,
        skippedCount: 0,
        screenshots: [],
        uploadedFiles: [],
        success: false,
        errors: validation.errors,
      };
    }

    // Preview mode — no browser
    if (mode === 'preview') {
      const actionResults: ActionResult[] = plan.actions.map(action => ({
        action,
        status: 'skipped' as const,
      }));
      const finishedAt = new Date().toISOString();
      return {
        runId, siteId: plan.siteId, profileId,
        startedAt, finishedAt,
        durationMs: Date.now() - new Date(startedAt).getTime(),
        mode,
        validationStatus: validation.status,
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        actionResults,
        totalActions: plan.actions.length,
        succeededCount: 0,
        failedCount: 0,
        skippedCount: plan.actions.length,
        screenshots: [],
        uploadedFiles: [],
        success: true,
        errors: [],
      };
    }

    // Submit mode — launch browser
    const screenshotsDir = path.join(this.artifactsDir, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

    const headless = process.env.HEADLESS !== 'false';
    const browser = await chromium.launch({ headless, args: ['--no-sandbox'] });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    const runtime = new BrowserRuntime(page);
    const actionResults: ActionResult[] = [];
    const screenshots: string[] = [];
    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    try {
      await page.goto(plan.siteUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await runtime.waitForFunction(plan.waitForReady.expression, plan.waitForReady.timeout);
      await runtime.waitForNetworkIdle(5000).catch(() => {});

      for (const action of plan.actions) {
        try {
          await this.executeAction(runtime, action);
          actionResults.push({ action, status: 'ok' });
          if (action.type === 'upload') uploadedFiles.push(action.path);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          actionResults.push({ action, status: 'failed', error: message });
          errors.push(`${action.type}[${getActionId(action)}]: ${message}`);
        }
      }

      const screenshotPath = path.join(screenshotsDir, `${runId}_filled.png`);
      await runtime.screenshot(screenshotPath);
      screenshots.push(screenshotPath);

      // Declare + submit
      if (plan.declareAction) {
        await runtime.jsCheck(plan.declareAction.name, plan.declareAction.checked);
      }
      await runtime.click(plan.submitAction.locator);
      await runtime.waitForNetworkIdle(10000).catch(() => {});

      const submittedPath = path.join(screenshotsDir, `${runId}_submitted.png`);
      await runtime.screenshot(submittedPath);
      screenshots.push(submittedPath);
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : String(err));
      const errorPath = path.join(screenshotsDir, `${runId}_error.png`);
      await runtime.screenshot(errorPath).catch(() => {});
      screenshots.push(errorPath);
    } finally {
      await browser.close();
    }

    const finishedAt = new Date().toISOString();
    const succeededCount = actionResults.filter(r => r.status === 'ok').length;
    const failedCount = actionResults.filter(r => r.status === 'failed').length;

    return {
      runId, siteId: plan.siteId, profileId,
      startedAt, finishedAt,
      durationMs: Date.now() - new Date(startedAt).getTime(),
      mode,
      validationStatus: validation.status,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings,
      actionResults,
      totalActions: plan.actions.length,
      succeededCount,
      failedCount,
      skippedCount: 0,
      screenshots,
      uploadedFiles,
      success: errors.length === 0,
      errors,
    };
  }

  private async executeAction(runtime: BrowserRuntime, action: SubmissionAction): Promise<void> {
    switch (action.type) {
      case 'jsFill':   await runtime.jsFill(action.name, action.value); break;
      case 'jsSelect': await runtime.jsSelect(action.name, action.text); break;
      case 'jsCheck':  await runtime.jsCheck(action.name, action.checked); break;
      case 'upload':   await runtime.upload(action.locator, action.path); break;
      case 'click':    await runtime.click(action.locator); break;
      case 'waitForFunction': await runtime.waitForFunction(action.expression, action.timeout); break;
      case 'wait':     await runtime.wait(action.ms); break;
    }
  }
}
