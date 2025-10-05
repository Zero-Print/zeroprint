import { QuizQuestion, QuizAnswer } from '@/types/games';

export interface QuizGameState {
  currentQuestion: number;
  questions: QuizQuestion[];
  answers: Map<string, string[]>;
  score: number;
  timeRemaining?: number;
  isComplete: boolean;
}

export class QuizGameEngine {
  private questions: QuizQuestion[];
  private state: QuizGameState;
  private timeLimit?: number;

  constructor(questions: QuizQuestion[], timeLimit?: number) {
    this.questions = questions;
    this.timeLimit = timeLimit;
    this.state = {
      currentQuestion: 0,
      questions: [...questions],
      answers: new Map(),
      score: 0,
      timeRemaining: timeLimit,
      isComplete: false,
    };
  }

  getState(): QuizGameState {
    return { ...this.state };
  }

  getCurrentQuestion(): QuizQuestion | null {
    if (this.state.currentQuestion >= this.state.questions.length) {
      return null;
    }
    return this.state.questions[this.state.currentQuestion];
  }

  submitAnswer(questionId: string, selectedAnswers: string[]): { 
    success: boolean; 
    isCorrect: boolean; 
    isComplete: boolean; 
    message?: string;
    correctAnswers?: string[];
  } {
    if (this.state.isComplete) {
      return { success: false, isCorrect: false, isComplete: true, message: 'Quiz already completed' };
    }

    const question = this.state.questions.find(q => q.id === questionId);
    if (!question) {
      return { success: false, isCorrect: false, isComplete: false, message: 'Question not found' };
    }

    // Store the answer
    this.state.answers.set(questionId, selectedAnswers);

    // Check if answer is correct
    const isCorrect = this.checkAnswer(question, selectedAnswers);
    if (isCorrect) {
      this.state.score += question.points || question.coinsPerCorrect || 10;
    }

    // Move to next question
    this.state.currentQuestion++;

    // Check if quiz is complete
    if (this.state.currentQuestion >= this.state.questions.length) {
      this.state.isComplete = true;
      return { 
        success: true, 
        isCorrect, 
        isComplete: true, 
        message: `Quiz completed! Final score: ${this.state.score}`,
        correctAnswers: question.correctAnswers
      };
    }

    return { 
      success: true, 
      isCorrect, 
      isComplete: false,
      correctAnswers: question.correctAnswers
    };
  }

  private checkAnswer(question: QuizQuestion, selectedAnswers: string[]): boolean {
    const correctAnswers = question.correctAnswers;
    
    if (selectedAnswers.length !== correctAnswers.length) {
      return false;
    }

    // Check if all selected answers are correct
    return selectedAnswers.every(answer => correctAnswers.includes(answer));
  }

  skipQuestion(): { success: boolean; isComplete: boolean; message?: string } {
    if (this.state.isComplete) {
      return { success: false, isComplete: true, message: 'Quiz already completed' };
    }

    this.state.currentQuestion++;

    if (this.state.currentQuestion >= this.state.questions.length) {
      this.state.isComplete = true;
      return { success: true, isComplete: true, message: `Quiz completed! Final score: ${this.state.score}` };
    }

    return { success: true, isComplete: false };
  }

  reset(): void {
    this.state = {
      currentQuestion: 0,
      questions: [...this.questions],
      answers: new Map(),
      score: 0,
      timeRemaining: this.timeLimit,
      isComplete: false,
    };
  }

  getScore(): number {
    return this.state.score;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.state.currentQuestion,
      total: this.state.questions.length,
      percentage: Math.round((this.state.currentQuestion / this.state.questions.length) * 100)
    };
  }

  getCurrentGameData(): QuizGameState {
    return this.state as QuizGameState;
  }

  getGameMode(): string {
    return 'quiz';
  }

  getCurrentRoundTitle(): string {
    return `Question ${this.state.currentQuestionIndex + 1} of ${this.state.questions.length}`;
  }

  nextRound(): QuizGameState {
    return this.nextQuestion();
  }

  resetRound(): QuizGameState {
    this.state = {
      ...this.state,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      isComplete: false,
    };
    return this.state as QuizGameState;
  }

  nextQuestion(): QuizGameState {
    if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
      this.state.currentQuestionIndex++;
      this.state.currentQuestion = this.state.currentQuestionIndex;
    } else {
      this.state.isComplete = true;
    }
    return this.state as QuizGameState;
  }
}
