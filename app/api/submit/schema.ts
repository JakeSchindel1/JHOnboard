import { z } from 'zod'

// Define sub-schemas for cleaner organization
const AuthorizedPersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(10, 'Valid phone number is required')
})

const HealthStatusSchema = z.object({
  pregnant: z.boolean().optional().default(false),
  developmentallyDisabled: z.boolean().optional().default(false),
  coOccurringDisorder: z.boolean().optional().default(false),
  docSupervision: z.boolean().optional().default(false),
  felon: z.boolean().optional().default(false),
  physicallyHandicapped: z.boolean().optional().default(false),
  postPartum: z.boolean().optional().default(false),
  primaryFemaleCaregiver: z.boolean().optional().default(false),
  recentlyIncarcerated: z.boolean().optional().default(false),
  sexOffender: z.boolean().optional().default(false),
  lgbtq: z.boolean().optional().default(false),
  veteran: z.boolean().optional().default(false),
  insulinDependent: z.boolean().optional().default(false),
  historyOfSeizures: z.boolean().optional().default(false),
  others: z.array(z.string()).optional().default([])
});

export const OnboardingSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  intakeDate: z.string().min(1, 'Intake date is required')
    .transform(str => new Date(str)),
  housingLocation: z.string().min(1, 'Housing location is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required')
    .transform(str => new Date(str)),
  socialSecurityNumber: z.string().min(1, 'SSN is required'),
  sex: z.string().min(1, 'Sex is required'),
  email: z.string().email('Valid email is required'),
  
  // Vehicle Information
  driversLicenseNumber: z.string().optional().default(''),
  vehicleTagNumber: z.string().optional().default(''),
  vehicleMake: z.string().optional().default(''),
  vehicleModel: z.string().optional().default(''),
  insured: z.boolean(),
  insuranceType: z.string().optional().default(''),
  policyNumber: z.string().optional().default(''),
  
  // Emergency Contact
  emergencyContactFirstName: z.string().min(1, 'Emergency contact first name is required'),
  emergencyContactLastName: z.string().min(1, 'Emergency contact last name is required'),
  emergencyContactPhone: z.string().min(10, 'Valid emergency contact phone is required'),
  emergencyContactRelationship: z.string().min(1, 'Emergency contact relationship is required'),
  otherRelationship: z.string().optional().default(''),
  
  // Medical Information
  dualDiagnosis: z.boolean(),
  mat: z.boolean(),
  matMedication: z.string().optional().default(''),
  matMedicationOther: z.string().optional().default(''),
  needPsychMedication: z.boolean(),
  medications: z.array(z.string()).default([]),
  
  // Health Status
  healthStatus: HealthStatusSchema.default({}),

  // Legal Information
  hasProbationOrPretrial: z.boolean(),
  jurisdiction: z.string().optional().default(''),
  otherJurisdiction: z.string().optional().default(''),
  
  // Consent Forms
  consentSignature: z.string().min(1, 'Consent signature is required'),
  consentAgreed: z.boolean(),
  consentTimestamp: z.string()
    .transform(str => new Date(str)),
  witnessSignature: z.string(),
  witnessTimestamp: z.string()
    .transform(str => new Date(str)),
  signatureId: z.string(),
  
  // Medication Forms
  medicationSignature: z.string(),
  medicationSignatureDate: z.string()
    .transform(str => new Date(str)),
  medicationWitnessSignature: z.string(),
  medicationWitnessTimestamp: z.string()
    .transform(str => new Date(str)),
  medicationSignatureId: z.string(),
  
  // Authorized People
  authorizedPeople: z.array(AuthorizedPersonSchema).default([]),
  
  // Treatment Information
  treatmentSignature: z.string().optional().default(''),
  treatmentAgreed: z.boolean().optional().default(false),
  treatmentTimestamp: z.string().optional()
    .transform(str => str ? new Date(str) : null),
  treatmentwitnessSignature: z.string().optional().default(''),
  treatmentwitnessTimestamp: z.string().optional()
    .transform(str => str ? new Date(str) : null),
  treatmentsignatureId: z.string().optional().default(''),
  
  // Price Consent
  priceConsentSignature: z.string().optional().default(''),
  priceConsentAgreed: z.boolean().optional().default(false),
  priceConsentTimestamp: z.string().optional()
    .transform(str => str ? new Date(str) : null),
  priceWitnessSignature: z.string().optional().default(''),
  priceWitnessTimestamp: z.string().optional()
    .transform(str => str ? new Date(str) : null),
  priceSignatureId: z.string().optional().default('')
})

// Export the type we can use in our components
export type OnboardingData = z.infer<typeof OnboardingSchema>