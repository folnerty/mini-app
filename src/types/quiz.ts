export interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  averageScore: number;
  categoriesStats: Record<string, {
    correct: number;
    total: number;
  }>;
  achievements: string[];
  lastPlayed: string;
  answeredQuestions: number[];
  questionHistory: Array<{
    questionId: number;
    userAnswer: number;
    isCorrect: boolean;
    timestamp: string;
    timeSpent: number;
  }>;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  gamesPlayed: number;
  averageScore: number;
  avatar: string;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  timeLeft: number;
  isGameActive: boolean;
  selectedQuestions: Question[];
}