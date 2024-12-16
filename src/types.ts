// API Types
export interface ApiResponse {
    success: boolean;
    message: string;
    error?: string;
    data?: any;
  }
  
  // Personal Information Types
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
  }
  
  // Vehicle Information Types
  export interface VehicleInformation {
    vehicleTagNumber: string;
    vehicleMake: string;
    vehicleModel: string;
  }
  
  // Insurance Information Types
  export interface InsuranceInformation {
    insured: boolean | null;
    insuranceType: string | null;
    policyNumber: string | null;
  }
  
  // Emergency Contact Types
  export interface EmergencyContact {
    emergencyContactFirstName: string;
    emergencyContactLastName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    otherRelationship: string;
  }
  
  // Medical Information Types
  export interface MedicalInformation {
    dualDiagnosis: boolean | null;
    mat: boolean | null;
    matMedication: string | null;
    matMedicationOther: string;
    needPsychMedication: boolean | null;
    medications: string[];
  }
  
  // Legal Information Types
  export interface LegalInformation {
    hasProbationOrPretrial: boolean | null;
    jurisdiction: string | null;
    otherJurisdiction: string;
  }
  
  // Signature Types
  export interface BaseSignature {
    signature: string;
    timestamp: string;
    witnessSignature: string;
    witnessTimestamp: string;
    signatureId: string;
  }
  
  export interface ConsentSignature extends BaseSignature {
    consentAgreed: boolean;
  }
  
  export interface TreatmentSignature extends BaseSignature {
    treatmentAgreed: boolean;
  }
  
  export interface PriceConsentSignature extends BaseSignature {
    priceConsentAgreed: boolean;
  }
  
  export interface MedicationSignature {
    medicationSignature: string;
    medicationSignatureDate: string;
    medicationWitnessSignature: string;
    medicationWitnessTimestamp: string;
    medicationSignatureId: string;
  }
  
  // Authorized Person Types
  export interface AuthorizedPerson {
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
  }
  
  // Health Status Types
  export interface HealthConditions {
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
  }
  
  export interface HealthDemographics {
    race: string;
    ethnicity: string;
    householdIncome: string;
    employmentStatus: string;
  }
  
  export interface HealthStatus extends HealthConditions, HealthDemographics {
    others: string[];
    [key: string]: boolean | string[] | string | undefined;
  }
  
  // Main Form Data Type
  export interface FormData extends 
    PersonalInformation,
    VehicleInformation,
    InsuranceInformation,
    EmergencyContact,
    MedicalInformation,
    LegalInformation {
    
    // Signatures
    consentSignature: string;
    consentAgreed: boolean;
    consentTimestamp: string;
    witnessSignature: string;
    witnessTimestamp: string;
    signatureId: string;
    
    // Medication Signature
    medicationSignature: string;
    medicationSignatureDate: string;
    medicationWitnessSignature: string;
    medicationWitnessTimestamp: string;
    medicationSignatureId: string;
    
    // Authorized People
    authorizedPeople: AuthorizedPerson[];
    
    // Treatment Consent
    treatmentSignature: string;
    treatmentAgreed: boolean;
    treatmentTimestamp: string;
    treatmentwitnessSignature: string;
    treatmentwitnessTimestamp: string;
    treatmentsignatureId: string;
    
    // Price Consent
    priceConsentSignature: string;
    priceConsentAgreed: boolean;
    priceConsentTimestamp: string;
    priceWitnessSignature: string;
    priceWitnessTimestamp: string;
    priceSignatureId: string;
  
    // Health Status
    healthStatus: HealthStatus;
  }
  
  // Event Handler Types
  export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
  export type SelectChangeHandler = (name: string, value: string | boolean | string[] | null) => void;
  export type VehicleToggleHandler = (hasNoVehicle: boolean) => void;
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
    isOnMAT: boolean | null;
    handleInputChange: InputChangeHandler;
    handleSelectChange: SelectChangeHandler;
  }
  
  export interface OnboardingPage7Props extends OnboardingPageProps {
    handleAuthorizedPeopleChange: AuthorizedPeopleChangeHandler;
  }
  
  // Required Fields
  export const requiredFields: (keyof FormData)[] = [
    'firstName',
    'lastName',
    'intakeDate',
    'housingLocation',
    'dateOfBirth',
    'socialSecurityNumber',
    'sex',
    'email',
    'driversLicenseNumber',
    'insured',
    'insuranceType',
    'policyNumber',
    'emergencyContactFirstName',
    'emergencyContactLastName',
    'emergencyContactPhone',
    'emergencyContactRelationship',
    'dualDiagnosis',
    'mat',
    'matMedication',
    'needPsychMedication',
    'hasProbationOrPretrial',
    'jurisdiction',
    'consentSignature',
    'consentAgreed',
    'consentTimestamp',
    'witnessSignature',
    'witnessTimestamp',
    'signatureId',
    'medicationSignature',
    'medicationSignatureDate',
    'medicationWitnessSignature',
    'medicationWitnessTimestamp',
    'medicationSignatureId',
    'priceConsentSignature',
    'priceConsentAgreed',
    'priceConsentTimestamp',
    'priceWitnessSignature',
    'priceWitnessTimestamp',
    'priceSignatureId'
  ];