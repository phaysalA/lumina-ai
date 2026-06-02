import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { CurriculumSchema } from '@/lib/schemas';

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

    // Convert file to base64 for Gemini's native PDF support
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Use Gemini's native PDF understanding — no separate parsing needed
    const { object: curriculum } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: CurriculumSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: base64,
              mediaType: 'application/pdf',
            },
            {
              type: 'text',
              text: `Extract and structure the curriculum from this PDF document. 
Create a hierarchical structure with subtopics and their topics. 
Assign importance weights (0-100) based on content emphasis.`,
            },
          ],
        },
      ],
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
