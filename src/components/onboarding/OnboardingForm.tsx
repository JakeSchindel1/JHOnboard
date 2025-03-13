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
import DirectPdfDownload from '@/components/DirectPdfDownload';

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
  const [showDirectDownload, setShowDirectDownload] = useState(false);

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

  const credentialsMode = process.env.NODE_ENV === 'development' 
    ? 'include' // Use include for local development
    : 'same-origin'; // Use same-origin for production

  // Now that we're using standard Next.js deployment, we can use the Next.js API route
  // This is more secure and handles CORS automatically
  const FUNCTION_URL = '/api/generatepdf';

  // Log the current environment and function URL for debugging
  useEffect(() => {
    console.log('Current environment:', process.env.NODE_ENV);
    console.log('Using PDF function URL:', FUNCTION_URL);
    console.log('Using credentials mode:', credentialsMode);
  }, [FUNCTION_URL, credentialsMode]);

  const downloadPDF = async (formData: FormData) => {
  try {
    console.log('Starting PDF download process...');
    console.log('Using function URL:', FUNCTION_URL);
    
    // Make a test HEAD request first to check if the function is reachable
    try {
      const testResponse = await fetch(FUNCTION_URL, {
        method: 'HEAD',
        headers: { 'Content-Type': 'application/json' },
        // Use the environment-specific credentials mode
        credentials: credentialsMode,
        // Add a cachebuster to prevent caching issues
        cache: 'no-cache'
      });
      
      console.log('Function endpoint test result:', testResponse.ok, 'Status:', testResponse.status);
      if (!testResponse.ok) {
        console.warn('Function endpoint may not be reachable, but continuing with main request...');
      }
    } catch (testError) {
      console.warn('Function endpoint test failed, but continuing with main request:', testError);
      // Continue with the main request anyway
    }

    // Prepare the data to send to the function
    const pdfRequestData = {
      ...formData,
      documentType: 'intake_form' // Specify the document type for the Azure Function
    };

    console.log('Sending data with document type:', pdfRequestData.documentType);

    // Main PDF generation request
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Add a request ID for tracking
        'X-Request-ID': `pdf-${Date.now()}`
      },
      body: JSON.stringify(pdfRequestData),
      // Use the environment-specific credentials mode
      credentials: credentialsMode,
      // Add a cachebuster to prevent caching issues
      cache: 'no-cache'
    });

    console.log('PDF generation response received:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Array.from(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PDF generation failed with error text:', errorText);
      throw new Error(`PDF generation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Check if we received data
    const blob = await response.blob();
    console.log('Received blob:', {
      size: blob.size,
      type: blob.type
    });

    if (blob.size === 0) {
      console.error('Received an empty blob');
      throw new Error('Empty PDF file received');
    }

    // Check content type more flexibly
    if (!blob.type.includes('pdf') && !blob.type.includes('application/octet-stream')) {
      console.error('Unexpected content type:', blob.type);
      // Continue anyway, as the content type might be incorrectly set
      console.warn('Attempting to download anyway');
    }

    const firstName = (formData.firstName || '').trim();
    const lastName = (formData.lastName || '').trim();
    const filename = `${lastName}${firstName}_Intake.pdf`
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9_.-]/g, '');

    console.log('Creating download for file:', filename);
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to document and click
    document.body.appendChild(link);
    console.log('Download link created, attempting to click');
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Download link cleanup completed');
    }, 1000);

    toast.success('PDF download initiated');
    return true;
  } catch (error) {
    console.error('PDF download failed:', error);
    
    // More specific error messages
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      toast.error('Unable to reach the PDF generation service. Please check your network connection.');
    } else if (error instanceof Error && error.message.includes('Empty PDF')) {
      toast.error('The server returned an empty PDF file. Please try again or contact support.');
    } else {
      toast.error('Failed to download PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    
    // Attempt fallback download method
    try {
      console.log('Attempting fallback download method...');
      
      // Create a new URL object for better URL handling
      const functionUrl = new URL(FUNCTION_URL);
      
      // Use the direct URL download approach
      const fallbackUrl = `${functionUrl.origin}/api/downloadpdf?firstName=${encodeURIComponent(formData.firstName || '')}&lastName=${encodeURIComponent(formData.lastName || '')}`;
      console.log('Fallback URL:', fallbackUrl);
      
      // Open in a new tab/window
      window.open(fallbackUrl, '_blank');
      toast.info('Attempted alternative download method. Please check your browser for a new tab.');
      
      return true;
    } catch (fallbackError) {
      console.error('Fallback download method failed:', fallbackError);
      return false;
    }
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
    setShowDirectDownload(false);

    try {
      const missingFields = validateFormData(formData);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const result = await DataApiTransformer.createParticipantRecord(formData);
      
      if (result.success) {
        // Try the PDF download
        try {
          const pdfResult = await downloadPDF(formData);
          if (!pdfResult) {
            // If PDF download fails, show the direct download option
            setShowDirectDownload(true);
            toast.warn("PDF generation via API failed. You can try the direct download button.");
          }
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
          setShowDirectDownload(true);
          toast.warn("PDF generation failed. You can try the direct download button.");
        }
        
        // Use a safer approach to navigate to the success page
        try {
          if (router && typeof router.push === 'function') {
            router.push('/success');
          } else {
            // Fallback to traditional navigation if router is not available
            window.location.href = '/success';
          }
        } catch (error) {
          console.error('Navigation error:', error);
          // Last resort fallback
          window.location.href = '/success';
        }
      } else {
        throw new Error(result.message || 'Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setShowDirectDownload(true);
      toast.error("Form submission encountered an error. You can try to generate the PDF directly.");
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
            {showDirectDownload && (
              <div className="mt-4">
                <p className="font-semibold">You can still generate the PDF:</p>
                <DirectPdfDownload formData={formData} />
              </div>
            )}
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
        <DialogContent className="sm:max-w-md" aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle>Return to Home Page?</DialogTitle>
            <DialogDescription id="dialog-description">
              Are you sure you want to return to the home page? Any unsaved progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              try {
                if (router && typeof router.push === 'function') {
                  router.push('/');
                } else {
                  // Fallback to traditional navigation
                  window.location.href = '/';
                }
              } catch (error) {
                console.error('Navigation error:', error);
                window.location.href = '/';
              }
            }}>
              Yes, return home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}