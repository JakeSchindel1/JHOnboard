import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Path to Python script relative to this file
    const scriptPath = join(process.cwd(), 'src/app/api/generate-pdf/generate.py');
    
    return new Promise((resolve, reject) => {
      const process = spawn('python', [scriptPath, JSON.stringify(data)]);
      
      let pdfBuffer = Buffer.from([]);
      
      process.stdout.on('data', (data) => {
        pdfBuffer = Buffer.concat([pdfBuffer, data]);
      });
      
      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('PDF generation failed'));
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
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}