import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SeafarerProfile } from './domain/profile.js';
import { normalizeProfile } from './normalizers/profileNormalizer.js';
import { getAdapter } from './adapters/registry.js';
import { EngineRunner } from './engine/runner.js';
import { ResultStorage } from './storage/resultStorage.js';
import { Logger } from './utils/logger.js';
import { resolveAttachments } from './utils/attachments.js';
import { RunMode } from './engine/result.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = new Logger();

function printUsage(): void {
  console.log(`
Usage: node src/cli.ts <siteId> [profilePath] [--preview]
  siteId       Required. e.g. "sailinga"
  profilePath  Optional. Default: ./profile.json
  --preview    Optional. Build plan and validate without browser.

Examples:
  node src/cli.ts sailinga
  node src/cli.ts sailinga profile.json --preview
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const siteId = args[0];
  const preview = args.includes('--preview');
  const mode: RunMode = preview ? 'preview' : 'submit';

  const profileArg = args.find(a => !a.startsWith('--') && a !== siteId);
  const profilePath = profileArg
    ? path.resolve(profileArg)
    : path.join(path.dirname(__dirname), 'profile.json');

  if (!fs.existsSync(profilePath)) {
    logger.error(`Profile not found: ${profilePath}`);
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let raw: any;
  try {
    raw = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
  } catch {
    logger.error(`Failed to parse profile JSON: ${profilePath}`);
    process.exit(1);
  }
  const attachments = resolveAttachments(path.dirname(profilePath));
  const profile: SeafarerProfile = normalizeProfile({ ...raw, attachments });

  let adapter;
  try {
    adapter = getAdapter(siteId);
  } catch {
    logger.error(`Unknown site: "${siteId}". Available: sailinga`);
    process.exit(1);
  }

  const plan = adapter.buildSubmissionPlan(profile);
  logger.plan(plan.siteId, plan.actions.length);

  if (preview) {
    logger.info('Preview mode — printing plan:');
    plan.actions.forEach((a, i) => {
      if (a.type === 'jsFill')   console.log(`  ${i+1}. fill[${a.name}] = "${a.value}"`);
      if (a.type === 'jsSelect') console.log(`  ${i+1}. select[${a.name}] = "${a.text}"`);
      if (a.type === 'upload')   console.log(`  ${i+1}. upload[${a.locator}] <- ${a.path}`);
      if (a.type === 'jsCheck')  console.log(`  ${i+1}. check[${a.name}] = ${a.checked}`);
    });
  }

  const artifactsDir = path.join(path.dirname(__dirname), 'artifacts');
  const runner = new EngineRunner(artifactsDir);
  const storage = new ResultStorage(path.join(artifactsDir, 'results'));

  logger.info(`Running ${mode} for ${siteId}...`);
  const result = await runner.run(plan, profile, mode);
  const savedPath = storage.save(result);
  logger.result(result);
  logger.info(`Result saved: ${savedPath}`);
  process.exit(result.success ? 0 : 1);
}

main().catch(err => {
  console.error('💥 Fatal:', err.message);
  process.exit(1);
});
