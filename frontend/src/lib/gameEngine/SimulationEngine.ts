import { BaseGameEngine } from './BaseGameEngine';
import { 
  SimulationConfig, 
  SimulationInput, 
  SimulationFormula, 
  SimulationResult,
  GameEvent,
  GameState 
} from '@/types/games';

export class SimulationEngine extends BaseGameEngine<SimulationConfig> {
  private inputValues: Map<string, any> = new Map();
  private calculationHistory: Array<{
    inputs: Record<string, any>;
    results: Record<string, any>;
    timestamp: Date;
  }> = [];
  private currentResults: Record<string, any> = {};

  constructor(config: SimulationConfig) {
    super(config);
  }

  // Override initialize to set up simulation-specific state
  initialize(config: SimulationConfig, userId: string): void {
    super.initialize(config, userId);
    
    this.updateState({
      totalSteps: 1, // Simulations are typically single-step completion
      maxScore: config.coins, // Score equals coins for simulations
    });

    this.inputValues.clear();
    this.calculationHistory = [];
    this.currentResults = {};

    // Initialize with default values
    this.initializeDefaultValues();
  }

  // Simulation-specific implementations
  validateAnswer(): boolean {
    throw new Error('Simulation engine does not support answer validation');
  }

  validateDrop(): boolean {
    throw new Error('Simulation engine does not support drag-drop validation');
  }

