import { Question, UserStats, LeaderboardEntry } from '../types/quiz';
import { questions } from '../data/questions';
import { VKUser, getUserDisplayName, getUserAvatar, generateUserKey } from './vkUtils';
import vkBridge from '@vkontakte/vk-bridge';

export const getRandomQuestions = (count: number = 10, excludeIds: number[] = []): Question[] => {
    const availableQuestions = questions.filter(q => !excludeIds.includes(q.id));

    const questionsToUse = availableQuestions.length >= count ? availableQuestions : questions;

    const shuffled = [...questionsToUse].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const shouldResetQuestionHistory = (answeredQuestions: number[]): boolean => {
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

    if (shouldResetQuestionHistory(stats.answeredQuestions)) {
        stats.answeredQuestions = [];
        stats.questionHistory = [];
    }

    stats.totalQuestions += totalQuestions;
    stats.correctAnswers += correctAnswers;
    stats.totalPoints += score;
    stats.averageScore = Math.round((stats.totalPoints / (stats.totalQuestions / 10)) || 0);
    stats.lastPlayed = new Date().toISOString();

    gameQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const timeSpent = timesSpent[index] || 30;

        if (!stats.answeredQuestions.includes(question.id)) {
            stats.answeredQuestions.push(question.id);
        }

        stats.questionHistory.push({
            questionId: question.id,
            userAnswer,
            isCorrect,
            timestamp: new Date().toISOString(),
            timeSpent
        });
    });

    categories.forEach(category => {
        if (!stats.categoriesStats[category]) {
            stats.categoriesStats[category] = { correct: 0, total: 0 };
        }
        stats.categoriesStats[category].total += 1;
    });

    gameQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;

        if (isCorrect && stats.categoriesStats[question.category]) {
            stats.categoriesStats[question.category].correct += 1;
        }
    });

    const newAchievements = checkAchievements(stats);
    stats.achievements = [...new Set([...stats.achievements, ...newAchievements])];

    saveUserStats(stats);
    return stats;
};

// Константы для VK Storage
const VK_STORAGE_KEYS = {
    GLOBAL_LEADERBOARD: 'quiz_global_leaderboard_v2',
    USER_PREFIX: 'quiz_user_',
    LEADERBOARD_HASH: 'quiz_leaderboard_hash'
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

// Функция для загрузки общего рейтинга из VK Storage
export const loadSharedLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
        const { isVKEnvironment } = await import('./vkUtils');
        
        if (isVKEnvironment()) {
            console.log('Loading leaderboard from VK Storage...');
            
            // Загружаем общий рейтинг из VK Storage
            const result = await vkBridge.send('VKWebAppStorageGet', {
                keys: [VK_STORAGE_KEYS.GLOBAL_LEADERBOARD]
            });
            
            if (result.keys && result.keys.length > 0 && result.keys[0].value) {
                const leaderboard = JSON.parse(result.keys[0].value);
                console.log('Loaded leaderboard from VK Storage:', leaderboard.length, 'entries');
                
                // Кешируем локально для быстрого доступа
                localStorage.setItem('cached_leaderboard', JSON.stringify(leaderboard));
                
                return leaderboard;
            } else {
                console.log('No leaderboard found in VK Storage, initializing empty');
                return [];
            }
        } else {
            console.log('Not in VK environment, using local cache');
            // В не-VK окружении используем локальный кеш
            const cached = localStorage.getItem('cached_leaderboard');
            return cached ? JSON.parse(cached) : [];
        }
    } catch (error) {
        console.error('Error loading leaderboard from VK Storage:', error);
        
        // Fallback к локальному кешу
        const cached = localStorage.getItem('cached_leaderboard');
        return cached ? JSON.parse(cached) : [];
    }
};

