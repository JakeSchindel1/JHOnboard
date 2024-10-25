from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from aws_lambda_powertools import Logger
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# Initialize FastAPI and Logger
app = FastAPI()
logger = Logger()

# Configure CORS - update with your Amplify app URL when deployed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your Amplify app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AuthorizedPerson(BaseModel):
    firstName: str
    lastName: str
    relationship: str
    phone: str

class OnboardingData(BaseModel):
    firstName: str
    lastName: str
    intakeDate: str
    housingLocation: str
    dateOfBirth: str
    socialSecurityNumber: str
    sex: str
    email: str
    driversLicenseNumber: str
    vehicleTagNumber: str
    vehicleMake: str
    vehicleModel: str
    insured: str
    insuranceType: str
    policyNumber: str
    emergencyContactFirstName: str
    emergencyContactLastName: str
    emergencyContactPhone: str
    emergencyContactRelationship: str
    otherRelationship: Optional[str]
    dualDiagnosis: str
    mat: bool
    matMedication: str
    matMedicationOther: Optional[str]
    needPsychMedication: str
    hasProbationOrPretrial: str
    jurisdiction: str
    otherJurisdiction: Optional[str]
    consentSignature: str
    consentAgreed: bool
    consentTimestamp: str
    witnessSignature: str
    witnessTimestamp: str
    signatureId: str
    medications: List[str]
    medicationSignature: str
    medicationSignatureDate: str
    medicationWitnessSignature: str
    medicationWitnessTimestamp: str
    medicationSignatureId: str
    authorizedPeople: List[AuthorizedPerson]
    treatmentSignature: Optional[str]
    treatmentAgreed: Optional[bool]
    treatmentTimestamp: Optional[str]
    treatmentwitnessSignature: Optional[str]
    treatmentwitnessTimestamp: Optional[str]
    treatmentsignatureId: Optional[str]
    priceConsentSignature: Optional[str]
    priceConsentAgreed: Optional[bool]
    priceConsentTimestamp: Optional[str]
    priceWitnessSignature: Optional[str]
    priceWitnessTimestamp: Optional[str]
    priceSignatureId: Optional[str]

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.post("/api/onboarding")
@logger.inject_lambda_context
async def create_onboarding(data: OnboardingData):
    try:
        # Log the incoming data
        logger.info("Received onboarding data", extra={
            "firstName": data.firstName,
            "lastName": data.lastName,
            "intakeDate": data.intakeDate
        })
        
        # Convert data to dictionary for response
        response_data = data.dict()
        
        # Log full data for debugging
        logger.debug("Full onboarding data", extra={"data": response_data})
        
        # Here you'll later add your RDS connection logic
        
        return {
            "success": True,
            "message": "Onboarding data received successfully",
            "data": response_data
        }
    except Exception as e:
        logger.error(f"Error processing onboarding data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Create Lambda handler
handler = Mangum(app)

# This is for local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)