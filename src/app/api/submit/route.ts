import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Define a type for signature
interface Signature {
  signatureType: string;
  signatureId: string;
  signatureTimestamp: string;
  witnessTimestamp?: string;
  signature?: string;
  witnessSignature?: string;
  witnessSignatureId?: string;
  agreed?: boolean;
  updates?: Record<string, any>;
}

// Create a modified schema for signature types to allow any string value
const FlexibleSignatureSchema = z.object({
  signatureType: z.string(),
  signatureId: z.string(),
  signatureTimestamp: z.string(),
  witnessTimestamp: z.string().optional(),
  signature: z.string().optional(),
  witnessSignature: z.string().optional(),
  witnessSignatureId: z.string().optional(),
  agreed: z.boolean().optional(),
  updates: z.record(z.any()).optional()
});

export async function POST(request: Request) {
  try {
    logger.info('Starting Supabase form submission process');
    
    const requestId = crypto.randomUUID();
    logger.debug('Request ID generated', { requestId });
    
    // Get Supabase client for auth
    let supabase;
    try {
      logger.debug('Initializing Supabase client');
      supabase = createServerComponentClient({ cookies });
      logger.debug('Supabase client initialized successfully');
    } catch (error: unknown) {
      const authClientError = error as Error;
      logger.error('Failed to create Supabase client', { 
        error: authClientError,
        message: authClientError.message,
        stack: authClientError.stack 
      });
      return NextResponse.json({
        success: false,
        message: 'Database service unavailable',
        error: 'Failed to initialize database connection'
      }, { status: 500 });
    }
    
    // Get the current authenticated user
    let user;
    try {
      logger.debug('Attempting to get authenticated user');
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        logger.error('Failed to get authenticated user', { 
          error: userError,
          message: userError.message 
        });
        return NextResponse.json({
          success: false,
          message: 'Authentication failed',
          error: 'Failed to verify user authentication'
        }, { status: 401 });
      }
      
      if (!authUser) {
        logger.warn('No authenticated user found');
        return NextResponse.json({
          success: false,
          message: 'Authentication required',
          error: 'No authenticated user found'
        }, { status: 401 });
      }
      
      user = authUser;
      logger.info('User authenticated successfully', { userId: user.id });
    } catch (error: unknown) {
      const getUserError = error as Error;
      logger.error('Error getting authenticated user', { 
        error: getUserError,
        message: getUserError.message,
        stack: getUserError.stack 
      });
      return NextResponse.json({
        success: false,
        message: 'Authentication error',
        error: 'Failed to verify user authentication'
      }, { status: 401 });
    }
    
    const userId = user?.id;
    
    logger.info('User authentication status', { 
      authenticated: !!user,
      userId: userId || 'anonymous'
    });

    if (!userId) {
      logger.warn('Unauthenticated request attempt');
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'User must be authenticated to submit form'
      }, { status: 401 });
    }
    
    let body;
    try {
      logger.debug('Parsing request body');
      body = await request.json();
      logger.debug('Request body parsed successfully', {
        bodyKeys: Object.keys(body),
        hasPersonalInfo: !!body.firstName && !!body.lastName,
        hasEmergencyContact: !!body.emergencyContact,
        hasSignatures: Array.isArray(body.signatures) && body.signatures.length > 0
      });
    } catch (error: unknown) {
      const parseError = error as Error;
      logger.error('Failed to parse request body', { 
        error: parseError,
        message: parseError.message 
      });
      return NextResponse.json({
        success: false,
        message: 'Invalid request format',
        error: 'Failed to parse request body'
      }, { status: 400 });
    }
    
    // More detailed logging of the incoming data structure
    logger.debug('Request body structure', {
      requestId,
      bodyKeys: Object.keys(body),
      firstName: body.firstName || body.first_name || 'missing',
      lastName: body.lastName || body.last_name || 'missing',
      hasMedicalInfo: !!body.medicalInformation || !!body.medical_information,
      medicalInfoKeys: body.medicalInformation ? Object.keys(body.medicalInformation) : 
                      (body.medical_information ? Object.keys(body.medical_information) : []),
      hasMedications: Array.isArray(body.medications),
      medicationsLength: Array.isArray(body.medications) ? body.medications.length : 'not an array',
      hasLegalStatus: !!body.legalStatus || !!body.legal_status,
      legalStatusKeys: body.legalStatus ? Object.keys(body.legalStatus) :
                      (body.legal_status ? Object.keys(body.legal_status) : [])
    });
    
    try {
      logger.info('Validating data schema');
      
      // Log the received body structure to help with debugging
      logger.debug('Full body structure', {
        keys: Object.keys(body),
        hasMedicalInfo: body.medicalInformation || body.medical_information ? 'yes' : 'no',
        hasMedications: Array.isArray(body.medications) ? 'yes' : 'no',
        hasLegalStatus: body.legalStatus || body.legal_status ? 'yes' : 'no'
      });
      
      // Transform snake_case to camelCase if needed
      const normalizedBody = {
        firstName: body.firstName || body.first_name,
        lastName: body.lastName || body.last_name,
        intakeDate: body.intakeDate || body.intake_date,
        housingLocation: body.housingLocation || body.housing_location,
        dateOfBirth: body.dateOfBirth || body.date_of_birth,
        socialSecurityNumber: body.socialSecurityNumber || body.social_security_number,
        sex: body.sex,
        email: body.email,
        driversLicenseNumber: body.driversLicenseNumber || body.drivers_license_number,
        phoneNumber: body.phoneNumber || body.phone_number,
        
        // Transform nested objects
        healthStatus: body.healthStatus || body.health_status,
        vehicle: body.vehicle,
        emergencyContact: body.emergencyContact || {
          firstName: body.emergency_contact?.first_name,
          lastName: body.emergency_contact?.last_name,
          phone: body.emergency_contact?.phone,
          relationship: body.emergency_contact?.relationship,
          otherRelationship: body.emergency_contact?.other_relationship
        },
        
        // Add missing fields that were showing up as undefined
        medicalInformation: body.medicalInformation || body.medical_information || {
          dualDiagnosis: false,
          mat: false,
          matMedication: '',
          matMedicationOther: '',
          needPsychMedication: false
        },
        
        medications: body.medications || [],
        
        legalStatus: body.legalStatus || body.legal_status || {
          hasProbationPretrial: false,
          hasPendingCharges: false,
          hasConvictions: false,
          isWanted: false,
          isOnBond: false,
          isSexOffender: false
        },
        
        // Include all other potential fields
        authorizedPeople: body.authorizedPeople || [],
        signatures: body.signatures || [],
        insurances: body.insurances || [],
        pendingCharges: body.pendingCharges || [],
        convictions: body.convictions || [],
        mentalHealth: body.mentalHealth || body.mental_health,
        drugHistory: body.drugHistory || body.drug_history,
        recoveryResidences: body.recoveryResidences || body.recovery_residences,
        treatmentHistory: body.treatmentHistory || body.treatment_history,
        incarcerationHistory: body.incarcerationHistory || body.incarceration_history,
        probationHistory: body.probationHistory || body.probation_history,
        drugTestResults: body.drugTestResults || body.drug_test_results
      };
      
      // Validate signatures separately
      let validatedSignatures: Signature[] = [];
      if (normalizedBody.signatures && Array.isArray(normalizedBody.signatures)) {
        logger.info(`Found ${normalizedBody.signatures.length} signatures to validate`);
        
        for (const signature of normalizedBody.signatures) {
          try {
            const validSig = FlexibleSignatureSchema.parse(signature);
            validatedSignatures.push(validSig);
          } catch (sigError) {
            logger.warn(`Invalid signature format: ${JSON.stringify(signature)}`, { error: sigError });
          }
        }
        
        logger.info(`Validated ${validatedSignatures.length} signatures`);
      }
      
      // Start database transaction
      logger.info('Starting database transaction');
      
      // Insert main participant data
      logger.debug('Inserting participant record');
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert({
          first_name: normalizedBody.firstName,
          last_name: normalizedBody.lastName,
          intake_date: normalizedBody.intakeDate,
          housing_location: normalizedBody.housingLocation,
          date_of_birth: normalizedBody.dateOfBirth,
          social_security_number: normalizedBody.socialSecurityNumber,
          sex: normalizedBody.sex,
          email: normalizedBody.email,
          drivers_license_number: normalizedBody.driversLicenseNumber,
          phone_number: normalizedBody.phoneNumber,
          created_by: userId
        })
        .select('id')
        .single();
      
      if (participantError) {
        logger.error('Failed to insert participant', { error: participantError });
        throw new Error(`Failed to insert participant: ${participantError.message}`);
      }
      
      const participantId = participant.id;
      logger.info('Participant created successfully', { participantId });
      
      // Helper function to handle database insertions with error handling
      const insertWithErrorHandling = async (tableName: string, data: any, description: string) => {
        try {
          logger.debug(`Inserting ${description}`);
          const { error } = await supabase.from(tableName).insert(data);
          if (error) {
            logger.error(`Failed to insert ${description}`, { error });
            throw new Error(`Failed to insert ${description}: ${error.message}`);
          }
          logger.debug(`${description} inserted successfully`);
        } catch (err) {
          logger.error(`Error inserting ${description}`, { error: err });
          throw err;
        }
      };

      // Insert health status
      if (normalizedBody.healthStatus) {
        await insertWithErrorHandling('health_status', {
          participant_id: participantId,
          pregnant: normalizedBody.healthStatus.pregnant || false,
          developmentally_disabled: normalizedBody.healthStatus.developmentallyDisabled || false,
          co_occurring_disorder: normalizedBody.healthStatus.coOccurringDisorder || false,
          doc_supervision: normalizedBody.healthStatus.docSupervision || false,
          felon: normalizedBody.healthStatus.felon || false,
          physically_handicapped: normalizedBody.healthStatus.physicallyHandicapped || false,
          post_partum: normalizedBody.healthStatus.postPartum || false,
          primary_female_caregiver: normalizedBody.healthStatus.primaryFemaleCaregiver || false,
          recently_incarcerated: normalizedBody.healthStatus.recentlyIncarcerated || false,
          sex_offender: normalizedBody.healthStatus.sexOffender || false,
          lgbtq: normalizedBody.healthStatus.lgbtq || false,
          veteran: normalizedBody.healthStatus.veteran || false,
          insulin_dependent: normalizedBody.healthStatus.insulinDependent || false,
          history_of_seizures: normalizedBody.healthStatus.historyOfSeizures || false,
          race: normalizedBody.healthStatus.race || '',
          ethnicity: normalizedBody.healthStatus.ethnicity || '',
          household_income: normalizedBody.healthStatus.householdIncome || '',
          employment_status: normalizedBody.healthStatus.employmentStatus || '',
          created_by: userId
        }, 'health status');
      }
      
      // Insert vehicle information if present
      if (normalizedBody.vehicle) {
        await insertWithErrorHandling('vehicles', {
          participant_id: participantId,
          make: normalizedBody.vehicle.make || '',
          model: normalizedBody.vehicle.model || '',
          tag_number: normalizedBody.vehicle.tagNumber || '',
          insured: normalizedBody.vehicle.insured || false,
          insurance_type: normalizedBody.vehicle.insuranceType || '',
          policy_number: normalizedBody.vehicle.policyNumber || '',
          created_by: userId
        }, 'vehicle information');
      }
      
      // Insert emergency contact
      if (normalizedBody.emergencyContact && normalizedBody.emergencyContact.firstName) {
        await insertWithErrorHandling('emergency_contacts', {
          participant_id: participantId,
          first_name: normalizedBody.emergencyContact.firstName,
          last_name: normalizedBody.emergencyContact.lastName,
          phone: normalizedBody.emergencyContact.phone,
          relationship: normalizedBody.emergencyContact.relationship,
          other_relationship: normalizedBody.emergencyContact.otherRelationship || '',
          created_by: userId
        }, 'emergency contact');
      }
      
      // Insert medical information
      if (normalizedBody.medicalInformation) {
        await insertWithErrorHandling('medical_information', {
          participant_id: participantId,
          dual_diagnosis: normalizedBody.medicalInformation.dualDiagnosis || false,
          mat: normalizedBody.medicalInformation.mat || false,
          mat_medication: normalizedBody.medicalInformation.matMedication || '',
          mat_medication_other: normalizedBody.medicalInformation.matMedicationOther || '',
          need_psych_medication: normalizedBody.medicalInformation.needPsychMedication || false,
          created_by: userId
        }, 'medical information');
      }
      
      // Insert medications
      if (normalizedBody.medications && normalizedBody.medications.length > 0) {
        const medicationsToInsert = normalizedBody.medications.map((med: any) => ({
          participant_id: participantId,
          medication_name: typeof med === 'string' ? med : med.medication_name || med.name || 'Unknown',
          dosage: typeof med === 'object' ? med.dosage : undefined,
          frequency: typeof med === 'object' ? med.frequency : undefined,
          prescribing_doctor: typeof med === 'object' ? med.prescribing_doctor : undefined,
          created_by: userId
        }));
        
        await insertWithErrorHandling('medications', medicationsToInsert, 'medications');
      }
      
      // Insert authorized people
      if (normalizedBody.authorizedPeople && normalizedBody.authorizedPeople.length > 0) {
        const authorizedPeopleToInsert = normalizedBody.authorizedPeople.map((person: any) => ({
          participant_id: participantId,
          first_name: person.firstName,
          last_name: person.lastName,
          relationship: person.relationship,
          phone: person.phone || '',
          created_by: userId
        }));
        
        await insertWithErrorHandling('authorized_people', authorizedPeopleToInsert, 'authorized people');
      }
      
      // Insert legal status
      if (normalizedBody.legalStatus) {
        await insertWithErrorHandling('legal_status', {
          participant_id: participantId,
          has_probation_pretrial: normalizedBody.legalStatus.hasProbationPretrial || false,
          jurisdiction: normalizedBody.legalStatus.jurisdiction || '',
          other_jurisdiction: normalizedBody.legalStatus.otherJurisdiction || '',
          has_pending_charges: normalizedBody.legalStatus.hasPendingCharges || false,
          has_convictions: normalizedBody.legalStatus.hasConvictions || false,
          is_wanted: normalizedBody.legalStatus.isWanted || false,
          is_on_bond: normalizedBody.legalStatus.isOnBond || false,
          bondsman_name: normalizedBody.legalStatus.bondsmanName || '',
          is_sex_offender: normalizedBody.legalStatus.isSexOffender || false,
          created_by: userId
        }, 'legal status');
      }

      // Insert pending charges if any
      if (normalizedBody.pendingCharges && normalizedBody.pendingCharges.length > 0) {
        const pendingChargesToInsert = normalizedBody.pendingCharges.map((charge: any) => ({
          participant_id: participantId,
          charge_description: charge.description || charge.charge_description || 'No description provided',
          court_date: charge.court_date || charge.courtDate,
          jurisdiction: charge.jurisdiction || '',
          case_number: charge.case_number || charge.caseNumber || '',
          created_by: userId
        }));
        
        await insertWithErrorHandling('pending_charges', pendingChargesToInsert, 'pending charges');
      }

      // Insert convictions if any
      if (normalizedBody.convictions && normalizedBody.convictions.length > 0) {
        const convictionsToInsert = normalizedBody.convictions.map((conviction: any) => ({
          participant_id: participantId,
          conviction_description: conviction.description || conviction.conviction_description || 'No description provided',
          conviction_date: conviction.conviction_date || conviction.convictionDate,
          jurisdiction: conviction.jurisdiction || '',
          sentence: conviction.sentence || '',
          created_by: userId
        }));
        
        await insertWithErrorHandling('convictions', convictionsToInsert, 'convictions');
      }
      
      // Insert mental health information
      if (normalizedBody.mentalHealth) {
        await insertWithErrorHandling('mental_health', {
          participant_id: participantId,
          entries: normalizedBody.mentalHealth.entries || [],
          suicidal_ideation: normalizedBody.mentalHealth.suicidalIdeation || 'no',
          homicidal_ideation: normalizedBody.mentalHealth.homicidalIdeation || 'no',
          hallucinations: normalizedBody.mentalHealth.hallucinations || 'no',
          depression_history: normalizedBody.mentalHealth.depressionHistory || false,
          anxiety_history: normalizedBody.mentalHealth.anxietyHistory || false,
          bipolar_history: normalizedBody.mentalHealth.bipolarHistory || false,
          ptsd_history: normalizedBody.mentalHealth.ptsdHistory || false,
          other_conditions: normalizedBody.mentalHealth.otherConditions || '',
          current_therapy: normalizedBody.mentalHealth.currentTherapy || false,
          therapy_provider: normalizedBody.mentalHealth.therapyProvider || '',
          created_by: userId
        }, 'mental health information');
      }
      
      // Insert drug history
      if (normalizedBody.drugHistory && normalizedBody.drugHistory.length > 0) {
        const drugHistoryToInsert = normalizedBody.drugHistory.map((entry: any) => ({
          participant_id: participantId,
          drug_type: entry.drugType,
          ever_used: entry.everUsed || 'no',
          date_last_use: entry.dateLastUse || '',
          frequency: entry.frequency || '',
          intravenous: entry.intravenous || 'no',
          total_years: entry.totalYears || '',
          amount: entry.amount || '',
          drug_of_choice: entry.drugOfChoice || false,
          created_by: userId
        }));
        
        await insertWithErrorHandling('drug_history', drugHistoryToInsert, 'drug history');
      }

      // Insert insurance information
      if (normalizedBody.insurances && normalizedBody.insurances.length > 0) {
        const insurancesToInsert = normalizedBody.insurances.map((insurance: any) => ({
          participant_id: participantId,
          insurance_type: insurance.type || insurance.insurance_type || '',
          insurance_company: insurance.company || insurance.insurance_company || '',
          policy_number: insurance.policy_number || insurance.policyNumber || '',
          group_number: insurance.group_number || insurance.groupNumber || '',
          is_primary: insurance.is_primary || insurance.isPrimary || false,
          created_by: userId
        }));
        
        await insertWithErrorHandling('insurances', insurancesToInsert, 'insurance information');
      }

      // Insert recovery residences history
      if (normalizedBody.recoveryResidences && normalizedBody.recoveryResidences.length > 0) {
        const recoveryResidencesToInsert = normalizedBody.recoveryResidences.map((residence: any) => ({
          participant_id: participantId,
          residence_name: residence.name || residence.residence_name || 'Unknown',
          location: residence.location || '',
          start_date: residence.start_date || residence.startDate,
          end_date: residence.end_date || residence.endDate,
          reason_for_leaving: residence.reason_for_leaving || residence.reasonForLeaving || '',
          would_recommend: residence.would_recommend || residence.wouldRecommend,
          created_by: userId
        }));
        
        await insertWithErrorHandling('recovery_residences', recoveryResidencesToInsert, 'recovery residences history');
      }

      // Insert treatment history
      if (normalizedBody.treatmentHistory && normalizedBody.treatmentHistory.length > 0) {
        const treatmentHistoryToInsert = normalizedBody.treatmentHistory.map((treatment: any) => ({
          participant_id: participantId,
          facility_name: treatment.facility_name || treatment.facilityName || 'Unknown',
          treatment_type: treatment.treatment_type || treatment.treatmentType || '',
          start_date: treatment.start_date || treatment.startDate,
          end_date: treatment.end_date || treatment.endDate,
          completed: treatment.completed || false,
          location: treatment.location || '',
          created_by: userId
        }));
        
        await insertWithErrorHandling('treatment_history', treatmentHistoryToInsert, 'treatment history');
      }
      
      // Insert signatures with legal document preservation
      if (validatedSignatures.length > 0) {
        logger.debug('Preparing signatures for insertion');
        
        const signaturesToInsert = validatedSignatures.map((sig: Signature) => ({
          participant_id: participantId,
          signature_type: sig.signatureType,
          signature: sig.signature || sig.signatureId, // Use actual signature or fallback to ID
          signature_id: sig.signatureId,
          signature_timestamp: sig.signatureTimestamp,
          witness_signature: sig.witnessSignature || '',
          witness_timestamp: sig.witnessTimestamp || null,
          witness_signature_id: sig.witnessSignatureId || '',
          agreed: sig.agreed || true,
          updates: sig.updates || {},
          // TODO: Fetch and store the current legal document version and content
          legal_document_version: null,
          legal_document_content: null,
          created_by: userId
        }));
        
        await insertWithErrorHandling('signatures', signaturesToInsert, 'signatures');
      }
      
      // Return success response
      logger.info('All data saved successfully to Supabase');
      return NextResponse.json({
        success: true,
        message: 'Participant data saved successfully',
        data: {
          participant_id: participantId,
          name: `${normalizedBody.firstName} ${normalizedBody.lastName}`,
          intake_date: normalizedBody.intakeDate,
          total_signatures: validatedSignatures.length
        }
      });
      
    } catch (error: any) {
      logger.error('Database transaction error', { 
        error: error,
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      });
      
      return NextResponse.json({
        success: false,
        message: 'Failed to save participant data',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      }, { status: 500 });
    }
  } catch (error: any) {
    logger.error('Unhandled API error', { 
      error: error,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });

    return NextResponse.json({
      success: false,
      message: 'Failed to process request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}