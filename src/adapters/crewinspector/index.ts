import { SeafarerProfile } from '../../domain/profile.js';
import { SubmissionPlan, SubmissionAction } from '../../engine/submissionPlan.js';
import { SiteAdapter } from '../types.js';
import { CI_RANK_MAP, CI_VTYPE_MAP, CI_CERT_MAP, CI_COUNTRY_MAP } from './mappings.js';
import { CREWINSPECTOR_COMPANIES } from './config.js';
import { splitCompany } from '../../utils/company.js';
export class CrewInspectorAdapter implements SiteAdapter {
  readonly siteId: string;
  readonly siteUrl: string;
  constructor(company: keyof typeof CREWINSPECTOR_COMPANIES = 'orca') {
    this.siteId = CREWINSPECTOR_COMPANIES[company].siteId;
    this.siteUrl = CREWINSPECTOR_COMPANIES[company].url;
  }
  buildSubmissionPlan(profile: SeafarerProfile): SubmissionPlan {
    const actions: SubmissionAction[] = [];
    // ── Login flow ──
    actions.push({ type: 'jsFill', name: 'email', value: profile.email });
    actions.push({ type: 'click', locator: 'input[type="submit"], button[type="submit"]' });
    // Wait for "no records" OR selfservice page
    actions.push({
      type: 'waitForFunction',
      expression: "document.querySelector('button:not([style*=\"display: none\"])') !== null && (document.body.innerText.includes('New application') || document.querySelector('#a-seaman') !== null)",
      timeout: 30000,
    });
    // If "New application" button exists — click it
    actions.push({ type: 'click', locator: 'button.btn-success, input[value="New application"]' });
    // Wait for Terms agree page OR selfservice
    actions.push({
      type: 'waitForFunction',
      expression: "document.querySelector('#a-seaman') !== null || document.querySelector('input[value=\"Agree\"]') !== null",
      timeout: 30000,
    });
    // If Terms page — click Agree then Go to Start
    actions.push({ type: 'click', locator: 'input[value="Agree"], button:has-text("Agree")' });
    actions.push({ type: 'wait', ms: 500 });
    actions.push({ type: 'click', locator: 'input[value="Go to Start"], button:has-text("Go to Start")' });
    // ── STEP 1: Personal tab ──
    actions.push({ type: 'click', locator: '#a-seaman' });
    actions.push({ type: 'waitForFunction', expression: "document.querySelector('#available_from') !== null" });
    actions.push({ type: 'click', locator: '#edit_button' });
    actions.push({ type: 'jsFill', name: 'available_from', value: this.toDisplayDate(profile.availableFrom) });
    actions.push({ type: 'jsSelect', name: 'rank_id', text: CI_RANK_MAP[profile.preferredRank ?? ''] ?? 'Able Seaman' });
    actions.push({ type: 'jsSelect', name: 'country_id', text: profile.nationality });
    actions.push({ type: 'jsSelect', name: 'citizenship_id', text: profile.citizenship ?? 'Citizen' });
    actions.push({ type: 'jsSelect', name: 'marital_id', text: profile.maritalStatus ?? 'Single' });
    actions.push({ type: 'jsFill', name: 'middle_name', value: '' });
    actions.push({ type: 'jsFill', name: 'pp_pob', value: profile.placeOfBirth ?? '' });
    if (profile.gender) {
      actions.push({
        type: 'jsCheck',
        name: 'sex',
        checked: profile.gender.toUpperCase() === 'M',
      });
    }
    if (profile.salary) {
      actions.push({ type: 'jsFill', name: 'min_salary', value: profile.salary.replace(/[^0-9]/g, '') });
    }
    if (profile.attachments?.cvPath) {
      actions.push({ type: 'upload', locator: '#seaman_file', path: profile.attachments.cvPath });
    }
    actions.push({ type: 'click', locator: '#save_button' });
    actions.push({ type: 'wait', ms: 1500 });
    // ── STEP 2: Contacts tab ──
    actions.push({ type: 'click', locator: '#a-address' });
    actions.push({ type: 'waitForFunction', expression: "document.querySelector('input[value=\"New entry\"]') !== null" });
    // Contacts are added as separate entries — click New entry to open form
    actions.push({ type: 'click', locator: 'input.btn-success[value="New entry"]' });
    actions.push({ type: 'waitForFunction', expression: "document.querySelector('#edit_form input[name=\"country_id\"]') !== null" });
    actions.push({ type: 'jsFill', name: 'address', value: [profile.city, profile.country].filter(Boolean).join(', ') });
    actions.push({ type: 'jsSelect', name: 'country_id', text: profile.country ?? '' });
    if (profile.phone) {
      actions.push({ type: 'jsFill', name: 'fax', value: profile.phone });
    }
    actions.push({ type: 'click', locator: '#edit_form #save_button' });
    actions.push({ type: 'wait', ms: 1500 });
    // ── STEP 3: Certificates tab ──
    actions.push({ type: 'click', locator: '#a-cert' });
    actions.push({ type: 'waitForFunction', expression: "document.querySelector('#a-cert') !== null" });
    actions.push({ type: 'wait', ms: 1000 });
    const certsToAdd = profile.certificates.filter(c => CI_CERT_MAP[c.name]);
    for (const cert of certsToAdd) {
      actions.push({ type: 'click', locator: 'input.btn-success[value="New entry"]' });
      actions.push({ type: 'waitForFunction', expression: "document.querySelector('#cert_id') !== null" });
      actions.push({ type: 'jsSelect', name: 'cert_id', text: CI_CERT_MAP[cert.name] });
      actions.push({ type: 'jsSelect', name: 'issuer_country', text: CI_COUNTRY_MAP[cert.issuedBy ?? ''] ?? 'UKR' });
      actions.push({ type: 'jsFill', name: 'issuer', value: cert.issuedBy ?? '' });
      actions.push({ type: 'jsFill', name: 'from_date', value: this.toDisplayDate(cert.issued) });
      if (cert.validTo) {
        actions.push({ type: 'jsFill', name: 'to_date', value: this.toDisplayDate(cert.validTo) });
      } else {
        actions.push({ type: 'jsCheck', name: 'is_unlimited', checked: true });
      }
      actions.push({ type: 'jsFill', name: 'licence_number', value: cert.number ?? '' });
      actions.push({ type: 'click', locator: '#save_button' });
      actions.push({ type: 'wait', ms: 1500 });
    }
    // ── STEP 4: Sea Service tab ──
    actions.push({ type: 'click', locator: '#a-seaservice' });
    actions.push({ type: 'waitForFunction', expression: "document.querySelector('#a-seaservice') !== null" });
    actions.push({ type: 'wait', ms: 1000 });
    for (const sea of profile.seaService.slice(0, 10)) {
      actions.push({ type: 'click', locator: 'input.btn-success[value="New entry"]' });
      actions.push({ type: 'waitForFunction', expression: "document.querySelector('#vessel_name') !== null" });
      actions.push({ type: 'jsFill', name: 'vessel_name', value: sea.vessel });
      actions.push({ type: 'jsSelect', name: 'vessel_type_id', text: CI_VTYPE_MAP[sea.type] ?? sea.type });
      if (sea.dwt) {
        actions.push({ type: 'jsFill', name: 'vessel_dwt', value: String(sea.dwt) });
      }
      actions.push({ type: 'jsSelect', name: 'rank_id', text: CI_RANK_MAP[sea.rank] ?? 'Able Seaman' });
      actions.push({ type: 'jsFill', name: 'on_date', value: this.toDisplayDate(sea.from) });
      actions.push({ type: 'jsFill', name: 'off_date', value: this.toDisplayDate(sea.to) });
      actions.push({ type: 'jsFill', name: 'owner_name', value: splitCompany(sea.company).owner });
      actions.push({ type: 'jsFill', name: 'agent_name', value: splitCompany(sea.company).agent });
      actions.push({ type: 'click', locator: '#save_button' });
      actions.push({ type: 'wait', ms: 1500 });
    }
    return {
      siteId: this.siteId,
      siteUrl: this.siteUrl,
      waitForReady: {
        type: 'waitForFunction',
        expression: "document.querySelector('#a-seaman') !== null",
        timeout: 120000,
      },
      actions,
      submitAction: { type: 'click', locator: 'input[value="SUBMIT"], button:has-text("SUBMIT")' },
    };
  }
  // Convert ISO date to dd.mm.yyyy for CrewInspector inputs
  private toDisplayDate(d: string | null | undefined): string {
    if (!d) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split('-');
      return `${day}.${m}.${y}`;
    }
    return d;
  }
}
