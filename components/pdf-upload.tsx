'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Curriculum } from '@/lib/schemas';

interface PDFUploadProps {
  onCurriculumLoaded: (curriculum: Curriculum) => void;
  isLoading?: boolean;
}

export function PDFUpload({ onCurriculumLoaded, isLoading: externalLoading = false }: PDFUploadProps) {
  const [dragging, setDragging] = React.useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = externalLoading || isParsing;

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setFileName(file.name);
    setIsParsing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse PDF');
      }

      const curriculum = await response.json();
      onCurriculumLoaded(curriculum);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Failed to parse PDF. Please try again.');
    } finally {
      setIsParsing(false);
      setFileName(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card
      className={`
        border-2 border-dashed p-8 text-center cursor-pointer
        transition-all duration-200
        ${dragging 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
        }
        ${isLoading ? 'pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="hidden"
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="space-y-4 py-4">
          {/* Spinner */}
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
          <div>
            <h3 className="font-semibold text-lg mb-1">Parsing PDF...</h3>
            {fileName && (
              <p className="text-sm text-muted-foreground mb-2">{fileName}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Extracting curriculum structure with AI. This may take a moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Upload Curriculum PDF</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your curriculum PDF or click to browse
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            Select PDF
          </Button>
        </div>
      )}
    </Card>
  );
}
