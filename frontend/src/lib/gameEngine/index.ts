export { BaseGameEngine } from './BaseGameEngine';
export { QuizEngine } from './QuizEngine';
export { DragDropEngine } from './DragDropEngine';
export { SimulationEngine } from './SimulationEngine';

// Game Engine Factory
import { BaseGameEngine } from './BaseGameEngine';
import { QuizEngine } from './QuizEngine';
import { DragDropEngine } from './DragDropEngine';
import { SimulationEngine } from './SimulationEngine';
import { GameConfig, GameType } from '@/types/games';

export class GameEngineFactory {
  static createEngine(config: GameConfig): BaseGameEngine {
    switch (config.type) {
      case 'quiz':
        return new QuizEngine(config as any);
      case 'dragdrop':
        return new DragDropEngine(config as any);
      case 'simulation':
        return new SimulationEngine(config as any);
      default:
        throw new Error(`Unsupported game type: ${config.type}`);
    }
  }

  static getSupportedTypes(): GameType[] {
    return ['quiz', 'dragdrop', 'simulation'];
  }

  static validateConfig(config: GameConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!config.id) errors.push('Game ID is required');
    if (!config.title) errors.push('Game title is required');
    if (!config.type) errors.push('Game type is required');
    if (!config.category) errors.push('Game category is required');
    if (typeof config.coins !== 'number' || config.coins < 0) {
      errors.push('Coins must be a non-negative number');
    }

    // Type-specific validation
    switch (config.type) {
      case 'quiz':
        errors.push(...this.validateQuizConfig(config as any));
        break;
      case 'dragdrop':
        errors.push(...this.validateDragDropConfig(config as any));
        break;
      case 'simulation':
        errors.push(...this.validateSimulationConfig(config as any));
        break;
      default:
        errors.push(`Unsupported game type: ${config.type}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static validateQuizConfig(config: any): string[] {
    const errors: string[] = [];

    if (!config.config) {
      errors.push('Quiz config is required');
      return errors;
    }

    if (!Array.isArray(config.config.questions) || config.config.questions.length === 0) {
      errors.push('Quiz must have at least one question');
    } else {
      config.config.questions.forEach((question: any, index: number) => {
        if (!question.id) errors.push(`Question ${index + 1}: ID is required`);
        if (!question.text) errors.push(`Question ${index + 1}: Text is required`);
        if (!question.type || !['single', 'multiple'].includes(question.type)) {
          errors.push(`Question ${index + 1}: Type must be 'single' or 'multiple'`);
        }
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push(`Question ${index + 1}: Must have at least 2 options`);
        }
        if (question.type === 'single' && !question.correctAnswer) {
          errors.push(`Question ${index + 1}: Correct answer is required for single choice`);
        }
        if (question.type === 'multiple' && (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0)) {
          errors.push(`Question ${index + 1}: Correct answers are required for multiple choice`);
        }
      });
    }

    return errors;
  }

  private static validateDragDropConfig(config: any): string[] {
    const errors: string[] = [];

    if (!config.config) {
      errors.push('Drag-drop config is required');
      return errors;
    }

    if (!Array.isArray(config.config.items) || config.config.items.length === 0) {
      errors.push('Drag-drop must have at least one item');
    }

    if (!Array.isArray(config.config.targets) || config.config.targets.length === 0) {
      errors.push('Drag-drop must have at least one target');
    }

    if (!config.config.correctMapping || typeof config.config.correctMapping !== 'object') {
      errors.push('Correct mapping is required');
    }

    if (!config.config.mode || !['sorting', 'matching', 'jigsaw'].includes(config.config.mode)) {
      errors.push('Mode must be one of: sorting, matching, jigsaw');
    }

    return errors;
  }

  private static validateSimulationConfig(config: any): string[] {
    const errors: string[] = [];

    if (!config.config) {
      errors.push('Simulation config is required');
      return errors;
    }

    if (!Array.isArray(config.config.inputs) || config.config.inputs.length === 0) {
      errors.push('Simulation must have at least one input');
    } else {
      config.config.inputs.forEach((input: any, index: number) => {
        if (!input.id) errors.push(`Input ${index + 1}: ID is required`);
        if (!input.label) errors.push(`Input ${index + 1}: Label is required`);
        if (!input.type || !['number', 'slider', 'select', 'toggle', 'text'].includes(input.type)) {
          errors.push(`Input ${index + 1}: Invalid type`);
        }
      });
    }

    if (!Array.isArray(config.config.formulas) || config.config.formulas.length === 0) {
      errors.push('Simulation must have at least one formula');
    } else {
      config.config.formulas.forEach((formula: any, index: number) => {
        if (!formula.id) errors.push(`Formula ${index + 1}: ID is required`);
        if (!formula.expression) errors.push(`Formula ${index + 1}: Expression is required`);
      });
    }

    return errors;
  }
}

// Utility functions
export const gameEngineUtils = {
  /**
   * Create a game engine instance from config
   */
  createEngine: GameEngineFactory.createEngine,

  /**
   * Validate game configuration
   */
  validateConfig: GameEngineFactory.validateConfig,

  /**
   * Get supported game types
   */
  getSupportedTypes: GameEngineFactory.getSupportedTypes,

  /**
   * Check if a game type is supported
   */
  isTypeSupported: (type: string): boolean => {
    return GameEngineFactory.getSupportedTypes().includes(type as GameType);
  },

  /**
   * Get default configuration for a game type
   */
  getDefaultConfig: (type: GameType): Partial<GameConfig> => {
    const baseConfig = {
      id: '',
      title: '',
      description: '',
      category: 'general' as const,
      difficulty: 'medium' as const,
      coins: 10,
      estimatedTime: 300, // 5 minutes
      tags: [],
      isActive: true,
    };

    switch (type) {
      case 'quiz':
        return {
          ...baseConfig,
          type: 'quiz',
          config: {
            questions: [],
            allowSkip: false,
            showCorrectAnswer: true,
            randomizeQuestions: false,
            randomizeOptions: false,
          },
        };

      case 'dragdrop':
        return {
          ...baseConfig,
          type: 'dragdrop',
          config: {
            mode: 'sorting' as const,
            items: [],
            targets: [],
            correctMapping: {},
            allowHints: true,
            requireAllItems: true,
          },
        };

      case 'simulation':
        return {
          ...baseConfig,
          type: 'simulation',
          config: {
            inputs: [],
            formulas: [],
            autoCalculate: true,
            allowReset: true,
          },
        };

      default:
        return baseConfig;
    }
  },
};