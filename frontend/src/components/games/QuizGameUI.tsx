'use client';

import React, { useState, useEffect } from 'react';
import { GameState, QuizQuestion, QuizAnswer } from '@/types/games';
import { QuizGameEngine } from '@/lib/gameEngine/QuizGameEngine';

interface QuizGameUIProps {
  gameEngine: QuizGameEngine;
  gameState: GameState;
  onStateChange: (state: GameState) => void;
}

interface QuizUIState {
  currentQuestion: QuizQuestion | null;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  timeRemaining: number;
  canProceed: boolean;
}

export default function QuizGameUI({ gameEngine, gameState, onStateChange }: QuizGameUIProps) {
  const [uiState, setUIState] = useState<QuizUIState>({
    currentQuestion: null,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    timeRemaining: 30,
    canProceed: false,
  });

  // Initialize current question
  useEffect(() => {
    const question = gameEngine.getCurrentQuestion();
    if (question) {
      setUIState(prev => ({
        ...prev,
        currentQuestion: question,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null,
        timeRemaining: question.timeLimit || 30,
        canProceed: false,
      }));
    }
  }, [gameState.currentStep, gameEngine]);

  // Question timer
  useEffect(() => {
    if (uiState.showFeedback || !uiState.currentQuestion) return;

    const timer = setInterval(() => {
      setUIState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          handleTimeUp();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [uiState.showFeedback, uiState.currentQuestion]);

  const handleAnswerSelect = (answerId: string) => {
    if (uiState.showFeedback) return;
    
    setUIState(prev => ({
      ...prev,
      selectedAnswer: answerId,
    }));
  };

  const handleSubmitAnswer = () => {
    if (!uiState.selectedAnswer || !uiState.currentQuestion) return;

    const isCorrect = gameEngine.submitAnswer(uiState.selectedAnswer);
    
    setUIState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect,
      canProceed: true,
    }));

    // Update game state
    onStateChange(gameEngine.getState());
  };

  const handleTimeUp = () => {
    if (uiState.showFeedback) return;
    
    // Auto-submit with no answer
    gameEngine.submitAnswer('');
    
    setUIState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect: false,
      canProceed: true,
    }));

    onStateChange(gameEngine.getState());
  };

  const handleNextQuestion = () => {
    gameEngine.nextQuestion();
    onStateChange(gameEngine.getState());
  };

  const getAnswerClassName = (answer: QuizAnswer): string => {
    const baseClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";
    
    if (!uiState.showFeedback) {
      if (uiState.selectedAnswer === answer.id) {
        return baseClass + "border-blue-500 bg-blue-50 text-blue-900";
      }
      return baseClass + "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50";
    }

    // Show feedback
    if (answer.isCorrect) {
      return baseClass + "border-green-500 bg-green-50 text-green-900";
    }
    
    if (uiState.selectedAnswer === answer.id && !answer.isCorrect) {
      return baseClass + "border-red-500 bg-red-50 text-red-900";
    }
    
    return baseClass + "border-gray-200 bg-gray-100 text-gray-600";
  };

  const getAnswerIcon = (answer: QuizAnswer): string => {
    if (!uiState.showFeedback) {
      return uiState.selectedAnswer === answer.id ? "🔵" : "⚪";
    }
    
    if (answer.isCorrect) {
      return "✅";
    }
    
    if (uiState.selectedAnswer === answer.id && !answer.isCorrect) {
      return "❌";
    }
    
    return "⚪";
  };

  const formatTime = (seconds: number): string => {
    return `${seconds}s`;
  };

  const getProgressColor = (): string => {
    if (uiState.timeRemaining > 20) return "bg-green-500";
    if (uiState.timeRemaining > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!uiState.currentQuestion) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              Question {gameState.currentStep} of {gameState.totalSteps}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {uiState.currentQuestion.category}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {uiState.currentQuestion.difficulty}
            </span>
          </div>
          
          {/* Timer */}
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-700">
              ⏱️ {formatTime(uiState.timeRemaining)}
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
                style={{ width: `${(uiState.timeRemaining / (uiState.currentQuestion.timeLimit || 30)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {uiState.currentQuestion.question}
        </h2>

        {/* Question Image */}
        {uiState.currentQuestion.image && (
          <div className="mb-6">
            <img
              src={uiState.currentQuestion.image}
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Question Explanation */}
        {uiState.currentQuestion.explanation && !uiState.showFeedback && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              💡 {uiState.currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Answers */}
      <div className="space-y-3 mb-6">
        {uiState.currentQuestion.answers.map((answer, index) => (
          <button
            key={answer.id}
            onClick={() => handleAnswerSelect(answer.id)}
            disabled={uiState.showFeedback}
            className={getAnswerClassName(answer)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getAnswerIcon(answer)}</span>
              <span className="flex-1 text-left">{answer.text}</span>
              <span className="text-sm text-gray-500">
                {String.fromCharCode(65 + index)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {uiState.showFeedback && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className={`flex items-center space-x-3 mb-4 ${
            uiState.isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            <span className="text-2xl">
              {uiState.isCorrect ? '🎉' : '😔'}
            </span>
            <h3 className="text-lg font-semibold">
              {uiState.isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
          </div>

          {/* Correct Answer Explanation */}
          {uiState.currentQuestion.correctAnswerExplanation && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Explanation:</h4>
              <p className="text-gray-700 text-sm">
                {uiState.currentQuestion.correctAnswerExplanation}
              </p>
            </div>
          )}

          {/* Points Earned */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Points earned: <span className="font-medium text-green-600">
                +{uiState.isCorrect ? uiState.currentQuestion.points : 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Total score: <span className="font-medium">{gameState.score}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!uiState.showFeedback ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!uiState.selectedAnswer}
            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {gameState.currentStep >= gameState.totalSteps ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>

      {/* Quiz Progress */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Quiz Progress</span>
          <span>{Math.round((gameState.currentStep / gameState.totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(gameState.currentStep / gameState.totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}