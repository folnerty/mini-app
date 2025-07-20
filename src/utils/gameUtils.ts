import { Question, UserStats, LeaderboardEntry } from '../types/quiz';
import { questions } from '../data/questions';
import { VKUser, getUserDisplayName, getUserAvatar, generateUserKey } from './vkUtils';

export const getRandomQuestions = (count: number = 10, excludeIds: number[] = []): Question[] => {
  // Фильтруем вопросы, исключая уже отвеченные
  const availableQuestions = questions.filter(q => !excludeIds.includes(q.id));
  
  // Если доступных вопросов меньше чем нужно, сбрасываем историю и используем все вопросы
  const questionsToUse = availableQuestions.length >= count ? availableQuestions : questions;
  
  const shuffled = [...questionsToUse].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const shouldResetQuestionHistory = (answeredQuestions: number[]): boolean => {
  // Сбрасываем историю, если пользователь ответил на 80% всех вопросов
  return answeredQuestions.length >= Math.floor(questions.length * 0.8);
};

export const calculateScore = (correctAnswers: number, totalQuestions: number, timeBonus: number = 0): number => {
  const baseScore = correctAnswers * 100;
  const percentage = (correctAnswers / totalQuestions) * 100;
  const bonusScore = percentage > 80 ? 50 : percentage > 60 ? 25 : 0;
  return baseScore + bonusScore + timeBonus;
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'hard': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Физика': return 'bg-blue-100 text-blue-800';
    case 'Химия': return 'bg-purple-100 text-purple-800';
    case 'Биология': return 'bg-green-100 text-green-800';
    case 'Астрономия': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const loadUserStats = (): UserStats => {
  const saved = localStorage.getItem('userStats');
  if (saved) {
    return JSON.parse(saved);
  }
  
  return {
    totalQuestions: 0,
    correctAnswers: 0,
    totalPoints: 0,
    averageScore: 0,
    categoriesStats: {},
    achievements: [],
    lastPlayed: '',
    answeredQuestions: [],
    questionHistory: []
  };
};

export const saveUserStats = (stats: UserStats): void => {
  localStorage.setItem('userStats', JSON.stringify(stats));
};

export const updateUserStats = (
  correctAnswers: number, 
  totalQuestions: number, 
  score: number, 
  categories: string[], 
  gameQuestions: Question[], 
  userAnswers: number[], 
  timesSpent: number[]
): UserStats => {
  const stats = loadUserStats();
  
  // Проверяем, нужно ли сбросить историю вопросов
  if (shouldResetQuestionHistory(stats.answeredQuestions)) {
    stats.answeredQuestions = [];
    stats.questionHistory = [];
  }
  
  stats.totalQuestions += totalQuestions;
  stats.correctAnswers += correctAnswers;
  stats.totalPoints += score;
  stats.averageScore = Math.round((stats.totalPoints / (stats.totalQuestions / 10)) || 0);
  stats.lastPlayed = new Date().toISOString();
  
  // Добавляем новые вопросы в историю
  gameQuestions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    const timeSpent = timesSpent[index] || 30;
    
    // Добавляем ID вопроса в список отвеченных
    if (!stats.answeredQuestions.includes(question.id)) {
      stats.answeredQuestions.push(question.id);
    }
    
    // Добавляем детальную информацию в историю
    stats.questionHistory.push({
      questionId: question.id,
      userAnswer,
      isCorrect,
      timestamp: new Date().toISOString(),
      timeSpent
    });
  });
  
  // Update category stats
  categories.forEach(category => {
    if (!stats.categoriesStats[category]) {
      stats.categoriesStats[category] = { correct: 0, total: 0 };
    }
    stats.categoriesStats[category].total += 1;
  });
  
  // Обновляем статистику правильных ответов по категориям
  gameQuestions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect && stats.categoriesStats[question.category]) {
      stats.categoriesStats[question.category].correct += 1;
    }
  });
  
  // Check for achievements
  const newAchievements = checkAchievements(stats);
  stats.achievements = [...new Set([...stats.achievements, ...newAchievements])];
  
  saveUserStats(stats);
  return stats;
};

export const checkAchievements = (stats: UserStats): string[] => {
  const achievements: string[] = [];
  
  if (stats.totalQuestions >= 50 && !stats.achievements.includes('Новичок')) {
    achievements.push('Новичок');
  }
  
  if (stats.totalQuestions >= 100 && !stats.achievements.includes('Знаток')) {
    achievements.push('Знаток');
  }
  
  if (stats.correctAnswers >= 100 && !stats.achievements.includes('Эрудит')) {
    achievements.push('Эрудит');
  }
  
  if (stats.totalPoints >= 1000 && !stats.achievements.includes('Мастер')) {
    achievements.push('Мастер');
  }
  
  return achievements;
};

export const loadLeaderboard = (): LeaderboardEntry[] => {
  const saved = localStorage.getItem('leaderboard');
  if (saved) {
    return JSON.parse(saved);
  }
  
  // Пустой рейтинг для новых пользователей
  return [];
};

export const updateLeaderboard = (stats: UserStats, vkUser: VKUser | null = null): void => {
  const leaderboard = loadLeaderboard();
  
  const userId = vkUser ? generateUserKey(vkUser.id) : 'anonymous_user';
  const userName = vkUser ? getUserDisplayName(vkUser) : 'Анонимный пользователь';
  const userAvatar = vkUser ? getUserAvatar(vkUser) : '👤';
  
  const userEntry: LeaderboardEntry = {
    id: userId,
    name: userName,
    totalPoints: stats.totalPoints,
    gamesPlayed: Math.floor(stats.totalQuestions / 10),
    averageScore: stats.averageScore,
    avatar: userAvatar
  };
  
  const existingIndex = leaderboard.findIndex(entry => entry.id === userId);
  if (existingIndex >= 0) {
    leaderboard[existingIndex] = userEntry;
  } else {
    leaderboard.push(userEntry);
  }
  
  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
};

export const getCurrentUserRank = (leaderboard: LeaderboardEntry[], vkUser: VKUser | null): number => {
  if (!vkUser) return 0;
  const userId = generateUserKey(vkUser.id);
  return leaderboard.findIndex(entry => entry.id === userId) + 1;
};

export const isCurrentUser = (entry: LeaderboardEntry, vkUser: VKUser | null): boolean => {
  if (!vkUser) return false;
  return entry.id === generateUserKey(vkUser.id);
};