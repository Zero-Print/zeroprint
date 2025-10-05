import { BaseGameEngine } from './BaseGameEngine';
import { 
  QuizConfig, 
  QuizQuestion, 
  QuizAnswer, 
  GameEvent,
  GameState 
} from '@/types/games';

export class QuizEngine extends BaseGameEngine<QuizConfig> {
  private currentQuestionIndex: number = 0;
  private questionStartTime?: Date;
  private questionTimer?: NodeJS.Timeout;

  constructor(config: QuizConfig) {
    super(config);
  }

  // Override initialize to set up quiz-specific state
  initialize(config: QuizConfig, userId: string): void {
    super.initialize(config, userId);
    
    this.updateState({
      totalSteps: config.config.questions.length,
      maxScore: this.calculateMaxScore(),
    });
  }

  // Override start to begin first question
  start(): void {
    super.start();
    this.startQuestion(0);
  }

  // Quiz-specific implementations
  validateAnswer(questionId: string, answer: QuizAnswer): boolean {
    const question = this.getQuestionById(questionId);
    if (!question) return false;

    if (question.type === 'single') {
      return question.correctAnswer === answer.selectedOption;
    } else if (question.type === 'multiple') {
      const correctAnswers = question.correctAnswers || [];
      const selectedAnswers = answer.selectedOptions || [];
      
      return correctAnswers.length === selectedAnswers.length &&
             correctAnswers.every(ans => selectedAnswers.includes(ans));
    }

    return false;
  }

  validateDrop(): boolean {
    throw new Error('Quiz engine does not support drag-drop validation');
  }

  validateInput(): boolean {
    throw new Error('Quiz engine does not support input validation');
  }

