import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import sql from 'mssql'
import { ConnectionPool, config as SQLConfig } from 'mssql';

async function getConnection() {
  console.log('🔄 Attempting database connection...');
  
  const config: SQLConfig = {
    server: process.env.DB_SERVER!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    options: {
      encrypt: true // Ensures the connection is secure
    }
  };

  try {
    const pool = new sql.ConnectionPool(config);
    const conn = await pool.connect();
    const identity = await pool.request().query('SELECT SYSTEM_USER as identity');
    console.log('🔑 Connected as:', identity.recordset[0].identity);
    return pool;
  } catch (error: any) {
    console.error('❌ Database connection failed:', {
      message: error?.message,
      name: error?.name,
      code: error?.number,
      state: error?.state,
      sql: error?.sql,
      fullError: error
    });
    throw error;
  }
}

export async function POST(request: Request) {
 console.log('📥 Received POST request')
 let connection
 let transaction

 try {
   console.log('🔍 Parsing request body...')
   const body = await request.json()
   console.log('📋 Request body received:', {
     ...body,
     socialSecurityNumber: '[REDACTED]'
   })

   console.log('🔎 Validating data schema...')
   const validatedData = OnboardingSchema.parse(body)
   console.log('✅ Data validation passed')
   
   console.log('🔌 Establishing database connection...')
   connection = await getConnection()
   
   console.log('🔄 Starting transaction...')
   transaction = connection.transaction()
   await transaction.begin()
   console.log('✅ Transaction started')

   // Core participant data
   console.log('📝 Inserting core participant data...')
   const participantResult = await transaction.request()
     .input('firstName', sql.VarChar(100), validatedData.firstName)
     .input('lastName', sql.VarChar(100), validatedData.lastName)
     .input('intakeDate', sql.Date, new Date(validatedData.intakeDate))
     .input('housingLocation', sql.VarChar(100), validatedData.housingLocation)
     .input('dateOfBirth', sql.Date, new Date(validatedData.dateOfBirth))
     .input('sex', sql.VarChar(50), validatedData.sex)
     .input('email', sql.VarChar(255), validatedData.email)
     .input('driversLicenseNumber', sql.VarChar(50), validatedData.driversLicenseNumber)
     .query(`
       INSERT INTO dbo.participants 
       (first_name, last_name, intake_date, housing_location, date_of_birth, sex, email, drivers_license_number, created_at)
       OUTPUT INSERTED.participant_id
       VALUES 
       (@firstName, @lastName, @intakeDate, @housingLocation, @dateOfBirth, @sex, @email, @driversLicenseNumber, GETDATE())
     `)

   const participantId = participantResult.recordset[0].participant_id
   console.log('✅ Core participant data inserted. ID:', participantId)

   // Sensitive Info
   console.log('🔒 Inserting sensitive information...')
   await transaction.request()
     .input('participantId', sql.Int, participantId)
     .input('ssn', sql.VarChar(11), validatedData.socialSecurityNumber)
     .query(`
       INSERT INTO dbo.participant_sensitive_info 
       (participant_id, ssn_encrypted, created_at)
       VALUES 
       (@participantId, ENCRYPTBYPASSPHRASE(@@SERVERNAME, @ssn), GETDATE())
     `)
   console.log('✅ Sensitive information inserted')

   // Vehicle Info
   if (validatedData.vehicleTagNumber || validatedData.vehicleMake || validatedData.vehicleModel) {
     console.log('🚗 Inserting vehicle information...')
     await transaction.request()
       .input('participantId', participantId)
       .input('tagNumber', validatedData.vehicleTagNumber)
       .input('make', validatedData.vehicleMake)
       .input('model', validatedData.vehicleModel)
       .query(`
         INSERT INTO dbo.vehicles 
         (participant_id, tag_number, make, model)
         VALUES 
         (@participantId, @tagNumber, @make, @model)
       `)
     console.log('✅ Vehicle information inserted')
   }

   // Insurance Info
   console.log('🏥 Inserting insurance information...')
   await transaction.request()
     .input('participantId', participantId)
     .input('isInsured', validatedData.insured)
     .input('insuranceType', validatedData.insuranceType)
     .input('policyNumber', validatedData.policyNumber)
     .query(`
       INSERT INTO dbo.insurance 
       (participant_id, is_insured, insurance_type, policy_number)
       VALUES 
       (@participantId, @isInsured, @insuranceType, @policyNumber)
     `)
   console.log('✅ Insurance information inserted')

   // Emergency Contact
   console.log('⚡ Inserting emergency contact...')
   await transaction.request()
     .input('participantId', participantId)
     .input('firstName', validatedData.emergencyContactFirstName)
     .input('lastName', validatedData.emergencyContactLastName)
     .input('phone', validatedData.emergencyContactPhone)
     .input('relationship', validatedData.emergencyContactRelationship)
     .input('otherRelationship', validatedData.otherRelationship)
     .query(`
       INSERT INTO dbo.emergency_contacts 
       (participant_id, first_name, last_name, phone, relationship, other_relationship)
       VALUES 
       (@participantId, @firstName, @lastName, @phone, @relationship, @otherRelationship)
     `)
   console.log('✅ Emergency contact inserted')

   // Medical Info
   console.log('💊 Inserting medical information...')
   await transaction.request()
     .input('participantId', participantId)
     .input('dualDiagnosis', validatedData.dualDiagnosis)
     .input('mat', validatedData.mat)
     .input('matMedication', validatedData.matMedication)
     .input('matMedicationOther', validatedData.matMedicationOther)
     .input('needPsychMedication', validatedData.needPsychMedication)
     .query(`
       INSERT INTO dbo.medical_info 
       (participant_id, dual_diagnosis, mat, mat_medication, mat_medication_other, need_psych_medication)
       VALUES 
       (@participantId, @dualDiagnosis, @mat, @matMedication, @matMedicationOther, @needPsychMedication)
     `)
   console.log('✅ Medical information inserted')

   // Medications
   if (validatedData.medications?.length > 0) {
     console.log('💉 Inserting medications...')
     for (const medication of validatedData.medications) {
       await transaction.request()
         .input('participantId', participantId)
         .input('medicationName', medication)
         .query(`
           INSERT INTO dbo.medications 
           (participant_id, medication_name)
           VALUES 
           (@participantId, @medicationName)
         `)
     }
     console.log('✅ Medications inserted')
   }

   // Legal Info
   console.log('⚖️ Inserting legal information...')
   await transaction.request()
     .input('participantId', participantId)
     .input('hasProbation', validatedData.hasProbationOrPretrial)
     .input('jurisdiction', validatedData.jurisdiction)
     .input('otherJurisdiction', validatedData.otherJurisdiction)
     .query(`
       INSERT INTO dbo.legal_info 
       (participant_id, has_probation_or_pretrial, jurisdiction, other_jurisdiction)
       VALUES 
       (@participantId, @hasProbation, @jurisdiction, @otherJurisdiction)
     `)
   console.log('✅ Legal information inserted')

   // Authorized People
   if (validatedData.authorizedPeople?.length > 0) {
     console.log('👥 Inserting authorized people...')
     for (const person of validatedData.authorizedPeople) {
       await transaction.request()
         .input('participantId', participantId)
         .input('firstName', person.firstName)
         .input('lastName', person.lastName)
         .input('relationship', person.relationship)
         .input('phone', person.phone)
         .query(`
           INSERT INTO dbo.authorized_people 
           (participant_id, first_name, last_name, relationship, phone)
           VALUES 
           (@participantId, @firstName, @lastName, @relationship, @phone)
         `)
     }
     console.log('✅ Authorized people inserted')
   }

   // Consents
   console.log('📝 Inserting consent information...')
   await transaction.request()
     .input('participantId', participantId)
     .input('signature', validatedData.consentSignature)
     .input('agreed', validatedData.consentAgreed)
     .input('timestamp', validatedData.consentTimestamp)
     .input('witnessSignature', validatedData.witnessSignature)
     .input('witnessTimestamp', validatedData.witnessTimestamp)
     .input('signatureId', validatedData.signatureId)
     .query(`
       INSERT INTO dbo.consents 
       (participant_id, consent_signature, consent_agreed, consent_timestamp, witness_signature, witness_timestamp, signature_id)
       VALUES 
       (@participantId, @signature, @agreed, @timestamp, @witnessSignature, @witnessTimestamp, @signatureId)
     `)
   console.log('✅ Consent information inserted')

   console.log('💾 Committing transaction...')
   await transaction.commit()
   console.log('✅ Transaction committed successfully')

   return NextResponse.json({
     success: true,
     message: 'Onboarding data saved successfully',
     data: {
       participant_id: participantId,
       name: `${validatedData.firstName} ${validatedData.lastName}`,
       intake_date: validatedData.intakeDate
     }
   })

 } catch (error: any) {
   console.error('❌ API Error:', {
     message: error?.message,
     name: error?.name,
     code: error?.number,
     state: error?.state,
     sql: error?.sql,
     stack: error?.stack,
     fullError: error
   });

   if (error.name === 'ZodError') {
     console.error('📋 Validation errors:', error.errors)
   }

   if (transaction) {
     console.log('↩️ Rolling back transaction...')
     await transaction.rollback()
     console.log('✅ Transaction rolled back')
   }

   return NextResponse.json({
     success: false,
     message: 'Failed to process onboarding data',
     error: `${error?.message} - ${error?.code || 'No code'} - ${error?.state || 'No state'}`,
     details: JSON.stringify(error, null, 2)
   }, { status: 500 })
 } finally {
   if (connection) {
     console.log('🔌 Closing database connection...')
     await connection.close()
     console.log('✅ Database connection closed')
   }
 }
}