'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameState, DragDropItem, DragDropTarget } from '@/types/games';
import { DragDropGameEngine } from '@/lib/gameEngine/DragDropGameEngine';

interface DragDropGameUIProps {
  gameEngine: DragDropGameEngine;
  gameState: GameState;
  onStateChange: (state: GameState) => void;
}

interface DragDropUIState {
  items: DragDropItem[];
  targets: DragDropTarget[];
  draggedItem: DragDropItem | null;
  dragOffset: { x: number; y: number };
  hoveredTarget: string | null;
  completedPairs: string[];
  showFeedback: boolean;
  feedbackMessage: string;
  canSubmit: boolean;
}

export default function DragDropGameUI({ gameEngine, gameState, onStateChange }: DragDropGameUIProps) {
  const [uiState, setUIState] = useState<DragDropUIState>({
    items: [],
    targets: [],
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },
    hoveredTarget: null,
    completedPairs: [],
    showFeedback: false,
    feedbackMessage: '',
    canSubmit: false,
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Initialize game data
  useEffect(() => {
    const gameData = gameEngine.getCurrentGameData();
    if (gameData) {
      setUIState(prev => ({
        ...prev,
        items: gameData.items || [],
        targets: gameData.targets || [],
        completedPairs: gameData.completedPairs || [],
        canSubmit: gameData.canSubmit || false,
      }));
    }
  }, [gameState.currentStep, gameEngine]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, item: DragDropItem) => {
    if (uiState.completedPairs.includes(item.id)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setUIState(prev => ({
      ...prev,
      draggedItem: item,
      dragOffset: { x: offsetX, y: offsetY },
    }));

    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!uiState.draggedItem || !gameAreaRef.current) return;

    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - gameAreaRect.left - uiState.dragOffset.x;
    const y = e.clientY - gameAreaRect.top - uiState.dragOffset.y;

    // Update dragged item position
    const updatedItems = uiState.items.map(item =>
      item.id === uiState.draggedItem!.id
        ? { ...item, position: { x, y } }
        : item
    );

    // Check for target hover
    let hoveredTarget = null;
    for (const target of uiState.targets) {
      if (isOverTarget(e.clientX, e.clientY, target)) {
        hoveredTarget = target.id;
        break;
      }
    }

    setUIState(prev => ({
      ...prev,
      items: updatedItems,
      hoveredTarget,
    }));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!uiState.draggedItem) return;

    // Check if dropped on a valid target
    let droppedOnTarget = null;
    for (const target of uiState.targets) {
      if (isOverTarget(e.clientX, e.clientY, target)) {
        droppedOnTarget = target;
        break;
      }
    }

    if (droppedOnTarget) {
      const result = gameEngine.dropItem(uiState.draggedItem.id, droppedOnTarget.id);
      
      setUIState(prev => ({
        ...prev,
        draggedItem: null,
        hoveredTarget: null,
        showFeedback: true,
        feedbackMessage: result.isCorrect ? 'Correct match!' : 'Try again!',
        completedPairs: result.isCorrect 
          ? [...prev.completedPairs, uiState.draggedItem!.id]
          : prev.completedPairs,
      }));

      // Hide feedback after 2 seconds
      setTimeout(() => {
        setUIState(prev => ({ ...prev, showFeedback: false, feedbackMessage: '' }));
      }, 2000);

      onStateChange(gameEngine.getState());
    } else {
      // Return to original position
      const originalItem = gameEngine.getOriginalItem(uiState.draggedItem.id);
      if (originalItem) {
        const updatedItems = uiState.items.map(item =>
          item.id === uiState.draggedItem!.id
            ? { ...item, position: originalItem.position }
            : item
        );

        setUIState(prev => ({
          ...prev,
          items: updatedItems,
          draggedItem: null,
          hoveredTarget: null,
        }));
      }
    }
  };

  const isOverTarget = (clientX: number, clientY: number, target: DragDropTarget): boolean => {
    const targetElement = document.getElementById(`target-${target.id}`);
    if (!targetElement) return false;

    const rect = targetElement.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  };

  const handleSubmit = () => {
    const result = gameEngine.submitRound();
    
    setUIState(prev => ({
      ...prev,
      showFeedback: true,
      feedbackMessage: `Round complete! Score: ${result.score}`,
    }));

    setTimeout(() => {
      gameEngine.nextRound();
      onStateChange(gameEngine.getState());
    }, 3000);
  };

  const handleReset = () => {
    gameEngine.resetRound();
    onStateChange(gameEngine.getState());
  };

  const getItemClassName = (item: DragDropItem): string => {
    const baseClass = "absolute cursor-pointer select-none transition-all duration-200 ";
    const sizeClass = "w-20 h-20 ";
    const styleClass = "bg-white border-2 rounded-lg shadow-md flex items-center justify-center text-sm font-medium ";
    
    if (uiState.completedPairs.includes(item.id)) {
      return baseClass + sizeClass + styleClass + "border-green-500 bg-green-50 text-green-700 cursor-default";
    }
    
    if (uiState.draggedItem?.id === item.id) {
      return baseClass + sizeClass + styleClass + "border-blue-500 bg-blue-50 text-blue-700 z-50 scale-110";
    }
    
    return baseClass + sizeClass + styleClass + "border-gray-300 hover:border-gray-400 hover:shadow-lg";
  };

  const getTargetClassName = (target: DragDropTarget): string => {
    const baseClass = "absolute border-2 border-dashed rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ";
    const sizeClass = "w-24 h-24 ";
    
    if (uiState.hoveredTarget === target.id) {
      return baseClass + sizeClass + "border-blue-500 bg-blue-50 text-blue-700";
    }
    
    if (target.isOccupied) {
      return baseClass + sizeClass + "border-green-500 bg-green-50 text-green-700";
    }
    
    return baseClass + sizeClass + "border-gray-300 bg-gray-50 text-gray-600";
  };

  const getGameModeInstructions = (): string => {
    const mode = gameEngine.getGameMode();
    switch (mode) {
      case 'sorting':
        return 'Sort items into the correct categories';
      case 'matching':
        return 'Match related items together';
      case 'sequencing':
        return 'Arrange items in the correct order';
      default:
        return 'Drag and drop items to complete the challenge';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {gameEngine.getCurrentRoundTitle()}
            </h2>
            <p className="text-gray-600 text-sm">
              {getGameModeInstructions()}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Round {gameState.currentStep} of {gameState.totalSteps}
            </div>
            <div className="text-lg font-semibold text-green-600">
              Score: {gameState.score}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(uiState.completedPairs.length / uiState.items.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {uiState.completedPairs.length} of {uiState.items.length} items matched
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative bg-white rounded-lg shadow-sm p-8 mb-6 min-h-96"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ height: '500px' }}
      >
        {/* Targets */}
        {uiState.targets.map((target) => (
          <div
            key={target.id}
            id={`target-${target.id}`}
            className={getTargetClassName(target)}
            style={{
              left: `${target.position.x}px`,
              top: `${target.position.y}px`,
            }}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{target.icon}</div>
              <div className="text-xs">{target.label}</div>
            </div>
          </div>
        ))}

        {/* Items */}
        {uiState.items.map((item) => (
          <div
            key={item.id}
            className={getItemClassName(item)}
            style={{
              left: `${item.position.x}px`,
              top: `${item.position.y}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, item)}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-xs">{item.label}</div>
            </div>
          </div>
        ))}

        {/* Feedback Overlay */}
        {uiState.showFeedback && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">
                {uiState.feedbackMessage.includes('Correct') ? '🎉' : '💪'}
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {uiState.feedbackMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleReset}
          className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset Round
        </button>
        
        {uiState.completedPairs.length === uiState.items.length && (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {gameState.currentStep >= gameState.totalSteps ? 'Complete Game' : 'Next Round'}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How to Play:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Click and drag items to move them around</li>
          <li>• Drop items onto the correct targets to make matches</li>
          <li>• Complete all matches to proceed to the next round</li>
          <li>• Use the reset button if you need to start over</li>
        </ul>
      </div>
    </div>
  );
}