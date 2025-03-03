"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import Image from 'next/image';
import ASAMAssessment from '@/components/onboarding/ASAMAssessment';
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
  SignatureType,
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
  insurances: [{ insuranceType: 'uninsured' }],

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
    insurances: [],
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
  signatures: [],

    // Mental Health and Drug History (already there)
  mentalHealth: {
    entries: [{
      diagnosis: '',
      dateOfDiagnosis: '',
      prescribedMedication: 'no',
      medicationCompliant: 'no',
      currentSymptoms: 'no',
      describeSymptoms: ''
    }],
    suicidalIdeation: 'no',
    homicidalIdeation: 'no',
    hallucinations: 'no'
  },
  drugHistory: [
    { drugType: 'Alcohol', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Cannabis', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Cocaine', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Methamphetamines', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Amphetamines/Other Stimulants', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Benzodiazepines/Tranquilizers', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Sedatives/Barbiturates', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Heroin/Opioids', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Fentanyl', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Abuse MAT', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Hallucinogens', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Inhalants', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Steroids', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Kratom', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Illegal Use of Prescriptions', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' },
    { drugType: 'Abuse OTC Medicine', everUsed: 'no', dateLastUse: '', frequency: '', intravenous: 'no', totalYears: '', amount: '' }
  ],

  // Add these missing properties
  recoveryResidences: [],
  hasResidenceHistory: 'no'
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
              insurances: [],
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
          insurances: [],
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

  const downloadPDF = async (formData: FormData) => {
    try {
      // Simple validation to ensure critical data is present
      if (!formData.firstName || !formData.lastName || !formData.signatures) {
        console.error('Missing critical data for PDF generation');
        throw new Error('Form data is incomplete. Cannot generate PDF.');
      }

      // Try multiple function URL variants - the URL might be case-sensitive or have changed
      const FUNCTION_URL_OPTIONS = [
        'https://jhonboard-func.azurewebsites.net/api/generatepdf',
        'https://jhonboard-func.azurewebsites.net/api/generatePDF',
        // Try without 'api/' prefix which is sometimes not needed
        'https://jhonboard-func.azurewebsites.net/generatepdf',
        'https://jhonboard-func.azurewebsites.net/generatePDF'
      ];
      
      if (process.env.NODE_ENV === 'development') {
        FUNCTION_URL_OPTIONS.unshift('http://localhost:7071/api/generatepdf');
      }

      // Log information about what we're trying to do
      console.log('PDF generation request starting...', {
        urls: FUNCTION_URL_OPTIONS,
        dataSize: JSON.stringify(formData).length,
        firstName: formData.firstName,
        lastName: formData.lastName,
        signatureCount: formData.signatures?.length || 0
      });

      // Create a deep copy of form data to ensure no reference issues
      const formDataCopy = JSON.parse(JSON.stringify(formData));

      // Try each URL in sequence until one works
      let response = null;
      let lastError = null;
      let successUrl = null;

      for (const url of FUNCTION_URL_OPTIONS) {
        try {
          console.log(`Trying function URL: ${url}`);
          response = await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/pdf, application/octet-stream'
            },
            body: JSON.stringify(formDataCopy),
            signal: AbortSignal.timeout(30000) // 30 second timeout per attempt
          });
          
          if (response.ok) {
            successUrl = url;
            console.log(`Successfully connected to function at: ${url}`);
            break;
          } else {
            console.warn(`Failed to connect to ${url}: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          console.warn(`Error connecting to ${url}:`, err);
          lastError = err;
        }
      }

      if (!response || !response.ok) {
        console.error('All function URLs failed. Last error:', lastError);
        throw new Error(`PDF generation failed: Could not connect to PDF generation service. Please contact support.`);
      }

      // Log the response info for debugging
      console.log('PDF generation response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        successUrl
      });

      const blob = await response.blob();
      
      // Check the blob's size to ensure it's not empty
      if (blob.size === 0) {
        console.error('Empty PDF file received (zero bytes)');
        throw new Error('Empty PDF file received (zero bytes)');
      }

      // Log blob details for debugging
      console.log('PDF blob received:', {
        type: blob.type,
        size: blob.size
      });

      // Validate content type - be more flexible with content types
      const validPdfTypes = ['application/pdf', 'application/octet-stream', 'binary/octet-stream'];
      if (!validPdfTypes.includes(blob.type.toLowerCase())) {
        console.warn(`Unexpected content type: ${blob.type}. Expected a PDF.`);
      }

      const firstName = (formData.firstName || '').trim();
      const lastName = (formData.lastName || '').trim();
      const filename = `${lastName}${firstName}_Intake.pdf`
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9_.-]/g, '');

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Small delay before cleanup to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('PDF download completed successfully');
      }, 100);

      return true;
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.legalStatus.isSexOffender) {
      toast.error("Interview must be terminated. Cannot proceed.");
      return;
    }
    
    if (currentPage < 16) {
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
      
      // Create a deep copy of form data to avoid reference issues
      const formDataCopy = JSON.parse(JSON.stringify(formData));
  
      // Submit data to the API
      console.log('Form submission starting...');
      const result = await DataApiTransformer.createParticipantRecord(formDataCopy);
      
      if (result.success) {
        console.log('Form submission successful, attempting to generate PDF...');
        
        try {
          const pdfSuccess = await downloadPDF(formDataCopy);
          if (!pdfSuccess) {
            console.warn('Form submitted but PDF download had issues');
            toast.warning('Your form was submitted successfully, but there was an issue generating the PDF. The Azure Function for PDF generation might need to be checked.');
          }
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
          toast.warning('Your form was submitted successfully, but there was an issue generating the PDF. The Azure Function for PDF generation might need to be checked.');
        }
        
        router.push('/success');
      } else {
        throw new Error(result.message || 'Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
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
      case 16:
        return !hasRequiredSignature('asam_assessment');
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
  
        case 16:
          return (
            <ASAMAssessment 
              {...commonProps}
              addSignature={addSignature}
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
      <OnboardingProgress currentPage={currentPage} totalPages={16} />
      
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
              {currentPage === 16 ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
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