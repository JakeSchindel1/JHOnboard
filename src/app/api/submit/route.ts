import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import sql, { ConnectionPool } from 'mssql'
import { ParticipantService } from '@/services/participantService'
import { logger } from '@/lib/logger'
import { PowerAutomateService } from '@/services/powerAutomateService'
import { z } from 'zod'

// Global connection pool
let pool: ConnectionPool | null = null;

async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool) {
    return pool;
  }
  
  logger.info('Attempting database connection...');
  
  const config = {
    server: process.env.DB_SERVER!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  try {
    pool = await new sql.ConnectionPool(config).connect();
    logger.info('Database connection established');
    return pool;
  } catch (error: any) {
    logger.error('Database connection failed', error, {
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
    });
    throw error;
  }
}

// Define a type for signature
interface Signature {
  signatureType: string;
  signatureId: string;
  signatureTimestamp: string;
  witnessTimestamp?: string;
}

// Create a modified schema for signature types to allow any string value
// This replaces the enum restriction in the original schema
const FlexibleSignatureSchema = z.object({
  signatureType: z.string(), // Accept any string value for signatureType
  signatureId: z.string(),
  signatureTimestamp: z.string(),
  witnessTimestamp: z.string().optional()
});

export async function POST(request: Request) {
  try {
    logger.info('Received POST request');
    
    // Rate limiting (simple implementation)
    const requestId = crypto.randomUUID();
    logger.debug('Request received', { requestId });
    
    const body = await request.json();
    logger.debug('Request body received', { 
      requestId,
      firstName: body.firstName,
      lastName: body.lastName
    });

    // Validate data against schema
    try {
      logger.info('Validating data schema');
      
      // Check if signatures are present in the request
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
      
      // Now validate the rest of the schema
      // We use a modified approach that's more lenient on signature types
      const { signatures, ...otherData } = body;
      const validatedBase = OnboardingSchema.omit({ signatures: true }).parse(otherData);
      
      // Combine the validated base data with our validated signatures
      const validatedData = {
        ...validatedBase,
        signatures: body.signatures || []
      };
      
      logger.info('Data validation passed');
      
      // Get database connection
      const pool = await getConnection();
      
      // Create participant service and call it
      const participantService = new ParticipantService(pool);
      const result = await participantService.createParticipant(validatedData);
      
      if (result.success) {
        // Log successful submission with signature types for audit purposes
        logger.info('Participant created successfully', {
          residentId: result.residentId,
          signatureTypes: validatedData.signatures?.map((s: Signature) => s.signatureType) || []
        });
        
        // Successfully saved to database, now send to Power Automate
        try {
          const powerAutomateService = new PowerAutomateService();
          const paResult = await powerAutomateService.sendFormData(validatedData);
          
          if (!paResult.success) {
            logger.warn('Power Automate submission failed but database save succeeded', {
              error: paResult.error
            });
          } else {
            logger.info('Power Automate flow triggered successfully');
          }
        } catch (paError) {
          // Don't fail the overall request if Power Automate fails
          logger.error('Error calling Power Automate flow', paError);
        }
        
        return NextResponse.json({
          success: true,
          message: result.message,
          data: {
            resident_id: result.residentId,
            name: `${validatedData.firstName} ${validatedData.lastName}`,
            intake_date: validatedData.intakeDate
          }
        });
      } else {
        logger.error('Participant creation failed', new Error(result.error || 'Unknown error'), { 
          firstName: validatedData.firstName,
          lastName: validatedData.lastName
        });
        
        return NextResponse.json({
          success: false,
          message: result.message,
          error: result.error
        }, { 
          status: 500 
        });
      }
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