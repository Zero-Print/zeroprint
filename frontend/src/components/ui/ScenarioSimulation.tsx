'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Zap,
  Leaf,
  Users,
  Building,
  Car,
  Factory,
  Settings,
  Save,
  Download
} from 'lucide-react';

interface PolicyScenario {
  id: string;
  name: string;
  description: string;
  category: 'transport' | 'energy' | 'waste' | 'green-space' | 'industry';
  parameters: {
    budget: number;
    timeline: number; // months
    scope: 'ward' | 'city' | 'region';
    intensity: 'low' | 'medium' | 'high';
  };
  projectedImpact: {
    carbonReduction: number;
    airQualityImprovement: number;
    citizenSatisfaction: number;
    economicImpact: number;
    jobsCreated: number;
  };
}

interface SimulationResult {
  scenario: PolicyScenario;
  timeline: Array<{
    month: number;
    carbonReduction: number;
    airQuality: number;
    citizenSatisfaction: number;
    economicImpact: number;
    cost: number;
  }>;
  finalMetrics: {
    totalCarbonReduction: number;
    totalCost: number;
    roi: number;
    citizenApproval: number;
    environmentalScore: number;
  };
}

interface ScenarioSimulationProps {
  scenarios: PolicyScenario[];
  onScenarioRun: (scenarioId: string) => void;
  onScenarioSave: (scenario: PolicyScenario) => void;
  className?: string;
}

