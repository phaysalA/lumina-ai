import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { AssessmentSchema } from '@/lib/schemas';
import type { DiagnosticQuestion, Curriculum } from '@/lib/schemas';

interface QuizAnswer {
  questionId: number;
  selectedAnswer: number;
}

export async function POST(request: NextRequest) {
  try {
    const { questions, answers, curriculum } = await request.json() as {
      questions: DiagnosticQuestion[];
      answers: QuizAnswer[];
      curriculum: Curriculum;
    };

    if (!questions || !answers || !curriculum) {
      return NextResponse.json(
        { error: 'Questions, answers, and curriculum are required' },
        { status: 400 }
      );
    }

    // Calculate raw scores per topic
    const topicResults: Record<string, { correct: number; total: number; details: string[] }> = {};

    for (const question of questions) {
      if (!topicResults[question.topic]) {
        topicResults[question.topic] = { correct: 0, total: 0, details: [] };
      }

      const answer = answers.find(a => a.questionId === question.id);
      const isCorrect = answer?.selectedAnswer === question.correctAnswer;
      
      topicResults[question.topic].total++;
      if (isCorrect) {
        topicResults[question.topic].correct++;
      }

      topicResults[question.topic].details.push(
        `Q: "${question.question}" (${question.difficulty}) - ${isCorrect ? 'CORRECT' : `WRONG (chose "${question.options[answer?.selectedAnswer ?? 0]}", correct was "${question.options[question.correctAnswer]}")`}`
      );
    }

    // Build the performance summary for the AI to analyze
    const performanceSummary = Object.entries(topicResults)
      .map(([topic, result]) => {
        const percentage = Math.round((result.correct / result.total) * 100);
        return `Topic: ${topic}\n  Score: ${result.correct}/${result.total} (${percentage}%)\n  ${result.details.join('\n  ')}`;
      })
      .join('\n\n');

    const allTopics = curriculum.subtopics.flatMap(sub => sub.topics.map(t => t.name));

    // Use AI to generate a nuanced assessment based on quiz performance
    const { object: assessment } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: AssessmentSchema,
      prompt: `Based on the following diagnostic quiz results, generate a detailed assessment of this student's understanding.

Curriculum: ${curriculum.title}
Topics covered: ${allTopics.join(', ')}

Quiz Performance:
${performanceSummary}

Generate an assessment that:
1. Assigns mastery scores (0-100) for EACH topic in the curriculum: ${allTopics.join(', ')}
   - For topics with quiz data, base the score on their performance and question difficulty
   - For topics without quiz data, assign a neutral score of 50 with reasoning that more data is needed
2. Identifies clear strengths (topics where the student excelled)
3. Identifies weaknesses (topics where the student struggled)
4. Provides an overall mastery score
5. Writes a helpful, encouraging summary

Consider question difficulty in scoring:
- Getting basic questions wrong suggests significant gaps
- Getting advanced questions right suggests strong mastery
- Missing intermediate questions suggests developing understanding`,
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Assessment evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate assessment' },
      { status: 500 }
    );
  }
}
