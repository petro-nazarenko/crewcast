export class Logger {
  private prefix: string;

  constructor(prefix = 'crewcast') {
    this.prefix = prefix;
  }

  info(msg: string): void {
    console.log(`[${this.prefix}] ℹ️  ${msg}`);
  }

  success(msg: string): void {
    console.log(`[${this.prefix}] ✅ ${msg}`);
  }

  warn(msg: string): void {
    console.warn(`[${this.prefix}] ⚠️  ${msg}`);
  }

  error(msg: string): void {
    console.error(`[${this.prefix}] 💥 ${msg}`);
  }

  plan(siteId: string, actionCount: number): void {
    this.info(`Plan for ${siteId}: ${actionCount} actions`);
  }

  result(result: import('../engine/result.js').SubmissionResult): void {
    const { mode, siteId, succeededCount, failedCount, skippedCount, success, durationMs } = result;
    const status = success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`\n${status} | ${siteId} | mode=${mode} | ${succeededCount} ok / ${failedCount} failed / ${skippedCount} skipped | ${durationMs}ms\n`);
    if (result.errors.length > 0) {
      result.errors.forEach(e => this.error(e));
    }
    if (result.validationWarnings.length > 0) {
      result.validationWarnings.forEach(w => this.warn(w));
    }
  }
}
