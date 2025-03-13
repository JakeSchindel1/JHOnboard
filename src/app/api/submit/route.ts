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
    logger.info('Received POST request');
    
    const requestId = crypto.randomUUID();
    logger.debug('Request received', { requestId });
    
    // Get Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    logger.info('User authentication status', { 
      authenticated: !!user,
      userId: userId || 'anonymous'
    });
    
    const body = await request.json();
    logger.debug('Request body received', { 
      requestId,
      firstName: body.firstName,
      lastName: body.lastName
    });

    try {
      logger.info('Validating data schema');
      
      // Validate signatures (same as before)
      if (body.signatures && Array.isArray(body.signatures)) {
        logger.info(`Found ${body.signatures.length} signatures to validate`);
        
        // Validate each signature directly
        const validatedSignatures: Signature[] = [];
        for (const signature of body.signatures) {
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
        body.signatures = validatedSignatures;
        logger.info(`Validated ${validatedSignatures.length} signatures`);
      }
      
      // Validate rest of schema (unchanged)
      const { signatures, ...otherData } = body;
      const validatedBase = OnboardingSchema.omit({ signatures: true }).parse(otherData);
      
      // Combine data (unchanged)
      const validatedData = {
        ...validatedBase,
        signatures: body.signatures || []
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
        throw new Error(`Failed to insert participant: ${participantError.message}`);
      }
      
      const participantId = participant.id;
      
      // Insert health status
      const { error: healthError } = await supabase
        .from('health_status')
        .insert({
          participant_id: participantId,
          pregnant: validatedData.healthStatus.pregnant,
          developmentally_disabled: validatedData.healthStatus.developmentallyDisabled,
          // ... other health fields ...
          created_by: userId
        });
      
      if (healthError) {
        throw new Error(`Failed to insert health status: ${healthError.message}`);
      }
      
      // ... Continue with other inserts (vehicle, emergency contacts, etc.) ...
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Participant data saved successfully',
        data: {
          participant_id: participantId,
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          intake_date: validatedData.intakeDate
        }
      });
      
    } catch (validationError: any) {
      logger.error('Validation error', validationError);
      
      return NextResponse.json({
        success: false,
        message: 'Invalid data submitted',
        error: validationError.message,
        details: validationError.errors || validationError.message
      }, { 
        status: 400 
      });
    }
  } catch (error: any) {
    logger.error('Unhandled API error', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to process request',
      error: 'An unexpected error occurred'
    }, { 
      status: 500 
    });
  }
}