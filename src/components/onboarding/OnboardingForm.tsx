"use client"

import React, { useState, useEffect } from 'react';
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
import OnboardingPage10 from '@/components/onboarding/OnboardingPage10';
import OnboardingPage11 from '@/components/onboarding/OnboardingPage11';
import OnboardingPage12 from '@/components/onboarding/OnboardingPage12';
import OnboardingPage13 from '@/components/onboarding/OnboardingPage13';
import OnboardingPage14 from '@/components/onboarding/OnboardingPage14';
import OnboardingPage15 from '@/components/onboarding/OnboardingPage15';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { DataApiTransformer } from '@/lib/transformers/dataApiTransformer';
import {
  FormData,
  InputChangeHandler,
  SelectChangeHandler,
  VehicleToggleHandler,
  HealthStatusChangeHandler,
  AuthorizedPeopleChangeHandler,
  requiredFields,
  requiredHealthStatusFields,
  requiredEmergencyContactFields,
  SignatureType
} from '@/types';

const initialFormState: FormData = {
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
  insuranceType: "",
  policyNumber: '',

  // Health Status
  healthStatus: {
    pregnant: false,
    developmentallyDisabled: false,
    coOccurringDisorder: false,
    docSupervision: false,
    felon: false,
    physicallyHandicapped: false,
    postPartum: false,
    primaryFemaleCaregiver: false,
    recentlyIncarcerated: false,
    sexOffender: false,
    lgbtq: false,
    veteran: false,
    insulinDependent: false,
    historyOfSeizures: false,
    race: "",
    ethnicity: "",
    householdIncome: "",
    employmentStatus: ""
  },

  // Optional Vehicle Information
  vehicle: {
    make: "",
    model: "",
    tagNumber: "",
    insured: false,
    insuranceType: "",
    policyNumber: ""
  },

  // Emergency Contact
  emergencyContact: {
    firstName: "",
    lastName: "",
    phone: "",
    relationship: "",
    otherRelationship: ""
  },

  // Medical Information
  medicalInformation: {
    dualDiagnosis: false,
    mat: false,
    matMedication: "",
    matMedicationOther: "",
    needPsychMedication: false
  },
  medications: [],

  // Legal Status
  legalStatus: {
    hasProbationPretrial: false,
    jurisdiction: "",
    otherJurisdiction: "",
    hasPendingCharges: false,
    hasConvictions: false,
    isWanted: false,
    isOnBond: false,
    bondsmanName: "",
    isSexOffender: false
  },

  // Optional Arrays
  pendingCharges: [{ chargeDescription: "", location: "" }],
  convictions: [{ offense: "" }],
  authorizedPeople: [{
    firstName: "",
    lastName: "",
    relationship: "",
    phone: ""
  }],

  // Signatures Array
  signatures: []
};

