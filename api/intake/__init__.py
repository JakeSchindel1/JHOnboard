# function_app.py
import azure.functions as func
import logging
import json
from typing import List, Optional, Union
from pydantic import BaseModel
import pyodbc
import os
from datetime import datetime
import base64
import os

# Configure logging
logger = logging.getLogger('intake-form')
logger.setLevel(logging.INFO)

# Pydantic models (same as your original)
class AuthorizedPerson(BaseModel):
    firstName: str
    lastName: str
    relationship: str
    phone: str

class OnboardingData(BaseModel):
    # Personal Information
    firstName: str
    lastName: str
    intakeDate: str
    housingLocation: str
    dateOfBirth: str
    socialSecurityNumber: str
    sex: str
    email: str
   
    # Vehicle Information
    driversLicenseNumber: str
    vehicleTagNumber: str
    vehicleMake: str
    vehicleModel: str
    insured: bool
    insuranceType: str
    policyNumber: str
   
    # Emergency Contact
    emergencyContactFirstName: str
    emergencyContactLastName: str
    emergencyContactPhone: str
    emergencyContactRelationship: str
    otherRelationship: Optional[str]
   
    # Medical Information
    dualDiagnosis: bool
    mat: bool
    matMedication: str
    matMedicationOther: Optional[str]
    needPsychMedication: bool
    medications: List[str]
   
    # Legal Information
    hasProbationOrPretrial: bool
    jurisdiction: str
    otherJurisdiction: Optional[str]
   
    # Consent Forms
    consentSignature: str
    consentAgreed: Union[bool, str]
    consentTimestamp: str
    witnessSignature: str
    witnessTimestamp: str
    signatureId: str
   
    # Medication Forms
    medicationSignature: str
    medicationSignatureDate: str
    medicationWitnessSignature: str
    medicationWitnessTimestamp: str
    medicationSignatureId: str
   
    # Authorized People
    authorizedPeople: List[AuthorizedPerson]
   
    # Treatment Information
    treatmentSignature: Optional[str]
    treatmentAgreed: Optional[Union[bool, str]]
    treatmentTimestamp: Optional[str]
    treatmentwitnessSignature: Optional[str]
    treatmentwitnessTimestamp: Optional[str]
    treatmentsignatureId: Optional[str]
   
    # Price Consent
    priceConsentSignature: Optional[str]
    priceConsentAgreed: Optional[Union[bool, str]]
    priceConsentTimestamp: Optional[str]
    priceWitnessSignature: Optional[str]
    priceWitnessTimestamp: Optional[str]
    priceSignatureId: Optional[str]

    # Disclosure Information
    disclosureAgreed: Optional[Union[bool, str]]
    disclosureAgreementTimestamp: Optional[str]
    disclosureSignature: Optional[str]
    disclosureSignatureDate: Optional[str]
    disclosureSignatureId: Optional[str]
    disclosureWitnessSignature: Optional[str]
    disclosureWitnessTimestamp: Optional[str]

# Database configuration for Azure SQL
connection_string = (
    f"Driver={{ODBC Driver 17 for SQL Server}};"
    f"Server={os.environ['SQL_SERVER']};"
    f"Database={os.environ['SQL_DATABASE']};"
    f"UID={os.environ['SQL_USER']};"
    f"PWD={os.environ['SQL_PASSWORD']};"
    "Encrypt=yes;"
    "TrustServerCertificate=no;"
)

