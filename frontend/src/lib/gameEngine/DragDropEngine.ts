import { BaseGameEngine } from './BaseGameEngine';
import { 
  DragDropConfig, 
  DragDropItem, 
  DragDropTarget, 
  GameEvent,
  GameState 
} from '@/types/games';

export class DragDropEngine extends BaseGameEngine<DragDropConfig> {
  private placedItems: Map<string, string> = new Map(); // itemId -> targetId
  private dropHistory: Array<{
    itemId: string;
    targetId: string;
    timestamp: Date;
    isCorrect: boolean;
  }> = [];

  constructor(config: DragDropConfig) {
    super(config);
  }

  // Override initialize to set up drag-drop specific state
  initialize(config: DragDropConfig, userId: string): void {
    super.initialize(config, userId);
    
    this.updateState({
      totalSteps: config.config.items.length,
      maxScore: this.calculateMaxScore(),
    });

    this.placedItems.clear();
    this.dropHistory = [];
  }

  // Drag-drop specific implementations
  validateAnswer(): boolean {
    throw new Error('Drag-drop engine does not support answer validation');
  }

  validateDrop(itemId: string, targetId: string): boolean {
    const item = this.getItemById(itemId);
    const target = this.getTargetById(targetId);
    
    if (!item || !target) return false;

    switch (this.config.config.mode) {
      case 'sorting':
        return this.validateSorting(item, target);
      case 'matching':
        return this.validateMatching(item, target);
      case 'jigsaw':
        return this.validateJigsaw(item, target);
      default:
        return false;
    }
  }

  validateInput(): boolean {
    throw new Error('Drag-drop engine does not support input validation');
  }

  calculateScore(): number {
    let score = 0;
    const correctMappings = this.config.config.correctMapping;

    this.placedItems.forEach((targetId, itemId) => {
      if (correctMappings[itemId] === targetId) {
        const item = this.getItemById(itemId);
        score += item?.points || 1;
      }
    });

    return score;
  }

  // Drag-drop specific methods
  dropItem(itemId: string, targetId: string): {
    success: boolean;
    isCorrect: boolean;
    feedback?: string;
    canContinue: boolean;
  } {
    const item = this.getItemById(itemId);
    const target = this.getTargetById(targetId);

    if (!item || !target) {
      return {
        success: false,
        isCorrect: false,
        feedback: 'Invalid item or target',
        canContinue: true,
      };
    }

    // Check if target is already occupied (for single-item targets)
    if (target.maxItems === 1 && this.isTargetOccupied(targetId)) {
      return {
        success: false,
        isCorrect: false,
        feedback: 'This target is already occupied',
        canContinue: true,
      };
    }

    // Check if target has reached capacity
    if (this.getTargetItemCount(targetId) >= (target.maxItems || Infinity)) {
      return {
        success: false,
        isCorrect: false,
        feedback: 'This target is full',
        canContinue: true,
      };
    }

    const isCorrect = this.validateDrop(itemId, targetId);
    
    // Remove item from previous position if it was placed
    const previousTarget = this.placedItems.get(itemId);
    if (previousTarget) {
      this.removeItemFromTarget(itemId, previousTarget);
    }

    // Place item in new target
    this.placedItems.set(itemId, targetId);

    // Record drop in history
    this.dropHistory.push({
      itemId,
      targetId,
      timestamp: new Date(),
      isCorrect,
    });

    // Update game state
    this.updateState({
      answers: {
        ...this.state.answers,
        [itemId]: targetId,
      },
      currentStep: this.placedItems.size,
    });

    // Emit drop event
    this.processEvent({
      type: 'ITEM_DROPPED',
      payload: {
        itemId,
        targetId,
        isCorrect,
        previousTarget,
        placedItems: this.placedItems.size,
        totalItems: this.config.config.items.length,
      },
    });

    // Check if game is complete
    const canContinue = !this.isGameComplete();
    if (!canContinue) {
      this.complete();
    }

    return {
      success: true,
      isCorrect,
      feedback: this.generateDropFeedback(item, target, isCorrect),
      canContinue,
    };
  }

  removeItem(itemId: string): boolean {
    const targetId = this.placedItems.get(itemId);
    if (!targetId) return false;

    this.placedItems.delete(itemId);

    // Update game state
    const newAnswers = { ...this.state.answers };
    delete newAnswers[itemId];
    
    this.updateState({
      answers: newAnswers,
      currentStep: this.placedItems.size,
    });

    // Emit item removed event
    this.processEvent({
      type: 'ITEM_REMOVED',
      payload: {
        itemId,
        targetId,
        placedItems: this.placedItems.size,
      },
    });

    return true;
  }

