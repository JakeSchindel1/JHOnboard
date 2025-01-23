from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
import json
import sys
from io import BytesIO
from datetime import datetime

def create_pdf(data):
    # Create a BytesIO buffer instead of a file
    buffer = BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Get base styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=16,
        spaceAfter=30,
        spaceBefore=20,
        textColor=colors.black
    )
    
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=20,
        spaceBefore=15,
        textColor=colors.black
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=10,
        textColor=colors.black
    )

    story = []
    
    # Title
    story.append(Paragraph(f"Journey House Onboarding Document", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
    story.append(Spacer(1, 20))

    # Personal Information
    story.append(Paragraph("Personal Information", header_style))
    personal_fields = [
        ('firstName', 'First Name'),
        ('lastName', 'Last Name'),
        ('intakeDate', 'Intake Date'),
        ('housingLocation', 'Housing Location'),
        ('dateOfBirth', 'Date of Birth'),
        ('socialSecurityNumber', 'Social Security Number'),
        ('sex', 'Sex'),
        ('email', 'Email'),
        ('driversLicenseNumber', "Driver's License Number")
    ]
    for field, label in personal_fields:
        if field in data:
            story.append(Paragraph(f"{label}: {data[field]}", normal_style))
    story.append(Spacer(1, 10))

    # Health Status
    if 'healthStatus' in data:
        story.append(Paragraph("Health Status", header_style))
        health_status = data['healthStatus']
        for key, value in health_status.items():
            label = key.replace('_', ' ').title()
            if isinstance(value, bool):
                value_text = 'Yes' if value else 'No'
            else:
                value_text = str(value)
            story.append(Paragraph(f"{label}: {value_text}", normal_style))
        story.append(Spacer(1, 10))

    # Vehicle Information
    if data.get('vehicle'):
        story.append(Paragraph("Vehicle Information", header_style))
        vehicle = data['vehicle']
        vehicle_fields = [
            ('make', 'Make'),
            ('model', 'Model'),
            ('tagNumber', 'Tag Number'),
            ('insured', 'Insured'),
            ('insuranceType', 'Insurance Type'),
            ('policyNumber', 'Policy Number')
        ]
        for field, label in vehicle_fields:
            if field in vehicle:
                value = vehicle[field]
                if isinstance(value, bool):
                    value = 'Yes' if value else 'No'
                story.append(Paragraph(f"{label}: {value}", normal_style))
        story.append(Spacer(1, 10))

    # Emergency Contact
    if 'emergencyContact' in data:
        story.append(Paragraph("Emergency Contact", header_style))
        emergency = data['emergencyContact']
        story.append(Paragraph(f"Name: {emergency['firstName']} {emergency['lastName']}", normal_style))
        story.append(Paragraph(f"Phone: {emergency['phone']}", normal_style))
        story.append(Paragraph(f"Relationship: {emergency['relationship']}", normal_style))
        if emergency.get('otherRelationship'):
            story.append(Paragraph(f"Other Relationship: {emergency['otherRelationship']}", normal_style))
        story.append(Spacer(1, 10))

    # Medical Information
    if 'medicalInformation' in data:
        story.append(Paragraph("Medical Information", header_style))
        medical = data['medicalInformation']
        medical_fields = [
            ('dualDiagnosis', 'Dual Diagnosis'),
            ('mat', 'MAT'),
            ('matMedication', 'MAT Medication'),
            ('matMedicationOther', 'Other MAT Medication'),
            ('needPsychMedication', 'Needs Psych Medication')
        ]
        for field, label in medical_fields:
            if field in medical:
                value = medical[field]
                if isinstance(value, bool):
                    value = 'Yes' if value else 'No'
                story.append(Paragraph(f"{label}: {value}", normal_style))
        story.append(Spacer(1, 10))

    # Medications List
    if data.get('medications'):
        story.append(Paragraph("Current Medications", header_style))
        for medication in data['medications']:
            story.append(Paragraph(f"• {medication}", normal_style))
        story.append(Spacer(1, 10))

    # Authorized People
    if data.get('authorizedPeople'):
        story.append(Paragraph("Authorized People", header_style))
        for person in data['authorizedPeople']:
            story.append(Paragraph(
                f"Name: {person['firstName']} {person['lastName']}\n"
                f"Relationship: {person['relationship']}\n"
                f"Phone: {person['phone']}", 
                normal_style
            ))
            story.append(Spacer(1, 5))
        story.append(Spacer(1, 10))

    # Legal Status
    if 'legalStatus' in data:
        story.append(Paragraph("Legal Status", header_style))
        legal = data['legalStatus']
        legal_fields = [
            ('hasProbationPretrial', 'On Probation/Pretrial'),
            ('jurisdiction', 'Jurisdiction'),
            ('hasPendingCharges', 'Has Pending Charges'),
            ('hasConvictions', 'Has Convictions'),
            ('isWanted', 'Is Wanted'),
            ('isOnBond', 'Is On Bond'),
            ('bondsmanName', 'Bondsman Name'),
            ('isSexOffender', 'Is Sex Offender')
        ]
        for field, label in legal_fields:
            if field in legal:
                value = legal[field]
                if isinstance(value, bool):
                    value = 'Yes' if value else 'No'
                story.append(Paragraph(f"{label}: {value}", normal_style))
        
        # Pending Charges
        if data.get('pendingCharges'):
            story.append(Spacer(1, 5))
            story.append(Paragraph("Pending Charges:", normal_style))
            for charge in data['pendingCharges']:
                charge_text = f"• {charge['chargeDescription']}"
                if charge.get('location'):
                    charge_text += f" (Location: {charge['location']})"
                story.append(Paragraph(charge_text, normal_style))

        # Convictions
        if data.get('convictions'):
            story.append(Spacer(1, 5))
            story.append(Paragraph("Convictions:", normal_style))
            for conviction in data['convictions']:
                story.append(Paragraph(f"• {conviction['offense']}", normal_style))
        
        story.append(Spacer(1, 10))

    # Signatures with legal certification
    story.append(Paragraph("Digital Signatures Record", header_style))
    if data.get('signatures'):
        for sig in data['signatures']:
            sig_text = (
                f"• Type: {sig['signatureType']}\n"
                f"• Signature ID: {sig['signatureId']}\n"
                f"• Signed on: {sig['signatureTimestamp']}"
            )
            if sig.get('witnessSignature'):
                sig_text += (
                    f"\n• Witness Signature ID: {sig['witnessSignatureId']}\n"
                    f"• Witness Signed on: {sig['witnessTimestamp']}"
                )
            story.append(Paragraph(sig_text, normal_style))
            story.append(Spacer(1, 5))
    
    story.append(Spacer(1, 30))
    
    # Legal certification section
    certification_text = (
        "I hereby certify that the above digital signature IDs constitute legally binding electronic signatures "
        "executed by me and/or my witness. I acknowledge that these electronic signatures carry the same legal "
        "weight and implications as traditional handwritten signatures, in accordance with applicable electronic "
        "signature laws and regulations. I confirm that I have voluntarily provided these signatures with full "
        "understanding of their legal significance."
    )
    story.append(Paragraph(certification_text, normal_style))
    
    story.append(Spacer(1, 30))
    
    # Signature lines
    story.append(Paragraph("Participant Signature: _______________________  Date: _______________", normal_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Witness Signature: _________________________  Date: _______________", normal_style))
    story.append(Spacer(1, 15))
    story.append(Paragraph("Printed Name: ______________________________", normal_style))

    # Build PDF
    doc.build(story)
    
    # Get PDF data from buffer
    pdf_data = buffer.getvalue()
    buffer.close()
    
    return pdf_data

if __name__ == "__main__":
    try:
        # Get JSON data from command line argument
        data = json.loads(sys.argv[1])
        
        # Generate PDF
        pdf_data = create_pdf(data)
        
        # Write PDF data directly to stdout
        sys.stdout.buffer.write(pdf_data)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)