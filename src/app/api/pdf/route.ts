import { NextRequest, NextResponse } from 'next/server';
import { FormData } from '@/types'; // Import the FormData type

/**
 * Validates that essential form data is present
 * Returns true if valid, error message string if invalid
 */
function validatePdfData(data: any): true | string {
  // Check for basic required form fields
  if (!data) return 'No form data provided';
  
  // Check personal information
  if (!data.firstName || !data.lastName) {
    return 'Missing required personal information (firstName, lastName)';
  }
  
  // Check for signatures
  if (!Array.isArray(data.signatures) || data.signatures.length === 0) {
    return 'Missing signatures data';
  }
  
  // Check for health status
  if (!data.healthStatus) {
    return 'Missing health status data';
  }
  
  // Additional validation could be added here
  return true;
}

/**
 * API route that proxies PDF generation requests to the Azure Function
 * This helps avoid CORS issues and provides better error handling
 */
export async function POST(request: NextRequest) {
  // Get the Azure Function URL based on environment
  const FUNCTION_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:7071/api/generatepdf'
    : 'https://jhonboard-func.azurewebsites.net/api/generatepdf';

  try {
    // Parse the JSON body
    const formData = await request.json() as FormData;
    
    // Validate the form data
    const validationResult = validatePdfData(formData);
    if (validationResult !== true) {
      console.error('PDF generation data validation failed:', validationResult);
      return NextResponse.json(
        { error: `Data validation failed: ${validationResult}` },
        { status: 400 }
      );
    }
    
    // Log request (excluding sensitive info)
    console.log('PDF generation proxy request details:', {
      url: FUNCTION_URL,
      dataSize: JSON.stringify(formData).length,
      firstName: formData.firstName,
      lastName: formData.lastName,
      signatureCount: formData.signatures?.length || 0,
      hasEmergencyContact: !!formData.emergencyContact,
      hasAuthorizedPeople: Array.isArray(formData.authorizedPeople) && formData.authorizedPeople.length > 0,
      hasMedicalInfo: !!formData.medicalInformation,
      dataKeys: Object.keys(formData),
    });

    // Add a timestamp to the request for tracking
    const requestWithTimestamp = {
      ...formData,
      _requestTimestamp: new Date().toISOString()
    };

    // Forward the request to Azure Function
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestWithTimestamp),
      // Set longer timeout
      signal: AbortSignal.timeout(120000) // 2 minute timeout
    });

    // Log response status
    console.log('PDF generation service response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    if (!response.ok) {
      // Try to parse error as JSON first, then fallback to text
      let errorDetail;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await response.json();
        errorDetail = JSON.stringify(errorJson);
      } else {
        errorDetail = await response.text();
      }

      console.error('Azure function error response:', {
        status: response.status,
        error: errorDetail
      });
      
      return NextResponse.json(
        { error: `PDF generation failed: ${response.status} ${response.statusText}`, details: errorDetail },
        { status: response.status }
      );
    }

    // Get the response as an ArrayBuffer
    const pdfBuffer = await response.arrayBuffer();
    
    // Check if the buffer is empty
    if (pdfBuffer.byteLength === 0) {
      console.error('Empty PDF received from Azure function (zero bytes)');
      return NextResponse.json(
        { error: 'Empty PDF received from generation service' },
        { status: 500 }
      );
    }

    // Log successful PDF generation
    console.log('PDF generation successful:', {
      byteLength: pdfBuffer.byteLength,
      firstName: formData.firstName,
      lastName: formData.lastName
    });

    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${formData.lastName}${formData.firstName}_Intake.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString()
      }
    });
  } catch (error) {
    console.error('PDF proxy error:', error);
    return NextResponse.json(
      { error: `PDF generation proxy error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 