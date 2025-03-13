import logging
import azure.functions as func
import requests
import os
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    # Get the PDF function URL from environment variable or use a default
    pdf_function_url = os.environ.get('PDF_FUNCTION_URL', 'https://jhonboard-func.azurewebsites.net/api/generatepdf')
    
    try:
        # Forward the request body to the PDF generation function
        request_body = req.get_body()
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Forward any authorization headers
        if req.headers.get('Authorization'):
            headers['Authorization'] = req.headers.get('Authorization')
            
        # Log request being forwarded
        logging.info(f'Forwarding request to {pdf_function_url}')
        
        # Make the request to the PDF generation function
        response = requests.post(
            pdf_function_url,
            data=request_body,
            headers=headers
        )
        
        # Return the response from the PDF generation function
        return func.HttpResponse(
            body=response.content,
            status_code=response.status_code,
            headers={
                'Content-Type': response.headers.get('Content-Type', 'application/pdf'),
                'Content-Disposition': response.headers.get('Content-Disposition', 'attachment; filename=document.pdf')
            }
        )
    except Exception as e:
        logging.error(f'Error forwarding request: {str(e)}')
        return func.HttpResponse(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        ) 