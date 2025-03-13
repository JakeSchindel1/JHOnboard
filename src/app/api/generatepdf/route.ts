import { NextRequest, NextResponse } from 'next/server';

// Default URL for the Azure Function
const DEFAULT_PDF_FUNCTION_URL = 'https://jhonboard-func.azurewebsites.net/api/generatepdf';

// Add export config for Next.js static export
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  // Get the PDF function URL from environment variable or use default
  const pdfFunctionUrl = process.env.PDF_FUNCTION_URL || DEFAULT_PDF_FUNCTION_URL;
  
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the Azure Function
    console.log(`Forwarding PDF request to: ${pdfFunctionUrl}`);
    
    const response = await fetch(pdfFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers if present
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') as string } 
          : {})
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PDF generation failed: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: `PDF generation failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the response as a blob
    const blob = await response.blob();
    
    // Return the PDF with appropriate headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/pdf',
        'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename=document.pdf'
      }
    });
    
  } catch (error) {
    console.error('Error forwarding request to PDF function:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 