import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import fs from 'fs/promises';

export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    console.log('Received data:', data);  // Debug log
    
    const scriptPath = join(process.cwd(), 'src/app/api/generate-pdf/generate.py');
    console.log('Script path:', scriptPath); // Debug log
    
    return new Promise<Response>((resolve, reject) => {
      const pythonProcess = spawn('python', [scriptPath, JSON.stringify(data)]);
      
      let stdoutData = Buffer.from([]);
      let stderrData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        console.log('Received chunk size:', data.length); // Debug log
        stdoutData = Buffer.concat([stdoutData, data]);
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        console.log('Python process exited with code:', code); // Debug log
        console.log('Stderr:', stderrData); // Debug log
        
        if (code !== 0) {
          return reject(new NextResponse('PDF generation failed', { status: 500 }));
        }
        
        if (stdoutData.length === 0) {
          return reject(new NextResponse('No PDF data generated', { status: 500 }));
        }
        
        resolve(new NextResponse(stdoutData, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=onboarding.pdf'
          }
        }));
      });
    });
  } catch (error) {
    console.error('Error:', error); // Debug log
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}