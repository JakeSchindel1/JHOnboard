import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Define a type for signature
interface Signature {
  signatureType: string;
  signatureId: string;
  signatureTimestamp: string;
  witnessTimestamp?: string;
}

// Create a modified schema for signature types to allow any string value
const FlexibleSignatureSchema = z.object({
  signatureType: z.string(),
  signatureId: z.string(),
  signatureTimestamp: z.string(),
  witnessTimestamp: z.string().optional()
});

export async function POST(request: Request) {
  try {
    logger.info('Starting form submission process');
    
    const requestId = crypto.randomUUID();
    logger.debug('Request ID generated', { requestId });
    
    // Get Supabase client for auth
    let supabaseAuth;
    try {
      logger.debug('Initializing Supabase auth client');
      supabaseAuth = createServerComponentClient({ cookies });
      logger.debug('Supabase auth client initialized successfully');
    } catch (error: unknown) {
      const authClientError = error as Error;
      logger.error('Failed to create Supabase auth client', { 
        error: authClientError,
        message: authClientError.message,
        stack: authClientError.stack 
      });
      return NextResponse.json({
        success: false,
        message: 'Authentication service unavailable',
        error: 'Failed to initialize authentication'
      }, { status: 500 });
    }
    
    // Get the current authenticated user
    let user;
    try {
      logger.debug('Attempting to get authenticated user');
      const { data: { user: authUser }, error: userError } = await supabaseAuth.auth.getUser();
      
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
    
    // Create a Supabase admin client that bypasses RLS
    let supabase;
    try {
      logger.debug('Initializing Supabase admin client');
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing required Supabase configuration');
      }
      
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      logger.debug('Supabase admin client initialized successfully');
    } catch (error: unknown) {
      const clientError = error as Error;
      logger.error('Failed to create Supabase admin client', { 
        error: clientError,
        message: clientError.message,
        stack: clientError.stack 
      });
      return NextResponse.json({
        success: false,
        message: 'Database service unavailable',
        error: 'Failed to initialize database connection'
      }, { status: 500 });
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
      // This handles the mismatch between DataApiTransformer and the expected schema
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
      
      // Validate signatures (same as before)
      if (normalizedBody.signatures && Array.isArray(normalizedBody.signatures)) {
        logger.info(`Found ${normalizedBody.signatures.length} signatures to validate`);
        
        // Validate each signature directly
        const validatedSignatures: Signature[] = [];
        for (const signature of normalizedBody.signatures) {
          try {
            // Use our flexible signature schema
            const validSig = FlexibleSignatureSchema.parse(signature);
            validatedSignatures.push(validSig);
          } catch (sigError) {
            logger.warn(`Invalid signature format: ${JSON.stringify(signature)}`, { error: sigError });
            // Don't add invalid signatures
          }
        }
        
        // Replace the signatures array with validated ones
        normalizedBody.signatures = validatedSignatures;
        logger.info(`Validated ${validatedSignatures.length} signatures`);
      }
      
      // Validate rest of schema (unchanged)
      const { signatures, ...otherData } = normalizedBody;
      
      try {
        // First try to validate the data with the schema
        const validatedBase = OnboardingSchema.omit({ signatures: true }).parse(otherData);
        
        // Combine data (unchanged)
        const validatedData = {
          ...validatedBase,
          signatures: normalizedBody.signatures || []
        };
        
        logger.info('Data validation passed');
        
        // Insert main participant data
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .insert({
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            intake_date: validatedData.intakeDate,
            housing_location: validatedData.housingLocation,
            date_of_birth: validatedData.dateOfBirth,
            social_security_number: validatedData.socialSecurityNumber,
            sex: validatedData.sex,
            email: validatedData.email,
            drivers_license_number: validatedData.driversLicenseNumber,
            phone_number: validatedData.phoneNumber,
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
        
        // Insert health status
        if (validatedData.healthStatus) {
          logger.debug('Inserting health status');
          const { error: healthError } = await supabase
            .from('health_status')
            .insert({
              participant_id: participantId,
              pregnant: validatedData.healthStatus.pregnant || false,
              developmentally_disabled: validatedData.healthStatus.developmentallyDisabled || false,
              co_occurring_disorder: validatedData.healthStatus.coOccurringDisorder || false,
              doc_supervision: validatedData.healthStatus.docSupervision || false,
              felon: validatedData.healthStatus.felon || false,
              physically_handicapped: validatedData.healthStatus.physicallyHandicapped || false,
              post_partum: validatedData.healthStatus.postPartum || false,
              primary_female_caregiver: validatedData.healthStatus.primaryFemaleCaregiver || false,
              recently_incarcerated: validatedData.healthStatus.recentlyIncarcerated || false,
              sex_offender: validatedData.healthStatus.sexOffender || false,
              lgbtq: validatedData.healthStatus.lgbtq || false,
              veteran: validatedData.healthStatus.veteran || false,
              insulin_dependent: validatedData.healthStatus.insulinDependent || false,
              history_of_seizures: validatedData.healthStatus.historyOfSeizures || false,
              race: validatedData.healthStatus.race || '',
              ethnicity: validatedData.healthStatus.ethnicity || '',
              household_income: validatedData.healthStatus.householdIncome || '',
              employment_status: validatedData.healthStatus.employmentStatus || '',
              created_by: userId
            });
          
          if (healthError) {
            logger.error('Failed to insert health status', { error: healthError });
            throw new Error(`Failed to insert health status: ${healthError.message}`);
          }
          logger.debug('Health status inserted successfully');
        }
        
        // Insert vehicle information if present
        if (validatedData.vehicle) {
          logger.debug('Inserting vehicle information');
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .insert({
              participant_id: participantId,
              make: validatedData.vehicle.make || '',
              model: validatedData.vehicle.model || '',
              tag_number: validatedData.vehicle.tagNumber || '',
              insured: validatedData.vehicle.insured || false,
              insurance_type: validatedData.vehicle.insuranceType || '',
              policy_number: validatedData.vehicle.policyNumber || '',
              created_by: userId
            });
          
          if (vehicleError) {
            logger.error('Failed to insert vehicle information', { error: vehicleError });
            throw new Error(`Failed to insert vehicle information: ${vehicleError.message}`);
          }
          logger.debug('Vehicle information inserted successfully');
        }
        
        // Insert emergency contact
        if (validatedData.emergencyContact) {
          logger.debug('Inserting emergency contact');
          const { error: emergencyContactError } = await supabase
            .from('emergency_contacts')
            .insert({
              participant_id: participantId,
              first_name: validatedData.emergencyContact.firstName,
              last_name: validatedData.emergencyContact.lastName,
              phone: validatedData.emergencyContact.phone,
              relationship: validatedData.emergencyContact.relationship,
              other_relationship: validatedData.emergencyContact.otherRelationship || '',
              created_by: userId
            });
          
          if (emergencyContactError) {
            logger.error('Failed to insert emergency contact', { error: emergencyContactError });
            throw new Error(`Failed to insert emergency contact: ${emergencyContactError.message}`);
          }
          logger.debug('Emergency contact inserted successfully');
        }
        
        // Insert medical information
        if (validatedData.medicalInformation) {
          logger.debug('Inserting medical information');
          const { error: medicalError } = await supabase
            .from('medical_information')
            .insert({
              participant_id: participantId,
              dual_diagnosis: validatedData.medicalInformation.dualDiagnosis || false,
              mat: validatedData.medicalInformation.mat || false,
              mat_medication: validatedData.medicalInformation.matMedication || '',
              mat_medication_other: validatedData.medicalInformation.matMedicationOther || '',
              need_psych_medication: validatedData.medicalInformation.needPsychMedication || false,
              created_by: userId
            });
          
          if (medicalError) {
            logger.error('Failed to insert medical information', { error: medicalError });
            throw new Error(`Failed to insert medical information: ${medicalError.message}`);
          }
          logger.debug('Medical information inserted successfully');
        }
        
        // Insert medications
        if (validatedData.medications && validatedData.medications.length > 0) {
          logger.debug('Inserting medications');
          const medicationsToInsert = validatedData.medications.map(med => ({
            participant_id: participantId,
            medication_name: med,
            created_by: userId
          }));
          
          const { error: medicationsError } = await supabase
            .from('medications')
            .insert(medicationsToInsert);
          
          if (medicationsError) {
            logger.error('Failed to insert medications', { error: medicationsError });
            throw new Error(`Failed to insert medications: ${medicationsError.message}`);
          }
          logger.debug('Medications inserted successfully');
        }
        
        // Insert authorized people
        if (validatedData.authorizedPeople && validatedData.authorizedPeople.length > 0) {
          logger.debug('Inserting authorized people');
          const authorizedPeopleToInsert = validatedData.authorizedPeople.map(person => ({
            participant_id: participantId,
            first_name: person.firstName,
            last_name: person.lastName,
            relationship: person.relationship,
            phone: person.phone,
            created_by: userId
          }));
          
          const { error: authorizedPeopleError } = await supabase
            .from('authorized_people')
            .insert(authorizedPeopleToInsert);
          
          if (authorizedPeopleError) {
            logger.error('Failed to insert authorized people', { error: authorizedPeopleError });
            throw new Error(`Failed to insert authorized people: ${authorizedPeopleError.message}`);
          }
          logger.debug('Authorized people inserted successfully');
        }
        
        // Insert legal status
        if (validatedData.legalStatus) {
          logger.debug('Inserting legal status');
          const { error: legalStatusError } = await supabase
            .from('legal_status')
            .insert({
              participant_id: participantId,
              has_probation_pretrial: validatedData.legalStatus.hasProbationPretrial || false,
              jurisdiction: validatedData.legalStatus.jurisdiction || '',
              other_jurisdiction: validatedData.legalStatus.otherJurisdiction || '',
              has_pending_charges: validatedData.legalStatus.hasPendingCharges || false,
              has_convictions: validatedData.legalStatus.hasConvictions || false,
              is_wanted: validatedData.legalStatus.isWanted || false,
              is_on_bond: validatedData.legalStatus.isOnBond || false,
              bondsman_name: validatedData.legalStatus.bondsmanName || '',
              is_sex_offender: validatedData.legalStatus.isSexOffender || false,
              created_by: userId
            });
          
          if (legalStatusError) {
            logger.error('Failed to insert legal status', { error: legalStatusError });
            throw new Error(`Failed to insert legal status: ${legalStatusError.message}`);
          }
          logger.debug('Legal status inserted successfully');
        }
        
        // Insert ASAM assessment data
        if (validatedData.mentalHealth) {
          logger.debug('Inserting mental health information');
          const { error: mentalHealthError } = await supabase
            .from('mental_health')
            .insert({
              participant_id: participantId,
              entries: validatedData.mentalHealth.entries || [],
              suicidal_ideation: validatedData.mentalHealth.suicidalIdeation || 'no',
              homicidal_ideation: validatedData.mentalHealth.homicidalIdeation || 'no',
              hallucinations: validatedData.mentalHealth.hallucinations || 'no',
              created_by: userId
            });
          
          if (mentalHealthError) {
            logger.error('Failed to insert mental health information', { error: mentalHealthError });
            throw new Error(`Failed to insert mental health information: ${mentalHealthError.message}`);
          }
          logger.debug('Mental health information inserted successfully');
        }
        
        // Insert drug history
        if (validatedData.drugHistory && validatedData.drugHistory.length > 0) {
          logger.debug('Inserting drug history');
          const drugHistoryToInsert = validatedData.drugHistory.map(entry => ({
            participant_id: participantId,
            drug_type: entry.drugType,
            ever_used: entry.everUsed || 'no',
            date_last_use: entry.dateLastUse || '',
            frequency: entry.frequency || '',
            intravenous: entry.intravenous || 'no',
            total_years: entry.totalYears || '',
            amount: entry.amount || '',
            created_by: userId
          }));
          
          const { error: drugHistoryError } = await supabase
            .from('drug_history')
            .insert(drugHistoryToInsert);
          
          if (drugHistoryError) {
            logger.error('Failed to insert drug history', { error: drugHistoryError });
            throw new Error(`Failed to insert drug history: ${drugHistoryError.message}`);
          }
          logger.debug('Drug history inserted successfully');
        }
        
        // Insert signatures
        if (validatedData.signatures && validatedData.signatures.length > 0) {
          logger.debug('Inserting signatures');
          const signaturesToInsert = validatedData.signatures.map((sig: {
            signatureType: string;
            signature: string;
            signatureId: string;
            signatureTimestamp: Date;
            witnessSignature?: string;
            witnessTimestamp?: Date | null;
            witnessSignatureId?: string;
            agreed?: boolean;
            updates?: Record<string, any>;
          }) => ({
            participant_id: participantId,
            signature_type: sig.signatureType,
            signature: sig.signature,
            signature_id: sig.signatureId,
            signature_timestamp: sig.signatureTimestamp,
            witness_signature: sig.witnessSignature || '',
            witness_timestamp: sig.witnessTimestamp || null,
            witness_signature_id: sig.witnessSignatureId || '',
            agreed: sig.agreed || false,
            updates: sig.updates || {},
            created_by: userId
          }));
          
          const { error: signaturesError } = await supabase
            .from('signatures')
            .insert(signaturesToInsert);
          
          if (signaturesError) {
            logger.error('Failed to insert signatures', { error: signaturesError });
            throw new Error(`Failed to insert signatures: ${signaturesError.message}`);
          }
          logger.debug('Signatures inserted successfully');
        }
        
        // Return success response
        logger.info('All data saved successfully');
        return NextResponse.json({
          success: true,
          message: 'Participant data saved successfully',
          data: {
            participant_id: participantId,
            name: `${validatedData.firstName} ${validatedData.lastName}`,
            intake_date: validatedData.intakeDate
          }
        });
      } catch (parseError) {
        // Log the detailed validation error
        logger.error('Schema validation error', { 
          error: parseError, 
          body: JSON.stringify(normalizedBody, null, 2)
        });
        
        return NextResponse.json({
          success: false,
          message: 'Invalid form data',
          error: parseError instanceof Error ? parseError.message : 'Validation failed'
        }, { status: 400 });
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