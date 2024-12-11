import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import sql, { ConnectionPool } from 'mssql'

// Global connection pool
let pool: ConnectionPool | null = null;

async function getConnection() {
  if (pool) {
    return pool;
  }
  
  console.log('🔄 Attempting database connection...');
  
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
    console.log('✅ Database connection established');
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
  let transaction: sql.Transaction | undefined;
  
  try {
    console.log('📥 Received POST request');
    
    // Parse and validate request body
    const body = await request.json();
    console.log('📋 Request body received:', {
      ...body,
      socialSecurityNumber: '[REDACTED]'
    });

    console.log('🔎 Validating data schema...');
    const validatedData = OnboardingSchema.parse(body);
    console.log('✅ Data validation passed');

    // Get database connection
    const pool = await getConnection();
    
    // Initialize transaction
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    console.log('✅ Transaction started');

    // Core participant data
    console.log('📝 Inserting core participant data...');
    const participantResult = await transaction.request()
      .input('firstName', sql.VarChar(100), validatedData.firstName)
      .input('lastName', sql.VarChar(100), validatedData.lastName)
      .input('intakeDate', sql.Date, validatedData.intakeDate)
      .input('housingLocation', sql.VarChar(100), validatedData.housingLocation)
      .input('dateOfBirth', sql.Date, validatedData.dateOfBirth)
      .input('sex', sql.VarChar(50), validatedData.sex)
      .input('email', sql.VarChar(255), validatedData.email)
      .input('driversLicenseNumber', sql.VarChar(50), validatedData.driversLicenseNumber)
      .query(`
        INSERT INTO dbo.participants 
        (first_name, last_name, intake_date, housing_location, date_of_birth, sex, email, drivers_license_number, created_at)
        OUTPUT INSERTED.participant_id
        VALUES 
        (@firstName, @lastName, @intakeDate, @housingLocation, @dateOfBirth, @sex, @email, @driversLicenseNumber, GETDATE())
      `);

    const participantId = participantResult.recordset[0].participant_id;
    console.log('✅ Core participant data inserted. ID:', participantId);

    // Sensitive Info
    console.log('🔒 Inserting sensitive information...');
    await transaction.request()
      .input('participantId', sql.Int, participantId)
      .input('ssn', sql.VarChar(11), validatedData.socialSecurityNumber)
      .query(`
        INSERT INTO dbo.participant_sensitive_info 
        (participant_id, ssn_encrypted, created_at)
        VALUES 
        (@participantId, ENCRYPTBYPASSPHRASE(@@SERVERNAME, @ssn), GETDATE())
      `);
    console.log('✅ Sensitive information inserted');

    // Vehicle Info (if provided)
    if (validatedData.vehicleTagNumber || validatedData.vehicleMake || validatedData.vehicleModel) {
      console.log('🚗 Inserting vehicle information...');
      await transaction.request()
        .input('participantId', sql.Int, participantId)
        .input('tagNumber', sql.VarChar(50), validatedData.vehicleTagNumber)
        .input('make', sql.VarChar(100), validatedData.vehicleMake)
        .input('model', sql.VarChar(100), validatedData.vehicleModel)
        .query(`
          INSERT INTO dbo.vehicles 
          (participant_id, tag_number, make, model)
          VALUES 
          (@participantId, @tagNumber, @make, @model)
        `);
      console.log('✅ Vehicle information inserted');
    }

    // Insurance Info
    console.log('🏥 Inserting insurance information...');
    await transaction.request()
      .input('participantId', sql.Int, participantId)
      .input('isInsured', sql.Bit, validatedData.insured)
      .input('insuranceType', sql.VarChar(100), validatedData.insuranceType)
      .input('policyNumber', sql.VarChar(100), validatedData.policyNumber)
      .query(`
        INSERT INTO dbo.insurance 
        (participant_id, is_insured, insurance_type, policy_number)
        VALUES 
        (@participantId, @isInsured, @insuranceType, @policyNumber)
      `);
    console.log('✅ Insurance information inserted');

    // Emergency Contact
    console.log('⚡ Inserting emergency contact...');
    await transaction.request()
      .input('participantId', sql.Int, participantId)
      .input('firstName', sql.VarChar(100), validatedData.emergencyContactFirstName)
      .input('lastName', sql.VarChar(100), validatedData.emergencyContactLastName)
      .input('phone', sql.VarChar(15), validatedData.emergencyContactPhone)
      .input('relationship', sql.VarChar(100), validatedData.emergencyContactRelationship)
      .input('otherRelationship', sql.VarChar(100), validatedData.otherRelationship)
      .query(`
        INSERT INTO dbo.emergency_contacts 
        (participant_id, first_name, last_name, phone, relationship, other_relationship)
        VALUES 
        (@participantId, @firstName, @lastName, @phone, @relationship, @otherRelationship)
      `);
    console.log('✅ Emergency contact inserted');

    // Medical Info
    console.log('💊 Inserting medical information...');
    await transaction.request()
      .input('participantId', sql.Int, participantId)
      .input('dualDiagnosis', sql.Bit, validatedData.dualDiagnosis)
      .input('mat', sql.Bit, validatedData.mat)
      .input('matMedication', sql.VarChar(100), validatedData.matMedication)
      .input('matMedicationOther', sql.VarChar(100), validatedData.matMedicationOther)
      .input('needPsychMedication', sql.Bit, validatedData.needPsychMedication)
      .query(`
        INSERT INTO dbo.medical_info 
        (participant_id, dual_diagnosis, mat, mat_medication, mat_medication_other, need_psych_medication)
        VALUES 
        (@participantId, @dualDiagnosis, @mat, @matMedication, @matMedicationOther, @needPsychMedication)
      `);
    console.log('✅ Medical information inserted');

    // Health Status
    console.log('🏥 Inserting health status information...');
    const healthStatusResult = await transaction.request()
      .input('participantId', sql.Int, participantId)
      .input('pregnant', sql.Bit, validatedData.healthStatus.pregnant)
      .input('developmentallyDisabled', sql.Bit, validatedData.healthStatus.developmentallyDisabled)
      .input('coOccurringDisorder', sql.Bit, validatedData.healthStatus.coOccurringDisorder)
      .input('docSupervision', sql.Bit, validatedData.healthStatus.docSupervision)
      .input('felon', sql.Bit, validatedData.healthStatus.felon)
      .input('physicallyHandicapped', sql.Bit, validatedData.healthStatus.physicallyHandicapped)
      .input('postPartum', sql.Bit, validatedData.healthStatus.postPartum)
      .input('primaryFemaleCaregiver', sql.Bit, validatedData.healthStatus.primaryFemaleCaregiver)
      .input('recentlyIncarcerated', sql.Bit, validatedData.healthStatus.recentlyIncarcerated)
      .input('sexOffender', sql.Bit, validatedData.healthStatus.sexOffender)
      .input('lgbtq', sql.Bit, validatedData.healthStatus.lgbtq)
      .input('veteran', sql.Bit, validatedData.healthStatus.veteran)
      .input('insulinDependent', sql.Bit, validatedData.healthStatus.insulinDependent)
      .input('historyOfSeizures', sql.Bit, validatedData.healthStatus.historyOfSeizures)
      .query(`
        INSERT INTO dbo.health_status 
        (participant_id, pregnant, developmentally_disabled, co_occurring_disorder,
         doc_supervision, felon, physically_handicapped, post_partum,
         primary_female_caregiver, recently_incarcerated, sex_offender,
         lgbtq, veteran, insulin_dependent, history_of_seizures)
        OUTPUT INSERTED.health_status_id
        VALUES 
        (@participantId, @pregnant, @developmentallyDisabled, @coOccurringDisorder,
         @docSupervision, @felon, @physicallyHandicapped, @postPartum,
         @primaryFemaleCaregiver, @recentlyIncarcerated, @sexOffender,
         @lgbtq, @veteran, @insulinDependent, @historyOfSeizures)
      `);
    
    const healthStatusId = healthStatusResult.recordset[0].health_status_id;
    console.log('✅ Health status information inserted');

    // Health Status Others (if any)
    if (validatedData.healthStatus.others?.length > 0) {
      console.log('🏥 Inserting other health status items...');
      for (const other of validatedData.healthStatus.others) {
        await transaction.request()
          .input('healthStatusId', sql.Int, healthStatusId)
          .input('description', sql.VarChar(255), other)
          .query(`
            INSERT INTO dbo.health_status_others 
            (health_status_id, description)
            VALUES 
            (@healthStatusId, @description)
          `);
      }
      console.log('✅ Other health status items inserted');
    }

    // Medications (if any)
    if (validatedData.medications?.length > 0) {
      console.log('💉 Inserting medications...');
      for (const medication of validatedData.medications) {
        await transaction.request()
          .input('participantId', sql.Int, participantId)
          .input('medicationName', sql.VarChar(255), medication)
          .query(`
            INSERT INTO dbo.medications 
            (participant_id, medication_name)
            VALUES 
            (@participantId, @medicationName)
          `);
      }
      console.log('✅ Medications inserted');
    }

    // Legal Info
    console.log('⚖️ Inserting legal information...');
    await transaction.request()
      .input('participantId', sql.Int, participantId)
      .input('hasProbation', sql.Bit, validatedData.hasProbationOrPretrial)
      .input('jurisdiction', sql.VarChar(100), validatedData.jurisdiction)
      .input('otherJurisdiction', sql.VarChar(100), validatedData.otherJurisdiction)
      .query(`
        INSERT INTO dbo.legal_info 
        (participant_id, has_probation_or_pretrial, jurisdiction, other_jurisdiction)
        VALUES 
        (@participantId, @hasProbation, @jurisdiction, @otherJurisdiction)
      `);
    console.log('✅ Legal information inserted');

    // Authorized People (if any)
    if (validatedData.authorizedPeople?.length > 0) {
      console.log('👥 Inserting authorized people...');
      for (const person of validatedData.authorizedPeople) {
        await transaction.request()
          .input('participantId', sql.Int, participantId)
          .input('firstName', sql.VarChar(100), person.firstName)
          .input('lastName', sql.VarChar(100), person.lastName)
          .input('relationship', sql.VarChar(100), person.relationship)
          .input('phone', sql.VarChar(15), person.phone)
          .query(`
            INSERT INTO dbo.authorized_people 
            (participant_id, first_name, last_name, relationship, phone)
            VALUES 
            (@participantId, @firstName, @lastName, @relationship, @phone)
          `);
      }
      console.log('✅ Authorized people inserted');
    }

    // Consents
    console.log('📝 Inserting consent information...');
    await transaction.request()
      .input('participantId', sql.Int, participantId)
      .input('signature', sql.VarChar(255), validatedData.consentSignature)
      .input('agreed', sql.Bit, validatedData.consentAgreed)
      .input('timestamp', sql.DateTime, validatedData.consentTimestamp)
      .input('witnessSignature', sql.VarChar(255), validatedData.witnessSignature)
      .input('witnessTimestamp', sql.DateTime, validatedData.witnessTimestamp)
      .input('signatureId', sql.VarChar(100), validatedData.signatureId)
      .query(`
        INSERT INTO dbo.consents 
        (participant_id, consent_signature, consent_agreed, consent_timestamp, 
         witness_signature, witness_timestamp, signature_id)
        VALUES 
        (@participantId, @signature, @agreed, @timestamp, 
         @witnessSignature, @witnessTimestamp, @signatureId)
      `);
    console.log('✅ Consent information inserted');

    // Treatment Consent (if provided)
    if (validatedData.treatmentSignature) {
      console.log('📝 Inserting treatment consent information...');
      await transaction.request()
        .input('participantId', sql.Int, participantId)
        .input('signature', sql.VarChar(255), validatedData.treatmentSignature)
        .input('agreed', sql.Bit, validatedData.treatmentAgreed)
        .input('timestamp', sql.DateTime, validatedData.treatmentTimestamp)
        .input('witnessSignature', sql.VarChar(255), validatedData.treatmentwitnessSignature)
        .input('witnessTimestamp', sql.DateTime, validatedData.treatmentwitnessTimestamp)
        .input('signatureId', sql.VarChar(100), validatedData.treatmentsignatureId)
        .query(`
          INSERT INTO dbo.treatment_consents 
          (participant_id, treatment_signature, treatment_agreed, treatment_timestamp,
           treatment_witness_signature, treatment_witness_timestamp, treatment_signature_id)
          VALUES 
          (@participantId, @signature, @agreed, @timestamp,
           @witnessSignature, @witnessTimestamp, @signatureId)
        `);
      console.log('✅ Treatment consent information inserted');
    }

    // Price Consent (if provided)
    if (validatedData.priceConsentSignature) {
      console.log('📝 Inserting price consent information...');
      await transaction.request()
        .input('participantId', sql.Int, participantId)
        .input('signature', sql.VarChar(255), validatedData.priceConsentSignature)
        .input('agreed', sql.Bit, validatedData.priceConsentAgreed)
        .input('timestamp', sql.DateTime, validatedData.priceConsentTimestamp)
        .input('witnessSignature', sql.VarChar(255), validatedData.priceWitnessSignature)
        .input('witnessTimestamp', sql.DateTime, validatedData.priceWitnessTimestamp)
        .input('signatureId', sql.VarChar(100), validatedData.priceSignatureId)
        .query(`
          INSERT INTO dbo.price_consents 
          (participant_id, price_consent_signature, price_consent_agreed, price_consent_timestamp,
           price_witness_signature, price_witness_timestamp, price_signature_id)
          VALUES 
          (@participantId, @signature, @agreed, @timestamp,
           @witnessSignature, @witnessTimestamp, @signatureId)
        `);
      console.log('✅ Price consent information inserted');
    }

    // Commit transaction
    console.log('💾 Committing transaction...');
    await transaction.commit();
    console.log('✅ Transaction committed successfully');

    return NextResponse.json({
      success: true,
      message: 'Onboarding data saved successfully',
      data: {
        participant_id: participantId,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        intake_date: validatedData.intakeDate
      }
    });

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
      console.error('📋 Validation errors:', error.errors);
    }

    if (transaction) {
      console.log('↩️ Rolling back transaction...');
      await transaction.rollback();
      console.log('✅ Transaction rolled back');
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to process onboarding data',
      error: `${error?.message} - ${error?.code || 'No code'} - ${error?.state || 'No state'}`,
      details: error.errors || error.message
    }, { 
      status: 500 
    });
  }
}