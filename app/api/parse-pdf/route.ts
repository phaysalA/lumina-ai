import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { CurriculumSchema } from '@/lib/schemas';
import path from 'path';

// Set the worker source to the actual file path so pdfjs-dist can find it
// in the Next.js server environment (Turbopack bundles break the default resolution)
const workerPath = path.join(
  process.cwd(),
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
);
PDFParse.setWorker(workerPath);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to Uint8Array for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Parse PDF using pdf-parse v2 API
    const pdfParser = new PDFParse({ data });
    const textResult = await pdfParser.getText();
    const text = textResult.text;
    await pdfParser.destroy();

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    // Use AI to structure the curriculum
    const { object: curriculum } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: CurriculumSchema,
      prompt: `Extract and structure the curriculum from the following PDF text. 
      Create a hierarchical structure with subtopics and their topics. 
      Assign importance weights (0-100) based on content emphasis.
      
      PDF Content:
      ${text.substring(0, 3000)}`,
    });

    return NextResponse.json(curriculum);
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}
