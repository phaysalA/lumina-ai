import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { StudyGuideSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const { topic, strength } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const prompt = strength < 50
      ? `Create a comprehensive study guide for the topic "${topic}". This is a weakness area (${strength}% mastery).
         Focus on fundamental concepts, common misconceptions, and practical applications.
         Include clear explanations, diverse examples, and multiple practice angles.`
      : `Create a focused study guide for ${topic} to deepen understanding (current mastery: ${strength}%).
         Focus on advanced concepts, nuanced understanding, and edge cases.`;

    const { object: studyGuide } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: StudyGuideSchema,
      prompt,
    });

    return NextResponse.json(studyGuide);
  } catch (error) {
    console.error('Study guide generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate study guide' },
      { status: 500 }
    );
  }
}
