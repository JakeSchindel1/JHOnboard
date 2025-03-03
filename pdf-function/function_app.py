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
        document_type = req_body.get('documentType', '')
        
        # At the start of the generate_pdf function
        logging.info(f"Received request for document type: {document_type}")
        logging.info(f"Current working directory: {os.getcwd()}")
        logging.info(f"Directory contents: {os.listdir('.')}")
        
        # Common data
        first_name = req_body.get('firstName', '')
        last_name = req_body.get('lastName', '')
        full_name = f"{first_name} {last_name}".strip()
        
        # Set up the document
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Add logo if it exists
        logo_path = "logo.png"
        if os.path.exists(logo_path):
            elements.append(Image(logo_path, width=200, height=100))
            elements.append(Spacer(1, 20))
        
        if document_type == 'resident_as_guest':
            # Read and process the resident as guest agreement
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/resident_as_guest.md', 'r') as file:
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
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                    # Get current timestamp from request body
                    signature_timestamp = req_body.get('signatureTimestamp', '')
                    witness_timestamp = req_body.get('witnessTimestamp', '')
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    formatted_wit_time = ''
                    if signature_timestamp:
                        try:
                            from datetime import datetime
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_sig_time = signature_timestamp
                    
                    if witness_timestamp:
                        try:
                            wit_dt = datetime.fromisoformat(witness_timestamp.replace('Z', '+00:00'))
                            formatted_wit_time = wit_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_wit_time = witness_timestamp

                    # Enhanced signature table with timestamps
                    signature_table = Table([
                        ['Resident Signature:', '_' * 40, 'Date:', formatted_sig_time or '_' * 30],
                        ['Witness Signature:', '_' * 40, 'Date:', formatted_wit_time or '_' * 30]
                    ], colWidths=[100, 200, 50, 150])
                    
                    signature_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
                    ]))
                    
                    elements.append(signature_table)
                    
                    # Add signature ID if present
                    signature_id = req_body.get('signatureId', '')
                    if signature_id:
                        elements.append(Spacer(1, 12))
                        elements.append(Paragraph(f"Document ID: {signature_id}", ParagraphStyle(
                            'SignatureID',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                            fontSize=8,
                            textColor=colors.gray
                        )))
                    
                    # Add page break after each form
                    elements.append(PageBreak())

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
                    
                    # Get current timestamp from request body
                    signature_timestamp = req_body.get('signatureTimestamp', '')
                    witness_timestamp = req_body.get('witnessTimestamp', '')
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    formatted_wit_time = ''
                    if signature_timestamp:
                        try:
                            from datetime import datetime
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_sig_time = signature_timestamp
                    
                    if witness_timestamp:
                        try:
                            wit_dt = datetime.fromisoformat(witness_timestamp.replace('Z', '+00:00'))
                            formatted_wit_time = wit_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_wit_time = witness_timestamp

                    # Enhanced signature table with timestamps
                    signature_table = Table([
                        ['Resident Signature:', '_' * 40, 'Date:', formatted_sig_time or '_' * 30],
                        ['Witness Signature:', '_' * 40, 'Date:', formatted_wit_time or '_' * 30]
                    ], colWidths=[100, 200, 50, 150])
                    
                    signature_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
                    ]))
                    
                    elements.append(signature_table)
                    
                    # Add signature ID if present
                    signature_id = req_body.get('signatureId', '')
                    if signature_id:
                        elements.append(Spacer(1, 12))
                        elements.append(Paragraph(f"Document ID: {signature_id}", ParagraphStyle(
                            'SignatureID',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                            fontSize=8,
                            textColor=colors.gray
                        )))
                    
                    # Add page break after each form
                    elements.append(PageBreak())

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
                        legal_status = ["No current legal issues reported."]
                    
                    content = content.replace('[LEGAL_STATUS_SUMMARY]', '\n'.join(legal_status))
                    
                    # Create Pending Charges Section
                    pending_charges = req_body.get('pendingCharges', [])
                    if pending_charges and req_body.get('legalStatus', {}).get('hasPendingCharges'):
                        charges_text = []
                        for i, charge in enumerate(pending_charges, 1):
                            desc = charge.get('chargeDescription', '').strip()
                            loc = charge.get('location', '').strip()
                            if desc or loc:
                                charges_text.append(f"{i}. {desc}")
                                if loc:
                                    charges_text.append(f"   Location: {loc}")
                                charges_text.append("")
                        charges_content = '\n'.join(charges_text) if charges_text else "No specific charges listed."
                    else:
                        charges_content = "No pending charges reported."
                    
                    content = content.replace('[PENDING_CHARGES]', charges_content)
                    
                    # Create Convictions Section
                    convictions = req_body.get('convictions', [])
                    if convictions and req_body.get('legalStatus', {}).get('hasConvictions'):
                        conv_text = []
                        for i, conviction in enumerate(convictions, 1):
                            offense = conviction.get('offense', '').strip()
                            if offense:
                                conv_text.append(f"{i}. {offense}")
                        conv_content = '\n'.join(conv_text) if conv_text else "No specific convictions listed."
                    else:
                        conv_content = "No prior convictions reported."
                    
                    content = content.replace('[CONVICTIONS]', conv_content)
                    
                    # Create Additional Information Section
                    additional_info = []
                    if req_body.get('legalStatus', {}).get('isWanted'):
                        additional_info.append("- Individual reports being wanted by law enforcement or government agency")
                    if req_body.get('legalStatus', {}).get('isOnBond'):
                        bondsman = req_body.get('legalStatus', {}).get('bondsmanName', '')
                        additional_info.append(f"- Currently out on bond")
                        if bondsman:
                            additional_info.append(f"  Bondsman: {bondsman}")
                    
                    if not additional_info:
                        additional_info = ["No additional legal information to report."]
                    
                    content = content.replace('[ADDITIONAL_INFO]', '\n'.join(additional_info))
                    
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
                    
                    # Get current timestamp from request body
                    signature_timestamp = req_body.get('signatureTimestamp', '')
                    witness_timestamp = req_body.get('witnessTimestamp', '')
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    formatted_wit_time = ''
                    if signature_timestamp:
                        try:
                            from datetime import datetime
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_sig_time = signature_timestamp
                    
                    if witness_timestamp:
                        try:
                            wit_dt = datetime.fromisoformat(witness_timestamp.replace('Z', '+00:00'))
                            formatted_wit_time = wit_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_wit_time = witness_timestamp

                    # Enhanced signature table with timestamps
                    signature_table = Table([
                        ['Resident Signature:', '_' * 40, 'Date:', formatted_sig_time or '_' * 30],
                        ['Witness Signature:', '_' * 40, 'Date:', formatted_wit_time or '_' * 30]
                    ], colWidths=[100, 200, 50, 150])
                    
                    signature_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
                    ]))
                    
                    elements.append(signature_table)
                    
                    # Add signature ID if present
                    signature_id = req_body.get('signatureId', '')
                    if signature_id:
                        elements.append(Spacer(1, 12))
                        elements.append(Paragraph(f"Document ID: {signature_id}", ParagraphStyle(
                            'SignatureID',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                            fontSize=8,
                            textColor=colors.gray
                        )))
                    
                    # Add page break after each form
                    elements.append(PageBreak())

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
                    
                    # Get current timestamp from request body
                    signature_timestamp = req_body.get('signatureTimestamp', '')
                    witness_timestamp = req_body.get('witnessTimestamp', '')
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    formatted_wit_time = ''
                    if signature_timestamp:
                        try:
                            from datetime import datetime
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_sig_time = signature_timestamp
                    
                    if witness_timestamp:
                        try:
                            wit_dt = datetime.fromisoformat(witness_timestamp.replace('Z', '+00:00'))
                            formatted_wit_time = wit_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_wit_time = witness_timestamp

                    # Enhanced signature table with timestamps
                    signature_table = Table([
                        ['Resident Signature:', '_' * 40, 'Date:', formatted_sig_time or '_' * 30],
                        ['Witness Signature:', '_' * 40, 'Date:', formatted_wit_time or '_' * 30]
                    ], colWidths=[100, 200, 50, 150])
                    
                    signature_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
                    ]))
                    
                    elements.append(signature_table)
                    
                    # Add signature ID if present
                    signature_id = req_body.get('signatureId', '')
                    if signature_id:
                        elements.append(Spacer(1, 12))
                        elements.append(Paragraph(f"Document ID: {signature_id}", ParagraphStyle(
                            'SignatureID',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                            fontSize=8,
                            textColor=colors.gray
                        )))
                    
                    # Add page break after each form
                    elements.append(PageBreak())

        elif document_type == 'critical_rules':
            # Read and process the critical rules
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/critical_rules.md', 'r') as file:
                    content = file.read()
                    
                    # Convert markdown to HTML
                    html = markdown.markdown(content, extensions=['markdown.extensions.tables'])
                    
                    # Process the content
                    for line in html.split('\n'):
                        if line.strip():
                            if line.startswith('<h1>'):
                                elements.append(Paragraph(line[4:-5], styles['Title']))
                            elif line.startswith('<h2>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading2']))
                            elif line.startswith('<h3>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading3']))
                            else:
                                elements.append(Paragraph(line, styles['Normal']))
                            elements.append(Spacer(1, 12))
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                    # Get current timestamp from request body
                    signature_timestamp = req_body.get('signatureTimestamp', '')
                    witness_timestamp = req_body.get('witnessTimestamp', '')
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    formatted_wit_time = ''
                    if signature_timestamp:
                        try:
                            from datetime import datetime
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_sig_time = signature_timestamp
                    
                    if witness_timestamp:
                        try:
                            wit_dt = datetime.fromisoformat(witness_timestamp.replace('Z', '+00:00'))
                            formatted_wit_time = wit_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_wit_time = witness_timestamp

                    # Enhanced signature table with timestamps
                    signature_table = Table([
                        ['Resident Signature:', '_' * 40, 'Date:', formatted_sig_time or '_' * 30],
                        ['Witness Signature:', '_' * 40, 'Date:', formatted_wit_time or '_' * 30]
                    ], colWidths=[100, 200, 50, 150])
                    
                    signature_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
                    ]))
                    
                    elements.append(signature_table)
                    
                    # Add signature ID if present
                    signature_id = req_body.get('signatureId', '')
                    if signature_id:
                        elements.append(Spacer(1, 12))
                        elements.append(Paragraph(f"Document ID: {signature_id}", ParagraphStyle(
                            'SignatureID',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                            fontSize=8,
                            textColor=colors.gray
                        )))
                    
                    # Add page break after each form
                    elements.append(PageBreak())

        elif document_type == 'house_rules':
            # Read and process the house rules
            try:
                logging.info(f"Attempting to read from agreements/{document_type}.md")
                logging.info(f"Agreements directory contents: {os.listdir('agreements')}")
                with open('agreements/house_rules.md', 'r') as file:
                    content = file.read()
                    
                    # Convert markdown to HTML with extensions for better formatting
                    html = markdown.markdown(content, extensions=['markdown.extensions.tables'])
                    
                    # Process the content
                    for line in html.split('\n'):
                        if line.strip():
                            if line.startswith('<h1>'):
                                elements.append(Paragraph(line[4:-5], styles['Title']))
                            elif line.startswith('<h2>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading2']))
                            elif line.startswith('<h3>'):
                                elements.append(Paragraph(line[4:-5], styles['Heading3']))
                            else:
                                elements.append(Paragraph(line, styles['Normal']))
                            elements.append(Spacer(1, 12))
                    
                    # Add signature section with detailed timestamp
                    elements.append(Spacer(1, 20))
                    
                    # Get current timestamp from request body
                    signature_timestamp = req_body.get('signatureTimestamp', '')
                    witness_timestamp = req_body.get('witnessTimestamp', '')
                    
                    # Format timestamps if present
                    formatted_sig_time = ''
                    formatted_wit_time = ''
                    if signature_timestamp:
                        try:
                            from datetime import datetime
                            sig_dt = datetime.fromisoformat(signature_timestamp.replace('Z', '+00:00'))
                            formatted_sig_time = sig_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_sig_time = signature_timestamp
                    
                    if witness_timestamp:
                        try:
                            wit_dt = datetime.fromisoformat(witness_timestamp.replace('Z', '+00:00'))
                            formatted_wit_time = wit_dt.strftime("%B %d, %Y at %I:%M:%S %p")
                        except:
                            formatted_wit_time = witness_timestamp

                    # Enhanced signature table with timestamps
                    signature_table = Table([
                        ['Resident Signature:', '_' * 40, 'Date:', formatted_sig_time or '_' * 30],
                        ['Witness Signature:', '_' * 40, 'Date:', formatted_wit_time or '_' * 30]
                    ], colWidths=[100, 200, 50, 150])
                    
                    signature_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
                    ]))
                    
                    elements.append(signature_table)
                    
                    # Add signature ID if present
                    signature_id = req_body.get('signatureId', '')
                    if signature_id:
                        elements.append(Spacer(1, 12))
                        elements.append(Paragraph(f"Document ID: {signature_id}", ParagraphStyle(
                            'SignatureID',
                            parent=styles['Normal'],
                            alignment=1,  # Center alignment
                            fontSize=8,
                            textColor=colors.gray
                        )))
                    
                    # Add page break after each form
                    elements.append(PageBreak())

        # Before building the PDF
        logging.info(f"Number of elements to be added to PDF: {len(elements)}")

        # Build the PDF
        doc.build(elements)
        
        # Get the value of the BytesIO buffer
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return func.HttpResponse(
            pdf_bytes,
            mimetype="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={document_type}.pdf"
            }
        )
        
    except Exception as e:
        return func.HttpResponse(
            f"Error generating PDF: {str(e)}",
            status_code=500
        )