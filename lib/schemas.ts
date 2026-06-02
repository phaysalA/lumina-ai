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
export type ExamGrade = z.infer<typeof ExamGradeSchema>;
export type StudyGuide = z.infer<typeof StudyGuideSchema>;
