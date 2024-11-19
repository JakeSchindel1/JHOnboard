"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import Image from 'next/image';
import OnboardingPage1 from '@/components/onboarding/OnboardingPage1';
import OnboardingPage2 from '@/components/onboarding/OnboardingPage2';
import OnboardingPage3 from '@/components/onboarding/OnboardingPage3';
import OnboardingPage4 from '@/components/onboarding/OnboardingPage4';
import OnboardingPage5 from '@/components/onboarding/OnboardingPage5';
import OnboardingPage6 from '@/components/onboarding/OnboardingPage6';
import OnboardingPage7 from '@/components/onboarding/OnboardingPage7';
import OnboardingPage8 from '@/components/onboarding/OnboardingPage8';
import OnboardingPage9 from '@/components/onboarding/OnboardingPage9';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

interface AuthorizedPerson {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  intakeDate: string;
  housingLocation: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  sex: string;
  email: string;
  driversLicenseNumber: string;
  
  // Vehicle Information
  vehicleTagNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  
  // Insurance Information
  insured: boolean | null;
  insuranceType: string | null;
  policyNumber: string | null;
  
  // Emergency Contact
  emergencyContactFirstName: string;
  emergencyContactLastName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  otherRelationship: string;
  
  // Medical Information
  dualDiagnosis: boolean | null;
  mat: boolean | null;
  matMedication: string | null;
  matMedicationOther: string;
  needPsychMedication: boolean | null;
  medications: string[];
  
  // Legal Information
  hasProbationOrPretrial: boolean | null;
  jurisdiction: string | null;
  otherJurisdiction: string;
  
  // Consent and Signatures
  consentSignature: string;
  consentAgreed: boolean;
  consentTimestamp: string;
  witnessSignature: string;
  witnessTimestamp: string;
  signatureId: string;
  
  // Medications
  medicationSignature: string;
  medicationSignatureDate: string;
  medicationWitnessSignature: string;
  medicationWitnessTimestamp: string;
  medicationSignatureId: string;
  
  // Authorized People
  authorizedPeople: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
  }>;
  
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
}

const requiredFields = [
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

// Add standardization function
const standardizeValue = (value: any): any => {
  // Handle arrays (for medications and authorizedPeople)
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const standardized = value.filter(item => 
      item && item !== 'none' && item !== 'null' && item !== ''
    );
    return standardized.length ? standardized : null;
  }

  // Handle objects (for authorizedPeople entries)
  if (value && typeof value === 'object') {
    const standardized = Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, v === '' ? null : v])
    );
    return Object.values(standardized).every(v => v === null) ? null : standardized;
  }

  // Handle empty/special values
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    value === 'null' ||
    value === 'none' ||
    value === 'undefined'
  ) {
    return null;
  }

  // Handle boolean strings
  if (value === 'true') return true;
  if (value === 'false') return false;

  return value;
};

