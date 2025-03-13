import azure.functions as func
import logging
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Image, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os
from io import BytesIO
import json
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF
import markdown
from datetime import datetime

# Add a helper function for safe markdown conversion
def safe_markdown_to_html(md_content, default_message="Content could not be processed"):
    """Safely convert markdown to HTML with proper error handling"""
    try:
        return markdown.markdown(md_content)
    except Exception as e:
        logging.error(f"Error converting markdown to HTML: {str(e)}")
        return f"<p>{default_message}</p>"

app = func.FunctionApp()

def create_recovery_residence_table(recovery_residences):
    if not recovery_residences:
        return None

    data = [['Recovery Residence', 'Estimated Date', 'Location']]
    for residence in recovery_residences:
        data.append([
            residence.get('name', ''),
            residence.get('startDate', ''),
            residence.get('location', '')
        ])

    while len(data) < 4:
        data.append(['', '', ''])

    style = TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ])

    table = Table(data, colWidths=[2.5*inch, 2*inch, 2*inch])
    table.setStyle(style)
    return table

def create_hospitalization_table(treatment_history):
    data = [['Type', 'Estimated Date', 'Location']]

    if treatment_history:
        for treatment in treatment_history:
            data.append([
                treatment.get('type', ''),
                treatment.get('estimatedDate', ''),
                treatment.get('location', '')
            ])

    while len(data) < 4:
        data.append(['', '', ''])

    style = TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ])

    table = Table(data, colWidths=[2.5*inch, 2*inch, 2*inch])
    table.setStyle(style)
    return table

def create_incarceration_table(incarceration_history):
    data = [['Incarceration', 'Estimated Date', 'Location']]

    if incarceration_history:
        for incarceration in incarceration_history:
            data.append([
                incarceration.get('type', ''),
                incarceration.get('estimatedDate', ''),
                incarceration.get('location', '')
            ])

    while len(data) < 4:
        data.append(['', '', ''])

    style = TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ])

    table = Table(data, colWidths=[2.5*inch, 2*inch, 2*inch])
    table.setStyle(style)
    return table

def create_drug_screen_section(drug_test_results):
    elements = []

    def create_box(is_filled=False):
        d = Drawing(15, 15)
        d.add(Rect(1, 1, 13, 13, strokeWidth=0.75, strokeColor=colors.black, fillColor=colors.white))
        if is_filled:
            d.add(Rect(2.5, 2.5, 10, 10, strokeWidth=0, fillColor=colors.black))
        return d

    row1_tests = ['AMP', 'BAR', 'BUP', 'BZO', 'COC', 'mAMP', 'MDMA', 'MOP']
    # Removed 'Invalid'
    indicators = ['Neg -', 'Pos +']  # Removed 'Invalid'

    test_data1 = [
        row1_tests + indicators,  # Headers
        [create_box(drug_test_results.get(test, False)) for test in row1_tests] + [
            create_box(False),  # Neg box - Always empty
            create_box(True),   # Pos box - Always filled
        ]
    ]

    row2_tests = ['MTD', 'OXY', 'PCP', 'THC', 'ETG', 'FTY', 'TRA', 'K2']
    test_data2 = [
        row2_tests,
        [create_box(drug_test_results.get(test, False)) for test in row2_tests]
    ]

    style = TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 1), (-1, 1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1,-1), 'MIDDLE') # Vertically center everything
    ])

    col_width = 0.55*inch
    # Adjusted column widths for indicators
    table1 = Table(test_data1, colWidths=[col_width]*8 + [col_width*1.8, col_width*1.8])
    table1.setStyle(style)

    table2 = Table(test_data2, colWidths=[col_width]*8)
    table2.setStyle(style)

    elements.append(table1)
    elements.append(Spacer(1, 8))
    elements.append(table2)
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("<b>Key:</b> Neg - = Negative Result, Pos + = Positive Result",
                             ParagraphStyle('Key', fontSize=8, alignment=1)))  # Centered key


    return elements

def create_medication_table(medications, mat_medications=None):
    """Create a table for medications with proper formatting."""
    data = [['Medication', 'Type', 'Notes']]
    
    # Add MAT medications if present
    if mat_medications:
        for med in mat_medications:
            data.append([
                med.get('name', ''),
                'MAT',
                med.get('notes', '')
            ])
    
    # Add regular medications
    if medications:
        for med in medications:
            data.append([
                med.get('name', ''),
                'Regular',
                med.get('notes', '')
            ])
    
    # Ensure minimum table size
    while len(data) < 4:
        data.append(['', '', ''])
    
    style = TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ])
    
    table = Table(data, colWidths=[2*inch, 1.5*inch, 3*inch])
    table.setStyle(style)
    return table

