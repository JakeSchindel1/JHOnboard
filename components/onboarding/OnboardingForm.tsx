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

      const response = await fetch('https://zy0yj0cypj.execute-api.us-east-1.amazonaws.com/prod/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(standardizedFormData),
      });

      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText) as ApiResponse;
      } catch (parseError) {
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        throw new Error(
          data.error || 
          data.message || 
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      if (!data.success) {
        throw new Error(data.message || 'Form submission failed');
      }

      router.push('/success');
    } catch (error) {
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