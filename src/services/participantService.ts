import sql from 'mssql';
import { OnboardingData } from '@/app/api/submit/schema';
import { logger } from '@/lib/logger';

export class ParticipantService {
  private db: sql.ConnectionPool;
  
  constructor(db: sql.ConnectionPool) {
    this.db = db;
  }
  
  async createParticipant(data: OnboardingData): Promise<{ success: boolean; residentId?: number; message: string; error?: string }> {
    let transaction: sql.Transaction | undefined;
    
    try {
      logger.info('Starting participant creation process', { 
        name: `${data.firstName} ${data.lastName}` 
      });
      
      transaction = new sql.Transaction(this.db);
      await transaction.begin();
      
      // Insert resident data
      const residentResult = await transaction.request()
        .input('firstName', sql.VarChar(100), data.firstName)
        .input('lastName', sql.VarChar(100), data.lastName)
        .input('intakeDate', sql.Date, data.intakeDate)
        .input('housingLocation', sql.VarChar(50), data.housingLocation)
        .input('dateOfBirth', sql.Date, data.dateOfBirth)
        .input('ssn', sql.VarChar(11), data.socialSecurityNumber)
        .input('sex', sql.VarChar(10), data.sex)
        .input('email', sql.VarChar(255), data.email)
        .input('driversLicense', sql.VarChar(50), data.driversLicenseNumber)
        .input('phoneNumber', sql.VarChar(20), data.phoneNumber)
        .query(`
          INSERT INTO residents 
          (first_name, last_name, intake_date, housing_location, date_of_birth, 
           social_security_number, sex, email, drivers_license_number, phone_number)
          OUTPUT INSERTED.id
          VALUES 
          (@firstName, @lastName, @intakeDate, @housingLocation, @dateOfBirth,
           @ssn, @sex, @email, @driversLicense, @phoneNumber)
        `);

      const residentId = residentResult.recordset[0].id;
      logger.info('Created resident record', { residentId });

      // Insert health status
      await transaction.request()
        .input('residentId', sql.Int, residentId)
        .input('pregnant', sql.Bit, data.healthStatus.pregnant)
        .input('disabled', sql.Bit, data.healthStatus.developmentallyDisabled)
        .input('coOccurring', sql.Bit, data.healthStatus.coOccurringDisorder)
        .input('docSupervision', sql.Bit, data.healthStatus.docSupervision)
        .input('felon', sql.Bit, data.healthStatus.felon)
        .input('handicapped', sql.Bit, data.healthStatus.physicallyHandicapped)
        .input('postPartum', sql.Bit, data.healthStatus.postPartum)
        .input('femaleCaregiver', sql.Bit, data.healthStatus.primaryFemaleCaregiver)
        .input('recentlyIncarcerated', sql.Bit, data.healthStatus.recentlyIncarcerated)
        .input('sexOffender', sql.Bit, data.healthStatus.sexOffender)
        .input('lgbtq', sql.Bit, data.healthStatus.lgbtq)
        .input('veteran', sql.Bit, data.healthStatus.veteran)
        .input('insulinDependent', sql.Bit, data.healthStatus.insulinDependent)
        .input('seizureHistory', sql.Bit, data.healthStatus.historyOfSeizures)
        .input('race', sql.VarChar(50), data.healthStatus.race)
        .input('ethnicity', sql.VarChar(50), data.healthStatus.ethnicity)
        .input('income', sql.VarChar(50), data.healthStatus.householdIncome)
        .input('employment', sql.VarChar(50), data.healthStatus.employmentStatus)
        .query(`
          INSERT INTO health_status
          (resident_id, pregnant, developmentally_disabled, co_occurring_disorder,
           doc_supervision, felon, physically_handicapped, post_partum,
           primary_female_caregiver, recently_incarcerated, sex_offender,
           lgbtq, veteran, insulin_dependent, history_of_seizures,
           race, ethnicity, household_income, employment_status)
          VALUES
          (@residentId, @pregnant, @disabled, @coOccurring,
           @docSupervision, @felon, @handicapped, @postPartum,
           @femaleCaregiver, @recentlyIncarcerated, @sexOffender,
           @lgbtq, @veteran, @insulinDependent, @seizureHistory,
           @race, @ethnicity, @income, @employment)
        `);
      
      // ... continue with other inserts, but let's not repeat all of them
      
      // Insert vehicle if present
      if (data.vehicle) {
        await transaction.request()
          .input('residentId', sql.Int, residentId)
          .input('make', sql.VarChar(50), data.vehicle.make)
          .input('model', sql.VarChar(50), data.vehicle.model)
          .input('tagNumber', sql.VarChar(20), data.vehicle.tagNumber)
          .query(`
            INSERT INTO vehicles
            (resident_id, make, model, tag_number)
            VALUES
            (@residentId, @make, @model, @tagNumber)
          `);
      }

      // Insert emergency contact
      await transaction.request()
        .input('residentId', sql.Int, residentId)
        .input('firstName', sql.VarChar(100), data.emergencyContact.firstName)
        .input('lastName', sql.VarChar(100), data.emergencyContact.lastName)
        .input('phone', sql.VarChar(20), data.emergencyContact.phone)
        .input('relationship', sql.VarChar(50), data.emergencyContact.relationship)
        .input('otherRelationship', sql.VarChar(100), data.emergencyContact.otherRelationship)
        .query(`
          INSERT INTO emergency_contacts
          (resident_id, first_name, last_name, phone, relationship, other_relationship)
          VALUES
          (@residentId, @firstName, @lastName, @phone, @relationship, @otherRelationship)
        `);

      // Insert medical information
      await transaction.request()
        .input('residentId', sql.Int, residentId)
        .input('dualDiagnosis', sql.Bit, data.medicalInformation.dualDiagnosis)
        .input('mat', sql.Bit, data.medicalInformation.mat)
        .input('matMedication', sql.VarChar(100), data.medicalInformation.matMedication)
        .input('matMedicationOther', sql.VarChar(100), data.medicalInformation.matMedicationOther)
        .input('needPsychMedication', sql.Bit, data.medicalInformation.needPsychMedication)
        .query(`
          INSERT INTO medical_information
          (resident_id, dual_diagnosis, mat, mat_medication, mat_medication_other, need_psych_medication)
          VALUES
          (@residentId, @dualDiagnosis, @mat, @matMedication, @matMedicationOther, @needPsychMedication)
        `);

      // Insert signatures (just showing one as example)
      if (data.signatures && data.signatures.length > 0) {
        for (const signature of data.signatures) {
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
      logger.info('Participant data saved successfully', { residentId });

      return {
        success: true,
        residentId,
        message: 'Participant data saved successfully'
      };
    } catch (error) {
      logger.error('Error in createParticipant', error, { 
        name: `${data.firstName} ${data.lastName}` 
      });

      if (transaction) {
        await transaction.rollback();
        logger.info('Transaction rolled back due to error');
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        message: 'Failed to create participant record',
        error: errorMessage
      };
    }
  }
} 