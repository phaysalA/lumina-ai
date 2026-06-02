'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Curriculum, ExamGrade } from '@/lib/schemas';

interface GradeInputProps {
  curriculum: Curriculum;
  onGradesAdded: (exams: ExamGrade[]) => void;
  existingExams: ExamGrade[];
}

export function GradeInput({ curriculum, onGradesAdded, existingExams }: GradeInputProps) {
  const [examName, setExamName] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [isExpanded, setIsExpanded] = useState(existingExams.length === 0);

  const allTopics = curriculum.subtopics.flatMap(sub => sub.topics.map(t => t.name));

  const handleGradeChange = (topic: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [topic]: value ? parseInt(value) : 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!examName.trim()) {
      alert('Please enter an exam name');
      return;
    }

    const newExam: ExamGrade = {
      examName,
      date: new Date().toISOString().split('T')[0],
      totalScore: parseInt(totalScore) || 0,
      maxScore: parseInt(maxScore) || 100,
      grades: allTopics.reduce((acc, topic) => {
        acc[topic] = grades[topic] || 0;
        return acc;
      }, {} as Record<string, number>),
    };

    const updated = [...existingExams, newExam];
    onGradesAdded(updated);

    // Reset form
    setExamName('');
    setTotalScore('');
    setMaxScore('100');
    setGrades({});
  };

  return (
    <Card className="p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left font-semibold text-lg mb-4 hover:text-primary transition-colors"
      >
        {isExpanded ? '▼' : '▶'} Add Exam Grades
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="exam-name">Exam Name</Label>
              <Input
                id="exam-name"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                placeholder="e.g., Midterm 2024"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="total-score">Your Score</Label>
              <Input
                id="total-score"
                type="number"
                value={totalScore}
                onChange={e => setTotalScore(e.target.value)}
                placeholder="e.g., 85"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max-score">Max Score</Label>
              <Input
                id="max-score"
                type="number"
                value={maxScore}
                onChange={e => setMaxScore(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Topic grades */}
          <div>
            <Label className="block mb-3 font-medium">Topic Scores</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allTopics.map(topic => (
                <div key={topic}>
                  <Label
                    htmlFor={`topic-${topic}`}
                    className="text-xs text-foreground font-medium line-clamp-2 min-h-[2rem] block"
                    title={topic}
                  >
                    {topic}
                  </Label>
                  <Input
                    id={`topic-${topic}`}
                    type="number"
                    min="0"
                    max="100"
                    value={grades[topic] ?? ''}
                    onChange={e => handleGradeChange(topic, e.target.value)}
                    placeholder="0-100"
                    className="mt-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Add Exam
          </Button>
        </form>
      )}

      {/* Existing exams list */}
      {existingExams.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium mb-3">Recent Exams</h4>
          <div className="space-y-2">
            {existingExams.map((exam, idx) => (
              <div key={idx} className="text-sm text-muted-foreground p-2 bg-muted/20 rounded">
                <span className="font-medium text-foreground">{exam.examName}</span> • {exam.totalScore}/{exam.maxScore}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
