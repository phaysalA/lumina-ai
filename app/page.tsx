'use client';

import { useState, useEffect } from 'react';
import { Curriculum, ExamGrade, StudyGuide, Assessment, DiagnosticQuiz } from '@/lib/schemas';
import { PDFUpload } from '@/components/pdf-upload';
import { QuickAssessment } from '@/components/quick-assessment';
import { Heatmap } from '@/components/heatmap';
import { StudyGuidePanel } from '@/components/study-guide-panel';
import { AssessmentPanel } from '@/components/assessment-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ActiveView = 'upload' | 'assessment' | 'dashboard';

export default function Page() {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [diagnosticQuiz, setDiagnosticQuiz] = useState<DiagnosticQuiz | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [exams, setExams] = useState<ExamGrade[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('upload');

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('lumina-state');
    if (saved) {
      const state = JSON.parse(saved);
      if (state.curriculum && state.assessment) {
        setCurriculum(state.curriculum);
        setAssessment(state.assessment);
        setExams(state.exams || []);
        setActiveView('dashboard');
      }
    }
  }, []);

  // Save to session storage
  useEffect(() => {
    if (curriculum && assessment) {
      sessionStorage.setItem('lumina-state', JSON.stringify({ curriculum, assessment, exams }));
    }
  }, [curriculum, assessment, exams]);

  // Convert assessment to ExamGrade format for heatmap compatibility
  useEffect(() => {
    if (assessment && curriculum && exams.length === 0) {
      const grades: Record<string, number> = {};
      assessment.topicScores.forEach(ts => {
        grades[ts.topic] = ts.score;
      });

      const assessmentExam: ExamGrade = {
        examName: 'Diagnostic Assessment',
        date: new Date().toISOString().split('T')[0],
        totalScore: assessment.overallScore,
        maxScore: 100,
        grades,
      };
      setExams([assessmentExam]);
    }
  }, [assessment, curriculum]);

  // Generate study guide when topic is selected
  useEffect(() => {
    if (!selectedTopic || !curriculum || exams.length === 0) {
      setStudyGuide(null);
      return;
    }

    const generateGuide = async () => {
      setIsGeneratingGuide(true);
      try {
        const topicAssessment = assessment?.topicScores.find(ts => ts.topic === selectedTopic);
        const strength = topicAssessment?.score ?? 50;

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
  }, [selectedTopic, curriculum, assessment]);

  const handleDocumentParsed = (curr: Curriculum, quiz: DiagnosticQuiz) => {
    setCurriculum(curr);
    setDiagnosticQuiz(quiz);
    setActiveView('assessment');
  };

  const handleAssessmentComplete = (assess: Assessment) => {
    setAssessment(assess);
    setDiagnosticQuiz(null);
    setActiveView('dashboard');
  };

  const handleReset = () => {
    setCurriculum(null);
    setDiagnosticQuiz(null);
    setAssessment(null);
    setExams([]);
    setSelectedTopic(null);
    setStudyGuide(null);
    setActiveView('upload');
    sessionStorage.removeItem('lumina-state');
  };

  // Upload View
  if (activeView === 'upload') {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Lumina</h1>
            <p className="text-muted-foreground">AI-powered study analytics and personalized learning guides</p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-semibold text-foreground">Upload Your Curriculum</h2>
              </div>
              <PDFUpload onDocumentParsed={handleDocumentParsed} />
              <p className="text-sm text-muted-foreground">
                Upload a PDF or Word document of your course material. We&apos;ll generate a quick quiz to assess your strengths.
              </p>
            </div>

            {/* Sample curriculum option */}
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
                  const sampleQuiz: DiagnosticQuiz = {
                    questions: [
                      { id: 1, topic: 'Atomic Structure', question: 'What determines the atomic number of an element?', options: ['Number of neutrons', 'Number of protons', 'Number of electrons', 'Atomic mass'], correctAnswer: 1, difficulty: 'basic' },
                      { id: 2, topic: 'Chemical Bonding', question: 'Which type of bond involves the sharing of electron pairs?', options: ['Ionic bond', 'Hydrogen bond', 'Covalent bond', 'Van der Waals bond'], correctAnswer: 2, difficulty: 'basic' },
                      { id: 3, topic: 'Properties of Water', question: 'What property of water allows insects to walk on its surface?', options: ['Cohesion', 'Adhesion', 'Surface tension', 'Capillary action'], correctAnswer: 2, difficulty: 'intermediate' },
                      { id: 4, topic: 'Cell Membrane', question: 'The fluid mosaic model describes the cell membrane as:', options: ['A rigid protein layer', 'A phospholipid bilayer with embedded proteins', 'A single layer of lipids', 'A carbohydrate shell'], correctAnswer: 1, difficulty: 'basic' },
                      { id: 5, topic: 'Organelles', question: 'Which organelle is responsible for ATP production?', options: ['Ribosome', 'Golgi apparatus', 'Mitochondria', 'Endoplasmic reticulum'], correctAnswer: 2, difficulty: 'basic' },
                      { id: 6, topic: 'Cell Division', question: 'During which phase of mitosis do chromosomes align at the cell equator?', options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], correctAnswer: 1, difficulty: 'intermediate' },
                      { id: 7, topic: 'DNA Replication', question: 'Which enzyme unwinds the DNA double helix during replication?', options: ['DNA polymerase', 'Helicase', 'Ligase', 'Primase'], correctAnswer: 1, difficulty: 'intermediate' },
                      { id: 8, topic: 'Gene Expression', question: 'What is the process of converting mRNA to protein called?', options: ['Transcription', 'Translation', 'Replication', 'Transduction'], correctAnswer: 1, difficulty: 'basic' },
                      { id: 9, topic: 'Heredity Patterns', question: 'In a dihybrid cross of two heterozygous parents (AaBb x AaBb), what is the expected phenotypic ratio?', options: ['3:1', '1:2:1', '9:3:3:1', '1:1:1:1'], correctAnswer: 2, difficulty: 'advanced' },
                      { id: 10, topic: 'Chemical Bonding', question: 'Which of the following best explains why NaCl dissolves in water?', options: ['Covalent bonds form between Na and water', 'Water molecules surround and separate Na+ and Cl- ions', 'NaCl becomes a gas in water', 'Hydrogen bonds break the NaCl crystal'], correctAnswer: 1, difficulty: 'advanced' },
                      { id: 11, topic: 'Cell Division', question: 'What is the key difference between meiosis I and meiosis II?', options: ['Meiosis I separates homologous chromosomes; meiosis II separates sister chromatids', 'Meiosis I is faster than meiosis II', 'Only meiosis II involves crossing over', 'Meiosis I produces haploid cells; meiosis II produces diploid cells'], correctAnswer: 0, difficulty: 'advanced' },
                      { id: 12, topic: 'DNA Replication', question: 'Why is DNA replication called "semi-conservative"?', options: ['Only half the DNA is copied', 'Each new molecule has one old and one new strand', 'It conserves energy by only replicating once', 'Half the bases are reused'], correctAnswer: 1, difficulty: 'intermediate' },
                    ],
                  };
                  setCurriculum(sampleCurriculum);
                  setDiagnosticQuiz(sampleQuiz);
                  setActiveView('assessment');
                }}
                variant="outline"
              >
                Try Sample Curriculum
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Assessment View (Diagnostic Quiz)
  if (activeView === 'assessment' && curriculum && diagnosticQuiz) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Lumina</h1>
                <p className="text-sm text-muted-foreground">{curriculum.title} — Diagnostic Assessment</p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Start Over
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <QuickAssessment
            questions={diagnosticQuiz.questions}
            curriculum={curriculum}
            onAssessmentComplete={handleAssessmentComplete}
          />
        </div>
      </main>
    );
  }

  // Dashboard View
  if (!curriculum) {
    // Fallback to upload if no curriculum
    setActiveView('upload');
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{curriculum.title}</h1>
              <p className="text-sm text-muted-foreground">{curriculum.description}</p>
            </div>
            <Button onClick={handleReset} variant="outline" className="whitespace-nowrap">
              New Session
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {selectedTopic ? (
          /* Expanded Study Guide View (heatmap hidden) */
          <div className="space-y-8">
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

            {assessment && <AssessmentPanel assessment={assessment} />}
          </div>
        ) : (
          /* Default View with Heatmap and prompt side by side */
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="p-6 lg:col-span-2">
                {exams.length > 0 ? (
                  <Heatmap
                    curriculum={curriculum}
                    exams={exams}
                    selectedTopic={selectedTopic ?? undefined}
                    onTopicSelect={topic => setSelectedTopic(topic)}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Assessment results will appear here</p>
                  </div>
                )}
              </Card>

              <Card className="p-6 text-center text-muted-foreground flex items-center justify-center">
                <div className="space-y-2">
                  <p className="text-2xl">🎯</p>
                  <p className="text-sm font-medium">Select a topic from the heatmap</p>
                  <p className="text-xs">Click any topic to get a personalized study guide</p>
                </div>
              </Card>
            </div>

            {assessment && <AssessmentPanel assessment={assessment} />}
          </div>
        )}
      </div>
    </main>
  );
}
