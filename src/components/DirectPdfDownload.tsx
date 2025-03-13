"use client"

import { useState } from 'react';
import { Button } from './ui/button';
import { FormData } from '@/types';

interface DirectPdfDownloadProps {
  formData: FormData;
  className?: string;
}

/**
 * Component that provides a direct download link to the PDF from the Azure Function
 * This is a fallback if the regular PDF generation method fails
 */
export default function DirectPdfDownload({ formData, className = '' }: DirectPdfDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // This component calls the Azure Function directly as a fallback
  // when the server-side API route fails
  const functionUrl = process.env.NEXT_PUBLIC_PDF_FUNCTION_URL || 'https://jhonboard-func.azurewebsites.net/api/generatepdf';
  
  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare the data to send to the function
      const pdfRequestData = {
        ...formData,
        documentType: 'intake_form' // Specify the document type for the Azure Function
      };
      
      // Send POST request to generate PDF
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-ID': `direct-pdf-${Date.now()}`
        },
        body: JSON.stringify(pdfRequestData),
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF generation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Get the PDF data
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Empty PDF file received');
      }
      
      // Create a download link
      const firstName = (formData.firstName || '').trim();
      const lastName = (formData.lastName || '').trim();
      const filename = `${lastName}${firstName}_Intake.pdf`
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9_.-]/g, '');
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append to document and click
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      setSuccess(true);
    } catch (error) {
      console.error('Direct PDF download failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className={`mt-4 ${className}`}>
      <Button 
        type="button" 
        onClick={handleGeneratePdf} 
        disabled={isGenerating}
        variant={success ? "outline" : "secondary"}
      >
        {isGenerating ? 'Generating PDF...' : success ? 'PDF Downloaded' : 'Generate PDF (Direct)'}
      </Button>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">
          Error: {error}
        </p>
      )}
      
      {success && (
        <p className="text-green-500 text-sm mt-2">
          PDF generated successfully!
        </p>
      )}
    </div>
  );
} 