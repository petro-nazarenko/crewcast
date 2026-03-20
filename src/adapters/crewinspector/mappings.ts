// Rank: text → numeric ID from CrewInspector dropdown
export const CI_RANK_MAP: Record<string, string> = {
  'AB': 'Able Seaman',
  'AB/B/S': 'Able Seaman',
  'AB/Rigger': 'Able Seaman / Rigger',
  'AB/Workteam': 'Able Seaman',
  'AB/Painter': 'Able Seaman',
  'AB/Watchman': 'Able Seaman',
  'Rigger/LOLER': 'Able Seaman / Rigger',
  'Rigger/BM/WO': 'Able Seaman / Rigger',
};
// Vessel type: canonical → CrewInspector text
export const CI_VTYPE_MAP: Record<string, string> = {
  'OSV': 'Offshore Supply Vessel',
  'PSV': 'Platform Supply Vessel',
  'MPSV': 'Multi Purpose Vessel',
  'AHTS': 'AHTS',
  'PLV': 'Pipe Layer',
  'SSDU': 'Diving Support Vessel',
  'Drillship': 'Drill Ship',
  'DP Fallpipe Vessel': 'Construction Vessel',
  'Dredging Barges': 'Dredger',
  'RSV / Dry Dock': 'Research Vessel',
  'PSV (Lay-up)': 'Platform Supply Vessel',
  'Cruise / Dry Dock': 'Cruise Vessel',
};
// Certificate name → CrewInspector cert_id select text
export const CI_CERT_MAP: Record<string, string> = {
  'Able Seafarer Deck': 'Rating Able Seafarer Deck',
  'Basic Safety Training (STCW)': 'Rating part of Navigational Watch',
  'Advanced Fire Fighting': 'Rating part of Navigational Watch',
  'Proficiency in Survival Craft and Rescue Boats': 'Rating part of Navigational Watch',
  'Officer in charge of a navigation watch': 'Officer in charge of a navigation watch',
};
// Country name → ISO alpha-3 code for issuer_country
export const CI_COUNTRY_MAP: Record<string, string> = {
  'Ukraine': 'UKR',
  'UKRAINE': 'UKR',
  'United Kingdom': 'GBR',
  'Netherlands': 'NLD',
  'Luxembourg': 'LUX',
  'Cyprus': 'CYP',
  'stcw.online': 'NLD',
  'Sea Survival School': 'GBR',
  'Mintra (e-learning)': 'GBR',
  'UK (e-learning)': 'GBR',
};