class DatabaseOperations:
    def __init__(self):
        try:
            self.conn = pyodbc.connect(connection_string)
            self.cursor = self.conn.cursor()
            logger.info("Database connection established successfully")
        except pyodbc.Error as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            raise

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            logger.error(f"Error in database operation: {str(exc_val)}")
            self.conn.rollback()
        else:
            self.conn.commit()
        self.cursor.close()
        self.conn.close()
        logger.info("Database connection closed")

    def insert_participant(self, data: OnboardingData) -> int:
        """Insert main participant information and return participant_id"""
        try:
            self.cursor.execute("""
                INSERT INTO participants 
                (first_name, last_name, intake_date, housing_location, date_of_birth, 
                 sex, email, drivers_license_number)
                OUTPUT INSERTED.participant_id
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data.firstName,
                data.lastName,
                data.intakeDate,
                data.housingLocation,
                data.dateOfBirth,
                data.sex,
                data.email,
                data.driversLicenseNumber
            ))
            participant_id = self.cursor.fetchval()
            logger.info(f"Inserted participant with ID: {participant_id}")
            return participant_id
        except pyodbc.Error as e:
            logger.error(f"Error inserting participant: {str(e)}")
            raise

    def insert_sensitive_info(self, participant_id: int, ssn: str):
        """Insert sensitive information with encryption"""
        try:
            if ssn:
                # Generate random IV for encryption
                encryption_iv = base64.b64encode(os.urandom(16)).decode('utf-8')
                
                self.cursor.execute("""
                    INSERT INTO participant_sensitive_info 
                    (participant_id, ssn_encrypted, encryption_iv, created_at)
                    VALUES (?, ?, ?, GETDATE())
                """, (
                    participant_id,
                    ssn,
                    encryption_iv
                ))
                logger.info(f"Inserted sensitive info for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting sensitive info: {str(e)}")
            raise

    def insert_vehicle(self, participant_id: int, data: OnboardingData):
        """Insert vehicle information"""
        try:
            if data.vehicleTagNumber or data.vehicleMake or data.vehicleModel:
                self.cursor.execute("""
                    INSERT INTO vehicles 
                    (participant_id, tag_number, make, model)
                    VALUES (?, ?, ?, ?)
                """, (
                    participant_id,
                    data.vehicleTagNumber,
                    data.vehicleMake,
                    data.vehicleModel
                ))
                logger.info(f"Inserted vehicle info for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting vehicle info: {str(e)}")
            raise

    def insert_insurance(self, participant_id: int, data: OnboardingData):
        """Insert insurance information"""
        try:
            self.cursor.execute("""
                INSERT INTO insurance 
                (participant_id, is_insured, insurance_type, policy_number)
                VALUES (?, ?, ?, ?)
            """, (
                participant_id,
                data.insured,
                data.insuranceType,
                data.policyNumber
            ))
            logger.info(f"Inserted insurance info for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting insurance info: {str(e)}")
            raise

    def insert_emergency_contact(self, participant_id: int, data: OnboardingData):
        """Insert emergency contact information"""
        try:
            self.cursor.execute("""
                INSERT INTO emergency_contacts 
                (participant_id, first_name, last_name, phone, relationship, other_relationship)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                participant_id,
                data.emergencyContactFirstName,
                data.emergencyContactLastName,
                data.emergencyContactPhone,
                data.emergencyContactRelationship,
                data.otherRelationship
            ))
            logger.info(f"Inserted emergency contact for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting emergency contact: {str(e)}")
            raise

    def insert_medical_info(self, participant_id: int, data: OnboardingData):
        """Insert medical information"""
        try:
            self.cursor.execute("""
                INSERT INTO medical_info 
                (participant_id, dual_diagnosis, mat, mat_medication, 
                 mat_medication_other, need_psych_medication)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                participant_id,
                data.dualDiagnosis,
                data.mat,
                data.matMedication,
                data.matMedicationOther,
                data.needPsychMedication
            ))
            logger.info(f"Inserted medical info for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting medical info: {str(e)}")
            raise

    def insert_medications(self, participant_id: int, medications: List[str]):
        """Insert medications"""
        try:
            for med in medications:
                self.cursor.execute("""
                    INSERT INTO medications 
                    (participant_id, medication_name)
                    VALUES (?, ?)
                """, (participant_id, med))
            logger.info(f"Inserted medications for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting medications: {str(e)}")
            raise

    def insert_legal_info(self, participant_id: int, data: OnboardingData):
        """Insert legal information"""
        try:
            self.cursor.execute("""
                INSERT INTO legal_info 
                (participant_id, has_probation_or_pretrial, jurisdiction, other_jurisdiction)
                VALUES (?, ?, ?, ?)
            """, (
                participant_id,
                data.hasProbationOrPretrial,
                data.jurisdiction,
                data.otherJurisdiction
            ))
            logger.info(f"Inserted legal info for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting legal info: {str(e)}")
            raise

    def insert_authorized_people(self, participant_id: int, authorized_people: List[AuthorizedPerson]):
        """Insert authorized people"""
        try:
            for person in authorized_people:
                self.cursor.execute("""
                    INSERT INTO authorized_people 
                    (participant_id, first_name, last_name, relationship, phone)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    participant_id,
                    person.firstName,
                    person.lastName,
                    person.relationship,
                    person.phone
                ))
            logger.info(f"Inserted authorized people for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting authorized people: {str(e)}")
            raise

    def insert_consents(self, participant_id: int, data: OnboardingData):
        """Insert all consent information"""
        try:
            # Main consent
            self.cursor.execute("""
                INSERT INTO consents 
                (participant_id, consent_signature, consent_agreed, consent_timestamp,
                 witness_signature, witness_timestamp, signature_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                participant_id,
                data.consentSignature,
                data.consentAgreed,
                data.consentTimestamp,
                data.witnessSignature,
                data.witnessTimestamp,
                data.signatureId
            ))

            # Medication consent
            self.cursor.execute("""
                INSERT INTO medication_consents 
                (participant_id, medication_signature, medication_signature_date,
                 medication_witness_signature, medication_witness_timestamp, medication_signature_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                participant_id,
                data.medicationSignature,
                data.medicationSignatureDate,
                data.medicationWitnessSignature,
                data.medicationWitnessTimestamp,
                data.medicationSignatureId
            ))

            # Treatment consent (if provided)
            if data.treatmentSignature:
                self.cursor.execute("""
                    INSERT INTO treatment_consents 
                    (participant_id, treatment_signature, treatment_agreed, treatment_timestamp,
                     treatment_witness_signature, treatment_witness_timestamp, treatment_signature_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    participant_id,
                    data.treatmentSignature,
                    data.treatmentAgreed,
                    data.treatmentTimestamp,
                    data.treatmentwitnessSignature,
                    data.treatmentwitnessTimestamp,
                    data.treatmentsignatureId
                ))

            # Price consent (if provided)
            if data.priceConsentSignature:
                self.cursor.execute("""
                    INSERT INTO price_consents 
                    (participant_id, price_consent_signature, price_consent_agreed, price_consent_timestamp,
                     price_witness_signature, price_witness_timestamp, price_signature_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    participant_id,
                    data.priceConsentSignature,
                    data.priceConsentAgreed,
                    data.priceConsentTimestamp,
                    data.priceWitnessSignature,
                    data.priceWitnessTimestamp,
                    data.priceSignatureId
                ))
                
            # Disclosure consent (if provided)
            if data.disclosureSignature:
                self.cursor.execute("""
                    INSERT INTO disclosure_consents 
                    (participant_id, disclosure_agreed, disclosure_agreement_timestamp,
                     disclosure_signature, disclosure_signature_date, disclosure_signature_id,
                     disclosure_witness_signature, disclosure_witness_timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    participant_id,
                    data.disclosureAgreed,
                    data.disclosureAgreementTimestamp,
                    data.disclosureSignature,
                    data.disclosureSignatureDate,
                    data.disclosureSignatureId,
                    data.disclosureWitnessSignature,
                    data.disclosureWitnessTimestamp
                ))
            
            logger.info(f"Inserted all consents for participant {participant_id}")
        except pyodbc.Error as e:
            logger.error(f"Error inserting consents: {str(e)}")
            raise

app = func.FunctionApp()

@app.