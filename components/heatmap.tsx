'use client';

import React from 'react';
import { ExamGrade, Curriculum } from '@/lib/schemas';

interface HeatmapProps {
  curriculum: Curriculum;
  exams: ExamGrade[];
  selectedTopic?: string;
  onTopicSelect?: (topic: string) => void;
}

export function Heatmap({ curriculum, exams, selectedTopic, onTopicSelect }: HeatmapProps) {
  // Collect all topics from curriculum
  const allTopics = curriculum.subtopics.flatMap(sub => sub.topics.map(t => t.name));

  // Calculate average score per topic across all exams
  const topicScores = allTopics.map(topicName => {
    const scores = exams
      .flatMap(exam => exam.grades[topicName] ?? [])
      .filter(score => score !== undefined && score !== null);
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  });

  // Color coding: red (0-40), yellow (40-70), green (70-100)
  const getColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500 hover:bg-emerald-600';
    if (score >= 40) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  const getTextColor = (score: number) => {
    return 'text-white';
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Performance Heatmap</h3>
      
      {/* Subtopic sections */}
      <div className="space-y-6">
        {curriculum.subtopics.map(subtopic => {
          const subtopicTopics = subtopic.topics.map(t => t.name);
          const subtopicIndex = curriculum.subtopics.indexOf(subtopic);
          const startIdx = allTopics.slice(0, allTopics.indexOf(subtopic.topics[0]?.name)).length;
          
          return (
            <div key={subtopic.name} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {subtopic.name}
              </h4>
              
              {/* Heatmap grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
                {subtopic.topics.map(topic => {
                  const topicIdx = allTopics.indexOf(topic.name);
                  const score = topicScores[topicIdx];
                  const isSelected = selectedTopic === topic.name;
                  
                  return (
                    <button
                      key={topic.name}
                      onClick={() => onTopicSelect?.(topic.name)}
                      className={`
                        flex flex-col items-center gap-2 group cursor-pointer
                        ${isSelected ? 'scale-105' : ''}
                        hover:scale-105 transition-all duration-200
                      `}
                      title={`${topic.name}: ${score}%`}
                    >
                      <div
                        className={`
                          aspect-square w-full rounded-lg
                          ${getColor(score)} ${getTextColor(score)}
                          flex flex-col items-center justify-center p-1
                          text-xl font-bold
                          ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}
                        `}
                      >
                        <span className="block">{score}</span>
                        <span className="text-sm opacity-75">%</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground text-center leading-tight line-clamp-2 w-full group-hover:text-foreground transition-colors">
                        {topic.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-muted-foreground">Need Help (0-40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-muted-foreground">Developing (40-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
          <span className="text-muted-foreground">Mastered (70-100%)</span>
        </div>
      </div>
    </div>
  );
}
