import fs from 'fs';
import path from 'path';
import { SubmissionResult } from '../engine/result.js';

export class ResultStorage {
  constructor(private resultsDir: string) {
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
  }

  save(result: SubmissionResult): string {
    const filename = `${result.runId}_${result.siteId}_${result.profileId}.json`;
    const filePath = path.join(this.resultsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
    return filePath;
  }

  load(filename: string): SubmissionResult {
    const filePath = path.join(this.resultsDir, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  list(): string[] {
    return fs.readdirSync(this.resultsDir).filter(f => f.endsWith('.json'));
  }
}
