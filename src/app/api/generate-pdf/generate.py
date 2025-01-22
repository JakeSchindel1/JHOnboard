from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
import json
import sys
from datetime import datetime

def create_pdf(data):
    doc = SimpleDocTemplate("onboarding.pdf", pagesize=letter)
    story = []
    
    # Styles
    title_style = ParagraphStyle(
        'CustomTitle',
        fontSize=16,
        spaceAfter=30,
        spaceBefore=20
    )
    
    header_style = ParagraphStyle(
        'CustomHeader',
        fontSize=14,
        spaceAfter=20,
        spaceBefore=15
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        fontSize=12,
        spaceAfter=10
    )

    # Title
    story.append(Paragraph(f"Journey House Onboarding Document", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
    story.append(Spacer(1, 20))

    # Personal Information
    story.append(Paragraph("Personal Information", header_style))
    story.append(Paragraph(f"Name: {data['firstName']} {data['lastName']}", normal_style))
    story.append(Paragraph(f"Intake Date: {data['intakeDate']}", normal_style))
    story.append(Paragraph(f"Housing Location: {data['housingLocation']}", normal_style))
    story.append(Paragraph(f"Date of Birth: {data['dateOfBirth']}", normal_style))
    story.append(Paragraph(f"SSN: {data['socialSecurityNumber']}", normal_style))
    story.append(Paragraph(f"Sex: {data['sex']}", normal_style))
    story.append(Paragraph(f"Email: {data['email']}", normal_style))
    story.append(Spacer(1, 10))

    # Health Status
    story.append(Paragraph("Health Status", header_style))
    health_status = data['healthStatus']
    for key, value in health_status.items():
        if isinstance(value, bool):
            story.append(Paragraph(f"{key.replace('_', ' ').title()}: {'Yes' if value else 'No'}", normal_style))
        else:
            story.append(Paragraph(f"{key.replace('_', ' ').title()}: {value}", normal_style))
    story.append(Spacer(1, 10))

    # Vehicle Information (if exists)
    if data.get('vehicle'):
        story.append(Paragraph("Vehicle Information", header_style))
        vehicle = data['vehicle']
        story.append(Paragraph(f"Make: {vehicle['make']}", normal_style))
        story.append(Paragraph(f"Model: {vehicle['model']}", normal_style))
        story.append(Paragraph(f"Tag Number: {vehicle['tagNumber']}", normal_style))
        story.append(Paragraph(f"Insured: {'Yes' if vehicle['insured'] else 'No'}", normal_style))
        story.append(Spacer(1, 10))

    # Emergency Contact
    story.append(Paragraph("Emergency Contact", header_style))
    emergency = data['emergencyContact']
    story.append(Paragraph(f"Name: {emergency['firstName']} {emergency['lastName']}", normal_style))
    story.append(Paragraph(f"Phone: {emergency['phone']}", normal_style))
    story.append(Paragraph(f"Relationship: {emergency['relationship']}", normal_style))
    story.append(Spacer(1, 10))

    # Medical Information
    story.append(Paragraph("Medical Information", header_style))
    medical = data['medicalInformation']
    story.append(Paragraph(f"Dual Diagnosis: {'Yes' if medical['dualDiagnosis'] else 'No'}", normal_style))
    story.append(Paragraph(f"MAT: {'Yes' if medical['mat'] else 'No'}", normal_style))
    if medical['mat']:
        story.append(Paragraph(f"MAT Medication: {medical['matMedication']}", normal_style))
    story.append(Spacer(1, 10))

    # Legal Status
    story.append(Paragraph("Legal Status", header_style))
    legal = data['legalStatus']
    story.append(Paragraph(f"On Probation/Pretrial: {'Yes' if legal['hasProbationPretrial'] else 'No'}", normal_style))
    if legal['hasProbationPretrial']:
        story.append(Paragraph(f"Jurisdiction: {legal['jurisdiction']}", normal_style))
    story.append(Paragraph(f"Pending Charges: {'Yes' if legal['hasPendingCharges'] else 'No'}", normal_style))
    story.append(Paragraph(f"Has Convictions: {'Yes' if legal['hasConvictions'] else 'No'}", normal_style))
    story.append(Spacer(1, 10))

    # Signatures
    story.append(Paragraph("Signatures", header_style))
    for sig in data['signatures']:
        story.append(Paragraph(f"Type: {sig['signatureType']}", normal_style))
        story.append(Paragraph(f"Signed on: {sig['signatureTimestamp']}", normal_style))
        story.append(Spacer(1, 5))

    doc.build(story)

if __name__ == "__main__":
    # Read JSON data from command line argument
    data = json.loads(sys.argv[1])
    create_pdf(data)