  getItemPosition(itemId: string): string | null {
    return this.placedItems.get(itemId) || null;
  }

  getTargetItems(targetId: string): DragDropItem[] {
    const itemIds = Array.from(this.placedItems.entries())
      .filter(([_, tId]) => tId === targetId)
      .map(([itemId, _]) => itemId);

    return itemIds
      .map(id => this.getItemById(id))
      .filter(item => item !== undefined) as DragDropItem[];
  }

  getAvailableItems(): DragDropItem[] {
    return this.config.config.items.filter(item => 
      !this.placedItems.has(item.id)
    );
  }

  getGameProgress(): {
    placed: number;
    total: number;
    percentage: number;
    correct: number;
    incorrect: number;
  } {
    const total = this.config.config.items.length;
    const placed = this.placedItems.size;
    const percentage = (placed / total) * 100;

    let correct = 0;
    let incorrect = 0;

    this.placedItems.forEach((targetId, itemId) => {
      if (this.config.config.correctMapping[itemId] === targetId) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return { placed, total, percentage, correct, incorrect };
  }

  // Hint system
  getHint(itemId?: string): string | null {
    if (!this.config.config.allowHints) return null;

    if (itemId) {
      const item = this.getItemById(itemId);
      const correctTargetId = this.config.config.correctMapping[itemId];
      const correctTarget = this.getTargetById(correctTargetId);

      if (item && correctTarget) {
        return `${item.name} belongs in ${correctTarget.name}`;
      }
    } else {
      // General hint
      const unplacedItems = this.getAvailableItems();
      if (unplacedItems.length > 0) {
        const randomItem = unplacedItems[Math.floor(Math.random() * unplacedItems.length)];
        return this.getHint(randomItem.id);
      }
    }

    return null;
  }

  // Validation methods for different modes
  private validateSorting(item: DragDropItem, target: DragDropTarget): boolean {
    // For sorting mode, check if item category matches target category
    return item.category === target.category;
  }

  private validateMatching(item: DragDropItem, target: DragDropTarget): boolean {
    // For matching mode, use the correct mapping
    return this.config.config.correctMapping[item.id] === target.id;
  }

  private validateJigsaw(item: DragDropItem, target: DragDropTarget): boolean {
    // For jigsaw mode, check position-based matching
    const correctTargetId = this.config.config.correctMapping[item.id];
    return correctTargetId === target.id;
  }

  // Helper methods
  private getItemById(itemId: string): DragDropItem | undefined {
    return this.config.config.items.find(item => item.id === itemId);
  }

  private getTargetById(targetId: string): DragDropTarget | undefined {
    return this.config.config.targets.find(target => target.id === targetId);
  }

  private isTargetOccupied(targetId: string): boolean {
    return Array.from(this.placedItems.values()).includes(targetId);
  }

  private getTargetItemCount(targetId: string): number {
    return Array.from(this.placedItems.values())
      .filter(tId => tId === targetId).length;
  }

  private removeItemFromTarget(itemId: string, targetId: string): void {
    // This is handled by the Map operations in dropItem
    // Additional cleanup logic can be added here if needed
  }

  private calculateMaxScore(): number {
    return this.config.config.items.reduce((total, item) => {
      return total + (item.points || 1);
    }, 0);
  }

  private isGameComplete(): boolean {
    if (this.config.config.requireAllItems) {
      return this.placedItems.size === this.config.config.items.length;
    } else {
      // Game is complete when minimum required items are placed correctly
      const minRequired = this.config.config.minRequiredItems || this.config.config.items.length;
      const correctPlacements = Array.from(this.placedItems.entries())
        .filter(([itemId, targetId]) => this.config.config.correctMapping[itemId] === targetId)
        .length;
      
      return correctPlacements >= minRequired;
    }
  }

  private generateDropFeedback(item: DragDropItem, target: DragDropTarget, isCorrect: boolean): string {
    if (isCorrect) {
      switch (this.config.config.mode) {
        case 'sorting':
          return `Great! ${item.name} belongs in ${target.name}`;
        case 'matching':
          return `Perfect match! ${item.name} and ${target.name} go together`;
        case 'jigsaw':
          return `Excellent! That piece fits perfectly`;
        default:
          return 'Correct placement!';
      }
    } else {
      switch (this.config.config.mode) {
        case 'sorting':
          return `${item.name} doesn't belong in ${target.name}. Try another bin!`;
        case 'matching':
          return `${item.name} and ${target.name} don't match. Keep trying!`;
        case 'jigsaw':
          return `That piece doesn't fit there. Look for the right spot!`;
        default:
          return 'Try a different placement!';
      }
    }
  }

  // Analytics and insights
  getDragDropAnalytics(): {
    totalDrops: number;
    correctDrops: number;
    incorrectDrops: number;
    averageDropTime: number;
    itemAnalytics: Record<string, {
      attempts: number;
      correctOnFirstTry: boolean;
      finallyCorrect: boolean;
    }>;
    targetAnalytics: Record<string, {
      totalDrops: number;
      correctDrops: number;
      currentItems: number;
    }>;
  } {
    const analytics = {
      totalDrops: this.dropHistory.length,
      correctDrops: this.dropHistory.filter(drop => drop.isCorrect).length,
      incorrectDrops: this.dropHistory.filter(drop => !drop.isCorrect).length,
      averageDropTime: 0,
      itemAnalytics: {} as Record<string, any>,
      targetAnalytics: {} as Record<string, any>,
    };

    // Calculate item analytics
    this.config.config.items.forEach(item => {
      const itemDrops = this.dropHistory.filter(drop => drop.itemId === item.id);
      const firstDrop = itemDrops[0];
      const currentTarget = this.placedItems.get(item.id);
      const isCurrentlyCorrect = currentTarget && 
        this.config.config.correctMapping[item.id] === currentTarget;

      analytics.itemAnalytics[item.id] = {
        attempts: itemDrops.length,
        correctOnFirstTry: firstDrop?.isCorrect || false,
        finallyCorrect: isCurrentlyCorrect,
      };
    });

    // Calculate target analytics
    this.config.config.targets.forEach(target => {
      const targetDrops = this.dropHistory.filter(drop => drop.targetId === target.id);
      const currentItems = this.getTargetItems(target.id);

      analytics.targetAnalytics[target.id] = {
        totalDrops: targetDrops.length,
        correctDrops: targetDrops.filter(drop => drop.isCorrect).length,
        currentItems: currentItems.length,
      };
    });

    return analytics;
  }

  // Get detailed results for review
  getDetailedResults(): {
    items: Array<{
      item: DragDropItem;
      placedIn: DragDropTarget | null;
      correctTarget: DragDropTarget | null;
      isCorrect: boolean;
      attempts: number;
    }>;
    targets: Array<{
      target: DragDropTarget;
      items: DragDropItem[];
      correctItems: DragDropItem[];
      accuracy: number;
    }>;
    summary: {
      score: number;
      maxScore: number;
      percentage: number;
      efficiency: number; // correct drops / total drops
    };
  } {
    const items = this.config.config.items.map(item => {
      const placedTargetId = this.placedItems.get(item.id);
      const placedTarget = placedTargetId ? this.getTargetById(placedTargetId) : null;
      const correctTargetId = this.config.config.correctMapping[item.id];
      const correctTarget = this.getTargetById(correctTargetId);
      const isCorrect = placedTargetId === correctTargetId;
      const attempts = this.dropHistory.filter(drop => drop.itemId === item.id).length;

      return {
        item,
        placedIn: placedTarget || null,
        correctTarget: correctTarget || null,
        isCorrect,
        attempts,
      };
    });

    const targets = this.config.config.targets.map(target => {
      const currentItems = this.getTargetItems(target.id);
      const correctItems = currentItems.filter(item => 
        this.config.config.correctMapping[item.id] === target.id
      );
      const accuracy = currentItems.length > 0 
        ? (correctItems.length / currentItems.length) * 100 
        : 0;

      return {
        target,
        items: currentItems,
        correctItems,
        accuracy,
      };
    });

    const score = this.calculateScore();
    const maxScore = this.state.maxScore;
    const percentage = (score / maxScore) * 100;
    const efficiency = this.dropHistory.length > 0 
      ? (this.dropHistory.filter(drop => drop.isCorrect).length / this.dropHistory.length) * 100
      : 0;

    return {
      items,
      targets,
      summary: {
        score,
        maxScore,
        percentage,
        efficiency,
      },
    };
  }
}