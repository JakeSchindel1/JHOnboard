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
  mat: string;
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
}

export default function OnboardingForm() {
  const [currentPage, setCurrentPage] = useState(1);
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
    mat: "",
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
    }]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
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
    
    if (currentPage < 7) {
      setCurrentPage(prev => prev + 1);
      return;
    }
    
    // Validate signatures
    if (currentPage === 5 && (!formData.consentSignature || !formData.witnessSignature)) {
      return;
    }

    // Validate medication page
    if (currentPage === 6 && !formData.medicationSignature) {
      return;
    }

    // Validate disclosure page
    if (currentPage === 7 && (
      formData.authorizedPeople.length === 0 || 
      formData.authorizedPeople.some(person => 
        !person.firstName || !person.lastName || !person.relationship || !person.phone
      )
    )) {
      return;
    }
    
    try {
      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData);
      // await submitFormData(formData);
      // Handle successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error
    }
  };

  const renderPageContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      handleSelectChange,
      handleAuthorizedPeopleChange,
      setCurrentPage
    };

    switch (currentPage) {
      case 1:
        return <OnboardingPage1 {...commonProps} />;
      case 2:
        return <OnboardingPage2 {...commonProps} />;
      case 3:
        return <OnboardingPage3 {...commonProps} />;
      case 4:
        return <OnboardingPage4 {...commonProps} />;
      case 5:
        return <OnboardingPage5 {...commonProps} />;
      case 6:
        return <OnboardingPage6 {...commonProps} />;
      case 7:
        return <OnboardingPage7 {...commonProps} />;
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
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-center mb-6">
        <Image
          src="/images/JourneyHouseLogo.png" 
          alt="Company Logo"
          width={200}
          height={80}
          priority
          className="h-auto w-auto max-w-[200px]"
        />
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Onboarding Form</h1>
      <OnboardingProgress currentPage={currentPage} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderPageContent()}

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
              disabled={isSubmitDisabled()}
            >
              {currentPage === 7 ? "Submit" : "Next"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}