export type ISODate = string;

export interface ProfileDocument {
  number: string;
  issued: ISODate;
  validTo: ISODate;
  country: string;
}

export interface Certificate {
  name: string;
  number?: string;
  issued?: ISODate;
  issuedBy?: string;
  validTo?: ISODate | null;
}

export interface SeaServiceRecord {
  rank: string;
  vessel: string;
  dwt?: number | null;
  type: string;
  area?: string;
  from: ISODate;
  to: ISODate;
  company: string;
}

export interface SeafarerProfile {
  firstName: string;
  lastName: string;
  fullName?: string;
  dateOfBirth: ISODate;
  gender?: string;
  nationality: string;
  citizenship?: string;
  placeOfBirth?: string;
  englishLevel?: string;
  email: string;
  phone?: string;
  residence?: string;
  city?: string;
  country?: string;
  airport?: string;
  availableFrom?: ISODate;
  salary?: string;
  position?: string;
  preferredRank?: string;
  preferredVessel?: string;
  vesselType?: string;
  documents: {
    passport: ProfileDocument;
    seamanBookUA?: ProfileDocument;
    seamanBookCY?: ProfileDocument;
    seamanBookLU?: ProfileDocument;
    usaVisaC1D?: Omit<ProfileDocument, 'country'>;
    [key: string]: ProfileDocument | Omit<ProfileDocument, 'country'> | undefined;
  };
  certificates: Certificate[];
  seaService: SeaServiceRecord[];
  experience?: string;
  skills?: string[];
  notes?: string;
  lastVessel?: string;
  lastVesselType?: string;
  lastCompany?: string;
  lastCrewingAgent?: string;
  lastContractEnd?: ISODate;
  attachments?: {
    cvPath?: string;
    photoPath?: string;
  };
}
