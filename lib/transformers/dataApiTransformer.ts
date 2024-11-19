// lib/transformers/dataApiTransformer.ts

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
    
    // Vehicle Information
    driversLicenseNumber: string;
    vehicleTagNumber: string;
    vehicleMake: string;
    vehicleModel: string;
    
    // Insurance Information
    insured: boolean;
    insuranceType: string;
    policyNumber: string;
    
    // Emergency Contact
    emergencyContactFirstName: string;
    emergencyContactLastName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    otherRelationship?: string;
    
    // Medical Information
    dualDiagnosis: boolean;
    mat: boolean;
    matMedication: string;
    matMedicationOther?: string;
    needPsychMedication: boolean;
    medications: string[];
    
    // Legal Information
    hasProbationOrPretrial: boolean;
    jurisdiction: string;
    otherJurisdiction?: string;
    
    // Consents
    consentSignature: string;
    consentAgreed: boolean;
    consentTimestamp: string;
    witnessSignature: string;
    witnessTimestamp: string;
    signatureId: string;
    
    // Medication Consents
    medicationSignature: string;
    medicationSignatureDate: string;
    medicationWitnessSignature: string;
    medicationWitnessTimestamp: string;
    medicationSignatureId: string;
    
    // Authorized People
    authorizedPeople: AuthorizedPerson[];
    
    // Treatment Information
    treatmentSignature?: string;
    treatmentAgreed?: boolean;
    treatmentTimestamp?: string;
    treatmentwitnessSignature?: string;
    treatmentwitnessTimestamp?: string;
    treatmentsignatureId?: string;
    
    // Price Consent
    priceConsentSignature?: string;
    priceConsentAgreed?: boolean;
    priceConsentTimestamp?: string;
    priceWitnessSignature?: string;
    priceWitnessTimestamp?: string;
    priceSignatureId?: string;
  }
  
  interface ParticipantCreatePayload {
    first_name: string;
    last_name: string;
    intake_date: string;
    housing_location: string;
    date_of_birth: string;
    sex: string;
    email: string;
    drivers_license_number: string | null;
  }
  
  export class DataApiTransformer {
    private static formatDate(date: string): string {
      return new Date(date).toISOString().split('T')[0];
    }
  
    static async createParticipantRecord(formData: FormData) {
      try {
        // Step 1: Create participant (anonymous access)
        const participantPayload: ParticipantCreatePayload = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          intake_date: this.formatDate(formData.intakeDate),
          housing_location: formData.housingLocation.toLowerCase(),
          date_of_birth: this.formatDate(formData.dateOfBirth),
          sex: formData.sex.toLowerCase(),
          email: formData.email.toLowerCase(),
          drivers_license_number: formData.driversLicenseNumber || null
        };
  
        console.log('Creating participant with payload:', participantPayload);
        
        const participantResponse = await fetch('/data-api/Participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(participantPayload)
        });
  
        if (!participantResponse.ok) {
          const errorText = await participantResponse.text();
          console.error('Participant creation failed:', errorText);
          throw new Error(`Failed to create participant: ${errorText}`);
        }
  
        const participant = await participantResponse.json();
        const participantId = participant.participant_id;
  
        // Step 2: Create related records (requires authentication)
        const relatedPromises = [
          // Sensitive Info
          fetch('/data-api/ParticipantSensitiveInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participant_id: participantId,
              ssn_encrypted: formData.socialSecurityNumber,
              encryption_iv: null
            })
          }),
  
          // Vehicle (only if vehicle info exists)
          formData.vehicleTagNumber && fetch('/data-api/Vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participant_id: participantId,
              tag_number: formData.vehicleTagNumber,
              make: formData.vehicleMake,
              model: formData.vehicleModel
            })
          }),
  
          // Insurance
          fetch('/data-api/Insurance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participant_id: participantId,
              is_insured: Boolean(formData.insured),
              insurance_type: formData.insuranceType || '',
              policy_number: formData.policyNumber || ''
            })
          }),
  
          // Medical Info
          fetch('/data-api/MedicalInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participant_id: participantId,
              dual_diagnosis: Boolean(formData.dualDiagnosis),
              mat: formData.mat,
              mat_medication: formData.matMedication || '',
              mat_medication_other: formData.matMedicationOther || '',
              need_psych_medication: Boolean(formData.needPsychMedication)
            })
          }),
  
          // Emergency Contact
          fetch('/data-api/EmergencyContacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participant_id: participantId,
              first_name: formData.emergencyContactFirstName,
              last_name: formData.emergencyContactLastName,
              phone: formData.emergencyContactPhone,
              relationship: formData.emergencyContactRelationship,
              other_relationship: formData.otherRelationship || ''
            })
          }),
  
          // Medications
          ...formData.medications.map(med => 
            fetch('/data-api/Medications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participant_id: participantId,
                medication_name: med
              })
            })
          ),
  
          // Legal Info
          fetch('/data-api/LegalInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participant_id: participantId,
              has_probation_or_pretrial: formData.hasProbationOrPretrial,
              jurisdiction: formData.jurisdiction || '',
              other_jurisdiction: formData.otherJurisdiction || ''
            })
          }),
  
          // Authorized People
          ...formData.authorizedPeople.map(person =>
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
            })
          ),
  
          // Consents
          fetch('/data-api/Consents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participant_id: participantId,
              consent_signature: formData.consentSignature,
              consent_agreed: formData.consentAgreed,
              consent_timestamp: formData.consentTimestamp,
              witness_signature: formData.witnessSignature,
              witness_timestamp: formData.witnessTimestamp,
              signature_id: formData.signatureId
            })
          })
        ].filter(Boolean);
  
        const results = await Promise.allSettled(relatedPromises);
        
        // Check for any failures
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
        throw error;
      }
    }
  }