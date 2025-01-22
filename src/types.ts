// API Types
export interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
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
  driversLicenseNumber: string;
  insuranceType: string;
  policyNumber: string; 
}

export interface VehicleInformation {
  make?: string;
  model?: string;
  tagNumber?: string;
  insured: boolean;
  insuranceType?: string;
  policyNumber?: string;
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
  | 'house_rules';

export interface Signature {
  signatureType: SignatureType;
  signature: string;
  signatureTimestamp: string;
  signatureId: string;
  witnessSignature?: string;
  witnessTimestamp?: string;
  witnessSignatureId?: string;
  agreed?: boolean;
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
}

// Event Handler Types
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

export type SelectChangeHandler = (
  name: string, 
  value: string | boolean | string[] | PendingCharge[] | Conviction[] | Signature[]
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
  'driversLicenseNumber',
  
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