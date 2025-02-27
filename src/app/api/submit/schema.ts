import { z } from 'zod'

// Define sub-schemas for cleaner organization
const AuthorizedPersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(10, 'Valid phone number is required')
})

const VehicleSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  tagNumber: z.string().optional(),
  insured: z.boolean().optional(),
  insuranceType: z.string().optional(),
  policyNumber: z.string().optional()
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
  race: z.string().min(1, 'Race is required'),
  ethnicity: z.string().min(1, 'Ethnicity is required'),
  householdIncome: z.string().min(1, 'Household income is required'),
  employmentStatus: z.string().min(1, 'Employment status is required')
})

const MedicalInformationSchema = z.object({
  dualDiagnosis: z.boolean(),
  mat: z.boolean(),
  matMedication: z.string().optional(),
  matMedicationOther: z.string().optional(),
  needPsychMedication: z.boolean()
})

const LegalStatusSchema = z.object({
  hasProbationPretrial: z.boolean(),
  jurisdiction: z.string().optional(),
  otherJurisdiction: z.string().optional(),
  hasPendingCharges: z.boolean(),
  hasConvictions: z.boolean(),
  isWanted: z.boolean(),
  isOnBond: z.boolean(),
  bondsmanName: z.string().optional(),
  isSexOffender: z.boolean()
})

const SignatureSchema = z.object({
  signatureType: z.enum([
    'emergency',
    'medication',
    'disclosure',
    'treatment',
    'price_consent',
    'tenant_rights',
    'contract_terms',
    'criminal_history',
    'ethics',
    'critical_rules',
    'house_rules',
    'asam_assessment'
  ]),
  signature: z.string(),
  signatureTimestamp: z.string().transform(str => new Date(str)),
  signatureId: z.string(),
  witnessSignature: z.string().optional(),
  witnessTimestamp: z.string().optional().transform(str => str ? new Date(str) : null),
  witnessSignatureId: z.string().optional(),
  agreed: z.boolean().optional()
})

export const OnboardingSchema = z.object({
  // Base resident information
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
  driversLicenseNumber: z.string().min(1, 'Driver\'s license number is required'),
  phoneNumber: z.string().optional(),

  // Health Status
  healthStatus: HealthStatusSchema,

  // Vehicle Information
  vehicle: VehicleSchema.optional(),

  // Emergency Contact
  emergencyContact: z.object({
    firstName: z.string().min(1, 'Emergency contact first name is required'),
    lastName: z.string().min(1, 'Emergency contact last name is required'),
    phone: z.string().min(10, 'Valid emergency contact phone is required'),
    relationship: z.string().min(1, 'Emergency contact relationship is required'),
    otherRelationship: z.string().optional()
  }),

  // Medical Information
  medicalInformation: MedicalInformationSchema,
  medications: z.array(z.string()),

  // Authorized People
  authorizedPeople: z.array(AuthorizedPersonSchema),

  // Legal Status
  legalStatus: LegalStatusSchema,
  pendingCharges: z.array(z.object({
    chargeDescription: z.string(),
    location: z.string().optional()
  })).optional(),
  convictions: z.array(z.object({
    offense: z.string()
  })).optional(),

  // Signatures
  signatures: z.array(SignatureSchema)
})

// Export the type we can use in our components
export type OnboardingData = z.infer<typeof OnboardingSchema>