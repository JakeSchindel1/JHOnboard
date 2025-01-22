import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';

export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const scriptPath = join(process.cwd(), 'src/app/api/generate-pdf/generate.py');
    
    return new Promise<Response>((resolve, reject) => {
      const process = spawn('python', [scriptPath, JSON.stringify(data)]);
      
      let pdfBuffer = Buffer.from([]);
      
      process.stdout.on('data', (data) => {
        pdfBuffer = Buffer.concat([pdfBuffer, data]);
      });
      
      process.on('close', (code) => {
        if (code !== 0) {
          reject(new NextResponse('PDF generation failed', { status: 500 }));
          return;
        }
        
        resolve(new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=onboarding.pdf'
          }
        }));
      });
    });
  } catch (error) {
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}