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

interface FormData {
  firstName: string;
  lastName: string;
  intakeDate: string;
  housingLocation: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  sex: string;
  email: string;
  driversLicenseNumber: string;
  vehicleTagNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  insured: string;
  insuranceType: string;
  policyNumber: string;
  emergencyContactFirstName: string;
  emergencyContactLastName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  otherRelationship: string;
  dualDiagnosis: string;
  mat: boolean;
  matMedication: string;
  matMedicationOther: string;
  needPsychMedication: string;
  hasProbationOrPretrial: string;
  jurisdiction: string;
  otherJurisdiction: string;
  consentSignature: string;
  consentAgreed: boolean;
  consentTimestamp: string;
  witnessSignature: string;
  witnessTimestamp: string;
  signatureId: string;
  medications: string[];
  medicationSignature: string;
  medicationSignatureDate: string;
  medicationWitnessSignature: string;
  medicationWitnessTimestamp: string;
  medicationSignatureId: string;
  authorizedPeople: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
  }>;
  treatmentSignature?: string;
  treatmentAgreed?: boolean;
  treatmentTimestamp?: string;
  treatmentwitnessSignature?: string;
  treatmentwitnessTimestamp?: string;
  treatmentsignatureId?: string;
  priceConsentSignature?: string;
  priceConsentAgreed?: boolean;
  priceConsentTimestamp?: string;
  priceWitnessSignature?: string;
  priceWitnessTimestamp?: string;
  priceSignatureId?: string;
}

// Required fields array
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
  'vehicleTagNumber',
  'vehicleMake',
  'vehicleModel',
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

export default function OnboardingForm() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    intakeDate: new Date().toISOString().split('T')[0],
    housingLocation: "",
    dateOfBirth: "",
    socialSecurityNumber: "",
    sex: "",
    email: "",
    driversLicenseNumber: "",
    vehicleTagNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    insured: "",
    insuranceType: "",
    policyNumber: "",
    emergencyContactFirstName: "",
    emergencyContactLastName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    otherRelationship: "",
    dualDiagnosis: "",
    mat: false,
    matMedication: "",
    matMedicationOther: "",
    needPsychMedication: "",
    hasProbationOrPretrial: "",
    jurisdiction: "",
    otherJurisdiction: "",
    consentSignature: "",
    consentAgreed: false,
    consentTimestamp: "",
    witnessSignature: "",
    witnessTimestamp: "",
    signatureId: "",
    medications: [],
    medicationSignature: "",
    medicationSignatureDate: "",
    medicationWitnessSignature: "",
    medicationWitnessTimestamp: "",
    medicationSignatureId: "",
    authorizedPeople: [{
      firstName: '',
      lastName: '',
      relationship: '',
      phone: ''
    }],
    treatmentSignature: '',
    treatmentAgreed: false,
    treatmentTimestamp: '',
    treatmentwitnessSignature: '',
    treatmentwitnessTimestamp: '',
    treatmentsignatureId: '',
    priceConsentSignature: '',
    priceConsentAgreed: false,
    priceConsentTimestamp: '',
    priceWitnessSignature: '',
    priceWitnessTimestamp: '',
    priceSignatureId: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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

    // Log form data being sent
    console.log('Submitting form data:', JSON.stringify(formData, null, 2));

    try {
      // Validate required fields using type-safe approach
      const missingFields = requiredFields.reduce((acc: string[], field) => {
        if (field in formData && !formData[field as keyof FormData]) {
          acc.push(field);
        }
        return acc;
      }, []);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate authorized people
      if (formData.authorizedPeople.length === 0 || 
          formData.authorizedPeople.some(person => 
            !person.firstName || 
            !person.lastName || 
            !person.relationship || 
            !person.phone
          )) {
        throw new Error('All authorized people must have complete information');
      }

      const response = await fetch('https://hssu7ggkl4.execute-api.us-east-1.amazonaws.com/default/onboarding-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(formData),
      });

      // Log the raw response
      console.log('Raw response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Get response text first
      const responseText = await response.text();
      console.log('Response text:', responseText);

      // Try to parse the response as JSON
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText) as ApiResponse;
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      // Log the parsed response
      console.log('Parsed response data:', data);

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

      console.log('Form submitted successfully:', data);
      router.push('/success');
    } catch (error) {
      console.error('Form submission error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

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
        return <OnboardingPage2 {...basicProps} />;
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
        <div 
          className="cursor-pointer"
          onClick={() => setShowDialog(true)}
        >
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