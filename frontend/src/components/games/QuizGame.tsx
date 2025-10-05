/**
 * Quiz Game Component
 * Renders quiz questions from JSON configuration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { QuizQuestion } from '@/types';

interface QuizGameProps {
  questions: QuizQuestion[];
  onScoreUpdate: (score: number, clientData: any) => void;
  onComplete: () => void;
  timeLimit?: number;
  isPaused: boolean;
}

export function QuizGame({ questions, onScoreUpdate, onComplete, timeLimit, isPaused }: QuizGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);

  // Timer effect
  useEffect(() => {
    if (!timeLimit || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, isPaused]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const newScore = calculateScore();
    setScore(newScore);
    setShowResults(true);
    onScoreUpdate(newScore, { answers: selectedAnswers });
    onComplete();
  };

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach(question => {
      const userAnswer = selectedAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        totalScore += question.points;
      }
    });
    return totalScore;
  };

  const getQuestionProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getAnswerStatus = (questionId: string, answerIndex: number) => {
    if (!showResults) return '';
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return '';
    
    if (answerIndex === question.correctAnswer) return 'correct';
    if (selectedAnswers[questionId] === answerIndex) return 'incorrect';
    return '';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">
              {score === questions.reduce((sum, q) => sum + q.points, 0) ? '🏆' : '🎉'}
            </div>
            <h3 className="text-2xl font-bold">
              {score === questions.reduce((sum, q) => sum + q.points, 0) ? 'Perfect Score!' : 'Quiz Complete!'}
            </h3>
            <div className="text-3xl font-bold text-green-600">{score}</div>
            <div className="text-muted-foreground">
              out of {questions.reduce((sum, q) => sum + q.points, 0)} points
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <CardDescription>{question.question}</CardDescription>
          </div>
          {timeLimit && (
            <Badge variant={timeLeft < 30 ? 'destructive' : 'secondary'}>
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <Progress value={getQuestionProgress()} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedAnswers[question.id]?.toString()}
          onValueChange={(value) => handleAnswerSelect(question.id, parseInt(value))}
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label 
                htmlFor={`option-${index}`} 
                className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                  getAnswerStatus(question.id, index) === 'correct' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : getAnswerStatus(question.id, index) === 'incorrect'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                  {getAnswerStatus(question.id, index) === 'correct' && (
                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                  )}
                  {getAnswerStatus(question.id, index) === 'incorrect' && (
                    <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {question.explanation && showResults && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Explanation</h4>
                <p className="text-blue-700 text-sm mt-1">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[question.id] === undefined}
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
