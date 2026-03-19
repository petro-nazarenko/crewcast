import { readFileSync } from 'fs';
import { chromium } from 'playwright';
import 'dotenv/config';
import { CERT_MAP, VTYPE_MAP, RANK_MAP } from './src/adapters/sailinga/mappings.js';
import { normalizeDate } from './src/normalizers/dateNormalizer.js';

const DRY_RUN = process.env.DRY_RUN === 'true';

const ENGLISH_MAP = {
  'Intermediate': 'Satisfact.',
  'Upper-Intermediate': 'Good',
  'Advanced': 'Fluent',
  'Basic': 'Basic',
};

const P = JSON.parse(readFileSync('./profile.json', 'utf-8'));

async function run() {
  if (DRY_RUN) {
    console.log('DRY_RUN mode — validating profile data only');
    console.log('Name:', P.firstName, P.lastName);
    console.log('Email:', P.email);
    console.log('Position:', P.position);
    console.log('English level:', ENGLISH_MAP[P.englishLevel] ?? P.englishLevel);
    console.log('Sea service records:', P.seaService.length);

    for (const cert of P.certificates) {
      const mapped = CERT_MAP[cert.name];
      if (mapped) console.log(`  Cert mapped: ${cert.name} → ${mapped}`);
    }

    for (const svc of P.seaService) {
      const rank = RANK_MAP[svc.rank] ?? svc.rank;
      const vtype = VTYPE_MAP[svc.type] ?? svc.type;
      console.log(`  Service: ${rank} on ${svc.vessel} (${vtype})`);
    }

    console.log('DRY_RUN complete — no browser launched');
    return;
  }

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(process.env.SAILINGA_URL ?? 'https://sailinga.com');
    console.log('Opened Sailinga');
    // TODO: form filling logic
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
