import { FormData, SignatureType, Signature, Insurance } from '@/types';

export class DataApiTransformer {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

  // Existing Validation Methods
  private static validatePersonalInfo(data: any) {
    if (!data.firstName || !data.lastName) {
      throw new Error('First name and last name are required');
    }
    
    if (!data.firstName.trim() || !data.lastName.trim()) {
      throw new Error('First name and last name cannot be empty');
    }

    if (!data.email?.includes('@')) {
      throw new Error('Valid email is required');
    }
    
    if (!data.socialSecurityNumber?.match(/^\d{3}-\d{2}-\d{4}$/)) {
      throw new Error('Valid Social Security Number is required');
    }
    
    if (!data.dateOfBirth || !data.intakeDate) {
      throw new Error('Date of birth and intake date are required');
    }
  }

  private static validateInsurances(insurances: any[]) {
    if (!Array.isArray(insurances) || insurances.length === 0) {
      throw new Error('At least one insurance entry is required');
    }

    insurances.forEach((insurance, index) => {
      if (!insurance.insuranceType) {
        throw new Error(`Insurance type is required for insurance entry ${index + 1}`);
      }
      if (insurance.insuranceType !== 'uninsured' && !insurance.policyNumber?.trim()) {
        throw new Error(`Policy number is required for insurance entry ${index + 1}`);
      }
    });
  }

  private static validateAuthorizedPeople(people: any[]) {
    if (!Array.isArray(people)) return;
    
    people.forEach((person, index) => {
      if (!person.firstName || !person.lastName || 
          !person.relationship || !person.phone) {
        throw new Error(`Missing information for authorized person at position ${index + 1}`);
      }
      
      if (!person.firstName.trim() || !person.lastName.trim() || 
          !person.relationship.trim() || !person.phone.trim()) {
        throw new Error(`Empty values not allowed for authorized person at position ${index + 1}`);
      }
    });
  }

  private static validateSignatures(data: FormData) {
    const requiredSignatures: SignatureType[] = [
      'treatment',
      'price_consent',
      'medication',
      'critical_rules',
      'house_rules',
      'ethics',
      'criminal_history',
      'asam_assessment'  // Added ASAM signature requirement
    ];
  
    if (!Array.isArray(data.signatures)) {
      throw new Error('Signatures array is required');
    }
  
    requiredSignatures.forEach(type => {
      const signature = data.signatures.find(s => s.signatureType === type);
      if (!signature || !signature.signature || !signature.signatureTimestamp || !signature.signatureId) {
        throw new Error(`Missing required signature information for ${type}`);
      }
    });
  }

  // Existing Transform Methods
  private static transformPersonalInfo(formData: any) {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      throw new Error('Missing required personal information');
    }

