import json
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import date

# Pydantic models for data validation
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
    insured: str
    insuranceType: str
    policyNumber: str
    
    # Emergency Contact
    emergencyContactFirstName: str
    emergencyContactLastName: str
    emergencyContactPhone: str
    emergencyContactRelationship: str
    otherRelationship: Optional[str]
    
    # Medical Information
    dualDiagnosis: str
    mat: bool
    matMedication: str
    matMedicationOther: Optional[str]
    needPsychMedication: str
    medications: List[str]
    
    # Legal Information
    hasProbationOrPretrial: str
    jurisdiction: str
    otherJurisdiction: Optional[str]
    
    # Consent Forms
    consentSignature: str
    consentAgreed: bool
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
    treatmentAgreed: Optional[bool]
    treatmentTimestamp: Optional[str]
    treatmentwitnessSignature: Optional[str]
    treatmentwitnessTimestamp: Optional[str]
    treatmentsignatureId: Optional[str]
    
    # Price Consent
    priceConsentSignature: Optional[str]
    priceConsentAgreed: Optional[bool]
    priceConsentTimestamp: Optional[str]
    priceWitnessSignature: Optional[str]
    priceWitnessTimestamp: Optional[str]
    priceSignatureId: Optional[str]

def get_cors_headers():
    """Centralized CORS headers configuration"""
    return {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    }

def lambda_handler(event, context):
    """Single entry point for all requests"""
    # Always include CORS headers
    cors_headers = get_cors_headers()
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({})
        }
    
    # Handle POST request
    try:
        # Parse and validate request body
        body = json.loads(event.get('body', '{}'))
        onboarding_data = OnboardingData(**body)
        
        # Process the data (add your processing logic here)
        print(f"Processing onboarding data for {onboarding_data.firstName} {onboarding_data.lastName}")
        
        # Return success response
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'success': True,
                'message': 'Onboarding data received successfully',
                'data': {
                    'name': f"{onboarding_data.firstName} {onboarding_data.lastName}",
                    'intake_date': onboarding_data.intakeDate
                }
            })
        }
    except Exception as e:
        # Log the error for debugging
        print(f"Error processing request: {str(e)}")
        
        # Return error response with appropriate status code
        status_code = 400 if isinstance(e, ValueError) else 500
        return {
            'statusCode': status_code,
            'headers': cors_headers,
            'body': json.dumps({
                'success': False,
                'message': 'Failed to process onboarding data',
                'error': str(e)
            })
        }