  validateInput(inputId: string, value: any): boolean {
    const input = this.getInputById(inputId);
    if (!input) return false;

    // Type validation
    switch (input.type) {
      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) return false;
        if (input.min !== undefined && numValue < input.min) return false;
        if (input.max !== undefined && numValue > input.max) return false;
        return true;

      case 'slider':
        const sliderValue = Number(value);
        if (isNaN(sliderValue)) return false;
        if (sliderValue < input.min || sliderValue > input.max) return false;
        return true;

      case 'select':
        return input.options?.some(option => option.value === value) || false;

      case 'toggle':
        return typeof value === 'boolean';

      case 'text':
        return typeof value === 'string' && value.length <= (input.maxLength || 1000);

      default:
        return true;
    }
  }

  calculateScore(): number {
    // For simulations, score is based on completion and interaction quality
    const requiredInputs = this.config.config.inputs.filter(input => input.required);
    const completedRequiredInputs = requiredInputs.filter(input => 
      this.inputValues.has(input.id) && this.inputValues.get(input.id) !== null
    );

    if (completedRequiredInputs.length === requiredInputs.length) {
      // Full score for completing all required inputs
      return this.config.coins;
    } else {
      // Partial score based on completion percentage
      const completionRate = completedRequiredInputs.length / requiredInputs.length;
      return Math.round(this.config.coins * completionRate);
    }
  }

  // Simulation-specific methods
  updateInput(inputId: string, value: any): {
    success: boolean;
    error?: string;
    results?: Record<string, any>;
  } {
    const input = this.getInputById(inputId);
    if (!input) {
      return {
        success: false,
        error: `Input with id ${inputId} not found`,
      };
    }

    if (!this.validateInput(inputId, value)) {
      return {
        success: false,
        error: `Invalid value for input ${input.label}`,
      };
    }

    // Update input value
    this.inputValues.set(inputId, value);

    // Update game state
    this.updateState({
      answers: {
        ...this.state.answers,
        [inputId]: value,
      },
    });

    // Recalculate results if auto-calculate is enabled
    let results = this.currentResults;
    if (this.config.config.autoCalculate) {
      results = this.calculateResults();
    }

    // Emit input changed event
    this.processEvent({
      type: 'INPUT_CHANGED',
      payload: {
        inputId,
        value,
        results,
        allInputsValid: this.areAllRequiredInputsValid(),
      },
    });

    return {
      success: true,
      results,
    };
  }

  calculateResults(): Record<string, any> {
    const inputs = this.getAllInputValues();
    const results: Record<string, any> = {};

    // Execute all formulas
    this.config.config.formulas.forEach(formula => {
      try {
        const result = this.executeFormula(formula, inputs);
        results[formula.id] = result;
      } catch (error) {
        console.error(`Error executing formula ${formula.id}:`, error);
        results[formula.id] = null;
      }
    });

    this.currentResults = results;

    // Add to calculation history
    this.calculationHistory.push({
      inputs: { ...inputs },
      results: { ...results },
      timestamp: new Date(),
    });

    // Emit calculation completed event
    this.processEvent({
      type: 'CALCULATION_COMPLETED',
      payload: {
        inputs,
        results,
        timestamp: new Date().toISOString(),
      },
    });

    return results;
  }

  runSimulation(): SimulationResult {
    if (!this.areAllRequiredInputsValid()) {
      throw new Error('Cannot run simulation: required inputs are missing or invalid');
    }

    const inputs = this.getAllInputValues();
    const results = this.calculateResults();
    const score = this.calculateScore();

    const simulationResult: SimulationResult = {
      gameId: this.state.gameId,
      userId: this.state.userId,
      inputs,
      results,
      score,
      coinsEarned: score,
      insights: this.generateInsights(inputs, results),
      recommendations: this.generateRecommendations(inputs, results),
      chartData: this.generateChartData(inputs, results),
      completedAt: new Date().toISOString(),
    };

    // Update game state
    this.updateState({
      score,
      coinsEarned: score,
      currentStep: 1,
    });

    // Complete the game
    this.complete();

    return simulationResult;
  }

  getInputValue(inputId: string): any {
    return this.inputValues.get(inputId);
  }

  getAllInputValues(): Record<string, any> {
    const values: Record<string, any> = {};
    this.inputValues.forEach((value, inputId) => {
      values[inputId] = value;
    });
    return values;
  }

  getCurrentResults(): Record<string, any> {
    return { ...this.currentResults };
  }

  getCalculationHistory(): Array<{
    inputs: Record<string, any>;
    results: Record<string, any>;
    timestamp: Date;
  }> {
    return [...this.calculationHistory];
  }

  resetInputs(): void {
    this.inputValues.clear();
    this.currentResults = {};
    this.initializeDefaultValues();

    this.updateState({
      answers: {},
      score: 0,
      currentStep: 0,
    });

    this.processEvent({
      type: 'INPUTS_RESET',
      payload: {
        gameId: this.state.gameId,
      },
    });
  }

  // Scenario management
  loadScenario(scenarioId: string): boolean {
    const scenario = this.config.config.scenarios?.find(s => s.id === scenarioId);
    if (!scenario) return false;

    // Load scenario inputs
    Object.entries(scenario.inputs).forEach(([inputId, value]) => {
      this.updateInput(inputId, value);
    });

    this.processEvent({
      type: 'SCENARIO_LOADED',
      payload: {
        scenarioId,
        scenario,
      },
    });

    return true;
  }

  compareScenarios(scenarioIds: string[]): Record<string, any> {
    const comparisons: Record<string, any> = {};

    scenarioIds.forEach(scenarioId => {
      const scenario = this.config.config.scenarios?.find(s => s.id === scenarioId);
      if (scenario) {
        // Temporarily calculate results for this scenario
        const tempResults: Record<string, any> = {};
        this.config.config.formulas.forEach(formula => {
          try {
            const result = this.executeFormula(formula, scenario.inputs);
            tempResults[formula.id] = result;
          } catch (error) {
            tempResults[formula.id] = null;
          }
        });
        comparisons[scenarioId] = {
          inputs: scenario.inputs,
          results: tempResults,
          name: scenario.name,
        };
      }
    });

    return comparisons;
  }

  // Private helper methods
  private getInputById(inputId: string): SimulationInput | undefined {
    return this.config.config.inputs.find(input => input.id === inputId);
  }

  private initializeDefaultValues(): void {
    this.config.config.inputs.forEach(input => {
      if (input.defaultValue !== undefined) {
        this.inputValues.set(input.id, input.defaultValue);
      }
    });
  }

  private areAllRequiredInputsValid(): boolean {
    const requiredInputs = this.config.config.inputs.filter(input => input.required);
    return requiredInputs.every(input => {
      const value = this.inputValues.get(input.id);
      return value !== undefined && value !== null && this.validateInput(input.id, value);
    });
  }

  private executeFormula(formula: SimulationFormula, inputs: Record<string, any>): any {
    // Define allowed operations for secure formula execution
    const allowedOps = ['Math.sqrt', 'Math.pow', 'Math.min', 'Math.max', 'Math.abs', 'Math.round'];
    
    // Create a safe execution context with limited Math functions
    const context = {
      ...inputs,
      Math: {
        sqrt: Math.sqrt,
        pow: Math.pow,
        min: Math.min,
        max: Math.max,
        abs: Math.abs,
        round: Math.round
      },
      // Add common utility functions
      round: (num: number, decimals: number = 2) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
    };
    
    // Sanitize formula expression to prevent code injection
    const sanitized = formula.expression.replace(/[^a-zA-Z0-9+\-*/.() ]/g, '');
    
    // Validate that the formula only uses allowed operations
    const isValid = allowedOps.some(op => sanitized.includes(op)) || 
                    !sanitized.includes('Math.') || 
                    sanitized.match(/^[a-zA-Z0-9+\-*/.() ]+$/);
    
    if (!isValid) {
      throw new Error(`Formula contains disallowed operations: ${formula.expression}`);
    }
    
    try {
      // Execute the sanitized formula with the limited context
      return Function(...Object.keys(context), `return ${sanitized}`)(...Object.values(context));
    } catch (error) {
      throw new Error(`Formula execution failed: ${error}`);
    }
  }

  private generateInsights(inputs: Record<string, any>, results: Record<string, any>): string[] {
    const insights: string[] = [];

    // Generate insights based on results
    this.config.config.formulas.forEach(formula => {
      const result = results[formula.id];
      if (result !== null && formula.insights) {
        formula.insights.forEach(insight => {
          if (this.evaluateCondition(insight.condition, inputs, results)) {
            insights.push(insight.message);
          }
        });
      }
    });

    return insights;
  }

  private generateRecommendations(inputs: Record<string, any>, results: Record<string, any>): string[] {
    const recommendations: string[] = [];

    // Generate recommendations based on results
    this.config.config.formulas.forEach(formula => {
      const result = results[formula.id];
      if (result !== null && formula.recommendations) {
        formula.recommendations.forEach(rec => {
          if (this.evaluateCondition(rec.condition, inputs, results)) {
            recommendations.push(rec.message);
          }
        });
      }
    });

    return recommendations;
  }

  private generateChartData(inputs: Record<string, any>, results: Record<string, any>): any[] {
    const chartData: any[] = [];

    // Generate chart data based on configuration
    if (this.config.config.charts) {
      this.config.config.charts.forEach(chart => {
        const data = {
          id: chart.id,
          type: chart.type,
          title: chart.title,
          data: this.generateChartDataPoints(chart, inputs, results),
        };
        chartData.push(data);
      });
    }

    return chartData;
  }

  private generateChartDataPoints(chart: any, inputs: Record<string, any>, results: Record<string, any>): any[] {
    // This would generate actual chart data based on chart configuration
    // For now, return a simple structure
    return chart.dataPoints?.map((point: any) => ({
      label: point.label,
      value: results[point.formulaId] || 0,
    })) || [];
  }

  private evaluateCondition(condition: string, inputs: Record<string, any>, results: Record<string, any>): boolean {
    try {
      const context = { ...inputs, ...results };
      const func = new Function(...Object.keys(context), `return ${condition}`);
      return Boolean(func(...Object.values(context)));
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  // Analytics and insights
  getSimulationAnalytics(): {
    totalCalculations: number;
    inputChanges: number;
    averageSessionTime: number;
    mostUsedInputs: Record<string, number>;
    resultTrends: Record<string, any[]>;
  } {
    const analytics = {
      totalCalculations: this.calculationHistory.length,
      inputChanges: this.inputValues.size,
      averageSessionTime: 0,
      mostUsedInputs: {} as Record<string, number>,
      resultTrends: {} as Record<string, any[]>,
    };

    // Calculate input usage
    this.config.config.inputs.forEach(input => {
      analytics.mostUsedInputs[input.id] = this.inputValues.has(input.id) ? 1 : 0;
    });

    // Calculate result trends
    this.config.config.formulas.forEach(formula => {
      analytics.resultTrends[formula.id] = this.calculationHistory.map(calc => ({
        timestamp: calc.timestamp,
        value: calc.results[formula.id],
      }));
    });

    return analytics;
  }

  // Get detailed results for review
  getDetailedResults(): {
    inputs: Array<{
      input: SimulationInput;
      value: any;
      isValid: boolean;
    }>;
    results: Array<{
      formula: SimulationFormula;
      result: any;
      unit?: string;
    }>;
    summary: {
      score: number;
      insights: string[];
      recommendations: string[];
      completionRate: number;
    };
  } {
    const inputs = this.config.config.inputs.map(input => ({
      input,
      value: this.inputValues.get(input.id),
      isValid: this.validateInput(input.id, this.inputValues.get(input.id)),
    }));

    const results = this.config.config.formulas.map(formula => ({
      formula,
      result: this.currentResults[formula.id],
      unit: formula.unit,
    }));

    const allInputs = this.getAllInputValues();
    const allResults = this.getCurrentResults();
    const score = this.calculateScore();
    const insights = this.generateInsights(allInputs, allResults);
    const recommendations = this.generateRecommendations(allInputs, allResults);
    
    const requiredInputs = this.config.config.inputs.filter(input => input.required);
    const completedInputs = requiredInputs.filter(input => 
      this.inputValues.has(input.id) && this.inputValues.get(input.id) !== null
    );
    const completionRate = (completedInputs.length / requiredInputs.length) * 100;

    return {
      inputs,
      results,
      summary: {
        score,
        insights,
        recommendations,
        completionRate,
      },
    };
  }
}