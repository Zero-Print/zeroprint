import { DragDropItem, DragDropTarget, DragDropConfig } from '@/types/games';

export interface DragDropGameState {
  items: DragDropItem[];
  targets: DragDropTarget[];
  score: number;
  isComplete: boolean;
  timeRemaining?: number;
}

export class DragDropGameEngine {
  private config: DragDropConfig;
  private state: DragDropGameState;

  constructor(config: DragDropConfig) {
    this.config = config;
    this.state = {
      items: [...config.items],
      targets: [...config.targets],
      score: 0,
      isComplete: false,
      timeRemaining: config.timeLimit,
    };
  }

  getState(): DragDropGameState {
    return { ...this.state };
  }

  dropItem(itemId: string, targetId: string): { 
    success: boolean; 
    isCorrect: boolean; 
    isComplete: boolean; 
    message?: string;
  } {
    if (this.state.isComplete) {
      return { success: false, isCorrect: false, isComplete: true, message: 'Game already completed' };
    }

    const item = this.state.items.find(i => i.id === itemId);
    const target = this.state.targets.find(t => t.id === targetId);

    if (!item || !target) {
      return { success: false, isCorrect: false, isComplete: false, message: 'Invalid item or target' };
    }

    // Check if target is already occupied
    if (target.isOccupied) {
      return { success: false, isCorrect: false, isComplete: false, message: 'Target is already occupied' };
    }

    // Check if item matches target
    const isCorrect = this.checkMatch(item, target);
    
    if (isCorrect) {
      // Place item on target
      item.position = { ...target.position };
      target.isOccupied = true;
      target.assignedItemId = itemId;
      this.state.score += 10;

      // Check if all items are placed correctly
      const allCorrect = this.state.targets.every(t => t.isOccupied && this.checkMatch(
        this.state.items.find(i => i.id === t.assignedItemId!)!,
        t
      ));

      if (allCorrect) {
        this.state.isComplete = true;
        return { 
          success: true, 
          isCorrect: true, 
          isComplete: true, 
          message: 'Congratulations! All items placed correctly!' 
        };
      }

      return { success: true, isCorrect: true, isComplete: false, message: 'Correct!' };
    } else {
      return { success: true, isCorrect: false, isComplete: false, message: 'Incorrect placement' };
    }
  }

  private checkMatch(item: DragDropItem, target: DragDropTarget): boolean {
    // This is a simple matching logic - can be customized based on game requirements
    return item.category === target.category || item.type === target.type;
  }

  removeItem(itemId: string): { success: boolean; message?: string } {
    const item = this.state.items.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    // Find and clear the target
    const target = this.state.targets.find(t => t.assignedItemId === itemId);
    if (target) {
      target.isOccupied = false;
      target.assignedItemId = undefined;
    }

    // Reset item position
    item.position = { x: 0, y: 0 };

    return { success: true, message: 'Item removed' };
  }

  reset(): void {
    this.state = {
      items: this.config.items.map(item => ({ ...item, position: { x: 0, y: 0 } })),
      targets: this.config.targets.map(target => ({ ...target, isOccupied: false, assignedItemId: undefined })),
      score: 0,
      isComplete: false,
      timeRemaining: this.config.timeLimit,
    };
  }

  getScore(): number {
    return this.state.score;
  }

  getProgress(): { placed: number; total: number; percentage: number } {
    const placed = this.state.targets.filter(t => t.isOccupied).length;
    const total = this.state.targets.length;
    return {
      placed,
      total,
      percentage: Math.round((placed / total) * 100)
    };
  }

  getCurrentGameData(): DragDropGameState {
    return this.state as DragDropGameState;
  }

  getGameMode(): string {
    return 'dragdrop';
  }

  getCurrentRoundTitle(): string {
    return 'Drag & Drop Challenge';
  }

  nextRound(): DragDropGameState {
    this.state = {
      ...this.state,
      items: this.config.config.items.map(item => ({ ...item, currentPosition: item.position, isPlaced: false, isDragging: false })),
      targets: this.config.config.targets.map(target => ({ ...target, isOccupied: false, assignedItemId: undefined })),
      score: 0,
      isComplete: false,
      feedback: {},
    };
    return this.state as DragDropGameState;
  }

  resetRound(): DragDropGameState {
    this.state = {
      ...this.state,
      items: this.config.config.items.map(item => ({ ...item, currentPosition: item.position, isPlaced: false, isDragging: false })),
      targets: this.config.config.targets.map(target => ({ ...target, isOccupied: false, assignedItemId: undefined })),
      score: 0,
      isComplete: false,
      feedback: {},
      completedPairs: 0,
      canSubmit: false,
    };
    return this.state as DragDropGameState;
  }

  getOriginalItem(itemId: string): DragDropItem | undefined {
    return this.state.items.find(item => item.id === itemId);
  }

  submitRound(): { success: boolean; isComplete: boolean; message?: string } {
    const correctMappings = this.state.correctMappings.filter(mapping => {
      const target = this.state.targets.find(t => t.assignedItemId === mapping.itemId);
      return target?.id === mapping.targetId;
    });
    
    this.state.completedPairs = correctMappings.length;
    this.state.canSubmit = correctMappings.length === this.state.correctMappings.length;
    this.state.isComplete = this.state.canSubmit;
    
    return {
      success: true,
      isComplete: this.state.isComplete,
      message: this.state.isComplete ? 'Round complete!' : 'Some items need to be placed correctly'
    };
  }
}
