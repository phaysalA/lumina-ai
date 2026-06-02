'use client';

import React, { useState, useEffect } from 'react';
import { Curriculum, ExamGrade, StudyGuide } from '@/lib/schemas';
import { PDFUpload } from '@/components/pdf-upload';
import { GradeInput } from '@/components/grade-input';
import { Heatmap } from '@/components/heatmap';
import { StudyGuidePanel } from '@/components/study-guide-panel';
import { ProgressTracker } from '@/components/progress-tracker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Page() {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [exams, setExams] = useState<ExamGrade[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [activeView, setActiveView] = useState<'setup' | 'dashboard'>('setup');

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('lumina-state');
    if (saved) {
      const state = JSON.parse(saved);
      setCurriculum(state.curriculum);
      setExams(state.exams);
      setActiveView(state.curriculum ? 'dashboard' : 'setup');
    }
  }, []);

  // Save to session storage
  useEffect(() => {
    if (curriculum || exams.length > 0) {
      sessionStorage.setItem('lumina-state', JSON.stringify({ curriculum, exams }));
    }
  }, [curriculum, exams]);

  // Generate study guide when topic is selected
  useEffect(() => {
    if (!selectedTopic || !curriculum || exams.length === 0) {
      setStudyGuide(null);
      return;
    }

    const generateGuide = async () => {
      setIsGeneratingGuide(true);
      try {
        // Calculate topic strength
        const topicScores = exams.flatMap(exam => exam.grades[selectedTopic] ?? []);
        const strength = topicScores.length > 0
          ? Math.round(topicScores.reduce((a, b) => a + b, 0) / topicScores.length)
          : 50;

        const response = await fetch('/api/generate-study-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: selectedTopic, strength }),
        });

        if (response.ok) {
          const guide = await response.json();
          setStudyGuide(guide);
        }
      } catch (error) {
        console.error('Error generating study guide:', error);
      } finally {
        setIsGeneratingGuide(false);
      }
    };

    generateGuide();
  }, [selectedTopic, curriculum, exams]);

  if (activeView === 'setup' || !curriculum) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Lumina</h1>
            <p className="text-muted-foreground">AI-powered exam performance analytics and personalized study guides</p>
          </div>
        </header>

        {/* Setup Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-8">
            {/* Step 1: Upload Curriculum */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-semibold text-foreground">Upload Your Curriculum</h2>
              </div>
              <PDFUpload
                onCurriculumLoaded={curr => {
                  setCurriculum(curr);
                  setActiveView('dashboard');
                }}
              />
              <p className="text-sm text-muted-foreground">
                Upload a PDF of your course curriculum to structure topics and subtopics using AI.
              </p>
            </div>

            {/* Alternative: Sample curriculum */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Or try a sample curriculum:</p>
              <Button
                onClick={() => {
                  const sampleCurriculum: Curriculum = {
                    title: 'AP Biology',
                    description: 'Advanced Placement Biology Curriculum',
                    subtopics: [
                      {
                        name: 'Chemistry of Life',
                        topics: [
                          { name: 'Atomic Structure', weight: 85 },
                          { name: 'Chemical Bonding', weight: 90 },
                          { name: 'Properties of Water', weight: 75 },
                        ],
                      },
                      {
                        name: 'Cell Structure',
                        topics: [
                          { name: 'Cell Membrane', weight: 80 },
                          { name: 'Organelles', weight: 85 },
                          { name: 'Cell Division', weight: 90 },
                        ],
                      },
                      {
                        name: 'Genetics',
                        topics: [
                          { name: 'DNA Replication', weight: 88 },
                          { name: 'Gene Expression', weight: 85 },
                          { name: 'Heredity Patterns', weight: 80 },
                        ],
                      },
                    ],
                  };
                  setCurriculum(sampleCurriculum);
                  setActiveView('dashboard');
                }}
                variant="outline"
              >
                Load Sample Curriculum
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Main Dashboard View
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{curriculum?.title || 'Lumina'}</h1>
              <p className="text-sm text-muted-foreground">{curriculum?.description}</p>
            </div>
            <Button
              onClick={() => {
                setCurriculum(null);
                setExams([]);
                setSelectedTopic(null);
                setStudyGuide(null);
                setActiveView('setup');
                sessionStorage.removeItem('lumina-state');
              }}
              variant="outline"
              className="whitespace-nowrap"
            >
              New Session
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Heatmap & Exams */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Heatmap */}
            <Card className="p-6">
              {exams.length > 0 ? (
                <Heatmap
                  curriculum={curriculum}
                  exams={exams}
                  selectedTopic={selectedTopic ?? undefined}
                  onTopicSelect={topic => setSelectedTopic(topic)}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Add exam grades to see your performance heatmap</p>
                </div>
              )}
            </Card>

            {/* Grade Input */}
            <GradeInput
              curriculum={curriculum}
              onGradesAdded={setExams}
              existingExams={exams}
            />
          </div>

          {/* Right Column: Study Guide & Progress */}
          <div className="space-y-8">
            {/* Study Guide */}
            {selectedTopic && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-1">
                  Study Guide: {selectedTopic}
                </h3>
                <StudyGuidePanel
                  studyGuide={studyGuide}
                  isLoading={isGeneratingGuide}
                  onClose={() => setSelectedTopic(null)}
                />
              </div>
            )}

            {/* Progress Tracker */}
            {exams.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-1">
                  Progress
                </h3>
                <ProgressTracker exams={exams} />
              </div>
            )}

            {/* Empty State */}
            {exams.length === 0 && !selectedTopic && (
              <Card className="p-6 text-center text-muted-foreground">
                <p className="text-sm">Add exams to get started →</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
