import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import sql, { ConnectionPool } from 'mssql'

// Global connection pool
let pool: ConnectionPool | null = null;

async function getConnection(): Promise<sql.ConnectionPool> {
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
    
    const body = await request.json();
    console.log('📋 Request body received:', {
      ...body,
      socialSecurityNumber: '[REDACTED]'
    });

    console.log('🔎 Validating data schema...');
    const validatedData = OnboardingSchema.parse(body);
    console.log('✅ Data validation passed');

    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    console.log('✅ Transaction started');

    // Insert resident data
    const residentResult = await transaction.request()
      .input('firstName', sql.VarChar(100), validatedData.firstName)
      .input('lastName', sql.VarChar(100), validatedData.lastName)
      .input('intakeDate', sql.Date, validatedData.intakeDate)
      .input('housingLocation', sql.VarChar(50), validatedData.housingLocation)
      .input('dateOfBirth', sql.Date, validatedData.dateOfBirth)
      .input('ssn', sql.VarChar(11), validatedData.socialSecurityNumber)
      .input('sex', sql.VarChar(10), validatedData.sex)
      .input('email', sql.VarChar(255), validatedData.email)
      .input('driversLicense', sql.VarChar(50), validatedData.driversLicenseNumber)
      .query(`
        INSERT INTO residents 
        (first_name, last_name, intake_date, housing_location, date_of_birth, 
         social_security_number, sex, email, drivers_license_number)
        OUTPUT INSERTED.id
        VALUES 
        (@firstName, @lastName, @intakeDate, @housingLocation, @dateOfBirth,
         @ssn, @sex, @email, @driversLicense)
      `);

    const residentId = residentResult.recordset[0].id;

    // Insert health status
    await transaction.request()
      .input('residentId', sql.Int, residentId)
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
      .input('race', sql.VarChar(50), validatedData.healthStatus.race)
      .input('ethnicity', sql.VarChar(50), validatedData.healthStatus.ethnicity)
      .input('householdIncome', sql.VarChar(50), validatedData.healthStatus.householdIncome)
      .input('employmentStatus', sql.VarChar(50), validatedData.healthStatus.employmentStatus)
      .query(`
        INSERT INTO health_status
        (resident_id, pregnant, developmentally_disabled, co_occurring_disorder,
         doc_supervision, felon, physically_handicapped, post_partum,
         primary_female_caregiver, recently_incarcerated, sex_offender,
         lgbtq, veteran, insulin_dependent, history_of_seizures,
         race, ethnicity, household_income, employment_status)
        VALUES
        (@residentId, @pregnant, @developmentallyDisabled, @coOccurringDisorder,
         @docSupervision, @felon, @physicallyHandicapped, @postPartum,
         @primaryFemaleCaregiver, @recentlyIncarcerated, @sexOffender,
         @lgbtq, @veteran, @insulinDependent, @historyOfSeizures,
         @race, @ethnicity, @householdIncome, @employmentStatus)
      `);

    // Insert vehicle information if provided
    if (validatedData.vehicle) {
      await transaction.request()
        .input('residentId', sql.Int, residentId)
        .input('make', sql.VarChar(50), validatedData.vehicle.make)
        .input('model', sql.VarChar(50), validatedData.vehicle.model)
        .input('tagNumber', sql.VarChar(50), validatedData.vehicle.tagNumber)
        .input('insured', sql.Bit, validatedData.vehicle.insured)
        .input('insuranceType', sql.VarChar(50), validatedData.vehicle.insuranceType)
        .input('policyNumber', sql.VarChar(100), validatedData.vehicle.policyNumber)
        .query(`
          INSERT INTO vehicles
          (resident_id, make, model, tag_number, insured, insurance_type, policy_number)
          VALUES
          (@residentId, @make, @model, @tagNumber, @insured, @insuranceType, @policyNumber)
        `);
    }

    // Insert emergency contact
    await transaction.request()
      .input('residentId', sql.Int, residentId)
      .input('firstName', sql.VarChar(100), validatedData.emergencyContact.firstName)
      .input('lastName', sql.VarChar(100), validatedData.emergencyContact.lastName)
      .input('phone', sql.VarChar(20), validatedData.emergencyContact.phone)
      .input('relationship', sql.VarChar(50), validatedData.emergencyContact.relationship)
      .input('otherRelationship', sql.VarChar(100), validatedData.emergencyContact.otherRelationship)
      .query(`
        INSERT INTO emergency_contacts
        (resident_id, first_name, last_name, phone, relationship, other_relationship)
        VALUES
        (@residentId, @firstName, @lastName, @phone, @relationship, @otherRelationship)
      `);

    // Insert medical information
    await transaction.request()
      .input('residentId', sql.Int, residentId)
      .input('dualDiagnosis', sql.Bit, validatedData.medicalInformation.dualDiagnosis)
      .input('mat', sql.Bit, validatedData.medicalInformation.mat)
      .input('matMedication', sql.VarChar(100), validatedData.medicalInformation.matMedication)
      .input('matMedicationOther', sql.VarChar(100), validatedData.medicalInformation.matMedicationOther)
      .input('needPsychMedication', sql.Bit, validatedData.medicalInformation.needPsychMedication)
      .query(`
        INSERT INTO medical_information
        (resident_id, dual_diagnosis, mat, mat_medication, mat_medication_other, need_psych_medication)
        VALUES
        (@residentId, @dualDiagnosis, @mat, @matMedication, @matMedicationOther, @needPsychMedication)
      `);

    // Insert medications
    if (validatedData.medications && validatedData.medications.length > 0) {
      for (const medication of validatedData.medications) {
        await transaction.request()
          .input('residentId', sql.Int, residentId)
          .input('medicationName', sql.VarChar(255), medication)
          .query(`
            INSERT INTO medications
            (resident_id, medication_name)
            VALUES
            (@residentId, @medicationName)
          `);
      }
    }

    // Insert authorized people
    if (validatedData.authorizedPeople && validatedData.authorizedPeople.length > 0) {
      for (const person of validatedData.authorizedPeople) {
        await transaction.request()
          .input('residentId', sql.Int, residentId)
          .input('firstName', sql.VarChar(100), person.firstName)
          .input('lastName', sql.VarChar(100), person.lastName)
          .input('relationship', sql.VarChar(50), person.relationship)
          .input('phone', sql.VarChar(20), person.phone)
          .query(`
            INSERT INTO authorized_people
            (resident_id, first_name, last_name, relationship, phone)
            VALUES
            (@residentId, @firstName, @lastName, @relationship, @phone)
          `);
      }
    }

    // Insert legal status
    await transaction.request()
      .input('residentId', sql.Int, residentId)
      .input('hasProbationPretrial', sql.Bit, validatedData.legalStatus.hasProbationPretrial)
      .input('jurisdiction', sql.VarChar(100), validatedData.legalStatus.jurisdiction)
      .input('otherJurisdiction', sql.VarChar(100), validatedData.legalStatus.otherJurisdiction)
      .input('hasPendingCharges', sql.Bit, validatedData.legalStatus.hasPendingCharges)
      .input('hasConvictions', sql.Bit, validatedData.legalStatus.hasConvictions)
      .input('isWanted', sql.Bit, validatedData.legalStatus.isWanted)
      .input('isOnBond', sql.Bit, validatedData.legalStatus.isOnBond)
      .input('bondsmanName', sql.VarChar(100), validatedData.legalStatus.bondsmanName)
      .input('isSexOffender', sql.Bit, validatedData.legalStatus.isSexOffender)
      .query(`
        INSERT INTO legal_status
        (resident_id, has_probation_pretrial, jurisdiction, other_jurisdiction,
         has_pending_charges, has_convictions, is_wanted, is_on_bond,
         bondsman_name, is_sex_offender)
        VALUES
        (@residentId, @hasProbationPretrial, @jurisdiction, @otherJurisdiction,
         @hasPendingCharges, @hasConvictions, @isWanted, @isOnBond,
         @bondsmanName, @isSexOffender)
      `);

    // Insert pending charges
    if (validatedData.pendingCharges && validatedData.pendingCharges.length > 0) {
      for (const charge of validatedData.pendingCharges) {
        await transaction.request()
          .input('residentId', sql.Int, residentId)
          .input('chargeDescription', sql.Text, charge.chargeDescription)
          .input('location', sql.VarChar(255), charge.location)
          .query(`
            INSERT INTO pending_charges
            (resident_id, charge_description, location)
            VALUES
            (@residentId, @chargeDescription, @location)
          `);
      }
    }

    // Insert convictions
    if (validatedData.convictions && validatedData.convictions.length > 0) {
      for (const conviction of validatedData.convictions) {
        await transaction.request()
          .input('residentId', sql.Int, residentId)
          .input('offense', sql.Text, conviction.offense)
          .query(`
            INSERT INTO convictions
            (resident_id, offense)
            VALUES
            (@residentId, @offense)
          `);
      }
    }

    // Insert signatures
    if (validatedData.signatures && validatedData.signatures.length > 0) {
      for (const signature of validatedData.signatures) {
        await transaction.request()
          .input('residentId', sql.Int, residentId)
          .input('signatureType', sql.VarChar(50), signature.signatureType)
          .input('signature', sql.Text, signature.signature)
          .input('signatureTimestamp', sql.DateTime2, signature.signatureTimestamp)
          .input('signatureId', sql.VarChar(100), signature.signatureId)
          .input('witnessSignature', sql.Text, signature.witnessSignature)
          .input('witnessTimestamp', sql.DateTime2, signature.witnessTimestamp)
          .input('witnessSignatureId', sql.VarChar(100), signature.witnessSignatureId)
          .input('agreed', sql.Bit, signature.agreed)
          .query(`
            INSERT INTO signatures
            (resident_id, signature_type, signature, signature_timestamp,
             signature_id, witness_signature, witness_timestamp,
             witness_signature_id, agreed)
            VALUES
            (@residentId, @signatureType, @signature, @signatureTimestamp,
             @signatureId, @witnessSignature, @witnessTimestamp,
             @witnessSignatureId, @agreed)
          `);
      }
    }

    await transaction.commit();

    return NextResponse.json({
      success: true,
      message: 'Resident data saved successfully',
      data: {
        resident_id: residentId,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        intake_date: validatedData.intakeDate
      }
    });

  } catch (error: any) {
    console.error('❌ API Error:', error);

    if (transaction) {
      await transaction.rollback();
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to process resident data',
      error: error.message,
      details: error.errors || error.message
    }, { 
      status: 500 
    });
  }
}