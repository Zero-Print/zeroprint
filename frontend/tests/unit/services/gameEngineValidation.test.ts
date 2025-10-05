import { gameEngineUtils } from '@/lib/gameEngine';

describe('GameEngine config validation', () => {
  it('rejects missing required base fields', () => {
    const { valid, errors } = gameEngineUtils.validateConfig({} as any);
    expect(valid).toBe(false);
    expect(errors.join(' ')).toMatch(/Game ID is required/);
    expect(errors.join(' ')).toMatch(/Game title is required/);
    expect(errors.join(' ')).toMatch(/Game type is required/);
    expect(errors.join(' ')).toMatch(/Game category is required/);
  });

  it('validates quiz config requirements', () => {
    const config: any = {
      id: 'quiz-1',
      title: 'Smart City Quiz',
      description: 'Test knowledge',
      type: 'quiz',
      category: 'city',
      difficulty: 'medium',
      coins: 10,
      maxScore: 100,
      estimatedTime: 600,
      tags: [],
      isActive: true,
      config: { questions: [] },
    };
    const res = gameEngineUtils.validateConfig(config);
    expect(res.valid).toBe(false);
    expect(res.errors.join(' ')).toMatch(/at least one question/);

    config.config.questions = [
      { id: 'q1', text: 'Q1', type: 'single', options: ['A', 'B'], correctAnswer: 'A' },
    ];
    const res2 = gameEngineUtils.validateConfig(config);
    expect(res2.valid).toBe(true);
  });

  it('validates dragdrop config requirements', () => {
    const config: any = {
      id: 'dd-1',
      title: 'Bin Sorter',
      description: 'Sort waste items',
      type: 'dragdrop',
      category: 'waste',
      difficulty: 'easy',
      coins: 10,
      maxScore: 100,
      estimatedTime: 480,
      tags: [],
      isActive: true,
      config: { items: [], targets: [], correctMapping: {}, mode: 'sorting' },
    };
    const res = gameEngineUtils.validateConfig(config);
    expect(res.valid).toBe(false);
    expect(res.errors.join(' ')).toMatch(/at least one item/);

    config.config.items = [{ id: 'i1' }];
    config.config.targets = [{ id: 't1' }];
    const res2 = gameEngineUtils.validateConfig(config);
    expect(res2.valid).toBe(true);
  });

  it('validates simulation config requirements', () => {
    const config: any = {
      id: 'sim-1',
      title: 'Commute Calculator',
      description: 'Calculate commute CO2',
      type: 'simulation',
      category: 'transport',
      difficulty: 'easy',
      coins: 12,
      maxScore: 100,
      estimatedTime: 600,
      tags: [],
      isActive: true,
      config: { inputs: [], formulas: [] },
    };
    const res = gameEngineUtils.validateConfig(config);
    expect(res.valid).toBe(false);
    expect(res.errors.join(' ')).toMatch(/at least one input/);

    config.config.inputs = [{ id: 'distance', label: 'Distance', type: 'number', defaultValue: 10 }];
    config.config.formulas = [{ id: 'co2', expression: 'distance * 0.15' }];
    const res2 = gameEngineUtils.validateConfig(config);
    expect(res2.valid).toBe(true);
  });
});
