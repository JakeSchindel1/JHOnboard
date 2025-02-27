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
            spaceAfter=30,
            fontSize=18,
            textColor=colors.black,
        )
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            spaceBefore=20,
            spaceAfter=12,
            textColor = colors.black,
            fontName='Helvetica-Bold'
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

        indented_style = ParagraphStyle(
            'Indented',
            parent=styles['Normal'],
            leftIndent=36,
            fontSize=11,
            leading=16
        )

        legal_status_style = ParagraphStyle(
            'LegalStatus',
            parent=styles['Normal'],
            fontSize=11,
            leading=16,
            leftIndent=12,  # Slight indent
        )

        elements = []

        # --- Logo (Smaller) ---
        logo_path = os.path.join(os.path.dirname(__file__), 'assets', 'JourneyHouseLogo.png')
        if os.path.exists(logo_path):
            img = Image(logo_path)
            aspect = img.imageWidth / float(img.imageHeight)
            target_width = 2 * inch  # Reduced size
            img.drawWidth = target_width
            img.drawHeight = target_width / aspect
            elements.append(img)
            elements.append(Spacer(1, 12))


        elements.append(Paragraph("Intake Form Summary", title_style))

        # --- Personal Information (Structured) ---
        elements.append(Paragraph("Personal Information", section_style))
        personal_info_data = [
            [Paragraph("<b>Name:</b>", normal_style), f"{req_body.get('firstName', '')} {req_body.get('lastName', '')}"],
            [Paragraph("<b>Date of Birth:</b>", normal_style), req_body.get('dateOfBirth', '')],
            [Paragraph("<b>Intake Date:</b>", normal_style), req_body.get('intakeDate', '')],
            [Paragraph("<b>Housing Location:</b>", normal_style), req_body.get('housingLocation', '').capitalize()],
            [Paragraph("<b>Email:</b>", normal_style), req_body.get('email', '')],
            [Paragraph("<b>Phone:</b>", normal_style), req_body.get('phone', '')],  # Added phone number
        ]
        personal_info_table = Table(personal_info_data, colWidths=[1.5*inch, 5*inch])
        personal_info_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(personal_info_table)


        # --- Insurance Information ---
        elements.append(Paragraph("Insurance Information", section_style))
        if req_body.get('insurances'):
            for insurance in req_body['insurances']:
                elements.append(Paragraph(
                    f"<b>Type:</b> {insurance.get('insuranceType', '').capitalize()}<br/>"
                    f"<b>Policy Number:</b> {insurance.get('policyNumber', '')}",
                    normal_style
                ))
                elements.append(Spacer(1, 6))
        else:
            elements.append(Paragraph("No insurance information provided", normal_style))

        # --- Emergency Contact ---
        elements.append(Paragraph("Emergency Contact", section_style))
        if 'emergencyContact' in req_body:
            ec = req_body['emergencyContact']
            elements.append(Paragraph(
                f"<b>Name:</b> {ec.get('firstName', '')} {ec.get('lastName', '')}<br/>"
                f"<b>Relationship:</b> {ec.get('relationship', '').capitalize()}<br/>"
                f"<b>Phone:</b> {ec.get('phone', '')}",
                normal_style
            ))

        # --- Legal Status ---
        elements.append(Paragraph("Legal Status", section_style))
        legal_status = req_body.get('legalStatus', {})

        if legal_status.get('hasProbation'):
            elements.append(Paragraph(f"Probation - {legal_status.get('jurisdiction', '').capitalize()}", legal_status_style))

        if legal_status.get('hasPretrial'):
             elements.append(Paragraph(f"Pretrial - {legal_status.get('jurisdiction', '').capitalize()}", legal_status_style))

        if not legal_status.get('hasProbation') and not legal_status.get('hasPretrial'):
            elements.append(Paragraph("No Probation or Pretrial", legal_status_style))



        # --- Medications ---
        elements.append(Paragraph("Medications", section_style))
        if req_body.get('medications'):
            for med in req_body['medications']:
                elements.append(Paragraph(f"• {med}", normal_style))
        else:
            elements.append(Paragraph("No medications listed", normal_style))

        # --- Page Break BEFORE Combined Signatures ---
        elements.append(PageBreak())

       # --- Combined Signatures and Legal Text (Single Page) ---
        elements.append(Paragraph("Consent and Agreement", section_style)) #Combined Heading

        if req_body.get('signatures'):
            for sig in req_body['signatures']:
                elements.append(Paragraph(
                    f"Signature ID: {sig.get('signatureId', '')} - {sig.get('signatureType', '').replace('_', ' ').title()}",
                    centered_style
                ))
                elements.append(Spacer(1, 6))

        elements.append(Spacer(1, 20))
        legal_text = """By signing below, I hereby declare that:

1.  All information provided in this intake form is true, accurate, and complete to the best of my knowledge.
2.  I understand that providing false information may result in immediate termination of services and potential legal consequences.
3.  I acknowledge that my electronic signature on this document is legally binding, carrying the same validity and enforceability as a handwritten signature.
4.  I have been given the opportunity to review all information and ask questions before signing.
5.  I consent to the collection, storage, and processing of the personal information provided in this form in accordance with applicable privacy laws.
6.  I understand that this signed document will be stored securely and may be used as legal evidence of my consent and agreements."""

        elements.append(Paragraph(legal_text, indented_style))

        elements.append(Spacer(1, 20))
        disclaimer_text = """I understand that the electronic signatures collected during this intake process are legally binding and equivalent to physical signatures. I acknowledge that these signatures represent my consent and agreement to all terms and conditions presented."""
        elements.append(Paragraph(disclaimer_text, indented_style))

        elements.append(Spacer(1, 30))
        signature_table_final = Table([
            ['_' * 30, '_' * 30],
            ['Resident Name:', 'Resident Signature:'],
        ], colWidths=[3*inch, 3*inch])

        signature_table_final.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(signature_table_final)
        # --- End Combined Signatures Page ---

        # --- Page Break Before Recovery History ---
        elements.append(PageBreak())

        # --- Recovery History and Subsequent Sections (New Page) ---
        elements.append(Paragraph("Recovery History", section_style))
        if req_body.get('hasResidenceHistory') == 'yes':
            elements.append(create_recovery_residence_table(req_body.get('recoveryResidences', [])))
        else:elements.append(Paragraph("No previous recovery residence history", normal_style))
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("Hospitalizations or Treatment", section_style))
        if req_body.get('hasTreatmentHistory') == 'yes':
            elements.append(create_hospitalization_table(req_body.get('treatmentHistory', [])))
        else:
            elements.append(Paragraph("No hospitalization or treatment history", normal_style))
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("Incarceration", section_style))
        if req_body.get('hasIncarcerationHistory') == 'yes':
            elements.append(create_incarceration_table(req_body.get('incarcerationHistory', [])))
        else:
            elements.append(Paragraph("No incarceration history", normal_style))
        elements.append(Spacer(1, 20))

        elements.append(Paragraph("Criminal Supervision", section_style))
        legal_status = req_body.get('legalStatus', {})

        if legal_status.get('hasProbation'):
            elements.append(Paragraph(f"Probation - {legal_status.get('jurisdiction', '').capitalize()}", legal_status_style))

        if legal_status.get('hasPretrial'):
             elements.append(Paragraph(f"Pretrial - {legal_status.get('jurisdiction', '').capitalize()}", legal_status_style))

        if not legal_status.get('hasProbation') and not legal_status.get('hasPretrial'):
            elements.append(Paragraph("No Probation or Pretrial", legal_status_style))

        elements.append(PageBreak()) # Page break for drug screen
        elements.append(Paragraph("Baseline Instant Screen", section_style))
        elements.append(Paragraph(
            "The baseline drug screen identifies what is in your system so that we can get you the help you need, "
            "and we create milestones of improvement. Baselines are not reported to supervision unless "
            "specifically requested.",
            normal_style
        ))

        drug_test_elements = create_drug_screen_section(req_body.get('drugTestResults', {}))
        elements.extend(drug_test_elements)

        # Add signature lines *after* drug screen
        elements.append(Spacer(1, 30))
        signature_table = Table([
            ['_' * 30, '_' * 30],
            ['Resident Name:', 'Resident Signature:'],
            ['', ''],
            ['_' * 30, '_' * 30],
            ['Witness Signature:', 'Date:']
        ], colWidths=[3*inch, 3*inch])

        signature_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(signature_table)

        # Add document generation timestamp (Bottom Right)
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(
            f"Document generated on: {req_body.get('intakeDate', '')}",
            ParagraphStyle(
                'DateStamp',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.gray,
                alignment=2  # Right alignment
            )
        ))

        # Build the PDF
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