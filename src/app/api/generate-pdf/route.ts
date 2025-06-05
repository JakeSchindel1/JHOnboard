import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { participantId, documentType } = body;

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Fetch participant data from database
    logger.info('Fetching participant data for PDF generation', { participantId, documentType });

    // Get main participant information
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (participantError || !participant) {
      logger.error('Failed to fetch participant', { error: participantError });
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Fetch all related data in parallel
    const [
      { data: healthStatus },
      { data: vehicle },
      { data: emergencyContact },
      { data: medicalInfo },
      { data: medications },
      { data: authorizedPeople },
      { data: legalStatus },
      { data: signatures },
      { data: mentalHealth },
      { data: drugHistory },
      { data: pendingCharges },
      { data: convictions }
    ] = await Promise.all([
      supabase.from('health_status').select('*').eq('participant_id', participantId).single(),
      supabase.from('vehicles').select('*').eq('participant_id', participantId).single(),
      supabase.from('emergency_contacts').select('*').eq('participant_id', participantId).single(),
      supabase.from('medical_information').select('*').eq('participant_id', participantId).single(),
      supabase.from('medications').select('*').eq('participant_id', participantId),
      supabase.from('authorized_people').select('*').eq('participant_id', participantId),
      supabase.from('legal_status').select('*').eq('participant_id', participantId).single(),
      supabase.from('signatures').select('*').eq('participant_id', participantId),
      supabase.from('mental_health').select('*').eq('participant_id', participantId).single(),
      supabase.from('drug_history').select('*').eq('participant_id', participantId),
      supabase.from('pending_charges').select('*').eq('participant_id', participantId),
      supabase.from('convictions').select('*').eq('participant_id', participantId)
    ]);

    // Construct the data object for the Azure function
    const pdfData = {
      // Basic participant information
      firstName: participant.first_name,
      lastName: participant.last_name,
      intakeDate: participant.intake_date,
      housingLocation: participant.housing_location,
      dateOfBirth: participant.date_of_birth,
      socialSecurityNumber: participant.social_security_number,
      sex: participant.sex,
      email: participant.email,
      driversLicenseNumber: participant.drivers_license_number,
      phoneNumber: participant.phone_number,

      // Health status
      healthStatus: healthStatus ? {
        pregnant: healthStatus.pregnant,
        developmentallyDisabled: healthStatus.developmentally_disabled,
        coOccurringDisorder: healthStatus.co_occurring_disorder,
        docSupervision: healthStatus.doc_supervision,
        felon: healthStatus.felon,
        physicallyHandicapped: healthStatus.physically_handicapped,
        postPartum: healthStatus.post_partum,
        primaryFemaleCaregiver: healthStatus.primary_female_caregiver,
        recentlyIncarcerated: healthStatus.recently_incarcerated,
        sexOffender: healthStatus.sex_offender,
        lgbtq: healthStatus.lgbtq,
        veteran: healthStatus.veteran,
        insulinDependent: healthStatus.insulin_dependent,
        historyOfSeizures: healthStatus.history_of_seizures,
        race: healthStatus.race,
        ethnicity: healthStatus.ethnicity,
        householdIncome: healthStatus.household_income,
        employmentStatus: healthStatus.employment_status
      } : null,

      // Vehicle information
      vehicle: vehicle ? {
        make: vehicle.make,
        model: vehicle.model,
        tagNumber: vehicle.tag_number,
        insured: vehicle.insured,
        insuranceType: vehicle.insurance_type,
        policyNumber: vehicle.policy_number
      } : null,

      // Emergency contact
      emergencyContact: emergencyContact ? {
        firstName: emergencyContact.first_name,
        lastName: emergencyContact.last_name,
        phone: emergencyContact.phone,
        relationship: emergencyContact.relationship,
        otherRelationship: emergencyContact.other_relationship
      } : null,

      // Medical information
      medicalInformation: medicalInfo ? {
        dualDiagnosis: medicalInfo.dual_diagnosis,
        mat: medicalInfo.mat,
        matMedication: medicalInfo.mat_medication,
        matMedicationOther: medicalInfo.mat_medication_other,
        needPsychMedication: medicalInfo.need_psych_medication
      } : null,

      // Medications list
      medications: medications?.map(med => med.medication_name) || [],

      // Authorized people
      authorizedPeople: authorizedPeople?.map(person => ({
        firstName: person.first_name,
        lastName: person.last_name,
        relationship: person.relationship,
        phone: person.phone
      })) || [],

      // Legal status
      legalStatus: legalStatus ? {
        hasProbationPretrial: legalStatus.has_probation_pretrial,
        jurisdiction: legalStatus.jurisdiction,
        otherJurisdiction: legalStatus.other_jurisdiction,
        hasPendingCharges: legalStatus.has_pending_charges,
        hasConvictions: legalStatus.has_convictions,
        isWanted: legalStatus.is_wanted,
        isOnBond: legalStatus.is_on_bond,
        bondsmanName: legalStatus.bondsman_name,
        isSexOffender: legalStatus.is_sex_offender
      } : null,

      // Signatures with historical legal text
      signatures: signatures?.map(sig => ({
        signatureType: sig.signature_type,
        signature: sig.signature,
        signatureId: sig.signature_id,
        signatureTimestamp: sig.signature_timestamp,
        witnessSignature: sig.witness_signature,
        witnessTimestamp: sig.witness_timestamp,
        witnessSignatureId: sig.witness_signature_id,
        agreed: sig.agreed,
        updates: sig.updates || {}
      })) || [],

      // Mental health information
      mentalHealth: mentalHealth ? {
        entries: mentalHealth.entries || [],
        suicidalIdeation: mentalHealth.suicidal_ideation,
        homicidalIdeation: mentalHealth.homicidal_ideation,
        hallucinations: mentalHealth.hallucinations
      } : null,

      // Drug history
      drugHistory: drugHistory?.map(entry => ({
        drugType: entry.drug_type,
        everUsed: entry.ever_used,
        dateLastUse: entry.date_last_use,
        frequency: entry.frequency,
        intravenous: entry.intravenous,
        totalYears: entry.total_years,
        amount: entry.amount
      })) || [],

      // Pending charges
      pendingCharges: pendingCharges || [],

      // Convictions
      convictions: convictions || [],

      // Document type for Azure function
      documentType: documentType || 'intake_form'
    };

    logger.info('Sending data to Azure Function for PDF generation', { 
      participantName: `${participant.first_name} ${participant.last_name}`,
      documentType,
      hasSignatures: signatures?.length || 0
    });

    // Call the Azure Function to generate PDF
    const azureFunctionUrl = process.env.AZURE_FUNCTION_URL || 'https://jhonboard-func.azurewebsites.net/api/pdf-generation';
    
    const response = await fetch(azureFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Azure Function returned error', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      throw new Error(`Azure Function error: ${response.status} - ${errorText}`);
    }

    // Get the PDF blob from Azure Function
    const pdfBuffer = await response.arrayBuffer();
    
    logger.info('PDF generated successfully', { 
      participantName: `${participant.first_name} ${participant.last_name}`,
      pdfSize: pdfBuffer.byteLength 
    });

    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${participant.first_name}${participant.last_name}_${documentType}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    logger.error('Error generating PDF', { error });
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 