import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import { ZodError } from 'zod'
import sql from 'mssql' 

// Create a connection using Managed Identity
const getConnection = async () => {
  try {
    const connectionString = process.env.DB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Database connection string not found');
    }
    return await sql.connect(connectionString);
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
};


export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json()
    console.log('Received data:', {
      ...body,
      socialSecurityNumber: '[REDACTED]'  // Log data but protect sensitive info
    });
    
    const validatedData = OnboardingSchema.parse(body)
    console.log('Data validation passed');
    
    connection = await getConnection();
    const transaction = connection.transaction();
    console.log('Starting transaction...');

    try {
      await transaction.begin();

      // 1. Insert main participant record with explicit parameter types
      console.log('Attempting to insert participant record...');
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
        `);

      const participantId = participantResult.recordset[0].participant_id;
      console.log('Participant inserted successfully, ID:', participantId);

      // 2. Insert sensitive info
      console.log('Inserting sensitive info...');
      await transaction.request()
        .input('participantId', sql.Int, participantId)
        .input('ssn', sql.VarChar(11), validatedData.socialSecurityNumber)
        .query(`
          INSERT INTO dbo.participant_sensitive_info 
          (participant_id, ssn_encrypted, created_at)
          VALUES 
          (@participantId, ENCRYPTBYPASSPHRASE(@@SERVERNAME, @ssn), GETDATE())
        `);

      // 3. Insert vehicle info if provided
      if (validatedData.vehicleTagNumber || validatedData.vehicleMake || validatedData.vehicleModel) {
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
          `);
      }

      // 4. Insert insurance info
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
        `);

      // 5. Insert emergency contact
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
        `);

      // 6. Insert medical info
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
        `);

      // 7. Insert medications
      if (validatedData.medications && validatedData.medications.length > 0) {
        for (const medication of validatedData.medications) {
          await transaction.request()
            .input('participantId', participantId)
            .input('medicationName', medication)
            .query(`
              INSERT INTO dbo.medications 
              (participant_id, medication_name)
              VALUES 
              (@participantId, @medicationName)
            `);
        }
      }

      // 8. Insert legal info
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
        `);

      // 9. Insert authorized people
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
          `);
      }

      // 10. Insert consent info
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
        `);

      // 11. Insert medication consent
      await transaction.request()
        .input('participantId', participantId)
        .input('signature', validatedData.medicationSignature)
        .input('signatureDate', validatedData.medicationSignatureDate)
        .input('witnessSignature', validatedData.medicationWitnessSignature)
        .input('witnessTimestamp', validatedData.medicationWitnessTimestamp)
        .input('signatureId', validatedData.medicationSignatureId)
        .query(`
          INSERT INTO dbo.medication_consents 
          (participant_id, medication_signature, medication_signature_date, medication_witness_signature, medication_witness_timestamp, medication_signature_id)
          VALUES 
          (@participantId, @signature, @signatureDate, @witnessSignature, @witnessTimestamp, @signatureId)
        `);

      // 12. Insert treatment consent if provided
      if (validatedData.treatmentSignature) {
        await transaction.request()
          .input('participantId', participantId)
          .input('signature', validatedData.treatmentSignature)
          .input('agreed', validatedData.treatmentAgreed)
          .input('timestamp', validatedData.treatmentTimestamp)
          .input('witnessSignature', validatedData.treatmentwitnessSignature)
          .input('witnessTimestamp', validatedData.treatmentwitnessTimestamp)
          .input('signatureId', validatedData.treatmentsignatureId)
          .query(`
            INSERT INTO dbo.treatment_consents 
            (participant_id, treatment_signature, treatment_agreed, treatment_timestamp, treatment_witness_signature, treatment_witness_timestamp, treatment_signature_id)
            VALUES 
            (@participantId, @signature, @agreed, @timestamp, @witnessSignature, @witnessTimestamp, @signatureId)
          `);
      }

      // 13. Insert price consent if provided
      if (validatedData.priceConsentSignature) {
        await transaction.request()
          .input('participantId', participantId)
          .input('signature', validatedData.priceConsentSignature)
          .input('agreed', validatedData.priceConsentAgreed)
          .input('timestamp', validatedData.priceConsentTimestamp)
          .input('witnessSignature', validatedData.priceWitnessSignature)
          .input('witnessTimestamp', validatedData.priceWitnessTimestamp)
          .input('signatureId', validatedData.priceSignatureId)
          .query(`
            INSERT INTO dbo.price_consents 
            (participant_id, price_consent_signature, price_consent_agreed, price_consent_timestamp, price_witness_signature, price_witness_timestamp, price_signature_id)
            VALUES 
            (@participantId, @signature, @agreed, @timestamp, @witnessSignature, @witnessTimestamp, @signatureId)
          `);
      }

      await transaction.commit();
      console.log('Transaction committed successfully');

      return NextResponse.json({
        success: true,
        message: 'Onboarding data saved successfully',
        data: {
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          intake_date: validatedData.intakeDate,
          participant_id: participantId
        }
      });

    } catch (error) {
      console.error('Transaction error details:', error);
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error details:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to process onboarding data',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: JSON.stringify(error, Object.getOwnPropertyNames(error))  // Better error serialization
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}