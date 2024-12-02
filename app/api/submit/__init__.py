import logging
import json
import azure.functions as func
import pyodbc

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    try:
        body = req.get_json()
        conn_str = "Driver={ODBC Driver 18 for SQL Server};Server=tcp:journey-house.database.windows.net,1433;Database=participant-info;Authentication=ActiveDirectoryDefault;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
        
        with pyodbc.connect(conn_str) as conn:
            # Add your SQL operations here
            return func.HttpResponse(
                json.dumps({"success": True, "message": "Data received"}),
                mimetype="application/json"
            )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Failed to process data", "error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )