'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SimulationEngine } from '@/lib/gameEngine/SimulationEngine';
import { GameState, SimulationInput, SimulationOutput } from '@/types/games';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SimulationGameUIProps {
  gameEngine: SimulationEngine;
  gameState: GameState;
  onStateChange: (state: GameState) => void;
}

export default function SimulationGameUI({ gameEngine, gameState, onStateChange }: SimulationGameUIProps) {
  const [results, setResults] = useState<Record<string, any>>({});
  const [running, setRunning] = useState(false);
  const inputs = (gameEngine.config as any).config.inputs as SimulationInput[];
  const outputs = (gameEngine.config as any).config.outputs as SimulationOutput[];

  useEffect(() => {
    // initial results if any
    setResults(gameEngine.getCurrentResults());
  }, [gameEngine]);

  const handleInputChange = useCallback((input: SimulationInput, value: any) => {
    const res = gameEngine.updateInput(input.id, value);
    if (res.success) {
      setResults({ ...(res.results || {}) });
      onStateChange(gameEngine.getState());
    }
  }, [gameEngine, onStateChange]);

  const handleRun = useCallback(() => {
    setRunning(true);
    try {
      const sim = gameEngine.runSimulation();
      setResults(sim.results);
      onStateChange(gameEngine.getState());
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  }, [gameEngine, onStateChange]);

  const handleReset = useCallback(() => {
    gameEngine.resetInputs();
    setResults(gameEngine.getCurrentResults());
    onStateChange(gameEngine.getState());
  }, [gameEngine, onStateChange]);

  const renderInput = (input: SimulationInput) => {
    const value = gameEngine.getInputValue(input.id);
    switch (input.type) {
      case 'slider':
        return (
          <div className="space-y-2" key={input.id}>
            <label className="text-sm text-gray-700 flex justify-between">
              <span>{input.label}</span>
              <span className="text-gray-500">{value}{input.unit ? ` ${input.unit}` : ''}</span>
            </label>
            <input
              type="range"
              min={input.min}
              max={input.max}
              step={input.step || 1}
              value={Number(value) ?? 0}
              onChange={(e) => handleInputChange(input, Number(e.target.value))}
              className="w-full"
            />
          </div>
        );
      case 'toggle':
        return (
          <label className="flex items-center gap-2" key={input.id}>
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => handleInputChange(input, e.target.checked)} />
            <span className="text-sm text-gray-700">{input.label}</span>
          </label>
        );
      case 'select':
        return (
          <div className="space-y-1" key={input.id}>
            <label className="text-sm text-gray-700">{input.label}</label>
            <select
              value={String(value)}
              onChange={(e) => handleInputChange(input, e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              {(input.options || []).map(opt => (
                <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      case 'text':
      default:
        return (
          <div className="space-y-1" key={input.id}>
            <label className="text-sm text-gray-700">{input.label}</label>
            <input
              type="number"
              value={value as any}
              onChange={(e) => handleInputChange(input, Number(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              placeholder={input.description}
            />
          </div>
        );
    }
  };

  const renderOutput = (output: SimulationOutput) => {
    const val = results[output.formulaId];
    if (output.type === 'number') {
      return (
        <div key={output.id} className="p-4 bg-white rounded border text-center">
          <div className="text-xs text-gray-500 mb-1">{output.label}</div>
          <div className="text-2xl font-semibold">{formatValue(val, output.format)}{output.unit ? ` ${output.unit}` : ''}</div>
        </div>
      );
    }
    if (output.type === 'text') {
      return (
        <div key={output.id} className="p-4 bg-white rounded border">
          <div className="text-xs text-gray-500 mb-1">{output.label}</div>
          <div className="text-sm">{String(val)}</div>
        </div>
      );
    }
    if (output.type === 'chart') {
      // Simple chart demo: treat val as series array or single number
      const data = Array.isArray(val) ? val : [{ name: 'Result', value: Number(val || 0) }];
      if (output.chartType === 'line') {
        return (
          <div key={output.id} className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke={output.color || '#10b981'} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }
      if (output.chartType === 'bar') {
        return (
          <div key={output.id} className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={output.color || '#3b82f6'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
      if (output.chartType === 'pie') {
        return (
          <div key={output.id} className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
                  {(data as any[]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={output.color || '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      }
    }
    return null;
  };

  const formatValue = (val: any, format?: string) => {
    if (val == null) return '—';
    if (format === 'percentage') return `${Number(val).toFixed(1)}%`;
    if (format === 'currency') return `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ZPCard className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{(gameEngine as any).config.title}</h2>
            <p className="text-sm text-gray-600">Adjust inputs to explore outcomes. Earn coins when you complete the simulation.</p>
          </div>
          <div className="flex items-center gap-2">
            <ZPBadge variant="info">Coins: {gameState.coinsEarned || 0}/{gameState.maxScore}</ZPBadge>
          </div>
        </div>
      </ZPCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ZPCard className="p-4 md:col-span-1">
          <h3 className="font-medium text-gray-900 mb-3">Inputs</h3>
          <div className="space-y-3">
            {inputs.map(renderInput)}
          </div>
          <div className="mt-4 flex gap-2">
            <ZPButton onClick={handleRun} disabled={running}>{running ? 'Running…' : 'Run Simulation'}</ZPButton>
            <ZPButton variant="secondary" onClick={handleReset}>Reset</ZPButton>
          </div>
        </ZPCard>

        <div className="md:col-span-2 space-y-4">
          <ZPCard className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {outputs.filter(o => o.type === 'number' || o.type === 'text').map(renderOutput)}
            </div>
          </ZPCard>

          {outputs.some(o => o.type === 'chart') && (
            <ZPCard className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Charts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outputs.filter(o => o.type === 'chart').map(renderOutput)}
              </div>
            </ZPCard>
          )}
        </div>
      </div>
    </div>
  );
}


