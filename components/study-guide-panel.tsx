'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudyGuide } from '@/lib/schemas';

interface StudyGuidePanelProps {
  studyGuide: StudyGuide | null;
  isLoading?: boolean;
  onClose?: () => void;
}

type TabType = 'summary' | 'flashcards' | 'quiz' | 'recommendations';

export function StudyGuidePanel({ studyGuide, isLoading = false, onClose }: StudyGuidePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  if (!studyGuide && !isLoading) return null;

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="inline-block animate-spin text-2xl mb-4">✨</div>
        <p className="text-muted-foreground">Generating personalized study guide...</p>
      </Card>
    );
  }

  if (!studyGuide) return null;

  const tabs: { label: string; value: TabType }[] = [
    { label: 'Summary', value: 'summary' },
    { label: `Flashcards (${studyGuide.flashcards.length})`, value: 'flashcards' },
    { label: `Quiz (${studyGuide.quiz.length})`, value: 'quiz' },
    { label: 'Tips', value: 'recommendations' },
  ];

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">{studyGuide.topic}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setCurrentFlashcard(0);
              setCurrentQuiz(0);
            }}
            className={`
              px-4 py-2 font-medium text-sm whitespace-nowrap
              border-b-2 transition-colors
              ${activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {studyGuide.summary}
              </p>
            </div>
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-6 min-h-[250px] flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-center space-y-4 w-full">
                <div className="text-sm text-muted-foreground">
                  Card {currentFlashcard + 1} of {studyGuide.flashcards.length}
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {studyGuide.flashcards[currentFlashcard]?.question}
                </h3>
                <p className="text-muted-foreground text-sm">(Click to reveal answer)</p>
              </div>
            </div>

            <details className="group cursor-pointer">
              <summary className="font-medium text-primary hover:underline">
                Show Answer
              </summary>
              <p className="mt-3 text-foreground leading-relaxed">
                {studyGuide.flashcards[currentFlashcard]?.answer}
              </p>
            </details>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentFlashcard(Math.max(0, currentFlashcard - 1))}
                disabled={currentFlashcard === 0}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentFlashcard(Math.min(studyGuide.flashcards.length - 1, currentFlashcard + 1))}
                disabled={currentFlashcard === studyGuide.flashcards.length - 1}
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {studyGuide.quiz[currentQuiz]?.question}
              </h3>
              <div className="space-y-2">
                {studyGuide.quiz[currentQuiz]?.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({ ...quizAnswers, [currentQuiz]: idx })}
                    className={`
                      w-full text-left p-3 rounded-lg border-2 transition-all
                      ${quizAnswers[currentQuiz] === idx
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary'
                      }
                    `}
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentQuiz(Math.max(0, currentQuiz - 1))}
                disabled={currentQuiz === 0}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentQuiz(Math.min(studyGuide.quiz.length - 1, currentQuiz + 1))}
                disabled={currentQuiz === studyGuide.quiz.length - 1}
              >
                Next →
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Question {currentQuiz + 1} of {studyGuide.quiz.length}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {studyGuide.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20"
              >
                <span className="text-secondary font-bold flex-shrink-0">💡</span>
                <p className="text-foreground text-sm">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