// Функция для обновления общего рейтинга в VK Storage
export const updateSharedLeaderboard = async (stats: UserStats, vkUser?: VKUser): Promise<void> => {
    try {
        const userId = vkUser ? `vk_${vkUser.id}` : `guest_${Date.now()}`;
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
        
        const { isVKEnvironment } = await import('./vkUtils');
        
        if (isVKEnvironment()) {
            console.log('Updating leaderboard in VK Storage...');
            
            // Загружаем текущий рейтинг
            let currentLeaderboard: LeaderboardEntry[] = [];
            
            try {
                const result = await vkBridge.send('VKWebAppStorageGet', {
                    keys: [VK_STORAGE_KEYS.GLOBAL_LEADERBOARD]
                });
                
                if (result.keys && result.keys.length > 0 && result.keys[0].value) {
                    currentLeaderboard = JSON.parse(result.keys[0].value);
                }
            } catch (loadError) {
                console.log('Could not load existing leaderboard, starting fresh');
            }
            
            // Обновляем или добавляем запись пользователя
            const existingIndex = currentLeaderboard.findIndex(entry => entry.id === userId);
            if (existingIndex >= 0) {
                currentLeaderboard[existingIndex] = userEntry;
            } else {
                currentLeaderboard.push(userEntry);
            }
            
            // Сортируем по очкам и ограничиваем размер
            currentLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
            const limitedLeaderboard = currentLeaderboard.slice(0, 100);
            
            // Сохраняем обновленный рейтинг в VK Storage
            await vkBridge.send('VKWebAppStorageSet', {
                key: VK_STORAGE_KEYS.GLOBAL_LEADERBOARD,
                value: JSON.stringify(limitedLeaderboard)
            });
            
            // Также сохраняем индивидуальную запись пользователя
            await vkBridge.send('VKWebAppStorageSet', {
                key: `${VK_STORAGE_KEYS.USER_PREFIX}${userId}`,
                value: JSON.stringify(userEntry)
            });
            
            // Кешируем локально
            localStorage.setItem('cached_leaderboard', JSON.stringify(limitedLeaderboard));
            
            console.log('Leaderboard updated in VK Storage:', limitedLeaderboard.length, 'entries');
        } else {
            console.log('Not in VK environment, updating local cache only');
            
            // В не-VK окружении обновляем только локальный кеш
            const cached = localStorage.getItem('cached_leaderboard');
            let currentLeaderboard: LeaderboardEntry[] = cached ? JSON.parse(cached) : [];
            
            const existingIndex = currentLeaderboard.findIndex(entry => entry.id === userId);
            if (existingIndex >= 0) {
                currentLeaderboard[existingIndex] = userEntry;
            } else {
                currentLeaderboard.push(userEntry);
            }
            
            currentLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
            const limitedLeaderboard = currentLeaderboard.slice(0, 100);
            
            localStorage.setItem('cached_leaderboard', JSON.stringify(limitedLeaderboard));
        }
        
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        
        // Fallback к локальному обновлению
        const userId = vkUser ? `vk_${vkUser.id}` : `guest_${Date.now()}`;
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
        
        const cached = localStorage.getItem('cached_leaderboard');
        let currentLeaderboard: LeaderboardEntry[] = cached ? JSON.parse(cached) : [];
        
        const existingIndex = currentLeaderboard.findIndex(entry => entry.id === userId);
        if (existingIndex >= 0) {
            currentLeaderboard[existingIndex] = userEntry;
        } else {
            currentLeaderboard.push(userEntry);
        }
        
        currentLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
        const limitedLeaderboard = currentLeaderboard.slice(0, 100);
        
        localStorage.setItem('cached_leaderboard', JSON.stringify(limitedLeaderboard));
    }
};

// Синхронная функция для быстрого доступа к кешированному рейтингу
export const getCachedLeaderboard = (): LeaderboardEntry[] => {
    try {
        const cached = localStorage.getItem('cached_leaderboard');
        return cached ? JSON.parse(cached) : [];
    } catch (error) {
        console.error('Error loading cached leaderboard:', error);
        return [];
    }
};

// Функция для инициализации общего рейтинга
export const initSharedLeaderboard = async (): Promise<void> => {
    try {
        const leaderboard = await loadSharedLeaderboard();
        console.log('Shared leaderboard initialized with', leaderboard.length, 'entries');
    } catch (error) {
        console.error('Error initializing shared leaderboard:', error);
    }
};

export const getCurrentUserRank = (leaderboard: LeaderboardEntry[], vkUser: VKUser | null): number => {
    if (!vkUser) return 0;
    const userId = generateUserKey(vkUser.id);
    const rank = leaderboard.findIndex(entry => entry.id === userId) + 1;
    return rank > 0 ? rank : 0;
};

export const isCurrentUser = (entry: LeaderboardEntry, vkUser: VKUser | null): boolean => {
    if (!vkUser) return entry.id.startsWith('anonymous_');
    return entry.id === generateUserKey(vkUser.id);
};