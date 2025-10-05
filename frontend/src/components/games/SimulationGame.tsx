/**
 * Simulation Game Component
 * Renders simulation game from JSON configuration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Target } from 'lucide-react';
import { SimulationConfig } from '@/types';

interface SimulationGameProps {
  config: SimulationConfig;
  onScoreUpdate: (score: number, clientData: any) => void;
  onComplete: () => void;
  timeLimit?: number;
  isPaused: boolean;
}

interface Objective {
  id: string;
  description: string;
  points: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export function SimulationGame({ config, onScoreUpdate, onComplete, timeLimit, isPaused }: SimulationGameProps) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const [simulationData, setSimulationData] = useState({
    solarPanels: 0,
    trees: 0,
    windTurbines: 0,
    carbonReduction: 0,
  });

  // Initialize objectives
  useEffect(() => {
    const initialObjectives = config.objectives.map(obj => ({
      ...obj,
      completed: false,
      progress: 0,
      maxProgress: this.getMaxProgress(obj),
    }));
    setObjectives(initialObjectives);
  }, [config]);

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

  const getMaxProgress = (objective: any) => {
    const validation = objective.validation;
    if (validation.solarPanels) return validation.solarPanels;
    if (validation.trees) return validation.trees;
    if (validation.windTurbines) return validation.windTurbines;
    if (validation.carbonReduction) return validation.carbonReduction;
    return 100;
  };

  const handleAction = (actionType: string) => {
    if (showResults) return;

    setSimulationData(prev => {
      const newData = { ...prev };
      
      switch (actionType) {
        case 'solar':
          newData.solarPanels += 1;
          break;
        case 'tree':
          newData.trees += 1;
          break;
        case 'wind':
          newData.windTurbines += 1;
          break;
        case 'carbon':
          newData.carbonReduction += 5;
          break;
      }

      return newData;
    });

    // Update objectives
    setObjectives(prev => prev.map(obj => {
      const validation = obj.validation;
      let progress = 0;
      
      if (validation.solarPanels) {
        progress = Math.min(simulationData.solarPanels + (actionType === 'solar' ? 1 : 0), validation.solarPanels);
      } else if (validation.trees) {
        progress = Math.min(simulationData.trees + (actionType === 'tree' ? 1 : 0), validation.trees);
      } else if (validation.windTurbines) {
        progress = Math.min(simulationData.windTurbines + (actionType === 'wind' ? 1 : 0), validation.windTurbines);
      } else if (validation.carbonReduction) {
        progress = Math.min(simulationData.carbonReduction + (actionType === 'carbon' ? 5 : 0), validation.carbonReduction);
      }

      const completed = progress >= obj.maxProgress;
      
      if (completed && !obj.completed) {
        setScore(prev => prev + obj.points);
      }

      return {
        ...obj,
        progress,
        completed,
      };
    }));
  };

  const handleComplete = () => {
    const finalScore = objectives.reduce((sum, obj) => sum + (obj.completed ? obj.points : 0), 0);
    setScore(finalScore);
    setShowResults(true);
    
    onScoreUpdate(finalScore, { 
      objectives: objectives.map(obj => ({
        id: obj.id,
        completed: obj.completed,
        progress: obj.progress
      })),
      simulationData
    });
    onComplete();
  };

  const getOverallProgress = () => {
    const totalPoints = objectives.reduce((sum, obj) => sum + obj.points, 0);
    const earnedPoints = objectives.reduce((sum, obj) => sum + (obj.completed ? obj.points : 0), 0);
    return (earnedPoints / totalPoints) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const completedObjectives = objectives.filter(obj => obj.completed).length;
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">
              {completedObjectives === objectives.length ? '🏆' : '🎉'}
            </div>
            <h3 className="text-2xl font-bold">
              {completedObjectives === objectives.length ? 'Perfect Simulation!' : 'Simulation Complete!'}
            </h3>
            <div className="text-3xl font-bold text-green-600">{score}</div>
            <div className="text-muted-foreground">
              {completedObjectives} of {objectives.length} objectives completed
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Simulation: {config.scenario}</CardTitle>
          {timeLimit && (
            <Badge variant={timeLeft < 30 ? 'destructive' : 'secondary'}>
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <CardDescription>
          Complete objectives to build a sustainable city
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(getOverallProgress())}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>

        {/* Objectives */}
        <div className="space-y-4">
          <h4 className="font-semibold">Objectives</h4>
          {objectives.map(objective => (
            <div key={objective.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{objective.description}</span>
                  {objective.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {objective.progress} / {objective.maxProgress}
                </div>
                <Progress 
                  value={(objective.progress / objective.maxProgress) * 100} 
                  className="h-1 mt-1"
                />
              </div>
              <Badge variant={objective.completed ? 'default' : 'secondary'}>
                {objective.points} pts
              </Badge>
            </div>
          ))}
        </div>

        {/* Simulation Actions */}
        <div className="space-y-4">
          <h4 className="font-semibold">Actions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleAction('solar')}
              className="h-20 flex flex-col space-y-2"
              variant="outline"
            >
              <div className="text-2xl">☀️</div>
              <div className="text-xs">Solar Panel</div>
              <div className="text-xs text-muted-foreground">{simulationData.solarPanels}</div>
            </Button>
            
            <Button
              onClick={() => handleAction('tree')}
              className="h-20 flex flex-col space-y-2"
              variant="outline"
            >
              <div className="text-2xl">🌳</div>
              <div className="text-xs">Plant Tree</div>
              <div className="text-xs text-muted-foreground">{simulationData.trees}</div>
            </Button>
            
            <Button
              onClick={() => handleAction('wind')}
              className="h-20 flex flex-col space-y-2"
              variant="outline"
            >
              <div className="text-2xl">💨</div>
              <div className="text-xs">Wind Turbine</div>
              <div className="text-xs text-muted-foreground">{simulationData.windTurbines}</div>
            </Button>
            
            <Button
              onClick={() => handleAction('carbon')}
              className="h-20 flex flex-col space-y-2"
              variant="outline"
            >
              <div className="text-2xl">🌱</div>
              <div className="text-xs">Reduce Carbon</div>
              <div className="text-xs text-muted-foreground">{simulationData.carbonReduction}%</div>
            </Button>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">{simulationData.solarPanels}</div>
            <div className="text-xs text-muted-foreground">Solar Panels</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{simulationData.trees}</div>
            <div className="text-xs text-muted-foreground">Trees</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{simulationData.windTurbines}</div>
            <div className="text-xs text-muted-foreground">Wind Turbines</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{simulationData.carbonReduction}%</div>
            <div className="text-xs text-muted-foreground">Carbon Reduction</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <Button onClick={handleComplete} size="lg">
            Complete Simulation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