export default function OnboardingForm() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programInfoReviewed, setProgramInfoReviewed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleInputChange: InputChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData(prev => {
        const parent = prev[parentKey as keyof FormData];
        // Ensure parent exists and is an object
        if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
          return {
            ...prev,
            [parentKey]: {
              ...parent,
              [childKey]: type === 'checkbox' ? checked : value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSelectChange: SelectChangeHandler = (name, value) => {
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData(prev => {
        const parent = prev[parentKey as keyof FormData];
        if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
          return {
            ...prev,
            [parentKey]: {
              ...parent,
              [childKey]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => {
        const newState = { ...prev, [name]: value };
        
        // Handle dependent fields
        if (name === 'legalStatus.hasProbationPretrial' && !value) {
          if (typeof newState.legalStatus === 'object' && newState.legalStatus) {
            newState.legalStatus = {
              ...newState.legalStatus,
              jurisdiction: "",
              otherJurisdiction: ""
            };
          }
        }
        
        if (name === 'vehicle.insured' && !value) {
          if (newState.vehicle && typeof newState.vehicle === 'object') {
            newState.vehicle = {
              ...newState.vehicle,
              insuranceType: "",
              policyNumber: ""
            };
          }
        }
        
        if (name === 'medicalInformation.mat' && !value) {
          if (typeof newState.medicalInformation === 'object' && newState.medicalInformation) {
            newState.medicalInformation = {
              ...newState.medicalInformation,
              matMedication: "",
              matMedicationOther: ""
            };
          }
        }
        
        return newState;
      });
    }
  };

  const handleVehicleToggle: VehicleToggleHandler = (hasVehicle) => {
    if (!hasVehicle) {
      setFormData(prev => ({ ...prev, vehicle: undefined }));
    } else {
      setFormData(prev => ({
        ...prev,
        vehicle: {
          make: "",
          model: "",
          tagNumber: "",
          insured: false,
          insuranceType: "",
          policyNumber: ""
        }
      }));
    }
  };

  const handleHealthStatusChange: HealthStatusChangeHandler = (updates) => {
    setFormData(prev => ({
      ...prev,
      healthStatus: {
        ...prev.healthStatus,
        ...updates
      }
    }));
  };

  const handleAuthorizedPeopleChange: AuthorizedPeopleChangeHandler = (people) => {
    setFormData(prev => ({
      ...prev,
      authorizedPeople: people
    }));
  };

  const addSignature = (
    type: SignatureType,
    signature: string,
    timestamp: string,
    signatureId: string,
    witnessSignature?: string,
    witnessTimestamp?: string,
    witnessSignatureId?: string,
    agreed?: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      signatures: [
        ...prev.signatures,
        {
          signatureType: type,
          signature,
          signatureTimestamp: timestamp,
          signatureId,
          witnessSignature,
          witnessTimestamp,
          witnessSignatureId,
          agreed
        }
      ]
    }));
  };

  const validateFormData = (data: FormData): string[] => {
    const errors: string[] = [];

    // Check required fields
    requiredFields.forEach(field => {
      const value = data[field];
      if (!value) {
        errors.push(field);
      }
    });

    // Check required health status fields
    requiredHealthStatusFields.forEach(field => {
      if (!data.healthStatus[field]) {
        errors.push(`healthStatus.${field}`);
      }
    });

    // Check required emergency contact fields
    requiredEmergencyContactFields.forEach(field => {
      if (!data.emergencyContact[field]) {
        errors.push(`emergencyContact.${field}`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.legalStatus.isSexOffender) {
      toast.error("Interview must be terminated. Cannot proceed.");
      return;
    }
    
    if (currentPage < 15) {
      setCurrentPage(prev => prev + 1);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const missingFields = validateFormData(formData);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const result = await DataApiTransformer.createParticipantRecord(formData);
      if (!result.success) {
        throw new Error(result.message || 'Form submission failed');
      }

      router.push('/success');
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = (): boolean => {
    const hasRequiredSignature = (type: SignatureType) => 
      formData.signatures.some(s => s.signatureType === type);

    switch (currentPage) {
      case 6:
        return !hasRequiredSignature('medication');
      case 7:
        return !formData.authorizedPeople.length || 
          formData.authorizedPeople.some(person => 
            !person.firstName || !person.lastName || !person.relationship || !person.phone
          );
      case 8:
        return !hasRequiredSignature('treatment');
      case 9:
        return !hasRequiredSignature('price_consent');
      case 10:
        return !hasRequiredSignature('tenant_rights') || !hasRequiredSignature('contract_terms');
      case 11:
        return !hasRequiredSignature('criminal_history') || formData.legalStatus.isSexOffender;
      case 12:
        return !hasRequiredSignature('ethics');
      case 13:
        return !hasRequiredSignature('critical_rules');
      case 14:
        return !hasRequiredSignature('house_rules');
      case 15:
        return !programInfoReviewed;
      default:
        return false;
    }
  };

  const renderPageContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      handleSelectChange,
      setCurrentPage,
    };

    switch (currentPage) {
      case 1:
        return <OnboardingPage1 {...commonProps} />;
      case 2:
        return (
          <OnboardingPage2 
            {...commonProps} 
            handleVehicleToggle={handleVehicleToggle}
            handleHealthStatusChange={handleHealthStatusChange}
          />
        );
      case 3:
        return <OnboardingPage3 {...commonProps} />;
      case 4:
        return <OnboardingPage4 {...commonProps} />;
      case 5:
        return <OnboardingPage5 {...commonProps} />;
      case 6:
        return (
          <OnboardingPage6 
            formData={formData}
            isOnMAT={Boolean(formData.medicalInformation.mat)}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
          />
        );
      case 7:
        return (
          <OnboardingPage7 
            {...commonProps} 
            handleAuthorizedPeopleChange={handleAuthorizedPeopleChange}
          />
        );
      case 8:
        return <OnboardingPage8 {...commonProps} />;
      case 9:
        return <OnboardingPage9 {...commonProps} />;
      case 10:
        return <OnboardingPage10 {...commonProps} />;
      case 11:
        return <OnboardingPage11 {...commonProps} />;
      case 12:
        return <OnboardingPage12 {...commonProps} />;
      case 13:
        return <OnboardingPage13 {...commonProps} />;
      case 14:
        return <OnboardingPage14 {...commonProps} />;
      case 15:
        return (
          <OnboardingPage15 
            {...commonProps}
            onComplete={(verified) => setProgramInfoReviewed(verified)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <ToastContainer />
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
      <OnboardingProgress currentPage={currentPage} totalPages={15} />
      
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
              {currentPage === 15 ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
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