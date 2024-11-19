// lib/transformers/dataApiTransformer.ts

interface AuthorizedPerson {
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
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
    insured: boolean;
    insuranceType: string;
    policyNumber: string;
    emergencyContactFirstName: string;
    emergencyContactLastName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    otherRelationship?: string;
    dualDiagnosis: boolean;
    mat: boolean;
    matMedication: string;
    matMedicationOther?: string;
    needPsychMedication: boolean;
    medications: string[];
    hasProbationOrPretrial: boolean;
    jurisdiction: string;
    otherJurisdiction?: string;
    consentSignature: string;
    consentAgreed: boolean;
    consentTimestamp: string;
    witnessSignature: string;
    witnessTimestamp: string;
    signatureId: string;
    medicationSignature: string;
    medicationSignatureDate: string;
    medicationWitnessSignature: string;
    medicationWitnessTimestamp: string;
    medicationSignatureId: string;
    authorizedPeople: AuthorizedPerson[];
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
  
  interface ApiResponse {
    success: boolean;
    message: string;
    data?: {
      name: string;
      intake_date: string;
      participant_id?: string;
    };
  }
  
  export class DataApiTransformer {
    private static formatDate(date: string): string {
      try {
        return new Date(date).toISOString().split('T')[0];
      } catch (e) {
        console.error('Date formatting error:', e);
        return date;
      }
    }
  
    private static validatePayload(payload: any): void {
      const now = new Date();
      const dob = new Date(payload.dateOfBirth);
      const intake = new Date(payload.intakeDate);
  
      if (dob > now) {
        throw new Error('Date of birth cannot be in the future');
      }
  
      if (intake > now) {
        throw new Error('Intake date cannot be in the future');
      }
  
      // Additional validations
      if (!payload.firstName || !payload.lastName) {
        throw new Error('First name and last name are required');
      }
  
      if (!payload.email || !payload.email.includes('@')) {
        throw new Error('Valid email is required');
      }
  
      // Validate authorized people if any exist
      if (payload.authorizedPeople?.length > 0) {
        payload.authorizedPeople.forEach((person: AuthorizedPerson, index: number) => {
          if (!person.firstName || !person.lastName || !person.relationship || !person.phone) {
            throw new Error(`Incomplete information for authorized person at position ${index + 1}`);
          }
        });
      }
    }
  
    static async createParticipantRecord(formData: FormData) {
      try {
        // Prepare the standardized payload
        const submitPayload = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            intakeDate: this.formatDate(formData.intakeDate),
            housingLocation: formData.housingLocation.toLowerCase(),
            dateOfBirth: this.formatDate(formData.dateOfBirth),
            sex: formData.sex.toLowerCase(),
            email: formData.email.toLowerCase().trim(),
            driversLicenseNumber: formData.driversLicenseNumber?.trim() || '',
            socialSecurityNumber: formData.socialSecurityNumber,
            vehicleTagNumber: formData.vehicleTagNumber || '',
            vehicleMake: formData.vehicleMake || '',
            vehicleModel: formData.vehicleModel || '',
            insured: formData.insured ? "yes" : "no",           
            insuranceType: formData.insuranceType || '',
            policyNumber: formData.policyNumber || '',
            emergencyContactFirstName: formData.emergencyContactFirstName,
            emergencyContactLastName: formData.emergencyContactLastName,
            emergencyContactPhone: formData.emergencyContactPhone,
            emergencyContactRelationship: formData.emergencyContactRelationship,
            otherRelationship: formData.otherRelationship || '',
            dualDiagnosis: formData.dualDiagnosis ? "yes" : "no",  
            mat: formData.mat,                                      
            matMedication: formData.matMedication || '',
            matMedicationOther: formData.matMedicationOther || '',
            needPsychMedication: formData.needPsychMedication ? "yes" : "no",  
            medications: formData.medications || [],
            hasProbationOrPretrial: formData.hasProbationOrPretrial ? "yes" : "no",  
            jurisdiction: formData.jurisdiction || '',
            otherJurisdiction: formData.otherJurisdiction || '',
            consentSignature: formData.consentSignature,
            consentAgreed: formData.consentAgreed,                
            consentTimestamp: formData.consentTimestamp,
            witnessSignature: formData.witnessSignature,
            witnessTimestamp: formData.witnessTimestamp,
            signatureId: formData.signatureId,
            medicationSignature: formData.medicationSignature,
            medicationSignatureDate: formData.medicationSignatureDate,
            medicationWitnessSignature: formData.medicationWitnessSignature,
            medicationWitnessTimestamp: formData.medicationWitnessTimestamp,
            medicationSignatureId: formData.medicationSignatureId,
            treatmentSignature: formData.treatmentSignature || '',
            treatmentAgreed: formData.treatmentAgreed,             
            treatmentTimestamp: formData.treatmentTimestamp || '',
            treatmentwitnessSignature: formData.treatmentwitnessSignature || '',
            treatmentwitnessTimestamp: formData.treatmentwitnessTimestamp || '',
            treatmentsignatureId: formData.treatmentsignatureId || '',
            priceConsentSignature: formData.priceConsentSignature || '',
            priceConsentAgreed: formData.priceConsentAgreed,      
            priceConsentTimestamp: formData.priceConsentTimestamp || '',
            priceWitnessSignature: formData.priceWitnessSignature || '',
            priceWitnessTimestamp: formData.priceWitnessTimestamp || '',
            priceSignatureId: formData.priceSignatureId || '',
            authorizedPeople: formData.authorizedPeople.map(person => ({
              firstName: person.firstName,
              lastName: person.lastName,
              relationship: person.relationship,
              phone: person.phone
            })),
            createdAt: new Date().toISOString()
      };
  
        // Validate the payload before submission
        this.validatePayload(submitPayload);
  
        console.log('Submitting data to API:', submitPayload);
  
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(submitPayload)
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response Error:', errorText);
          throw new Error(`API request failed: ${errorText}`);
        }
  
        const result: ApiResponse = await response.json();
  
        if (!result.success) {
          throw new Error(result.message || 'Failed to submit participant data');
        }
  
        return {
          success: true,
          participantId: result.data?.participant_id,
          message: 'Participant data submitted successfully',
          data: result.data
        };
  
      } catch (error) {
        console.error('Error in createParticipantRecord:', error);
        
        // Enhanced error handling with specific messages
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        if (errorMessage.includes('date')) {
          throw new Error(`Date validation error: ${errorMessage}`);
        } else if (errorMessage.includes('API request failed')) {
          throw new Error(`Submission failed: ${errorMessage}`);
        } else if (errorMessage.includes('authorized person')) {
          throw new Error(`Validation error: ${errorMessage}`);
        } else {
          throw new Error(`Error creating participant record: ${errorMessage}`);
        }
      }
    }
  }