export function ScenarioSimulation({ 
  scenarios, 
  onScenarioRun, 
  onScenarioSave,
  className = '' 
}: ScenarioSimulationProps) {
  const [selectedScenario, setSelectedScenario] = useState<PolicyScenario | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [customScenario, setCustomScenario] = useState<Partial<PolicyScenario>>({
    name: '',
    description: '',
    category: 'transport',
    parameters: {
      budget: 1000000,
      timeline: 12,
      scope: 'city',
      intensity: 'medium'
    }
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Mock simulation data
  const mockScenarios: PolicyScenario[] = [
    {
      id: 'electric-buses',
      name: 'Electric Bus Fleet',
      description: 'Replace 50% of city buses with electric vehicles',
      category: 'transport',
      parameters: {
        budget: 5000000,
        timeline: 18,
        scope: 'city',
        intensity: 'high'
      },
      projectedImpact: {
        carbonReduction: 25,
        airQualityImprovement: 30,
        citizenSatisfaction: 15,
        economicImpact: -2000000,
        jobsCreated: 150
      }
    },
    {
      id: 'solar-panels',
      name: 'Solar Panel Initiative',
      description: 'Install solar panels on 1000 government buildings',
      category: 'energy',
      parameters: {
        budget: 3000000,
        timeline: 12,
        scope: 'city',
        intensity: 'medium'
      },
      projectedImpact: {
        carbonReduction: 20,
        airQualityImprovement: 15,
        citizenSatisfaction: 20,
        economicImpact: 500000,
        jobsCreated: 200
      }
    },
    {
      id: 'green-corridors',
      name: 'Green Corridor Network',
      description: 'Create interconnected green spaces and bike lanes',
      category: 'green-space',
      parameters: {
        budget: 2000000,
        timeline: 24,
        scope: 'city',
        intensity: 'medium'
      },
      projectedImpact: {
        carbonReduction: 15,
        airQualityImprovement: 25,
        citizenSatisfaction: 35,
        economicImpact: 1000000,
        jobsCreated: 100
      }
    }
  ];

  const runSimulation = async (scenario: PolicyScenario) => {
    setSelectedScenario(scenario);
    setIsRunning(true);
    setSimulationProgress(0);
    setResults(null);

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSimulationProgress(i);
    }

    // Generate mock results
    const timeline = Array.from({ length: scenario.parameters.timeline }, (_, month) => {
      const progress = (month + 1) / scenario.parameters.timeline;
      return {
        month: month + 1,
        carbonReduction: scenario.projectedImpact.carbonReduction * progress * (0.8 + Math.random() * 0.4),
        airQuality: scenario.projectedImpact.airQualityImprovement * progress * (0.8 + Math.random() * 0.4),
        citizenSatisfaction: scenario.projectedImpact.citizenSatisfaction * progress * (0.8 + Math.random() * 0.4),
        economicImpact: scenario.projectedImpact.economicImpact * progress,
        cost: (scenario.parameters.budget / scenario.parameters.timeline) * (month + 1)
      };
    });

    const finalMetrics = {
      totalCarbonReduction: scenario.projectedImpact.carbonReduction,
      totalCost: scenario.parameters.budget,
      roi: (scenario.projectedImpact.economicImpact / scenario.parameters.budget) * 100,
      citizenApproval: 65 + Math.random() * 30,
      environmentalScore: 70 + Math.random() * 25
    };

    setResults({
      scenario,
      timeline,
      finalMetrics
    });

    setIsRunning(false);
    onScenarioRun(scenario.id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Car className="h-4 w-4" />;
      case 'energy': return <Zap className="h-4 w-4" />;
      case 'waste': return <Factory className="h-4 w-4" />;
      case 'green-space': return <Leaf className="h-4 w-4" />;
      case 'industry': return <Building className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transport': return 'bg-blue-100 text-blue-800';
      case 'energy': return 'bg-yellow-100 text-yellow-800';
      case 'waste': return 'bg-gray-100 text-gray-800';
      case 'green-space': return 'bg-green-100 text-green-800';
      case 'industry': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportResults = () => {
    if (results) {
      const data = {
        scenario: results.scenario.name,
        results: results.finalMetrics,
        timeline: results.timeline,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scenario-${results.scenario.id}-results.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Scenario Selection */}
      <ZPCard>
        <ZPCard.Header>
          <ZPCard.Title className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Policy Scenario Simulation
          </ZPCard.Title>
          <ZPCard.Description>
            Model the environmental and economic impact of policy initiatives
          </ZPCard.Description>
        </ZPCard.Header>

        <ZPCard.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...mockScenarios, ...scenarios].map(scenario => (
              <div
                key={scenario.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedScenario?.id === scenario.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(scenario.category)}
                    <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                  </div>
                  <ZPBadge className={getCategoryColor(scenario.category)}>
                    {scenario.category}
                  </ZPBadge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Budget:</span>
                    <span className="ml-1 font-medium">
                      ${(scenario.parameters.budget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Timeline:</span>
                    <span className="ml-1 font-medium">{scenario.parameters.timeline}mo</span>
                  </div>
                  <div>
                    <span className="text-gray-500">CO2 Reduction:</span>
                    <span className="ml-1 font-medium text-green-600">
                      {scenario.projectedImpact.carbonReduction}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Jobs:</span>
                    <span className="ml-1 font-medium">{scenario.projectedImpact.jobsCreated}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Custom Scenario Button */}
            <div
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-400 flex items-center justify-center"
              onClick={() => setShowCustomForm(true)}
            >
              <div className="text-center">
                <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">Create Custom Scenario</span>
              </div>
            </div>
          </div>
        </ZPCard.Body>

        <ZPCard.Footer>
          <ZPButton
            onClick={() => selectedScenario && runSimulation(selectedScenario)}
            disabled={!selectedScenario || isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Simulation
              </>
            )}
          </ZPButton>
        </ZPCard.Footer>
      </ZPCard>

      {/* Simulation Progress */}
      {isRunning && (
        <ZPCard>
          <ZPCard.Body>
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-4">
                Simulating: {selectedScenario?.name}
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${simulationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Processing environmental impact models... {simulationProgress}%
              </p>
            </div>
          </ZPCard.Body>
        </ZPCard>
      )}

      {/* Simulation Results */}
      {results && (
        <ZPCard>
          <ZPCard.Header>
            <ZPCard.Title className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Simulation Results: {results.scenario.name}
            </ZPCard.Title>
            <ZPButton
              variant="outline"
              size="sm"
              onClick={exportResults}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </ZPButton>
          </ZPCard.Header>

          <ZPCard.Body>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results.finalMetrics.totalCarbonReduction}%
                </div>
                <div className="text-sm text-gray-600">Carbon Reduction</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${(results.finalMetrics.totalCost / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600">Total Investment</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {results.finalMetrics.roi.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">ROI</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.finalMetrics.citizenApproval.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Citizen Approval</div>
              </div>
              
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {results.finalMetrics.environmentalScore.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Environmental Score</div>
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Impact Timeline</h4>
              <div className="space-y-3">
                {results.timeline.slice(0, 6).map((point, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Month {point.month}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>CO2: {point.carbonReduction.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Air: {point.airQuality.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>Satisfaction: {point.citizenSatisfaction.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ZPCard.Body>

          <ZPCard.Footer>
            <ZPButton
              variant="outline"
              onClick={() => setResults(null)}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </ZPButton>
            <ZPButton
              onClick={() => onScenarioSave(results.scenario)}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Scenario
            </ZPButton>
          </ZPCard.Footer>
        </ZPCard>
      )}
    </div>
  );
}

export default ScenarioSimulation;