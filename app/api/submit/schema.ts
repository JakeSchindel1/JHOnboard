// app/api/submit/schema.ts
import { z } from 'zod'

// Define sub-schemas for cleaner organization
const AuthorizedPersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(10, 'Valid phone number is required')
})

export const OnboardingSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  intakeDate: z.string().min(1, 'Intake date is required'),
  housingLocation: z.string().min(1, 'Housing location is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  socialSecurityNumber: z.string().min(1, 'SSN is required'),
  sex: z.string().min(1, 'Sex is required'),
  email: z.string().email('Valid email is required'),
  
  // Vehicle Information
  driversLicenseNumber: z.string(),
  vehicleTagNumber: z.string(),
  vehicleMake: z.string(),
  vehicleModel: z.string(),
  insured: z.string(),
  insuranceType: z.string(),
  policyNumber: z.string(),
  
  // Emergency Contact
  emergencyContactFirstName: z.string().min(1, 'Emergency contact first name is required'),
  emergencyContactLastName: z.string().min(1, 'Emergency contact last name is required'),
  emergencyContactPhone: z.string().min(10, 'Valid emergency contact phone is required'),
  emergencyContactRelationship: z.string().min(1, 'Emergency contact relationship is required'),
  otherRelationship: z.string().optional(),
  
  // Medical Information
  dualDiagnosis: z.string(),
  mat: z.boolean(),
  matMedication: z.string(),
  matMedicationOther: z.string().optional(),
  needPsychMedication: z.string(),
  medications: z.array(z.string()),
  
  // Legal Information
  hasProbationOrPretrial: z.string(),
  jurisdiction: z.string(),
  otherJurisdiction: z.string().optional(),
  
  // Consent Forms
  consentSignature: z.string().min(1, 'Consent signature is required'),
  consentAgreed: z.boolean(),
  consentTimestamp: z.string(),
  witnessSignature: z.string(),
  witnessTimestamp: z.string(),
  signatureId: z.string(),
  
  // Medication Forms
  medicationSignature: z.string(),
  medicationSignatureDate: z.string(),
  medicationWitnessSignature: z.string(),
  medicationWitnessTimestamp: z.string(),
  medicationSignatureId: z.string(),
  
  // Authorized People
  authorizedPeople: z.array(AuthorizedPersonSchema),
  
  // Treatment Information
  treatmentSignature: z.string().optional(),
  treatmentAgreed: z.boolean().optional(),
  treatmentTimestamp: z.string().optional(),
  treatmentwitnessSignature: z.string().optional(),
  treatmentwitnessTimestamp: z.string().optional(),
  treatmentsignatureId: z.string().optional(),
  
  // Price Consent
  priceConsentSignature: z.string().optional(),
  priceConsentAgreed: z.boolean().optional(),
  priceConsentTimestamp: z.string().optional(),
  priceWitnessSignature: z.string().optional(),
  priceWitnessTimestamp: z.string().optional(),
  priceSignatureId: z.string().optional()
})

export type OnboardingData = z.infer<typeof OnboardingSchema>