def create_authorized_people_table(authorized_people):
    """Create a table for authorized people with proper formatting."""
    data = [['Name', 'Relationship', 'Phone']]
    
    if authorized_people:
        for person in authorized_people:
            full_name = f"{person.get('firstName', '')} {person.get('lastName', '')}".strip()
            data.append([
                full_name,
                person.get('relationship', '').capitalize(),
                person.get('phone', '')
            ])
    
    # Ensure minimum table size
    while len(data) < 4:
        data.append(['', '', ''])
    
    style = TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ])
    
    table = Table(data, colWidths=[2.5*inch, 2*inch, 2*inch])
    table.setStyle(style)
    return table

@app.function_name(name="generatePDF")
@app.route(route="generatepdf", methods=["POST", "OPTIONS"], auth_level=func.AuthLevel.ANONYMOUS)
def generate_pdf(req: func.HttpRequest) -> func.HttpResponse:
    CORS_HEADERS = {
        'Access-Control-Allow-Origin': 'https://intake.journeyhouserecovery.org',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Request-ID',
        'Access-Control-Allow-Credentials': 'true'
    }

    if req.method == "OPTIONS":
        return func.HttpResponse(
            status_code=200,
            headers=CORS_HEADERS
        )

    try:
        # Add request ID for tracking
        request_id = req.headers.get('X-Request-ID', 'unknown')
        logging.info(f"Processing PDF request ID: {request_id}")
        
        req_body = req.get_json()
        
        # Support for multiple document types
        document_types = req_body.get('documentTypes', [])
        if not document_types:
            # Backward compatibility - single document type
        document_type = req_body.get('documentType', '')
            if document_type:
                document_types = [document_type]
        
        # Add digital signature consent form if it's not already included
        if 'digital_signature_consent' not in document_types:
            # Ensuring it's the last document
            document_types.append('digital_signature_consent')
            logging.info(f"Added digital_signature_consent as the final document")
        elif 'digital_signature_consent' in document_types and document_types[-1] != 'digital_signature_consent':
            # If it's in the list but not at the end, remove it and append it again to ensure it's last
            document_types.remove('digital_signature_consent')
            document_types.append('digital_signature_consent')
            logging.info(f"Moved digital_signature_consent to be the final document")
        
        # Handle document-specific signatures
        signatures = req_body.get('signatures', [])
        # Create a dictionary to look up signatures by type
        signature_map = {}
        for sig in signatures:
            sig_type = sig.get('signatureType', '')
            if sig_type:
                signature_map[sig_type] = sig
        
        logging.info(f"Found {len(signatures)} signatures for {len(document_types)} document types")
        logging.info(f"Signature types: {list(signature_map.keys())}")
        
        # At the start of the generate_pdf function
        logging.info(f"Received request for document types: {document_types}")
        logging.info(f"Current working directory: {os.getcwd()}")
        logging.info(f"Directory contents: {os.listdir('.')}")
        
        # Common data
        first_name = req_body.get('firstName', '')
        last_name = req_body.get('lastName', '')
        full_name = f"{first_name} {last_name}".strip()

        # Validate required fields
        if not document_types:
            logging.error("Missing required field: documentType or documentTypes")
            return func.HttpResponse(
                body=json.dumps({"error": "Missing required field: documentType or documentTypes"}),
                status_code=400,
                mimetype="application/json",
                headers=CORS_HEADERS
            )
        
        # Set up the document
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Add logo if it exists
        logo_path = "logo.png"
        try:
        if os.path.exists(logo_path):
                img = Image(logo_path, width=200, height=100)
                elements.append(img)
            elements.append(Spacer(1, 20))
                logging.info("Added logo to PDF")
        except Exception as e:
            logging.warning(f"Error adding logo to PDF: {str(e)}")
            # Continue without the logo, don't let this fail the PDF generation
        
        # Process each document type
        for i, document_type in enumerate(document_types):
            logging.info(f"Processing document type: {document_type} ({i+1}/{len(document_types)})")
            
            # Add a page break between documents (but not before the first one)
            if i > 0:
                elements.append(PageBreak())
                
            # Handle each document type
            if document_type == 'intake_form':
                try:
                    # Create full intake form PDF
                    logging.info("Generating full intake form PDF")
                    
                    # Title and header info
                    elements.append(Paragraph("Journey House Intake Form", styles['Title']))
                    elements.append(Spacer(1, 12))
                    
                    # Add client information section
                    elements.append(Paragraph("Resident Information", styles['Heading1']))
                    elements.append(Spacer(1, 6))
                    
                    # Personal info table
                    personal_data = [
                        ['Full Name:', f"{first_name} {last_name}", 'Intake Date:', req_body.get('intakeDate', '')],
                        ['Date of Birth:', req_body.get('dateOfBirth', ''), 'SSN:', req_body.get('socialSecurityNumber', '')],
                        ['Email:', req_body.get('email', ''), 'Phone:', req_body.get('phoneNumber', '')],
                        ['Driver\'s License:', req_body.get('driversLicenseNumber', ''), 'Sex:', req_body.get('sex', '')]
                    ]
                    
                    personal_table = Table(personal_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
                    personal_table.setStyle(TableStyle([
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                        ('BACKGROUND', (2, 0), (2, -1), colors.lightgrey),
                        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
                    ]))
                    elements.append(personal_table)
                    elements.append(Spacer(1, 20))
                    
                    # Add emergency contact section
                    elements.append(Paragraph("Emergency Contact", styles['Heading2']))
                    elements.append(Spacer(1, 6))
                    
                    emergency_contact = req_body.get('emergencyContact', {})
                    emergency_data = [
                        ['Name:', f"{emergency_contact.get('firstName', '')} {emergency_contact.get('lastName', '')}"],
                        ['Relationship:', emergency_contact.get('relationship', '')],
                        ['Phone:', emergency_contact.get('phone', '')]
                    ]
                    
                    emergency_table = Table(emergency_data, colWidths=[1.5*inch, 5.5*inch])
                    emergency_table.setStyle(TableStyle([
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ]))
                    elements.append(emergency_table)
                    elements.append(Spacer(1, 20))
                    
                    # Add vehicle information if present
                    vehicle = req_body.get('vehicle', {})
                    if vehicle:
                        elements.append(Paragraph("Vehicle Information", styles['Heading2']))
                        elements.append(Spacer(1, 6))
                        
                        vehicle_data = [
                            ['Make:', vehicle.get('make', '')],
                            ['Model:', vehicle.get('model', '')],
                            ['Tag Number:', vehicle.get('tagNumber', '')],
                            ['Insured:', 'Yes' if vehicle.get('insured', False) else 'No']
                        ]
                        
                        vehicle_table = Table(vehicle_data, colWidths=[1.5*inch, 5.5*inch])
                        vehicle_table.setStyle(TableStyle([
                            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                        ]))
                        elements.append(vehicle_table)
                        elements.append(Spacer(1, 20))
                    
                    # Add medications table if present
                    medications = req_body.get('medications', [])
                    if medications and len(medications) > 0:
                        elements.append(Paragraph("Medications", styles['Heading2']))
                        elements.append(Spacer(1, 6))
                        
                        med_table = create_medication_table(medications)
                        if med_table:
                            elements.append(med_table)
                            elements.append(Spacer(1, 20))
                    
                    # Add authorized people section if present
                    authorized_people = req_body.get('authorizedPeople', [])
                    if authorized_people and len(authorized_people) > 0:
                        elements.append(Paragraph("Authorized Individuals", styles['Heading2']))
                        elements.append(Spacer(1, 6))
                        
                        auth_table = create_authorized_people_table(authorized_people)
                        if auth_table:
                            elements.append(auth_table)
                            elements.append(Spacer(1, 20))
                    
                    # Add health status section
                    health_status = req_body.get('healthStatus', {})
                    if health_status:
                        elements.append(Paragraph("Health Status", styles['Heading2']))
                        elements.append(Spacer(1, 6))
                        
                        # Create health condition boxes
                        health_conditions = []
                        if health_status.get('pregnant', False):
                            health_conditions.append('Pregnant')
                        if health_status.get('developmentallyDisabled', False):
                            health_conditions.append('Developmentally Disabled')
                        if health_status.get('coOccurringDisorder', False):
                            health_conditions.append('Co-Occurring Disorder')
                        if health_status.get('docSupervision', False):
                            health_conditions.append('DOC Supervision')
                        if health_status.get('felon', False):
                            health_conditions.append('Felon')
                        if health_status.get('physicallyHandicapped', False):
                            health_conditions.append('Physically Handicapped')
                        if health_status.get('postPartum', False):
                            health_conditions.append('Post-Partum')
                        if health_status.get('primaryFemaleCaregiver', False):
                            health_conditions.append('Primary Female Caregiver')
                        if health_status.get('recentlyIncarcerated', False):
                            health_conditions.append('Recently Incarcerated')
                        if health_status.get('sexOffender', False):
                            health_conditions.append('Sex Offender')
                        if health_status.get('lgbtq', False):
                            health_conditions.append('LGBTQ+')
                        if health_status.get('veteran', False):
                            health_conditions.append('Veteran')
                        if health_status.get('insulinDependent', False):
                            health_conditions.append('Insulin Dependent')
                        if health_status.get('historyOfSeizures', False):
                            health_conditions.append('History of Seizures')
                        
                        health_conditions_text = ", ".join(health_conditions) if health_conditions else "None"
                        
                        health_data = [
                            ['Health Conditions:', health_conditions_text],
                            ['Race:', health_status.get('race', '')],
                            ['Ethnicity:', health_status.get('ethnicity', '')],
                            ['Household Income:', health_status.get('householdIncome', '')],
                            ['Employment Status:', health_status.get('employmentStatus', '')]
                        ]
                        
                        health_table = Table(health_data, colWidths=[1.5*inch, 5.5*inch])
                        health_table.setStyle(TableStyle([
                            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                        ]))
                        elements.append(health_table)
                        elements.append(Spacer(1, 20))
                    
                    # Add signatures section
                    elements.append(Paragraph("Signatures", styles['Heading2']))
                    elements.append(Spacer(1, 6))
                    
                    signature = signature_map.get(document_type, {})
                    if signature:
                        sig_type = signature.get('signatureType', '')
                        sig_date = signature.get('signatureTimestamp', '')
                        
                        # Format the timestamp if present
                        formatted_date = ''
                        if sig_date:
                            try:
                                date_obj = datetime.fromisoformat(sig_date.replace('Z', '+00:00'))
                                formatted_date = date_obj.strftime("%B %d, %Y at %I:%M:%S %p")
                            except:
                                formatted_date = sig_date
                        
                        # Create display name for signature type
                        sig_type_display = sig_type.replace('_', ' ').title()
                        
                        elements.append(Paragraph(f"{sig_type_display} Agreement", styles['Heading3']))
                        elements.append(Paragraph(f"Signed on: {formatted_date}", styles['Normal']))
                        elements.append(Spacer(1, 12))
                    
                    elements.append(Spacer(1, 20))
                    elements.append(Paragraph("Generated on: " + datetime.now().strftime("%B %d, %Y at %I:%M:%S %p"), styles['Normal']))
                    
                    # Add page break after intake form
                    elements.append(PageBreak())
                except Exception as e:
                    logging.error(f"Error generating intake form PDF: {str(e)}")
                    elements.append(Paragraph("Journey House Intake Form", styles['Title']))
                    elements.append(Spacer(1, 12))
                    elements.append(Paragraph(f"Error generating intake form: {str(e)}", styles['Normal']))
                    elements.append(Spacer(1, 12))
                    elements.append(Paragraph("Please contact support for assistance.", styles['Normal']))
                    elements.append(PageBreak())  # Add page break even after error
            
            elif document_type == 'resident_as_guest':
            # Read and process the resident as guest agreement
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/resident_as_guest.md', 'r') as file:
                    content = file.read()
                    # Replace the resident name placeholder
                    content = content.replace('[RESIDENT_NAME]', full_name)
                    
                        # Convert markdown to HTML using safe function
                        html = safe_markdown_to_html(content, f"Error processing resident as guest agreement for {full_name}")
                    
                    # Process the content
                    for line in html.split('\n'):
                        if line.strip():
                            if line.startswith('<h1>'):
                                elements.append(Paragraph(line[4:-5], styles['Title']))
                            elif line.startswith('<h2>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading2']))
                            else:
                                elements.append(Paragraph(line, styles['Normal']))
                            elements.append(Spacer(1, 12))
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                        # Get document-specific signature if available
                        document_signature = signature_map.get(document_type, {})
                        
                        # Get current timestamp from document signature or general request body
                        signature_timestamp = document_signature.get('signatureTimestamp', req_body.get('signatureTimestamp', ''))
                        signature_id = document_signature.get('signatureId', req_body.get('signatureId', ''))
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    if signature_timestamp:
                        try:
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                            except Exception as e:
                                logging.warning(f"Error formatting signature timestamp: {str(e)}")
                            formatted_sig_time = signature_timestamp
                    
                        # Simplified digital verification section - no signatures
                        elements.append(Spacer(1, 20))
                        
                        # Combine date and digital signature ID on one line
                    if signature_id:
                            combined_text = f"Date: {formatted_sig_time}               Digital Signature ID: {signature_id}"
                            elements.append(Paragraph(combined_text, ParagraphStyle(
                                'DigitalSignature',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                                fontSize=10,
                                textColor=colors.gray
                            )))
                        else:
                            # If no signature ID, still show the date in gray
                            elements.append(Paragraph(f"Date: {formatted_sig_time}", ParagraphStyle(
                                'DigitalSignature',
                                parent=styles['Normal'],
                                alignment=1,  # Center alignment
                                fontSize=10,
                            textColor=colors.gray
                        )))
                    
                        # Don't add page break at the end of the loop, it will be handled by the loop
                except Exception as e:
                    logging.error(f"Error processing resident_as_guest document: {str(e)}")
                    elements.append(Paragraph("Resident as Guest Agreement", styles['Title']))
                    elements.append(Spacer(1, 12))
                    elements.append(Paragraph(f"Error rendering agreement: {str(e)}", styles['Normal']))
                    # Don't add page break at the end of the loop, it will be handled by the loop

        elif document_type == 'contract_terms':
            # Read and process the contract terms
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/contract_terms.md', 'r') as file:
                    content = file.read()
                    
                    # Convert markdown to HTML
                    html = markdown.markdown(content)
                    
                    # Process the content
                    for line in html.split('\n'):
                        if line.strip():
                            if line.startswith('<h1>'):
                                elements.append(Paragraph(line[4:-5], styles['Title']))
                            elif line.startswith('<h2>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading2']))
                            else:
                                elements.append(Paragraph(line, styles['Normal']))
                            elements.append(Spacer(1, 12))
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                        # Get document-specific signature if available
                        document_signature = signature_map.get(document_type, {})
                        
                        # Get current timestamp from document signature or general request body
                        signature_timestamp = document_signature.get('signatureTimestamp', req_body.get('signatureTimestamp', ''))
                        signature_id = document_signature.get('signatureId', req_body.get('signatureId', ''))
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    if signature_timestamp:
                        try:
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                            except Exception as e:
                                logging.warning(f"Error formatting signature timestamp: {str(e)}")
                            formatted_sig_time = signature_timestamp
                    
                        # Simplified digital verification section - no signatures
                        elements.append(Spacer(1, 20))
                        
                        # Combine date and digital signature ID on one line
                    if signature_id:
                            combined_text = f"Date: {formatted_sig_time}               Digital Signature ID: {signature_id}"
                            elements.append(Paragraph(combined_text, ParagraphStyle(
                                'DigitalSignature',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                                fontSize=10,
                                textColor=colors.gray
                            )))
                        else:
                            # If no signature ID, still show the date in gray
                            elements.append(Paragraph(f"Date: {formatted_sig_time}", ParagraphStyle(
                                'DigitalSignature',
                                parent=styles['Normal'],
                                alignment=1,  # Center alignment
                                fontSize=10,
                            textColor=colors.gray
                        )))
                    
                        # Don't add page break at the end of the loop, it will be handled by the loop
                except Exception as e:
                    logging.error(f"Error processing contract_terms document: {str(e)}")
                    elements.append(Paragraph(f"Error rendering contract terms: {str(e)}", styles['Normal']))
                    # Don't add page break at the end of the loop, it will be handled by the loop

        elif document_type == 'criminal_history':
            # Read and process the criminal history template
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/criminal_history.md', 'r') as file:
                    content = file.read()
                    
                    # Create Legal Status Summary
                    legal_status = []
                    if req_body.get('legalStatus', {}).get('hasPendingCharges'):
                        legal_status.append("- Currently has pending charges")
                    if req_body.get('legalStatus', {}).get('hasConvictions'):
                        legal_status.append("- Has prior convictions")
                    if req_body.get('legalStatus', {}).get('isWanted'):
                        legal_status.append("- Currently wanted by law enforcement")
                    if req_body.get('legalStatus', {}).get('isOnBond'):
                        bondsman = req_body.get('legalStatus', {}).get('bondsmanName', '')
                        legal_status.append(f"- Currently out on bond (Bondsman: {bondsman})")
                    
                    if not legal_status:
                            legal_status = ["Has no pending charges or convictions."]
                    
                    content = content.replace('[LEGAL_STATUS_SUMMARY]', '\n'.join(legal_status))
                    
                    # Create Pending Charges Section
                    pending_charges = req_body.get('pendingCharges', [])
                    if pending_charges and req_body.get('legalStatus', {}).get('hasPendingCharges'):
                        charges_text = []
                        for i, charge in enumerate(pending_charges, 1):
                            desc = charge.get('chargeDescription', '').strip()
                            loc = charge.get('location', '').strip()
                                charges_text.append(f"{i}. {desc} (Location: {loc if loc else 'Not specified'})")
                            pending_charges_text = '\n'.join(charges_text)
                    else:
                            pending_charges_text = "No pending charges."
                    
                        content = content.replace('[PENDING_CHARGES]', pending_charges_text)
                    
                    # Create Convictions Section
                    convictions = req_body.get('convictions', [])
                    if convictions and req_body.get('legalStatus', {}).get('hasConvictions'):
                            convictions_text = []
                        for i, conviction in enumerate(convictions, 1):
                            offense = conviction.get('offense', '').strip()
                                convictions_text.append(f"{i}. {offense}")
                            convictions_text = '\n'.join(convictions_text)
                    else:
                            convictions_text = "No convictions."
                        
                        # Handle additional information section if it exists in the template
                        if '[ADDITIONAL_INFORMATION]' in content:
                            additional_info = req_body.get('legalStatus', {}).get('additionalInformation', '').strip()
                    if not additional_info:
                                additional_info = "No additional information."
                            content = content.replace('[ADDITIONAL_INFORMATION]', additional_info)
                    
                        # Replace the resident name placeholder
                        content = content.replace('[RESIDENT_NAME]', full_name)
                    
                    # Convert markdown to HTML
                    html = markdown.markdown(content)
                    
                    # Process the content
                    for line in html.split('\n'):
                        if line.strip():
                            if line.startswith('<h1>'):
                                elements.append(Paragraph(line[4:-5], styles['Title']))
                            elif line.startswith('<h2>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading2']))
                            else:
                                elements.append(Paragraph(line, styles['Normal']))
                            elements.append(Spacer(1, 12))
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                        # Get document-specific signature if available
                        document_signature = signature_map.get(document_type, {})
                        
                        # Get current timestamp from document signature or general request body
                        signature_timestamp = document_signature.get('signatureTimestamp', req_body.get('signatureTimestamp', ''))
                        signature_id = document_signature.get('signatureId', req_body.get('signatureId', ''))
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    if signature_timestamp:
                        try:
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                            except Exception as e:
                                logging.warning(f"Error formatting signature timestamp: {str(e)}")
                            formatted_sig_time = signature_timestamp
                    
                        # Simplified digital verification section - no signatures
                        elements.append(Spacer(1, 20))
                        
                        # Combine date and digital signature ID on one line
                    if signature_id:
                            combined_text = f"Date: {formatted_sig_time}               Digital Signature ID: {signature_id}"
                            elements.append(Paragraph(combined_text, ParagraphStyle(
                                'DigitalSignature',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                                fontSize=10,
                                textColor=colors.gray
                            )))
                        else:
                            # If no signature ID, still show the date in gray
                            elements.append(Paragraph(f"Date: {formatted_sig_time}", ParagraphStyle(
                                'DigitalSignature',
                                parent=styles['Normal'],
                                alignment=1,  # Center alignment
                                fontSize=10,
                            textColor=colors.gray
                        )))
                    
                        # Don't add page break at the end of the loop, it will be handled by the loop
                except Exception as e:
                    logging.error(f"Error processing criminal_history document: {str(e)}")
                    elements.append(Paragraph("Criminal History Disclosure", styles['Title']))
                    elements.append(Spacer(1, 12))
                    elements.append(Paragraph(f"Error rendering criminal history disclosure: {str(e)}", styles['Normal']))
                    # Don't add page break at the end of the loop, it will be handled by the loop

        elif document_type == 'ethics':
            # Read and process the ethics agreement
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/ethics_agreement.md', 'r') as file:
                    content = file.read()
                    
                    # Convert markdown to HTML
                    html = markdown.markdown(content)
                    
                    # Process the content
                    for line in html.split('\n'):
                        if line.strip():
                            if line.startswith('<h1>'):
                                elements.append(Paragraph(line[4:-5], styles['Title']))
                            elif line.startswith('<h2>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading2']))
                            else:
                                elements.append(Paragraph(line, styles['Normal']))
                            elements.append(Spacer(1, 12))
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                        # Get document-specific signature if available
                        document_signature = signature_map.get(document_type, {})
                        
                        # Get current timestamp from document signature or general request body
                        signature_timestamp = document_signature.get('signatureTimestamp', req_body.get('signatureTimestamp', ''))
                        signature_id = document_signature.get('signatureId', req_body.get('signatureId', ''))
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    if signature_timestamp:
                        try:
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                            except Exception as e:
                                logging.warning(f"Error formatting signature timestamp: {str(e)}")
                            formatted_sig_time = signature_timestamp
                    
                        # Simplified digital verification section - no signatures
                        elements.append(Spacer(1, 20))
                        
                        # Combine date and digital signature ID on one line
                    if signature_id:
                            combined_text = f"Date: {formatted_sig_time}               Digital Signature ID: {signature_id}"
                            elements.append(Paragraph(combined_text, ParagraphStyle(
                                'DigitalSignature',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                                fontSize=10,
                                textColor=colors.gray
                            )))
                        else:
                            # If no signature ID, still show the date in gray
                            elements.append(Paragraph(f"Date: {formatted_sig_time}", ParagraphStyle(
                                'DigitalSignature',
                                parent=styles['Normal'],
                                alignment=1,  # Center alignment
                                fontSize=10,
                            textColor=colors.gray
                        )))
                    
                        # Don't add page break at the end of the loop, it will be handled by the loop
                except Exception as e:
                    logging.error(f"Error processing ethics document: {str(e)}")
                    elements.append(Paragraph("Ethics Agreement", styles['Title']))
                    elements.append(Spacer(1, 12))
                    elements.append(Paragraph(f"Error rendering ethics agreement: {str(e)}", styles['Normal']))
                    # Don't add page break at the end of the loop, it will be handled by the loop

        elif document_type == 'critical_rules':
            # Read and process the critical rules
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/critical_rules.md', 'r') as file:
                    content = file.read()
                    
                    # Convert markdown to HTML
                        html = markdown.markdown(content)
                    
                    # Process the content
                    for line in html.split('\n'):
                        if line.strip():
                            if line.startswith('<h1>'):
                                elements.append(Paragraph(line[4:-5], styles['Title']))
                            elif line.startswith('<h2>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading2']))
                            else:
                                elements.append(Paragraph(line, styles['Normal']))
                            elements.append(Spacer(1, 12))
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                        # Get document-specific signature if available
                        document_signature = signature_map.get(document_type, {})
                        
                        # Get current timestamp from document signature or general request body
                        signature_timestamp = document_signature.get('signatureTimestamp', req_body.get('signatureTimestamp', ''))
                        signature_id = document_signature.get('signatureId', req_body.get('signatureId', ''))
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    if signature_timestamp:
                        try:
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                            except Exception as e:
                                logging.warning(f"Error formatting signature timestamp: {str(e)}")
                            formatted_sig_time = signature_timestamp
                    
                        # Simplified digital verification section - no signatures
                        elements.append(Spacer(1, 20))
                        
                        # Combine date and digital signature ID on one line
                    if signature_id:
                            combined_text = f"Date: {formatted_sig_time}               Digital Signature ID: {signature_id}"
                            elements.append(Paragraph(combined_text, ParagraphStyle(
                                'DigitalSignature',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                                fontSize=10,
                                textColor=colors.gray
                            )))
                        else:
                            # If no signature ID, still show the date in gray
                            elements.append(Paragraph(f"Date: {formatted_sig_time}", ParagraphStyle(
                                'DigitalSignature',
                                parent=styles['Normal'],
                                alignment=1,  # Center alignment
                                fontSize=10,
                            textColor=colors.gray
                        )))
                    
                        # Don't add page break at the end of the loop, it will be handled by the loop
                except Exception as e:
                    logging.error(f"Error processing critical_rules document: {str(e)}")
                    elements.append(Paragraph("Critical Rules Agreement", styles['Title']))
                    elements.append(Spacer(1, 12))
                    elements.append(Paragraph(f"Error rendering critical rules agreement: {str(e)}", styles['Normal']))
                    # Don't add page break at the end of the loop, it will be handled by the loop

        elif document_type == 'house_rules':
            # Read and process the house rules
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/house_rules.md', 'r') as file:
                    content = file.read()
                    
                        # Convert markdown to HTML
                        html = markdown.markdown(content)
                    
                    # Process the content
                    for line in html.split('\n'):
                        if line.strip():
                            if line.startswith('<h1>'):
                                elements.append(Paragraph(line[4:-5], styles['Title']))
                            elif line.startswith('<h2>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading2']))
                            else:
                                elements.append(Paragraph(line, styles['Normal']))
                            elements.append(Spacer(1, 12))
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                        # Get document-specific signature if available
                        document_signature = signature_map.get(document_type, {})
                        
                        # Get current timestamp from document signature or general request body
                        signature_timestamp = document_signature.get('signatureTimestamp', req_body.get('signatureTimestamp', ''))
                        signature_id = document_signature.get('signatureId', req_body.get('signatureId', ''))
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    if signature_timestamp:
                        try:
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                            except Exception as e:
                                logging.warning(f"Error formatting signature timestamp: {str(e)}")
                            formatted_sig_time = signature_timestamp
                    
                        # Simplified digital verification section - no signatures
                        elements.append(Spacer(1, 20))
                        
                        # Combine date and digital signature ID on one line
                        if signature_id:
                            combined_text = f"Date: {formatted_sig_time}               Digital Signature ID: {signature_id}"
                            elements.append(Paragraph(combined_text, ParagraphStyle(
                                'DigitalSignature',
                                parent=styles['Normal'],
                                alignment=1,  # Center alignment
                                fontSize=10,
                                textColor=colors.gray
                            )))
                        else:
                            # If no signature ID, still show the date in gray
                            elements.append(Paragraph(f"Date: {formatted_sig_time}", ParagraphStyle(
                                'DigitalSignature',
                                parent=styles['Normal'],
                                alignment=1,  # Center alignment
                                fontSize=10,
                                textColor=colors.gray
                            )))
                        
                        # Don't add page break at the end of the loop, it will be handled by the loop
                except Exception as e:
                    logging.error(f"Error processing house_rules document: {str(e)}")
                    elements.append(Paragraph("House Rules Agreement", styles['Title']))
                    elements.append(Spacer(1, 12))
                    elements.append(Paragraph(f"Error rendering house rules agreement: {str(e)}", styles['Normal']))
                    # Don't add page break at the end of the loop, it will be handled by the loop
            elif document_type == 'digital_signature_consent':
                # Read and process the digital signature consent
                try:
                    logging.info(f"Attempting to read from agreements/{document_type}.md")
                    logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                    with open('agreements/digital_signature_consent.md', 'r') as file:
                        content = file.read()
                        
                        # Replace the resident name placeholder
                        content = content.replace('[RESIDENT_NAME]', full_name)
                        
                        # Convert markdown to HTML
                        html = markdown.markdown(content)
                        
                        # Process the content
                        for line in html.split('\n'):
                            if line.strip():
                                if line.startswith('<h1>'):
                                    elements.append(Paragraph(line[4:-5], styles['Title']))
                                elif line.startswith('<h2>'):
                                    elements.append(Paragraph(line[4:-5], styles['Heading2']))
                                else:
                                    elements.append(Paragraph(line, styles['Normal']))
                        elements.append(Spacer(1, 12))
                        
                        # Add signature section with detailed timestamp - current date
                        elements.append(Spacer(1, 20))
                        elements.append(Paragraph(f"Document generated on: {datetime.now().strftime('%B %d, %Y at %I:%M:%S %p')}", ParagraphStyle(
                            'DigitalSignature',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                            fontSize=10,
                            textColor=colors.gray
                        )))
                except Exception as e:
                    logging.error(f"Error processing digital_signature_consent document: {str(e)}")
                    elements.append(Paragraph("Digital Signature Consent", styles['Title']))
                    elements.append(Spacer(1, 12))
                    elements.append(Paragraph(f"Error rendering digital signature consent: {str(e)}", styles['Normal']))
                    # Don't add page break at the end, this is the last document
            else:
                # Handle unknown document type
                logging.warning(f"Unknown document type: {document_type}")
                elements.append(Paragraph(f"Unknown Document Type: {document_type}", styles['Title']))
                elements.append(Spacer(1, 12))
                elements.append(Paragraph(f"The requested document type '{document_type}' is not recognized.", styles['Normal']))
                elements.append(Spacer(1, 12))
                elements.append(Paragraph("Please contact support if you believe this is an error.", styles['Normal']))
                # Don't add page break at the end, it will be handled by the loop

        # Before building the PDF
        logging.info(f"Number of elements to be added to PDF: {len(elements)}")

        # Build the PDF
        try:
            logging.info("Starting PDF build process")
        doc.build(elements)
            logging.info("PDF build process completed successfully")
        except Exception as e:
            logging.error(f"Error during PDF build: {str(e)}")
            import traceback
            logging.error(f"PDF build traceback: {traceback.format_exc()}")
            raise
        
        # Get the value of the BytesIO buffer
        pdf_bytes = buffer.getvalue()
        pdf_size = len(pdf_bytes)
        logging.info(f"PDF generation complete, size: {pdf_size} bytes")

        # Check for potentially corrupt PDF
        if pdf_size < 100:  # Very small PDFs are likely corrupt
            logging.warning(f"WARNING: Generated PDF is suspiciously small ({pdf_size} bytes)")
        elif not pdf_bytes.startswith(b'%PDF-'):  # Check for PDF header
            logging.warning("WARNING: Generated PDF doesn't begin with '%PDF-' header - likely corrupt")

        buffer.close()
        
        # Create a filename based on document types
        if len(document_types) == 1:
            filename = f"{first_name}_{last_name}_{document_types[0]}.pdf"
        else:
            filename = f"{first_name}_{last_name}_multiple_documents.pdf"
        
        # Return the PDF with correct headers
        return func.HttpResponse(
            body=pdf_bytes,
            mimetype="application/pdf",
            headers={
                "Content-Type": "application/pdf",
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Allow-Origin": "https://intake.journeyhouserecovery.org",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Request-ID",
                "Access-Control-Allow-Credentials": "true",
                "Content-Length": str(pdf_size)
            }
        )
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logging.error(f"Error generating PDF: {str(e)}")
        logging.error(f"Error details: {error_details}")
        
        return func.HttpResponse(
            body=f"Error generating PDF: {str(e)}",
            status_code=500,
            headers=CORS_HEADERS
        )