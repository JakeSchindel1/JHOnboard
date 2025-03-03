// API Types
export interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}


//ASAM
export interface MentalHealthEntry {
  diagnosis: string;
  dateOfDiagnosis: string;
  prescribedMedication: 'yes' | 'no';
  medicationCompliant: 'yes' | 'no';
  currentSymptoms: 'yes' | 'no';
  describeSymptoms: string;
}

// New MentalHealth interface using MentalHealthEntry
export interface MentalHealth {
  entries: MentalHealthEntry[];
  suicidalIdeation: 'yes' | 'no';
  homicidalIdeation: 'yes' | 'no';
  hallucinations: 'yes' | 'no';
}

export interface DrugHistoryEntry {
  drugType: string;
  everUsed: 'yes' | 'no';
  dateLastUse: string;
  frequency: string;
  intravenous: 'yes' | 'no';
  totalYears: string;
  amount: string;
}

export interface RecoveryResidenceEntry {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
}

export interface TreatmentHistoryEntry {
  type: string;
  estimatedDate: string;
  location: string;
}

export interface IncarcerationHistoryEntry {
  type: string;
  estimatedDate: string;
  location: string;
}

export interface ProbationHistoryEntry {
  type: 'probation' | 'pretrial';
  jurisdiction: string;
  startDate: string;
  endDate: string;
  officerName: string;
  officerEmail?: string;  // Optional
  officerPhone?: string;  // Optional
}

export interface DrugTestResults {
  [key: string]: boolean;
}


// Base Types
export interface PersonalInformation {
  firstName: string;
  lastName: string;
  intakeDate: string;
  housingLocation: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  sex: string;
  email: string;
  driversLicenseNumber?: string;
  phoneNumber?: string;
}

export interface Insurance {
  insuranceType: string;
  policyNumber?: string;
}

export interface VehicleInformation {
  make?: string;
  model?: string;
  tagNumber?: string;
  insured: boolean;
  insurances: Insurance[];
  policyNumber?: string;
  noVehicle?: boolean;
}

export interface EmergencyContact {
  firstName: string;
  lastName: string;
  phone: string;
  relationship: string;
  otherRelationship?: string;
}

export interface MedicalInformation {
  dualDiagnosis: boolean;
  mat: boolean;
  matMedication?: string;
  matMedicationOther?: string;
  needPsychMedication: boolean;
}

export interface AuthorizedPerson {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
}

export interface HealthStatus {
  // Health Conditions
  pregnant: boolean;
  developmentallyDisabled: boolean;
  coOccurringDisorder: boolean;
  docSupervision: boolean;
  felon: boolean;
  physicallyHandicapped: boolean;
  postPartum: boolean;
  primaryFemaleCaregiver: boolean;
  recentlyIncarcerated: boolean;
  sexOffender: boolean;
  lgbtq: boolean;
  veteran: boolean;
  insulinDependent: boolean;
  historyOfSeizures: boolean;
  
  // Demographics
  race: string;
  ethnicity: string;
  householdIncome: string;
  employmentStatus: string;
}

export interface LegalStatus {
  hasProbationPretrial: boolean;
  jurisdiction?: string;
  jurisdictionTypes?: string;
  otherJurisdiction?: string;
  hasPendingCharges: boolean;
  hasConvictions: boolean;
  isWanted: boolean;
  isOnBond: boolean;
  bondsmanName?: string;
  isSexOffender: boolean;
}

export interface PendingCharge {
  chargeDescription: string;
  location?: string;
}

export interface Conviction {
  offense: string;
}

export type SignatureType = 
  | 'emergency'
  | 'medication'
  | 'disclosure'
  | 'treatment'
  | 'price_consent'
  | 'tenant_rights'
  | 'contract_terms'
  | 'criminal_history'
  | 'ethics'
  | 'critical_rules'
  | 'house_rules'
  | 'asam_assessment'
  | 'resident_as_guest'
  | 'treat_others';

export interface Signature {
  signatureType: SignatureType;
  signature: string;
  signatureTimestamp: string;
  signatureId: string;
  witnessSignature?: string;
  witnessTimestamp?: string;
  witnessSignatureId?: string;
  agreed?: boolean;
  updates?: Record<string, any>;
}

// Main Form Data Type
export interface FormData extends PersonalInformation {
  healthStatus: HealthStatus;
  vehicle?: VehicleInformation;
  emergencyContact: EmergencyContact;
  medicalInformation: MedicalInformation;
  medications: string[];
  authorizedPeople: AuthorizedPerson[];
  legalStatus: LegalStatus;
  pendingCharges?: PendingCharge[];
  convictions?: Conviction[];
  signatures: Signature[];
  insurances: Insurance[];
  mentalHealth: MentalHealth;
  drugHistory?: DrugHistoryEntry[];
  recoveryResidences: RecoveryResidenceEntry[];
  hasResidenceHistory: 'yes' | 'no';
  treatmentHistory?: TreatmentHistoryEntry[];
  hasTreatmentHistory?: 'yes' | 'no';
  incarcerationHistory?: IncarcerationHistoryEntry[];
  hasIncarcerationHistory?: 'yes' | 'no';
  probationHistory?: ProbationHistoryEntry[];
  drugTestResults?: DrugTestResults;
}

// Event Handler Types
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

export type SelectChangeHandler = (
  name: string, 
  value: string | boolean | string[] | PendingCharge[] | Conviction[] | Signature[] |
   Insurance[]| MentalHealthEntry[] | DrugHistoryEntry[] | RecoveryResidenceEntry[] | 
   TreatmentHistoryEntry[] | IncarcerationHistoryEntry[] | ProbationHistoryEntry[] |
   DrugTestResults
) => void;

export type VehicleToggleHandler = (hasVehicle: boolean) => void;

export type HealthStatusChangeHandler = (updates: Partial<HealthStatus>) => void;

export type AuthorizedPeopleChangeHandler = (people: AuthorizedPerson[]) => void;

// Component Props Types
export interface OnboardingPageProps {
  formData: FormData;
  handleInputChange: InputChangeHandler;
  handleSelectChange: SelectChangeHandler;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export interface OnboardingPage2Props extends OnboardingPageProps {
  handleVehicleToggle: VehicleToggleHandler;
  handleHealthStatusChange: HealthStatusChangeHandler;
}

export interface OnboardingPage6Props {
  formData: FormData;
  isOnMAT: boolean;
  handleInputChange: InputChangeHandler;
  handleSelectChange: SelectChangeHandler;
}

export interface OnboardingPage7Props extends OnboardingPageProps {
  handleAuthorizedPeopleChange: AuthorizedPeopleChangeHandler;
}

// Required Fields (based on database NOT NULL constraints)
export const requiredFields: (keyof FormData)[] = [
  // Personal Information
  'firstName',
  'lastName',
  'intakeDate',
  'housingLocation',
  'dateOfBirth',
  'socialSecurityNumber',
  'sex',
  'email',
  
  // Required Related Objects
  'healthStatus',
  'emergencyContact',
  'medicalInformation',
  'legalStatus',
  'signatures'
];

// Required nested fields
export const requiredHealthStatusFields: (keyof HealthStatus)[] = [
  'race',
  'ethnicity',
  'householdIncome',
  'employmentStatus'
];

export const requiredEmergencyContactFields: (keyof EmergencyContact)[] = [
  'firstName',
  'lastName',
  'phone',
  'relationship'
];

export const requiredSignatureFields: (keyof Signature)[] = [
  'signatureType',
  'signature',
  'signatureTimestamp',
  'signatureId'
];