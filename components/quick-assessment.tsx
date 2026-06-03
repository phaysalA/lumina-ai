'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DiagnosticQuestion, Curriculum, Assessment } from '@/lib/schemas';

interface QuickAssessmentProps {
  questions: DiagnosticQuestion[];
  curriculum: Curriculum;
  onAssessmentComplete: (assessment: Assessment) => void;
}

export function QuickAssessment({ questions, curriculum, onAssessmentComplete }: QuickAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectAnswer = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);

    try {
      const quizAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId: parseInt(questionId),
        selectedAnswer,
      }));

      const response = await fetch('/api/evaluate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          answers: quizAnswers,
          curriculum,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate assessment');
      }

      const assessment: Assessment = await response.json();
      onAssessmentComplete(assessment);
    } catch (error) {
      console.error('Error evaluating assessment:', error);
      alert('Failed to evaluate your answers. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isEvaluating) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className="animate-spin h-10 w-10 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">Analyzing Your Answers...</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;re evaluating your responses to build a personalized study plan.
          </p>
        </div>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Quick Assessment</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Answer these questions so we can understand your strengths
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{answeredCount}</span>
              <span className="text-muted-foreground">/{totalQuestions}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Question Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Topic & Difficulty badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {currentQ.topic}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              currentQ.difficulty === 'basic' 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : currentQ.difficulty === 'intermediate'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              {currentQ.difficulty}
            </span>
          </div>

          {/* Question */}
          <h3 className="text-lg font-semibold text-foreground leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                  ${currentAnswer === idx
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/20'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <span className={`
                    flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                    ${currentAnswer === idx
                      ? 'bg-primary text-white'
                      : 'bg-muted/50 text-muted-foreground'
                    }
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-foreground text-sm pt-0.5">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>

        {currentQuestion === totalQuestions - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={answeredCount < totalQuestions}
            className="bg-primary hover:bg-primary/90"
          >
            Submit Assessment
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleNext}
          >
            Next →
          </Button>
        )}
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestion(idx)}
            className={`
              w-8 h-8 rounded-full text-xs font-medium transition-all
              ${idx === currentQuestion
                ? 'bg-primary text-white scale-110'
                : answers[q.id] !== undefined
                ? 'bg-primary/20 text-primary'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }
            `}
            title={`Question ${idx + 1}: ${q.topic}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