    return {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      intakeDate: formData.intakeDate,
      housingLocation: formData.housingLocation?.toLowerCase() || '',
      dateOfBirth: formData.dateOfBirth,
      socialSecurityNumber: formData.socialSecurityNumber,
      sex: formData.sex?.toLowerCase() || '',
      email: formData.email.toLowerCase().trim(),
      driversLicenseNumber: formData.driversLicenseNumber?.trim() || '',
      phoneNumber: formData.phoneNumber?.trim() || ''
    };
  }

  private static transformInsurances(formData: any) {
    if (!Array.isArray(formData.insurances)) {
      return [{ insuranceType: 'uninsured', policyNumber: '' }];
    }

    return formData.insurances.map((insurance: any) => ({
      insuranceType: insurance.insuranceType?.trim() || 'uninsured',
      policyNumber: insurance.policyNumber?.trim() || ''
    }));
  }

  private static transformVehicleInfo(formData: any) {
    return {
      make: formData.vehicle?.make?.trim() || '',
      model: formData.vehicle?.model?.trim() || '',
      tagNumber: formData.vehicle?.tagNumber?.trim() || '',
      insured: Boolean(formData.vehicle?.insured)
    };
  }

  private static transformMedicalInfo(formData: any) {
    return {
      dualDiagnosis: Boolean(formData.dualDiagnosis),
      mat: Boolean(formData.mat),
      matMedication: formData.matMedication?.trim() || '',
      matMedicationOther: formData.matMedicationOther?.trim() || '',
      needPsychMedication: Boolean(formData.needPsychMedication)
    };
  }

  private static transformLegalInfo(formData: any) {
    return {
      hasProbationPretrial: Boolean(formData.hasProbationOrPretrial),
      jurisdiction: formData.jurisdiction?.trim() || '',
      otherJurisdiction: formData.otherJurisdiction?.trim() || '',
      hasPendingCharges: Boolean(formData.hasPendingCharges),
      pendingCharges: Array.isArray(formData.pendingCharges) ? formData.pendingCharges : [],
      hasConvictions: Boolean(formData.hasConvictions),
      convictions: Array.isArray(formData.convictions) ? formData.convictions : [],
      isWanted: Boolean(formData.isWanted),
      isOnBond: Boolean(formData.isOnBond),
      bondsmanName: formData.bondsmanName?.trim() || '',
      isSexOffender: Boolean(formData.isSexOffender)
    };
  }

  private static transformHealthStatus(healthStatus: any) {
    if (!healthStatus) {
      throw new Error('Health status information is required');
    }

    return {
      pregnant: Boolean(healthStatus.pregnant),
      developmentallyDisabled: Boolean(healthStatus.developmentallyDisabled),
      coOccurringDisorder: Boolean(healthStatus.coOccurringDisorder),
      docSupervision: Boolean(healthStatus.docSupervision),
      felon: Boolean(healthStatus.felon),
      physicallyHandicapped: Boolean(healthStatus.physicallyHandicapped),
      postPartum: Boolean(healthStatus.postPartum),
      primaryFemaleCaregiver: Boolean(healthStatus.primaryFemaleCaregiver),
      recentlyIncarcerated: Boolean(healthStatus.recentlyIncarcerated),
      sexOffender: Boolean(healthStatus.sexOffender),
      lgbtq: Boolean(healthStatus.lgbtq),
      veteran: Boolean(healthStatus.veteran),
      insulinDependent: Boolean(healthStatus.insulinDependent),
      historyOfSeizures: Boolean(healthStatus.historyOfSeizures),
      others: Array.isArray(healthStatus.others) ? 
        healthStatus.others.map((item: string) => item?.trim()).filter(Boolean) : [],
      race: healthStatus.race?.trim() || '',
      ethnicity: healthStatus.ethnicity?.trim() || '',
      householdIncome: healthStatus.householdIncome?.trim() || '',
      employmentStatus: healthStatus.employmentStatus?.trim() || ''
    };
  }

  // New ASAM Transform Methods
  private static transformMentalHealth(formData: FormData) {
    return {
      suicidal_ideation: formData.mentalHealth.suicidalIdeation === 'yes',
      homicidal_ideation: formData.mentalHealth.homicidalIdeation === 'yes',
      hallucinations: formData.mentalHealth.hallucinations === 'yes',
      entries: formData.mentalHealth.entries.map(entry => ({
        diagnosis: entry.diagnosis.trim(),
        date_of_diagnosis: entry.dateOfDiagnosis,
        prescribed_medication: entry.prescribedMedication === 'yes',
        medication_compliant: entry.medicationCompliant === 'yes',
        current_symptoms: entry.currentSymptoms === 'yes',
        describe_symptoms: entry.describeSymptoms.trim()
      }))
    };
  }

  private static transformDrugHistory(formData: FormData) {
    return formData.drugHistory?.map(entry => ({
      drug_type: entry.drugType.trim(),
      ever_used: entry.everUsed === 'yes',
      date_last_use: entry.dateLastUse,
      frequency: entry.frequency?.trim(),
      intravenous: entry.intravenous === 'yes',
      total_years: entry.totalYears?.trim(),
      amount: entry.amount?.trim()
    }));
  }

  // Main Method
  static async createParticipantRecord(formData: FormData) {
    try {
      // Validate critical data
      this.validatePersonalInfo(formData);
      this.validateAuthorizedPeople(formData.authorizedPeople);
      this.validateSignatures(formData);
      this.validateInsurances(formData.insurances);

      // Check emergency contact data
      if (!formData.emergencyContact?.firstName || 
          !formData.emergencyContact?.lastName || 
          !formData.emergencyContact?.phone || 
          !formData.emergencyContact?.relationship) {
        throw new Error('Missing required emergency contact information');
      }

      // Transform all data sections
      const submitPayload = {
        ...this.transformPersonalInfo(formData),
        insurances: this.transformInsurances(formData),
        medications: formData.medications || [],
        vehicle: this.transformVehicleInfo(formData),
        medicalInformation: this.transformMedicalInfo(formData),
        legalStatus: this.transformLegalInfo(formData),
        signatures: this.transformSignatures(formData.signatures),
        emergencyContact: {
          firstName: formData.emergencyContact.firstName.trim(),
          lastName: formData.emergencyContact.lastName.trim(),
          phone: formData.emergencyContact.phone.trim(),
          relationship: formData.emergencyContact.relationship.trim(),
          otherRelationship: formData.emergencyContact.otherRelationship?.trim() || ''
        },
        authorizedPeople: (formData.authorizedPeople || []).map(person => ({
          firstName: person.firstName.trim(),
          lastName: person.lastName.trim(),
          relationship: person.relationship.trim(),
          phone: person.phone.trim()
        })),
        healthStatus: this.transformHealthStatus(formData.healthStatus),

        // ASAM Data
        mentalHealth: this.transformMentalHealth(formData),
        drugHistory: this.transformDrugHistory(formData),
        recoveryResidences: formData.recoveryResidences?.map(entry => ({
          name: entry.name.trim(),
          start_date: entry.startDate,
          end_date: entry.endDate,
          location: entry.location.trim()
        })),
        treatmentHistory: formData.treatmentHistory?.map(entry => ({
          type: entry.type.trim(),
          estimated_date: entry.estimatedDate,
          location: entry.location.trim()
        })),
        incarcerationHistory: formData.incarcerationHistory?.map(entry => ({
          type: entry.type.trim(),
          estimated_date: entry.estimatedDate,
          location: entry.location.trim()
        })),
        probationHistory: formData.probationHistory?.map(entry => ({
          type: entry.type,
          jurisdiction: entry.jurisdiction.trim(),
          start_date: entry.startDate,
          end_date: entry.endDate,
          officer_name: entry.officerName.trim(),
          officer_email: entry.officerEmail?.trim(),
          officer_phone: entry.officerPhone?.trim()
        })),
        drugTestResults: formData.drugTestResults ? 
          Object.entries(formData.drugTestResults).map(([test_type, result]) => ({
            test_type,
            result
          })) : []
      };

      console.log('Submitting data to API:', {
        ...submitPayload,
        socialSecurityNumber: '[REDACTED]'
      });

      try {
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(submitPayload)
        });

        console.log('API Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response Error:', errorText);
          throw new Error(`API request failed: ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response data:', result);

        if (!result.success) {
          throw new Error(result.message || 'Failed to submit participant data');
        }

        return {
          success: true,
          participantId: result.data?.participant_id,
          message: 'Participant data submitted successfully',
          data: result.data
        };
      } catch (apiError) {
        console.error('API communication error:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error in createParticipantRecord:', error);
      
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

  private static transformSignatures(signatures: Signature[]) {
    if (!Array.isArray(signatures)) {
      return [];
    }

    // Map of frontend signature types to backend signature types
    const signatureTypeMap: Record<string, string> = {
      'emergency': 'disclosure',
      'medication': 'treat_others',
      'disclosure': 'disclosure',
      'treatment': 'disclosure',
      'price_consent': 'house_rules',
      'tenant_rights': 'resident_as_guest',
      'contract_terms': 'house_rules',
      'criminal_history': 'criminal_history',
      'ethics': 'disclosure',
      'critical_rules': 'house_rules',
      'house_rules': 'house_rules',
      'asam_assessment': 'asam_assessment',
      'resident_as_guest': 'resident_as_guest',
      'treat_others': 'treat_others'
    };

    console.log('Transforming signatures:', signatures.map(s => s.signatureType));
    
    const transformedSignatures = signatures.map(signature => {
      // Map frontend signature type to backend signature type
      const mappedType = signatureTypeMap[signature.signatureType] || 'disclosure';
      console.log(`Mapping signature type: ${signature.signatureType} → ${mappedType}`);
      
      return {
        ...signature,
        signatureType: mappedType
      };
    });
    
    console.log('Transformed signatures:', transformedSignatures.map(s => s.signatureType));
    return transformedSignatures;
  }
}