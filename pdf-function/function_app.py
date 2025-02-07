import azure.functions as func
import logging
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Image, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os
from io import BytesIO
import json

app = func.FunctionApp()

@app.function_name(name="generatePDF")
@app.route(route="generatepdf", methods=["POST", "OPTIONS"], auth_level=func.AuthLevel.ANONYMOUS)
def generate_pdf(req: func.HttpRequest) -> func.HttpResponse:
   CORS_HEADERS = {
       'Access-Control-Allow-Origin': 'https://white-river-06f67820f.5.azurestaticapps.net',
       'Access-Control-Allow-Methods': 'POST, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type'
   }

   if req.method == "OPTIONS":
       return func.HttpResponse(
           status_code=200,
           headers=CORS_HEADERS
       )
       
   try:
       req_body = req.get_json()
       buffer = BytesIO()
       
       doc = SimpleDocTemplate(
           buffer,
           pagesize=letter,
           rightMargin=72,
           leftMargin=72,
           topMargin=72,
           bottomMargin=72
       )
       
       styles = getSampleStyleSheet()
       title_style = ParagraphStyle(
           'CustomTitle',
           parent=styles['Heading1'],
           alignment=1,
           spaceAfter=30
       )
       section_style = ParagraphStyle(
           'SectionHeader',
           parent=styles['Heading2'],
           fontSize=14,
           spaceBefore=20,
           spaceAfter=12
       )
       normal_style = ParagraphStyle(
           'CustomNormal',
           parent=styles['Normal'],
           fontSize=11,
           leading=16
       )
       centered_style = ParagraphStyle(
           'Centered',
           parent=styles['Normal'],
           alignment=1,
           fontSize=11
       )
       
       elements = []
       
       logo_path = os.path.join(os.path.dirname(__file__), 'assets', 'JourneyHouseLogo.png')
       if os.path.exists(logo_path):
           img = Image(logo_path)
           aspect = img.imageWidth / float(img.imageHeight)
           target_width = 1.5 * inch
           img.drawWidth = target_width
           img.drawHeight = target_width / aspect
           elements.append(img)
       
       elements.append(Spacer(1, 12))
       elements.append(Paragraph("Intake Form Summary", title_style))
       
       elements.append(Paragraph(
           f"<b>Name:</b> {req_body.get('firstName', '')} {req_body.get('lastName', '')}<br/>"
           f"<b>Date of Birth:</b> {req_body.get('dateOfBirth', '')}<br/>"
           f"<b>Intake Date:</b> {req_body.get('intakeDate', '')}<br/>"
           f"<b>Housing Location:</b> {req_body.get('housingLocation', '')}<br/>"
           f"<b>Email:</b> {req_body.get('email', '')}", 
           normal_style
       ))
       
       elements.append(Paragraph("Insurance Information", section_style))
       if req_body.get('insurances'):
           for insurance in req_body['insurances']:
               elements.append(Paragraph(
                   f"<b>Type:</b> {insurance.get('insuranceType', '')}<br/>"
                   f"<b>Policy Number:</b> {insurance.get('policyNumber', '')}", 
                   normal_style
               ))
               elements.append(Spacer(1, 6))
       else:
           elements.append(Paragraph("No insurance information provided", normal_style))
       
       elements.append(Paragraph("Emergency Contact", section_style))
       if 'emergencyContact' in req_body:
           ec = req_body['emergencyContact']
           elements.append(Paragraph(
               f"<b>Name:</b> {ec.get('firstName', '')} {ec.get('lastName', '')}<br/>"
               f"<b>Relationship:</b> {ec.get('relationship', '')}<br/>"
               f"<b>Phone:</b> {ec.get('phone', '')}", 
               normal_style
           ))
       
       elements.append(Paragraph("Legal Status", section_style))
       legal = req_body.get('legalStatus', {})
       if legal.get('hasProbationPretrial'):
           elements.append(Paragraph(
               f"<b>Jurisdiction:</b> {legal.get('jurisdiction', '')}<br/>"
               f"<b>Other Jurisdiction:</b> {legal.get('otherJurisdiction', '')}", 
               normal_style
           ))
       else:
           elements.append(Paragraph("No probation or pretrial supervision", normal_style))
       
       elements.append(Paragraph("Medications", section_style))
       if req_body.get('medications'):
           for med in req_body['medications']:
               elements.append(Paragraph(f"• {med}", normal_style))
       else:
           elements.append(Paragraph("No medications listed", normal_style))
       
       elements.append(Paragraph("Consent Signatures", section_style))
       if req_body.get('signatures'):
           for sig in req_body['signatures']:
               elements.append(Paragraph(
                   f"Signature ID: {sig.get('signatureId', '')} - {sig.get('signatureType', '').replace('_', ' ').title()}", 
                   centered_style
               ))
       
       elements.append(Spacer(1, 20))
       legal_text = """By signing below, I hereby declare that:

1. All information provided in this intake form is true, accurate, and complete to the best of my knowledge.
2. I understand that providing false information may result in immediate termination of services and potential legal consequences.
3. I acknowledge that my electronic signature on this document is legally binding, carrying the same validity and enforceability as a handwritten signature.
4. I have been given the opportunity to review all information and ask questions before signing.
5. I consent to the collection, storage, and processing of the personal information provided in this form in accordance with applicable privacy laws.
6. I understand that this signed document will be stored securely and may be used as legal evidence of my consent and agreements."""
       
       elements.append(Paragraph(legal_text, normal_style))
       
       elements.append(Spacer(1, 20))
       disclaimer_text = """I understand that the electronic signatures collected during this intake process are legally binding and equivalent to physical signatures. I acknowledge that these signatures represent my consent and agreement to all terms and conditions presented."""
       elements.append(Paragraph(disclaimer_text, normal_style))
       
       elements.append(Spacer(1, 30))
       sig_line = Table([
           ['_' * 40, '_' * 20],
           ['Participant Signature', 'Date'],
           ['', ''],
           ['', ''],
           ['', ''],
           ['_' * 40, '_' * 20],
           ['Witness Signature', 'Date']
       ], colWidths=[4*inch, 2*inch])
       
       sig_line.setStyle(TableStyle([
           ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
           ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
           ('FONTSIZE', (0, 0), (-1, -1), 10),
           ('TOPPADDING', (0, 0), (-1, -1), 0),
           ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
       ]))
       elements.append(sig_line)
       
       elements.append(Spacer(1, 20))
       elements.append(Paragraph(
           f"Document generated on: {req_body.get('intakeDate', '')}",
           ParagraphStyle(
               'DateStamp',
               parent=styles['Normal'],
               fontSize=8,
               textColor=colors.gray
           )
       ))
       
       doc.build(elements)
       
       pdf_bytes = buffer.getvalue()
       buffer.close()
       
       return func.HttpResponse(
           body=pdf_bytes,
           mimetype="application/pdf",
           headers={
               **CORS_HEADERS,
               'Content-Disposition': f'attachment; filename="{req_body.get("lastName", "")}{req_body.get("firstName", "")}_Intake.pdf"'
           },
           status_code=200
       )
       
   except Exception as e:
       logging.error(f"Error generating PDF: {str(e)}")
       return func.HttpResponse(
           f"Error generating PDF: {str(e)}",
           status_code=500,
           headers=CORS_HEADERS
       )