export default function OnboardingForm() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    firstName: "",
    lastName: "",
    intakeDate: new Date().toISOString().split('T')[0],
    housingLocation: "",
    dateOfBirth: "",
    socialSecurityNumber: "",
    sex: "",
    email: "",
    driversLicenseNumber: "",
    
    // Vehicle Information
    vehicleTagNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    
    // Insurance Information
    insured: null,
    insuranceType: null,
    policyNumber: null,
    
    // Emergency Contact
    emergencyContactFirstName: "",
    emergencyContactLastName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    otherRelationship: "",
    
    // Medical Information
    dualDiagnosis: null,
    mat: null,
    matMedication: null,
    matMedicationOther: "",
    needPsychMedication: null,
    medications: [],
    
    // Legal Information
    hasProbationOrPretrial: null,
    jurisdiction: null,
    otherJurisdiction: "",
    
    // Consent and Signatures
    consentSignature: "",
    consentAgreed: false,
    consentTimestamp: "",
    witnessSignature: "",
    witnessTimestamp: "",
    signatureId: "",
    
    // Medications
    medicationSignature: "",
    medicationSignatureDate: "",
    medicationWitnessSignature: "",
    medicationWitnessTimestamp: "",
    medicationSignatureId: "",
    
    // Authorized People
    authorizedPeople: [{
      firstName: '',
      lastName: '',
      relationship: '',
      phone: ''
    }],
    
    // Treatment Consent
    treatmentSignature: '',
    treatmentAgreed: false,
    treatmentTimestamp: '',
    treatmentwitnessSignature: '',
    treatmentwitnessTimestamp: '',
    treatmentsignatureId: '',
    
    // Price Consent
    priceConsentSignature: '',
    priceConsentAgreed: false,
    priceConsentTimestamp: '',
    priceWitnessSignature: '',
    priceWitnessTimestamp: '',
    priceSignatureId: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.checked
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string | boolean | string[] | null) => {
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      
      // Handle dependent fields for probation/pretrial
      if (name === 'hasProbationOrPretrial' && !value) {
        newState.jurisdiction = null;
        newState.otherJurisdiction = '';
      }
      
      // Handle dependent fields for insurance
      if (name === 'insured' && !value) {
        newState.insuranceType = null;
        newState.policyNumber = null;
      }

      // Handle dependent fields for MAT
      if (name === 'mat' && !value) {
        newState.matMedication = null;
        newState.matMedicationOther = '';
      }
      
      return newState;
    });
  };

  const handleVehicleToggle = (hasNoVehicle: boolean) => {
    setFormData(prev => ({
      ...prev,
      vehicleMake: hasNoVehicle ? 'null' : '',
      vehicleModel: hasNoVehicle ? 'null' : '',
      vehicleTagNumber: hasNoVehicle ? 'null' : '',
    }));
  };

  const handleAuthorizedPeopleChange = (people: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
  }>) => {
    setFormData(prev => ({
      ...prev,
      authorizedPeople: people
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (currentPage < 9) {
      setCurrentPage(prev => prev + 1);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create the standardized form data with proper handling of null values
      const standardizedFormData = {
        ...formData,
        // Handle vehicle fields
        vehicleTagNumber: formData.vehicleTagNumber === 'null' ? '' : (formData.vehicleTagNumber || ''),
        vehicleMake: formData.vehicleMake === 'null' ? '' : (formData.vehicleMake || ''),
        vehicleModel: formData.vehicleModel === 'null' ? '' : (formData.vehicleModel || ''),
        
        // Handle insurance fields
        insuranceType: !formData.insured ? '' : (formData.insuranceType || ''),
        policyNumber: !formData.insured ? '' : (formData.policyNumber || ''),
        
        // Handle MAT medication
        matMedication: !formData.mat ? '' : (formData.matMedication || ''),
        
        // Handle medications array
        medications: formData.medications || [],
        
        // Handle jurisdiction
        jurisdiction: !formData.hasProbationOrPretrial ? '' : (formData.jurisdiction || ''),
        
        // Handle authorized people
        authorizedPeople: formData.authorizedPeople.filter(person => 
          person.firstName || person.lastName || person.relationship || person.phone
        )
      };

      console.log('Standardized Form Data:', JSON.stringify(standardizedFormData, null, 2));

      // Modified validation logic
      const missingFields = requiredFields.reduce((acc: string[], field) => {
        // Skip vehicle-related fields if they're marked as "null"
        if (['vehicleMake', 'vehicleModel', 'vehicleTagNumber'].includes(field) &&
            standardizedFormData[field as keyof FormData] === '') {
          return acc;
        }

        // Skip conditional fields based on parent values
        if (
          (field === 'insuranceType' || field === 'policyNumber') && !standardizedFormData.insured ||
          field === 'jurisdiction' && !standardizedFormData.hasProbationOrPretrial ||
          field === 'matMedication' && !standardizedFormData.mat
        ) {
          return acc;
        }
        
        const value = standardizedFormData[field as keyof FormData];
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          acc.push(field);
        }
        return acc;
      }, []);

      if (missingFields.length > 0) {
        console.log('Missing Fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (!standardizedFormData.authorizedPeople || 
          standardizedFormData.authorizedPeople.some((person: AuthorizedPerson) => 
            !person.firstName || 
            !person.lastName || 
            !person.relationship || 
            !person.phone
          )) {
        throw new Error('All authorized people must have complete information');
      }

      const submitData = async (standardizedFormData: FormData) => {
        try {
          console.log('Starting participant creation...');
          // Create participant first
          const participantResponse = await fetch('/data-api/Participants', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              first_name: standardizedFormData.firstName,
              last_name: standardizedFormData.lastName,
              intake_date: standardizedFormData.intakeDate,
              housing_location: standardizedFormData.housingLocation,
              date_of_birth: standardizedFormData.dateOfBirth,
              sex: standardizedFormData.sex,
              email: standardizedFormData.email,
              drivers_license_number: standardizedFormData.driversLicenseNumber,
            })
          });

          console.log('Participant Response:', await participantResponse.clone().json());
      
          if (!participantResponse.ok) {
            console.error('Participant creation failed:', await participantResponse.text());
            throw new Error('Failed to create participant');
          }
      
          const participant = await participantResponse.json();
          const participantId = participant.id;

          console.log('Created participant with ID:', participantId);
      
          // Create all related records in parallel
          const promises = [
            // Sensitive Info
            fetch('/data-api/ParticipantSensitiveInfo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                ssn_encrypted: standardizedFormData.socialSecurityNumber,
                encryption_iv: null
              })
            }).then(async res => {
              console.log('Sensitive Info Response:', await res.json());
              return res;
            }),
      
            // Vehicle
            standardizedFormData.vehicleTagNumber && fetch('/data-api/Vehicles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                tag_number: standardizedFormData.vehicleTagNumber,
                make: standardizedFormData.vehicleMake,
                model: standardizedFormData.vehicleModel
              })
            }).then(async res => {
              console.log('Vehicle Response:', await res.json());
              return res;
            }),
      
            // Insurance
            fetch('/data-api/Insurance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                is_insured: standardizedFormData.insured,
                insurance_type: standardizedFormData.insuranceType,
                policy_number: standardizedFormData.policyNumber
              })
            }).then(async res => {
              console.log('Insurance Response:', await res.json());
              return res;
            }),
      
            // Emergency Contact
            fetch('/data-api/EmergencyContacts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                first_name: standardizedFormData.emergencyContactFirstName,
                last_name: standardizedFormData.emergencyContactLastName,
                phone: standardizedFormData.emergencyContactPhone,
                relationship: standardizedFormData.emergencyContactRelationship,
                other_relationship: standardizedFormData.otherRelationship
              })
            }).then(async res => {
              console.log('Emergency Contact Response:', await res.json());
              return res;
            }),
      
            // Medical Info
            fetch('/data-api/MedicalInfo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                dual_diagnosis: standardizedFormData.dualDiagnosis,
                mat: standardizedFormData.mat,
                mat_medication: standardizedFormData.matMedication,
                mat_medication_other: standardizedFormData.matMedicationOther,
                need_psych_medication: standardizedFormData.needPsychMedication
              })
            }).then(async res => {
              console.log('Medical Info Response:', await res.json());
              return res;
            }),
      
            // Medications
            ...standardizedFormData.medications.map(med => 
              fetch('/data-api/Medications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  participant_id: participantId,
                  medication_name: med
                })
              }).then(async res => {
                console.log('Medication Response:', await res.json());
                return res;
              })
            ),
      
            // Legal Info
            fetch('/data-api/LegalInfo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                has_probation_or_pretrial: standardizedFormData.hasProbationOrPretrial,
                jurisdiction: standardizedFormData.jurisdiction,
                other_jurisdiction: standardizedFormData.otherJurisdiction
              })
            }).then(async res => {
              console.log('Legal Info Response:', await res.json());
              return res;
            }),
      
            // Authorized People
            ...standardizedFormData.authorizedPeople.map(person =>
              fetch('/data-api/AuthorizedPeople', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  participant_id: participantId,
                  first_name: person.firstName,
                  last_name: person.lastName,
                  relationship: person.relationship,
                  phone: person.phone
                })
              }).then(async res => {
                console.log('Authorized Person Response:', await res.json());
                return res;
              })
            ),
      
            // All Consents
            fetch('/data-api/Consents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                consent_signature: standardizedFormData.consentSignature,
                consent_agreed: standardizedFormData.consentAgreed,
                consent_timestamp: standardizedFormData.consentTimestamp,
                witness_signature: standardizedFormData.witnessSignature,
                witness_timestamp: standardizedFormData.witnessTimestamp,
                signature_id: standardizedFormData.signatureId
              })
            }).then(async res => {
              console.log('Consents Response:', await res.json());
              return res;
            }),
      
            fetch('/data-api/MedicationConsents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                medication_signature: standardizedFormData.medicationSignature,
                medication_signature_date: standardizedFormData.medicationSignatureDate,
                medication_witness_signature: standardizedFormData.medicationWitnessSignature,
                medication_witness_timestamp: standardizedFormData.medicationWitnessTimestamp,
                medication_signature_id: standardizedFormData.medicationSignatureId
              })
            }).then(async res => {
              console.log('Medication Consents Response:', await res.json());
              return res;
            }),
      
            fetch('/data-api/TreatmentConsents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                treatment_signature: standardizedFormData.treatmentSignature,
                treatment_agreed: standardizedFormData.treatmentAgreed,
                treatment_timestamp: standardizedFormData.treatmentTimestamp,
                treatment_witness_signature: standardizedFormData.treatmentwitnessSignature,
                treatment_witness_timestamp: standardizedFormData.treatmentwitnessTimestamp,
                treatment_signature_id: standardizedFormData.treatmentsignatureId
              })
            }).then(async res => {
              console.log('Treatment Consents Response:', await res.json());
              return res;
            }),
      
            fetch('/data-api/PriceConsents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                price_consent_signature: standardizedFormData.priceConsentSignature,
                price_consent_agreed: standardizedFormData.priceConsentAgreed,
                price_consent_timestamp: standardizedFormData.priceConsentTimestamp,
                price_witness_signature: standardizedFormData.priceWitnessSignature,
                price_witness_timestamp: standardizedFormData.priceWitnessTimestamp,
                price_signature_id: standardizedFormData.priceSignatureId
              })
            }).then(async res => {
              console.log('Price Consents Response:', await res.json());
              return res;
            })
          ];

          await Promise.all(promises.filter(Boolean));
          console.log('All submissions complete');
      
          return {
            success: true,
            message: 'Form submitted successfully',
            data: { participantId }
          };
      
        } catch (error: unknown) {
          console.error('Submission error:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
          });
          throw error;
        }
      };

      const result = await submitData(standardizedFormData);
      
      if (!result.success) {
        throw new Error(result.message || 'Form submission failed');
      }
      
      router.push('/success');
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while submitting the form. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPageContent = () => {
    const basicProps = {
      formData,
      handleInputChange,
      handleSelectChange,
      setCurrentPage,
    };

    switch (currentPage) {
      case 1:
        return <OnboardingPage1 {...basicProps} />;
      case 2:
        return <OnboardingPage2 
          {...basicProps} 
          handleVehicleToggle={handleVehicleToggle}
        />;
      case 3:
        return <OnboardingPage3 {...basicProps} />;
      case 4:
        return <OnboardingPage4 {...basicProps} />;
      case 5:
        return <OnboardingPage5 {...basicProps} />;
      case 6:
        return <OnboardingPage6 
          formData={formData}
          isOnMAT={formData.mat}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
        />;
      case 7:
        return <OnboardingPage7 
          {...basicProps} 
          handleAuthorizedPeopleChange={handleAuthorizedPeopleChange}
        />;
      case 8:
        return <OnboardingPage8 {...basicProps} />;
      case 9:
        return <OnboardingPage9 {...basicProps} />;
      default:
        return null;
    }
  };

  const isSubmitDisabled = () => {
    if (currentPage === 5) {
      return !formData.consentSignature || !formData.witnessSignature;
    }
    if (currentPage === 6) {
      return !formData.medicationSignature;
    }
    if (currentPage === 7) {
      return formData.authorizedPeople.length === 0 || 
        formData.authorizedPeople.some(person => 
          !person.firstName || !person.lastName || !person.relationship || !person.phone
        );
    }
    if (currentPage === 9) {
      return !formData.priceConsentSignature || !formData.priceWitnessSignature;
    }
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-center mb-6">
        <div className="cursor-pointer" onClick={() => setShowDialog(true)}>
          <Image
            src="/images/JourneyHouseLogo.png" 
            alt="Company Logo"
            width={200}
            height={80}
            priority
            className="h-auto w-auto max-w-[200px] hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Onboarding Form</h1>
      <OnboardingProgress currentPage={currentPage} totalPages={9} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderPageContent()}

        {isSubmitting && (
          <div className="p-4 mb-4 text-blue-700 bg-blue-100 rounded-lg">
            Submitting form, please wait...
          </div>
        )}

        {submitError && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            {submitError}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {currentPage > 1 && (
            <Button 
              type="button" 
              onClick={() => setCurrentPage(prev => prev - 1)}
              variant="outline"
            >
              Back
            </Button>
          )}
          <div className={currentPage === 1 ? 'ml-auto' : ''}>
            <Button 
              type="submit"
              disabled={isSubmitDisabled() || isSubmitting}
            >
              {currentPage === 9 ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
            </Button>
          </div>
        </div>
      </form>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Return to Home Page?</DialogTitle>
            <DialogDescription>
              Are you sure you want to return to the home page? Any unsaved progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => router.push('/')}>
              Yes, return home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}