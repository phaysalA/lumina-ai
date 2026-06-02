'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ExamGrade } from '@/lib/schemas';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ProgressTrackerProps {
  exams: ExamGrade[];
}

export function ProgressTracker({ exams }: ProgressTrackerProps) {
  if (exams.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Add exams to track your progress over time
      </Card>
    );
  }

  // Prepare timeline data
  const timelineData = exams.map((exam, idx) => ({
    name: exam.examName,
    score: Math.round((exam.totalScore / exam.maxScore) * 100),
    exam: exam.examName,
  }));

  // Prepare radar data for latest exam
  const latestExam = exams[exams.length - 1];
  const topics = Object.keys(latestExam.grades);
  const radarData = topics.slice(0, 8).map(topic => ({
    topic: topic.length > 12 ? topic.substring(0, 12) + '...' : topic,
    score: latestExam.grades[topic],
    fullTopic: topic,
  }));

  // Calculate statistics
  const scores = exams.map(e => (e.totalScore / e.maxScore) * 100);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const improvement = scores.length > 1 ? Math.round(scores[scores.length - 1] - scores[0]) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Exams Taken</div>
          <div className="text-2xl font-bold text-primary">{exams.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Average Score</div>
          <div className="text-2xl font-bold text-primary">{avgScore}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Latest Score</div>
          <div className="text-2xl font-bold text-accent">
            {Math.round((latestExam.totalScore / latestExam.maxScore) * 100)}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Improvement</div>
          <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {improvement >= 0 ? '+' : ''}{improvement}%
          </div>
        </Card>
      </div>

      {/* Trend Chart */}
      {exams.length > 1 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--color-primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--color-primary))', r: 4 }}
                activeDot={{ r: 6 }}
                name="Exam Score (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Topic Performance Radar */}
      {radarData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Topic Mastery - {latestExam.examName}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="topic" stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.6)" />
              <Radar
                name="Score (%)"
                dataKey="score"
                stroke="hsl(var(--color-primary))"
                fill="hsl(var(--color-primary))"
                fillOpacity={0.25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
