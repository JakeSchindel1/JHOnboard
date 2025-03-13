// This file is kept for compatibility but won't be used in static export.
// The client will directly call the Azure Function

// Note: For static export, this route should be removed from the build
// and direct client-side calls to the Azure Function should be used instead.

// Default URL for the Azure Function
const PDF_FUNCTION_URL = process.env.PDF_FUNCTION_URL || 'https://jhonboard-func.azurewebsites.net/api/generatepdf';

// Export basic config to prevent dynamic errors
export const dynamic = 'error';

export async function POST() {
  return new Response(
    JSON.stringify({ 
      error: 'This route is not available in static export mode',
      message: 'Please call the Azure Function directly'
    }),
    { 
      status: 501,
      headers: { 'content-type': 'application/json' }
    }
  );
} 