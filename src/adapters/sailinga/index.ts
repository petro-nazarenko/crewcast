import { SeafarerProfile } from '../../domain/profile.js';
import { SubmissionPlan, SubmissionAction } from '../../engine/submissionPlan.js';
import { SiteAdapter } from '../types.js';
import { CERT_MAP, VTYPE_MAP, RANK_MAP, ENGLISH_MAP } from './mappings.js';
import { SAILINGA_CONFIG } from './config.js';
export class SailingaAdapter implements SiteAdapter {
  readonly siteId = SAILINGA_CONFIG.siteId;
  readonly siteUrl = SAILINGA_CONFIG.siteUrl;
  buildSubmissionPlan(profile: SeafarerProfile): SubmissionPlan {
    const actions: SubmissionAction[] = [];
    // Personal — read from profile, not hardcoded
    actions.push({ type: 'jsSelect', name: 'Position1', text: profile.preferredRank ?? 'AB' });
    actions.push({ type: 'jsSelect', name: 'Nationality', text: profile.nationality });
    actions.push({ type: 'jsSelect', name: 'English', text: ENGLISH_MAP[profile.englishLevel ?? ''] ?? 'Satisfact.' });
    actions.push({ type: 'jsFill', name: 'Surname', value: profile.lastName });
    actions.push({ type: 'jsFill', name: 'Name', value: profile.firstName });
    actions.push({ type: 'jsFill', name: 'Dateofbirth', value: profile.dateOfBirth });
    actions.push({ type: 'jsFill', name: 'Email', value: profile.email });
    actions.push({ type: 'jsFill', name: 'T1_Rem', value: profile.phone ?? '' });
    actions.push({ type: 'jsFill', name: 'Minsalary', value: profile.salary ?? 'Discussable' });
    actions.push({ type: 'jsFill', name: 'Available', value: profile.availableFrom ?? '' });
    // Address — from profile, not hardcoded
    const address = [profile.residence, profile.city].filter(Boolean).join(', ');
    actions.push({ type: 'jsFill', name: 'Address', value: address });
    actions.push({ type: 'jsFill', name: 'City', value: profile.city ?? '' });
    actions.push({ type: 'jsFill', name: 'Country', value: profile.country ?? '' });
    // Gender — from profile if present
    if (profile.gender) {
      actions.push({ type: 'jsSelect', name: 'Sex', text: profile.gender });
    }
    // Passport
    actions.push({ type: 'jsFill', name: 'PassportNo', value: profile.documents.passport.number });
    actions.push({ type: 'jsFill', name: 'P_Dateofissue', value: profile.documents.passport.issued });
    actions.push({ type: 'jsFill', name: 'P_Dateofexpiry', value: profile.documents.passport.validTo });
    actions.push({ type: 'jsSelect', name: 'P_Placeofissue', text: profile.documents.passport.country });
    // Seaman Book UA
    if (profile.documents.seamanBookUA) {
      const sb = profile.documents.seamanBookUA;
      actions.push({ type: 'jsFill', name: 'SeamensBookNo', value: sb.number });
      actions.push({ type: 'jsFill', name: 'SBK_Dateofissue', value: sb.issued });
      actions.push({ type: 'jsFill', name: 'SBK_Dateofexpiry', value: sb.validTo });
      actions.push({ type: 'jsSelect', name: 'SBK_Placeofissue', text: sb.country });
    }
    // COC — find from certificates array, not hardcoded
    const coc = profile.certificates.find(c => c.name === 'Able Seafarer Deck');
    if (coc) {
      actions.push({ type: 'jsSelect', name: 'LicenseGrade', text: 'A/B' });
      actions.push({ type: 'jsSelect', name: 'L_Placeofissue', text: coc.issuedBy ?? 'Ukraine' });
      actions.push({ type: 'jsFill', name: 'LicencsNo', value: coc.number ?? '' });
      actions.push({ type: 'jsFill', name: 'L_Dateofissue', value: coc.issued ?? '' });
    }
    // Certificates
    const certs = profile.certificates
      .filter(c => CERT_MAP[c.name])
      .slice(0, SAILINGA_CONFIG.maxCerts);
    for (let idx = 0; idx < certs.length; idx++) {
      const n = idx + 1;
      const c = certs[idx];
      actions.push({ type: 'jsSelect', name: `Cer_Document${n}`, text: CERT_MAP[c.name] });
      actions.push({ type: 'jsFill', name: `Cer_Number${n}`, value: c.number ?? '' });
      actions.push({ type: 'jsFill', name: `Cer_Dateofexpiry${n}`, value: c.validTo ?? '' });
      actions.push({
        type: 'jsSelect',
        name: `Cer_Placeofissue${n}`,
        text: c.issuedBy?.includes('Ukraine') ? 'Ukraine' : 'Other',
      });
    }
    // Sea Service — company split is Sailinga-specific
    const sea = profile.seaService.slice(0, SAILINGA_CONFIG.maxSeaService);
    for (let idx = 0; idx < sea.length; idx++) {
      const n = idx + 1;
      const e = sea[idx];
      actions.push({ type: 'jsFill', name: `NameofVessel${n}`, value: e.vessel });
      actions.push({ type: 'jsFill', name: `GRT${n}`, value: e.dwt ? String(e.dwt) : '' });
      actions.push({ type: 'jsSelect', name: `Type${n}`, text: VTYPE_MAP[e.type] ?? 'Other' });
      actions.push({ type: 'jsSelect', name: `Rank${n}`, text: RANK_MAP[e.rank] ?? 'AB' });
      actions.push({ type: 'jsFill', name: `PeriodFrom${n}`, value: e.from });
      actions.push({ type: 'jsFill', name: `PeriodTo${n}`, value: e.to });
      actions.push({ type: 'jsFill', name: `Company${n}`, value: e.company.split('/')[0].trim() });
    }
    // Notes
    actions.push({ type: 'jsFill', name: 'rem3', value: profile.notes ?? '' });
    // CV upload
    if (profile.attachments?.cvPath) {
      actions.push({ type: 'upload', locator: SAILINGA_CONFIG.cvLocator, path: profile.attachments.cvPath });
    }
    // Photo upload
    if (profile.attachments?.photoPath) {
      actions.push({ type: 'upload', locator: SAILINGA_CONFIG.photoLocator, path: profile.attachments.photoPath });
    }
    return {
      siteId: this.siteId,
      siteUrl: this.siteUrl,
      waitForReady: {
        type: 'waitForFunction',
        expression: SAILINGA_CONFIG.waitForReadyExpression,
        timeout: 60000,
      },
      actions,
      submitAction: { type: 'click', locator: SAILINGA_CONFIG.submitLocator },
      declareAction: { type: 'jsCheck', name: SAILINGA_CONFIG.declareFieldName, checked: true },
    };
  }
}
