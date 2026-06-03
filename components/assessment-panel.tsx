'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Assessment } from '@/lib/schemas';

interface AssessmentPanelProps {
  assessment: Assessment;
}

export function AssessmentPanel({ assessment }: AssessmentPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Assessment Results</h3>
          <div className={`text-3xl font-bold ${getScoreColor(assessment.overallScore)}`}>
            {assessment.overallScore}%
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{assessment.summary}</p>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h4 className="font-medium text-emerald-500 mb-3 flex items-center gap-2">
            <span>💪</span> Strengths
          </h4>
          <ul className="space-y-2">
            {assessment.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h4 className="font-medium text-red-400 mb-3 flex items-center gap-2">
            <span>🎯</span> Areas to Improve
          </h4>
          <ul className="space-y-2">
            {assessment.weaknesses.map((weakness, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-red-400 mt-0.5">→</span>
                {weakness}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Topic Scores */}
      <Card className="p-6">
        <h4 className="font-medium text-foreground mb-4">Topic Breakdown</h4>
        <div className="space-y-3">
          {assessment.topicScores
            .sort((a, b) => a.score - b.score)
            .map((topic, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${getScoreBg(topic.score)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{topic.topic}</span>
                  <span className={`text-sm font-bold ${getScoreColor(topic.score)}`}>
                    {topic.score}%
                  </span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-1.5 mb-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${getProgressBarColor(topic.score)}`}
                    style={{ width: `${topic.score}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{topic.reasoning}</p>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
