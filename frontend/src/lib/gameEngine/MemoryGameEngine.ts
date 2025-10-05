import { MemoryCard, MemoryConfig } from '@/types/games';

export interface MemoryGameState {
  cards: MemoryCard[];
  flippedCards: string[];
  matchedPairs: string[];
  moves: number;
  isComplete: boolean;
  timeRemaining?: number;
}

export class MemoryGameEngine {
  private config: MemoryConfig;
  private state: MemoryGameState;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.state = {
      cards: [...config.cards],
      flippedCards: [],
      matchedPairs: [],
      moves: 0,
      isComplete: false,
      timeRemaining: config.timeLimit,
    };
  }

  getState(): MemoryGameState {
    return { ...this.state };
  }

  flipCard(cardId: string): { success: boolean; isComplete: boolean; message?: string } {
    if (this.state.isComplete) {
      return { success: false, isComplete: true, message: 'Game already completed' };
    }

    const card = this.state.cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) {
      return { success: false, isComplete: false, message: 'Invalid card' };
    }

    // Flip the card
    card.isFlipped = true;
    this.state.flippedCards.push(cardId);

    // Check for match if two cards are flipped
    if (this.state.flippedCards.length === 2) {
      this.state.moves++;
      const [firstId, secondId] = this.state.flippedCards;
      const firstCard = this.state.cards.find(c => c.id === firstId);
      const secondCard = this.state.cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Match found
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        this.state.matchedPairs.push(firstId, secondId);
        this.state.flippedCards = [];

        // Check if game is complete
        if (this.state.matchedPairs.length === this.state.cards.length) {
          this.state.isComplete = true;
          return { success: true, isComplete: true, message: 'Congratulations! You completed the game!' };
        }

        return { success: true, isComplete: false, message: 'Match found!' };
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          if (firstCard) firstCard.isFlipped = false;
          if (secondCard) secondCard.isFlipped = false;
          this.state.flippedCards = [];
        }, 1000);

        return { success: true, isComplete: false, message: 'No match, try again!' };
      }
    }

    return { success: true, isComplete: false };
  }

  reset(): void {
    this.state = {
      cards: this.config.cards.map(card => ({ ...card, isFlipped: false, isMatched: false })),
      flippedCards: [],
      matchedPairs: [],
      moves: 0,
      isComplete: false,
      timeRemaining: this.config.timeLimit,
    };
  }

  getScore(): number {
    const totalPairs = this.state.cards.length / 2;
    const matchedPairs = this.state.matchedPairs.length / 2;
    const efficiency = Math.max(0, 1 - (this.state.moves - totalPairs) / totalPairs);
    return Math.round(matchedPairs * 100 * efficiency);
  }

  getCurrentGameData(): MemoryGameState {
    return this.state as MemoryGameState;
  }

  getGameMode(): string {
    return 'memory';
  }

  getCurrentRoundTitle(): string {
    return `Round ${this.state.currentRound}`;
  }

  nextRound(): MemoryGameState {
    if (this.state.currentRound < this.state.maxRounds) {
      this.state.currentRound++;
      this.state = this.resetRound();
    }
    return this.state as MemoryGameState;
  }

  resetRound(): MemoryGameState {
    this.state = {
      ...this.state,
      cards: this.initializeCards(this.config.cards),
      flippedCards: [],
      matches: 0,
      moves: 0,
    };
    return this.state as MemoryGameState;
  }

  checkMatch(): { isMatch: boolean; isComplete: boolean } {
    const flippedCards = this.state.cards.filter(card => card.isFlipped && !card.isMatched);
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      const isMatch = card1.content === card2.content;
      
      if (isMatch) {
        this.state.matchedPairs.push(card1.id, card2.id);
        this.state.matchedCards = [...this.state.matchedPairs];
        this.state.matches++;
        this.state.score += 10;
      }
      
      const isComplete = this.state.matchedPairs.length === this.state.cards.length;
      this.state.isComplete = isComplete;
      
      return { isMatch, isComplete };
    }
    return { isMatch: false, isComplete: this.state.isComplete };
  }

  completeRound(): MemoryGameState {
    this.state.isComplete = true;
    this.state.timeBonus = Math.max(0, (this.state.timeRemaining || 0) * 0.1);
    this.state.score += this.state.timeBonus;
    return this.state as MemoryGameState;
  }
}
