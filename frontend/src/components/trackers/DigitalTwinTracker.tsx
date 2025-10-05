'use client';

import React, { useState } from 'react';
import { TrackerCard } from '../ui/TrackerCard';
import { ZPButton } from '../ZPButton';
import { ZPCard } from '../ZPCard';

type DigitalTwinSimulation = {
  simId: string;
  userId: string;
  type: 'home' | 'office' | 'city' | 'transport' | 'energy_system';
  inputConfig: Record<string, any>;
  results: {
    co2Saved: number;
    energySaved: number;
    costSaved: number;
    comparison: {
      baseline: { co2Emission: number; energyConsumption: number; cost: number };
      optimized: { co2Emission: number; energyConsumption: number; cost: number };
      improvement: { co2Reduction: number; energyReduction: number; costReduction: number };
    };
    recommendations: string[];
    feasibilityScore: number;
  };
  createdAt: string;
  updatedAt?: string;
  status: 'running' | 'completed' | 'failed';
  duration?: number;
};
type SimulationTemplate = {
  templateId: string;
  name: string;
  type: DigitalTwinSimulation['type'];
  description: string;
  inputSchema?: Record<string, any>;
  defaultValues?: Record<string, any>;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
};
import {
  Cpu,
  Home,
  Building,
  Car,
  Zap,
  Play,
  BarChart3,
  TrendingUp,
  DollarSign,
  Leaf,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';

interface DigitalTwinTrackerProps {
  simulations: DigitalTwinSimulation[];
  templates: SimulationTemplate[];
  onRunSimulation: (templateId: string, config: Record<string, any>) => void;
  onViewResults: (simId: string) => void;
}

export const DigitalTwinTracker: React.FC<DigitalTwinTrackerProps> = ({
  simulations,
  templates,
  onRunSimulation,
  onViewResults,
}) => {
  const [showNewSimModal, setShowNewSimModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SimulationTemplate | null>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<DigitalTwinSimulation | null>(null);
  const [simConfig, setSimConfig] = useState<Record<string, any>>({});

  // Calculate metrics from simulations
  const completedSims = simulations.filter(sim => sim.status === 'completed');
  const totalCO2Saved = completedSims.reduce((sum, sim) => sum + sim.results.co2Saved, 0);
  const totalEnergySaved = completedSims.reduce((sum, sim) => sum + sim.results.energySaved, 0);
  const totalCostSaved = completedSims.reduce((sum, sim) => sum + sim.results.costSaved, 0);
  const avgFeasibilityScore =
    completedSims.length > 0
      ? completedSims.reduce((sum, sim) => sum + sim.results.feasibilityScore, 0) /
        completedSims.length
      : 0;

  const metrics = [
    {
      label: 'CO₂ Saved',
      value: totalCO2Saved,
      unit: 'kg',
      trend: 'up' as const,
      color: 'green',
    },
    {
      label: 'Energy Saved',
      value: totalEnergySaved,
      unit: 'kWh',
      trend: 'up' as const,
      color: 'blue',
    },
    {
      label: 'Cost Saved',
      value: totalCostSaved,
      unit: '₹',
      trend: 'up' as const,
      color: 'purple',
    },
    {
      label: 'Feasibility',
      value: avgFeasibilityScore,
      unit: '%',
      trend: 'stable' as const,
      color: 'orange',
    },
  ];

  const getSimulationTypeIcon = (type: DigitalTwinSimulation['type']) => {
    switch (type) {
      case 'home':
        return <Home className='w-4 h-4' />;
      case 'office':
        return <Building className='w-4 h-4' />;
      case 'city':
        return <Building className='w-4 h-4' />;
      case 'transport':
        return <Car className='w-4 h-4' />;
      case 'energy_system':
        return <Zap className='w-4 h-4' />;
      default:
        return <Cpu className='w-4 h-4' />;
    }
  };

  const getStatusIcon = (status: DigitalTwinSimulation['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'running':
        return <Loader className='w-4 h-4 text-blue-500 animate-spin' />;
      case 'failed':
        return <AlertCircle className='w-4 h-4 text-red-500' />;
      default:
        return <Clock className='w-4 h-4 text-gray-500' />;
    }
  };

  const getDifficultyColor = (difficulty: SimulationTemplate['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRunSimulation = () => {
    if (selectedTemplate) {
      onRunSimulation(selectedTemplate.templateId, simConfig);
      setShowNewSimModal(false);
      setSelectedTemplate(null);
      setSimConfig({});
    }
  };

  const handleViewResults = (simulation: DigitalTwinSimulation) => {
    setSelectedSimulation(simulation);
    setShowResultsModal(true);
    onViewResults(simulation.simId);
  };

  return (
    <>
      <TrackerCard
        type='digital-twin'
        title='Digital Twin Simulations'
        metrics={[
          { label: 'CO₂ Saved', value: totalCO2Saved, unit: 'kg' },
          { label: 'Energy Saved', value: totalEnergySaved, unit: 'kWh' },
          { label: 'Cost Saved', value: totalCostSaved, unit: 'INR' },
        ]}
        overallScore={{ value: avgFeasibilityScore, maxValue: 100, label: 'Avg Feasibility' }}
        trend={avgFeasibilityScore >= 60 ? 'improving' : 'stable'}
        lastUpdated={new Date()}
        onViewDetails={() => setShowResultsModal(true)}
        onAddEntry={() => setShowNewSimModal(true)}
      />

      {/* New Simulation Modal */}
      {showNewSimModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <ZPCard className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-xl font-semibold'>New Digital Twin Simulation</h3>
                <button
                  onClick={() => setShowNewSimModal(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  ✕
                </button>
              </div>

              {!selectedTemplate ? (
                <div className='space-y-4'>
                  <h4 className='font-medium text-gray-700'>Choose a Simulation Template</h4>
                  <div className='grid gap-4'>
                    {templates.map(template => (
                      <div
                        key={template.templateId}
                        className='border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors'
                        onClick={() => {
                          setSelectedTemplate(template);
                          setSimConfig(template.defaultValues || {});
                        }}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center space-x-3'>
                            {getSimulationTypeIcon(template.type)}
                            <div>
                              <h5 className='font-medium'>{template.name}</h5>
                              <p className='text-sm text-gray-600'>{template.description}</p>
                            </div>
                          </div>
                          <div className='flex flex-col items-end space-y-1'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}
                            >
                              {template.difficulty}
                            </span>
                            <span className='text-xs text-gray-500 flex items-center'>
                              <Clock className='w-3 h-3 mr-1' />
                              {template.estimatedTime}m
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium text-gray-700'>
                      Configure: {selectedTemplate.name}
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        setSimConfig({});
                      }}
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      ← Back to Templates
                    </button>
                  </div>

                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-600 mb-3'>{selectedTemplate.description}</p>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='font-medium'>Category:</span> {selectedTemplate.category}
                      </div>
                      <div>
                        <span className='font-medium'>Estimated Time:</span>{' '}
                        {selectedTemplate.estimatedTime} minutes
                      </div>
                    </div>
                  </div>

                  {/* Simple configuration form */}
                  <div className='space-y-3'>
                    <h5 className='font-medium'>Configuration Parameters</h5>
                    {Object.entries(selectedTemplate.defaultValues || {}).map(([key, value]) => (
                      <div key={key}>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <input
                          type={typeof value === 'number' ? 'number' : 'text'}
                          value={simConfig[key] || value}
                          onChange={e =>
                            setSimConfig(prev => ({
                              ...prev,
                              [key]:
                                typeof value === 'number' ? Number(e.target.value) : e.target.value,
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                    ))}
                  </div>

                  <div className='flex space-x-3 pt-4'>
                    <ZPButton
                      onClick={handleRunSimulation}
                      className='flex-1 flex items-center justify-center space-x-2'
                    >
                      <Play className='w-4 h-4' />
                      <span>Run Simulation</span>
                    </ZPButton>
                    <ZPButton
                      variant='outline'
                      onClick={() => setShowNewSimModal(false)}
                      className='flex-1'
                    >
                      Cancel
                    </ZPButton>
                  </div>
                </div>
              )}
            </div>
          </ZPCard>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <ZPCard className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-xl font-semibold'>Simulation Results</h3>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  ✕
                </button>
              </div>

              <div className='space-y-6'>
                {/* Recent Simulations List */}
                <div>
                  <h4 className='font-medium text-gray-700 mb-4'>Recent Simulations</h4>
                  <div className='space-y-3'>
                    {simulations.slice(0, 5).map(simulation => (
                      <div
                        key={simulation.simId}
                        className='border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors'
                        onClick={() => handleViewResults(simulation)}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            {getSimulationTypeIcon(simulation.type)}
                            <div>
                              <h5 className='font-medium capitalize'>
                                {simulation.type.replace('_', ' ')} Simulation
                              </h5>
                              <p className='text-sm text-gray-600'>
                                Created {new Date(simulation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center space-x-4'>
                            {simulation.status === 'completed' && (
                              <div className='text-right text-sm'>
                                <div className='flex items-center space-x-2 text-green-600'>
                                  <Leaf className='w-4 h-4' />
                                  <span>{simulation.results.co2Saved.toFixed(1)} kg CO₂</span>
                                </div>
                                <div className='flex items-center space-x-2 text-blue-600'>
                                  <DollarSign className='w-4 h-4' />
                                  <span>₹{simulation.results.costSaved.toFixed(0)}</span>
                                </div>
                              </div>
                            )}
                            {getStatusIcon(simulation.status)}
                          </div>
                        </div>

                        {simulation.status === 'completed' &&
                          selectedSimulation?.simId === simulation.simId && (
                            <div className='mt-4 pt-4 border-t'>
                              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                                <div className='text-center'>
                                  <div className='text-2xl font-bold text-green-600'>
                                    {simulation.results.comparison.improvement.co2Reduction.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                  <div className='text-sm text-gray-600'>CO₂ Reduction</div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-2xl font-bold text-blue-600'>
                                    {simulation.results.comparison.improvement.energyReduction.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                  <div className='text-sm text-gray-600'>Energy Reduction</div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-2xl font-bold text-purple-600'>
                                    {simulation.results.comparison.improvement.costReduction.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                  <div className='text-sm text-gray-600'>Cost Reduction</div>
                                </div>
                                <div className='text-center'>
                                  <div className='text-2xl font-bold text-orange-600'>
                                    {simulation.results.feasibilityScore}
                                  </div>
                                  <div className='text-sm text-gray-600'>Feasibility Score</div>
                                </div>
                              </div>

                              {simulation.results.recommendations.length > 0 && (
                                <div>
                                  <h6 className='font-medium text-gray-700 mb-2'>
                                    Recommendations
                                  </h6>
                                  <ul className='space-y-1'>
                                    {simulation.results.recommendations
                                      .slice(0, 3)
                                      .map((rec, index) => (
                                        <li
                                          key={index}
                                          className='text-sm text-gray-600 flex items-start'
                                        >
                                          <span className='text-blue-500 mr-2'>•</span>
                                          {rec}
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                {completedSims.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-700 mb-4'>Overall Impact</h4>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div className='bg-green-50 p-4 rounded-lg text-center'>
                        <div className='text-2xl font-bold text-green-600'>
                          {totalCO2Saved.toFixed(1)}
                        </div>
                        <div className='text-sm text-gray-600'>Total CO₂ Saved (kg)</div>
                      </div>
                      <div className='bg-blue-50 p-4 rounded-lg text-center'>
                        <div className='text-2xl font-bold text-blue-600'>
                          {totalEnergySaved.toFixed(1)}
                        </div>
                        <div className='text-sm text-gray-600'>Total Energy Saved (kWh)</div>
                      </div>
                      <div className='bg-purple-50 p-4 rounded-lg text-center'>
                        <div className='text-2xl font-bold text-purple-600'>
                          ₹{totalCostSaved.toFixed(0)}
                        </div>
                        <div className='text-sm text-gray-600'>Total Cost Saved</div>
                      </div>
                      <div className='bg-orange-50 p-4 rounded-lg text-center'>
                        <div className='text-2xl font-bold text-orange-600'>
                          {completedSims.length}
                        </div>
                        <div className='text-sm text-gray-600'>Simulations Completed</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ZPCard>
        </div>
      )}
    </>
  );
};