  calculateScore(): number {
    let totalScore = 0;
    const answers = this.state.answers || {};

    this.config.config.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer && this.validateAnswer(question.id, userAnswer)) {
        totalScore += question.points || 1;
      }
    });

    return totalScore;
  }

  // Quiz-specific methods
  submitAnswer(questionId: string, answer: QuizAnswer): void {
    const question = this.getQuestionById(questionId);
    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    const isCorrect = this.validateAnswer(questionId, answer);
    const responseTime = this.calculateResponseTime();

    // Update state with answer
    this.updateState({
      answers: {
        ...this.state.answers,
        [questionId]: {
          ...answer,
          isCorrect,
          responseTime,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Stop question timer
    this.stopQuestionTimer();

    // Emit answer submitted event
    this.processEvent({
      type: 'ANSWER_SUBMITTED',
      payload: {
        questionId,
        answer,
        isCorrect,
        responseTime,
        currentQuestion: this.currentQuestionIndex,
        totalQuestions: this.config.config.questions.length,
      },
    });

    // Move to next question or complete game
    if (this.hasNextQuestion()) {
      this.nextQuestion();
    } else {
      this.complete();
    }
  }

  getCurrentQuestion(): QuizQuestion | null {
    return this.config.config.questions[this.currentQuestionIndex] || null;
  }

  getQuestionProgress(): { current: number; total: number; percentage: number } {
    const total = this.config.config.questions.length;
    const current = this.currentQuestionIndex + 1;
    const percentage = (current / total) * 100;

    return { current, total, percentage };
  }

  skipQuestion(): void {
    if (!this.config.config.allowSkip) {
      throw new Error('Skipping questions is not allowed in this quiz');
    }

    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion) {
      // Record as skipped
      this.updateState({
        answers: {
          ...this.state.answers,
          [currentQuestion.id]: {
            selectedOption: null,
            selectedOptions: [],
            isCorrect: false,
            responseTime: this.calculateResponseTime(),
            timestamp: new Date().toISOString(),
            skipped: true,
          },
        },
      });

      this.stopQuestionTimer();

      if (this.hasNextQuestion()) {
        this.nextQuestion();
      } else {
        this.complete();
      }
    }
  }

  getQuestionTimeRemaining(): number {
    if (!this.config.config.questionTimeLimit) return 0;
    
    const elapsed = this.calculateResponseTime();
    return Math.max(0, this.config.config.questionTimeLimit - elapsed);
  }

  // Private helper methods
  private startQuestion(index: number): void {
    this.currentQuestionIndex = index;
    this.questionStartTime = new Date();

    const question = this.getCurrentQuestion();
    if (!question) return;

    // Start question timer if configured
    if (this.config.config.questionTimeLimit) {
      this.startQuestionTimer();
    }

    // Emit question started event
    this.processEvent({
      type: 'QUESTION_STARTED',
      payload: {
        questionId: question.id,
        questionIndex: index,
        timeLimit: this.config.config.questionTimeLimit,
      },
    });
  }

  private nextQuestion(): void {
    if (this.hasNextQuestion()) {
      this.startQuestion(this.currentQuestionIndex + 1);
    }
  }

  private hasNextQuestion(): boolean {
    return this.currentQuestionIndex < this.config.config.questions.length - 1;
  }

  private getQuestionById(questionId: string): QuizQuestion | undefined {
    return this.config.config.questions.find(q => q.id === questionId);
  }

  private calculateMaxScore(): number {
    return this.config.config.questions.reduce((total, question) => {
      return total + (question.points || 1);
    }, 0);
  }

  private calculateResponseTime(): number {
    if (!this.questionStartTime) return 0;
    
    const now = new Date();
    return Math.round((now.getTime() - this.questionStartTime.getTime()) / 1000);
  }

  private startQuestionTimer(): void {
    if (!this.config.config.questionTimeLimit) return;

    this.questionTimer = setTimeout(() => {
      // Auto-submit empty answer when time expires
      const currentQuestion = this.getCurrentQuestion();
      if (currentQuestion) {
        this.submitAnswer(currentQuestion.id, {
          selectedOption: null,
          selectedOptions: [],
          isCorrect: false,
          responseTime: this.config.config.questionTimeLimit!,
          timestamp: new Date().toISOString(),
          timedOut: true,
        });
      }
    }, this.config.config.questionTimeLimit * 1000);
  }

  private stopQuestionTimer(): void {
    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
      this.questionTimer = undefined;
    }
  }

  // Override processEvent to handle quiz-specific events
  processEvent(event: GameEvent): void {
    switch (event.type) {
      case 'QUESTION_STARTED':
        // Handle question started logic
        break;
      case 'ANSWER_SUBMITTED':
        // Already handled in submitAnswer
        break;
      default:
        super.processEvent(event);
    }
  }

  // Quiz analytics and insights
  getQuizAnalytics(): {
    averageResponseTime: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedAnswers: number;
    timedOutAnswers: number;
    categoryPerformance: Record<string, { correct: number; total: number }>;
  } {
    const answers = this.state.answers || {};
    const analytics = {
      averageResponseTime: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedAnswers: 0,
      timedOutAnswers: 0,
      categoryPerformance: {} as Record<string, { correct: number; total: number }>,
    };

    let totalResponseTime = 0;
    let answeredQuestions = 0;

    this.config.config.questions.forEach(question => {
      const answer = answers[question.id];
      const category = question.category || 'general';

      // Initialize category if not exists
      if (!analytics.categoryPerformance[category]) {
        analytics.categoryPerformance[category] = { correct: 0, total: 0 };
      }
      analytics.categoryPerformance[category].total++;

      if (answer) {
        if (answer.skipped) {
          analytics.skippedAnswers++;
        } else if (answer.timedOut) {
          analytics.timedOutAnswers++;
        } else if (answer.isCorrect) {
          analytics.correctAnswers++;
          analytics.categoryPerformance[category].correct++;
        } else {
          analytics.incorrectAnswers++;
        }

        if (answer.responseTime) {
          totalResponseTime += answer.responseTime;
          answeredQuestions++;
        }
      }
    });

    analytics.averageResponseTime = answeredQuestions > 0 
      ? Math.round(totalResponseTime / answeredQuestions) 
      : 0;

    return analytics;
  }

  // Get detailed results for review
  getDetailedResults(): {
    questions: Array<{
      question: QuizQuestion;
      userAnswer: QuizAnswer | null;
      isCorrect: boolean;
      explanation?: string;
    }>;
    summary: {
      score: number;
      maxScore: number;
      percentage: number;
      timeSpent: number;
    };
  } {
    const answers = this.state.answers || {};
    const questions = this.config.config.questions.map(question => ({
      question,
      userAnswer: answers[question.id] || null,
      isCorrect: answers[question.id]?.isCorrect || false,
      explanation: question.explanation,
    }));

    const score = this.calculateScore();
    const maxScore = this.state.maxScore;
    const percentage = (score / maxScore) * 100;
    const timeSpent = this.state.completedAt && this.state.startedAt
      ? Math.round((new Date(this.state.completedAt).getTime() - new Date(this.state.startedAt).getTime()) / 1000)
      : 0;

    return {
      questions,
      summary: {
        score,
        maxScore,
        percentage,
        timeSpent,
      },
    };
  }
}