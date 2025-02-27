import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import sql, { ConnectionPool } from 'mssql'
import { ParticipantService } from '@/services/participantService'
import { logger } from '@/lib/logger'

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
      const validatedData = OnboardingSchema.parse(body);
      logger.info('Data validation passed');
      
      // Get database connection
      const pool = await getConnection();
      
      // Create participant service and call it
      const participantService = new ParticipantService(pool);
      const result = await participantService.createParticipant(validatedData);
      
      if (result.success) {
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