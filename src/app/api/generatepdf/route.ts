// Now that we're using standard Next.js deployment, this API route can proxy requests to the Azure Function

import { NextRequest, NextResponse } from 'next/server';

// Enable dynamic API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Use Node.js runtime

// Default URL for the Azure Function
const PDF_FUNCTION_URL = process.env.PDF_FUNCTION_URL || 'https://jhonboard-func.azurewebsites.net/api/generatepdf';

export async function POST(request: NextRequest) {
  console.log('PDF generation request received, forwarding to Azure Function');
  
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the Azure Function
    const response = await fetch(PDF_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': request.headers.get('X-Request-ID') || `pdf-${Date.now()}`
      },
      body: JSON.stringify(body)
    });
    
    // If the function returned an error, pass it through
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Function returned an error:', response.status, errorText);
      
      return new NextResponse(
        errorText,
        { 
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('Content-Type') || 'text/plain'
          }
        }
      );
    }
    
    // Get the PDF data
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    
    console.log('PDF generated successfully, size:', buffer.byteLength);
    
    // Return the PDF with appropriate headers
    return new NextResponse(
      buffer,
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="GeneratedIntake.pdf"`,
          'Content-Length': buffer.byteLength.toString()
        }
      }
    );
  } catch (error) {
    console.error('Error forwarding request to Azure Function:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 