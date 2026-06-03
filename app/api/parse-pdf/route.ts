import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { CurriculumSchema, DiagnosticQuizSchema } from '@/lib/schemas';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MEDIA_TYPE_MAP: Record<string, string> = {
  'application/pdf': 'application/pdf',
  'application/msword': 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

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

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or Word document (.pdf, .doc, .docx).' },
        { status: 400 }
      );
    }

    // Convert file to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mediaType = MEDIA_TYPE_MAP[file.type] || 'application/pdf';

    // Step 1: Extract curriculum structure
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
              mediaType,
            },
            {
              type: 'text',
              text: `Extract and structure the curriculum from this document. 
Create a hierarchical structure with subtopics and their topics. 
Assign importance weights (0-100) based on content emphasis.`,
            },
          ],
        },
      ],
    });

    // Step 2: Generate diagnostic quiz questions based on the extracted curriculum
    const topicNames = curriculum.subtopics.flatMap(sub => sub.topics.map(t => t.name));

    const { object: diagnosticQuiz } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: DiagnosticQuizSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: base64,
              mediaType,
            },
            {
              type: 'text',
              text: `Based on this document, generate a quick diagnostic assessment quiz to test a student's understanding of the material.

The curriculum covers these topics: ${topicNames.join(', ')}

Generate 2-3 questions per topic (aim for ${Math.min(topicNames.length * 2, 15)} questions total to keep it quick). 
Mix difficulty levels: include some basic recall, some intermediate application, and some advanced analysis questions.

Each question should:
- Be directly testable from the document content
- Have exactly 4 plausible options with only one correct answer
- Test actual understanding, not just memorization
- Be clear and unambiguous

This quiz helps determine the student's current strengths and weaknesses so we can personalize their study plan.`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ curriculum, diagnosticQuiz });
  } catch (error) {
    console.error('Document parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse document' },
      { status: 500 }
    );
  }
}
