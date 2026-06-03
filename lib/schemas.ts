import { z } from 'zod';

// Curriculum data structures
export const TopicSchema = z.object({
  name: z.string().describe('Topic name'),
  weight: z.number().min(0).max(100).describe('Importance weight 0-100'),
});

export const SubtopicSchema = z.object({
  name: z.string().describe('Subtopic name'),
  topics: z.array(TopicSchema).describe('List of topics under this subtopic'),
});

export const CurriculumSchema = z.object({
  title: z.string().describe('Curriculum title'),
  description: z.string().optional().describe('Curriculum description'),
  subtopics: z.array(SubtopicSchema).describe('List of subtopics'),
});

// Diagnostic quiz question generated from curriculum
export const DiagnosticQuestionSchema = z.object({
  id: z.number().describe('Question ID'),
  topic: z.string().describe('The topic this question assesses'),
  question: z.string().describe('The question text'),
  options: z.array(z.string()).min(4).max(4).describe('Four multiple choice options'),
  correctAnswer: z.number().min(0).max(3).describe('Index of the correct answer (0-3)'),
  difficulty: z.enum(['basic', 'intermediate', 'advanced']).describe('Question difficulty level'),
});

export const DiagnosticQuizSchema = z.object({
  questions: z.array(DiagnosticQuestionSchema).describe('Array of diagnostic questions covering key topics'),
});

// Assessment generated from quiz results
export const TopicAssessmentSchema = z.object({
  topic: z.string().describe('Topic name matching a topic from the curriculum'),
  score: z.number().min(0).max(100).describe('Estimated mastery score 0-100 based on quiz performance'),
  reasoning: z.string().describe('Brief explanation of why this score was given'),
});

export const AssessmentSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall estimated mastery percentage'),
  strengths: z.array(z.string()).describe('List of identified strength areas'),
  weaknesses: z.array(z.string()).describe('List of identified weakness areas'),
  topicScores: z.array(TopicAssessmentSchema).describe('Per-topic assessment scores'),
  summary: z.string().describe('Brief summary of the student assessment'),
});

export const ExamGradeSchema = z.object({
  examName: z.string().describe('Name of the exam'),
  date: z.string().describe('Exam date (ISO format)'),
  totalScore: z.number().describe('Total score achieved'),
  maxScore: z.number().describe('Maximum possible score'),
  grades: z.record(z.string(), z.number()).describe('Topic name to score mapping'),
});

export const StudyGuideSchema = z.object({
  topic: z.string().describe('Topic name'),
  summary: z.string().describe('Summary of key concepts'),
  flashcards: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).describe('Study flashcards'),
  quiz: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number(),
  })).describe('Practice quiz questions'),
  recommendations: z.array(z.string()).describe('Personalized study recommendations'),
});

export type Curriculum = z.infer<typeof CurriculumSchema>;
export type Subtopic = z.infer<typeof SubtopicSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type DiagnosticQuestion = z.infer<typeof DiagnosticQuestionSchema>;
export type DiagnosticQuiz = z.infer<typeof DiagnosticQuizSchema>;
export type Assessment = z.infer<typeof AssessmentSchema>;
export type TopicAssessment = z.infer<typeof TopicAssessmentSchema>;
export type ExamGrade = z.infer<typeof ExamGradeSchema>;
export type StudyGuide = z.infer<typeof StudyGuideSchema>;
