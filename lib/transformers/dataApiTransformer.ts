// lib/transformers/dataApiTransformer.ts

interface ParticipantApiPayload {
    first_name: string;
    last_name: string;
    intake_date: string;
    housing_location: string;
    date_of_birth: string;
    sex: string;
    email: string;
    drivers_license_number: string | null;
  }
  
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
  
  export class DataApiTransformer {
    private static formatDate(date: string): string {
      try {
        return new Date(date).toISOString().split('T')[0];
      } catch (e) {
        console.error('Date formatting error:', e);
        return date;
      }
    }
  
    private static validatePayload(payload: ParticipantApiPayload): void {
      const now = new Date();
      const dob = new Date(payload.date_of_birth);
      const intake = new Date(payload.intake_date);
  
      if (dob > now) {
        throw new Error('Date of birth cannot be in the future');
      }
  
      if (intake > now) {
        throw new Error('Intake date cannot be in the future');
      }
    }
  
    static async createParticipantRecord(formData: FormData) {
      try {
        const participantPayload: ParticipantApiPayload = {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          intake_date: this.formatDate(formData.intakeDate),
          housing_location: formData.housingLocation.toLowerCase(),
          date_of_birth: this.formatDate(formData.dateOfBirth),
          sex: formData.sex.toLowerCase(),
          email: formData.email.toLowerCase().trim(),
          drivers_license_number: formData.driversLicenseNumber ? formData.driversLicenseNumber.trim() : null
        };
  
        this.validatePayload(participantPayload);
  
        console.log('Creating participant with payload:', participantPayload);
        
        const participantResponse = await fetch('/data-api/Participants', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(participantPayload)
        });
  
        let errorText;
        try {
          const responseText = await participantResponse.text();
          console.log('Full API Response:', responseText);
          errorText = responseText;
        } catch (e) {
          console.error('Error reading response:', e);
        }
  
        if (!participantResponse.ok) {
          throw new Error(`Failed to create participant: ${errorText}`);
        }
  
        let participant;
        try {
          participant = JSON.parse(errorText!);
        } catch (e) {
          throw new Error('Failed to parse participant response');
        }
  
        const participantId = participant.participant_id;
        if (!participantId) {
          throw new Error('No participant ID returned from API');
        }
  
        const relatedPromises = [
          fetch('/data-api/ParticipantSensitiveInfo', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              ssn_encrypted: formData.socialSecurityNumber,
              encryption_iv: null
            })
          }),
  
          formData.vehicleTagNumber && fetch('/data-api/Vehicles', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              tag_number: formData.vehicleTagNumber,
              make: formData.vehicleMake,
              model: formData.vehicleModel
            })
          }),
  
          fetch('/data-api/Insurance', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              is_insured: formData.insured,
              insurance_type: formData.insuranceType || '',
              policy_number: formData.policyNumber || ''
            })
          }),
  
          fetch('/data-api/MedicalInfo', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              dual_diagnosis: formData.dualDiagnosis,
              mat: formData.mat,
              mat_medication: formData.matMedication || '',
              mat_medication_other: formData.matMedicationOther || '',
              need_psych_medication: formData.needPsychMedication
            })
          }),
  
          fetch('/data-api/EmergencyContacts', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              first_name: formData.emergencyContactFirstName,
              last_name: formData.emergencyContactLastName,
              phone: formData.emergencyContactPhone,
              relationship: formData.emergencyContactRelationship,
              other_relationship: formData.otherRelationship || ''
            })
          }),
  
          ...formData.medications.map((med: string) => 
            fetch('/data-api/Medications', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                participant_id: participantId,
                medication_name: med
              })
            })
          ),
  
          fetch('/data-api/LegalInfo', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              has_probation_or_pretrial: formData.hasProbationOrPretrial,
              jurisdiction: formData.jurisdiction || '',
              other_jurisdiction: formData.otherJurisdiction || ''
            })
          }),
  
          ...formData.authorizedPeople.map((person: AuthorizedPerson) =>
            fetch('/data-api/AuthorizedPeople', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                participant_id: participantId,
                first_name: person.firstName,
                last_name: person.lastName,
                relationship: person.relationship,
                phone: person.phone
              })
            })
          ),
  
          fetch('/data-api/Consents', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              consent_signature: formData.consentSignature,
              consent_agreed: formData.consentAgreed,
              consent_timestamp: formData.consentTimestamp,
              witness_signature: formData.witnessSignature,
              witness_timestamp: formData.witnessTimestamp,
              signature_id: formData.signatureId
            })
          }),
  
          fetch('/data-api/TreatmentConsents', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              treatment_signature: formData.treatmentSignature || '',
              treatment_agreed: formData.treatmentAgreed || false,
              treatment_timestamp: formData.treatmentTimestamp || '',
              treatment_witness_signature: formData.treatmentwitnessSignature || '',
              treatment_witness_timestamp: formData.treatmentwitnessTimestamp || '',
              treatment_signature_id: formData.treatmentsignatureId || ''
            })
          }),
  
          fetch('/data-api/PriceConsents', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              participant_id: participantId,
              price_consent_signature: formData.priceConsentSignature || '',
              price_consent_agreed: formData.priceConsentAgreed || false,
              price_consent_timestamp: formData.priceConsentTimestamp || '',
              price_witness_signature: formData.priceWitnessSignature || '',
              price_witness_timestamp: formData.priceWitnessTimestamp || '',
              price_signature_id: formData.priceSignatureId || ''
            })
          })
        ].filter(Boolean);
  
        const results = await Promise.allSettled(relatedPromises);
        
        const failures = results.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected'
        );
  
        if (failures.length > 0) {
          console.error('Some related records failed:', failures);
          throw new Error('Failed to create all related records');
        }
  
        return {
          success: true,
          participantId,
          message: 'Participant and related records created successfully'
        };
  
      } catch (error) {
        console.error('Error in createParticipantRecord:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('date')) {
          throw new Error(`Date validation error: ${errorMessage}`);
        } else if (errorMessage.includes('participant')) {
          throw new Error(`Participant creation failed: ${errorMessage}`);
        } else {
          throw error;
        }
      }
    }
  }