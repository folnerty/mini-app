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

// Константы для VK Storage
const VK_STORAGE_KEYS = {
    GLOBAL_LEADERBOARD: 'quiz_global_leaderboard_v3',
    USER_STATS_PREFIX: 'quiz_user_stats_',
    LEADERBOARD_VERSION: 'quiz_leaderboard_version'
};

// Функция для загрузки статистики пользователя
export const loadUserStats = async (vkUser?: VKUser): Promise<UserStats> => {
    const defaultStats: UserStats = {
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

    try {
        const { isVKEnvironment } = await import('./vkUtils');
        
        if (isVKEnvironment() && vkUser) {
            console.log('Loading user stats from VK Storage for user:', vkUser.id);
            
            const userStatsKey = VK_STORAGE_KEYS.USER_STATS_PREFIX + vkUser.id;
            const result = await vkBridge.send('VKWebAppStorageGet', {
                keys: [userStatsKey]
            });
            
            if (result.keys && result.keys.length > 0 && result.keys[0].value) {
                const stats = JSON.parse(result.keys[0].value);
                console.log('User stats loaded from VK Storage:', stats);
                return stats;
            } else {
                console.log('No user stats found in VK Storage, using defaults');
                return defaultStats;
            }
        } else {
            console.log('Not in VK environment, using localStorage');
            const saved = localStorage.getItem('userStats');
            return saved ? JSON.parse(saved) : defaultStats;
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
        
        // Fallback к localStorage для не-VK пользователей
        const saved = localStorage.getItem('userStats');
        return saved ? JSON.parse(saved) : defaultStats;
    }
};

// Синхронная версия для обратной совместимости
export const loadUserStatsSync = (): UserStats => {
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

// Функция для сохранения статистики пользователя
export const saveUserStats = async (stats: UserStats, vkUser?: VKUser): Promise<void> => {
    try {
        const { isVKEnvironment } = await import('./vkUtils');
        
        if (isVKEnvironment() && vkUser) {
            console.log('Saving user stats to VK Storage for user:', vkUser.id);
            
            const userStatsKey = VK_STORAGE_KEYS.USER_STATS_PREFIX + vkUser.id;
            await vkBridge.send('VKWebAppStorageSet', {
                key: userStatsKey,
                value: JSON.stringify(stats)
            });
            
            console.log('User stats saved to VK Storage');
        } else {
            console.log('Not in VK environment, saving to localStorage');
            localStorage.setItem('userStats', JSON.stringify(stats));
        }
    } catch (error) {
        console.error('Error saving user stats:', error);
        
        // Fallback к localStorage
        localStorage.setItem('userStats', JSON.stringify(stats));
    }
};

export const updateUserStats = async (
    correctAnswers: number,
    totalQuestions: number,
    score: number,
    categories: string[],
    gameQuestions: Question[],
    userAnswers: number[],
    timesSpent: number[],
    vkUser?: VKUser
): Promise<UserStats> => {
    const stats = await loadUserStats(vkUser);

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

    await saveUserStats(stats, vkUser);
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

// Функция для загрузки ГЛОБАЛЬНОГО рейтинга (один для всех пользователей)
export const loadSharedLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
        const { isVKEnvironment } = await import('./vkUtils');
        
        if (isVKEnvironment()) {
            console.log('Loading GLOBAL leaderboard from VK Storage...');
            
            const result = await vkBridge.send('VKWebAppStorageGet', {
                keys: [VK_STORAGE_KEYS.GLOBAL_LEADERBOARD]
            });
            
            if (result.keys && result.keys.length > 0 && result.keys[0].value) {
                const leaderboard = JSON.parse(result.keys[0].value);
                console.log('GLOBAL leaderboard loaded from VK Storage:', leaderboard.length, 'entries');
                
                // Кешируем для не-VK пользователей
                localStorage.setItem('cached_global_leaderboard', JSON.stringify(leaderboard));
                
                return leaderboard;
            } else {
                console.log('No GLOBAL leaderboard found in VK Storage, initializing empty');
                // Если нет данных в VK Storage, попробуем загрузить из кеша
                const cached = localStorage.getItem('cached_global_leaderboard');
                return cached ? JSON.parse(cached) : [];
            }
        } else {
            console.log('Not in VK environment, using cached global leaderboard');
            const cached = localStorage.getItem('cached_global_leaderboard');
            return cached ? JSON.parse(cached) : [];
        }
    } catch (error) {
        console.error('Error loading GLOBAL leaderboard:', error);
        
        // Fallback к кешированным данным
        const cached = localStorage.getItem('cached_global_leaderboard');
        return cached ? JSON.parse(cached) : [];
    }
};

// Функция для обновления ГЛОБАЛЬНОГО рейтинга (один для всех пользователей)
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
        
        // Всегда обновляем локальный кеш
        let currentLeaderboard: LeaderboardEntry[] = [];
        const cached = localStorage.getItem('cached_global_leaderboard');
        if (cached) {
            currentLeaderboard = JSON.parse(cached);
        }
        
        // Обновляем или добавляем запись пользователя в локальный кеш
        const existingIndex = currentLeaderboard.findIndex(entry => entry.id === userId);
        if (existingIndex >= 0) {
            currentLeaderboard[existingIndex] = userEntry;
        } else {
            currentLeaderboard.push(userEntry);
        }
        
        // Сортируем и ограничиваем
        currentLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
        const limitedLeaderboard = currentLeaderboard.slice(0, 100);
        
        // Сохраняем в локальный кеш
        localStorage.setItem('cached_global_leaderboard', JSON.stringify(limitedLeaderboard));
        
        if (isVKEnvironment()) {
            console.log('Updating GLOBAL leaderboard in VK Storage...');
            
            try {
                // Загружаем текущий ГЛОБАЛЬНЫЙ рейтинг из VK Storage
                let vkLeaderboard: LeaderboardEntry[] = [];
                
                const result = await vkBridge.send('VKWebAppStorageGet', {
                    keys: [VK_STORAGE_KEYS.GLOBAL_LEADERBOARD]
                });
                
                if (result.keys && result.keys.length > 0 && result.keys[0].value) {
                    vkLeaderboard = JSON.parse(result.keys[0].value);
                } else {
                    // Если в VK Storage пусто, используем локальный кеш
                    vkLeaderboard = [...limitedLeaderboard];
                }
                
                // Обновляем или добавляем запись пользователя в VK рейтинг
                const vkExistingIndex = vkLeaderboard.findIndex(entry => entry.id === userId);
                if (vkExistingIndex >= 0) {
                    vkLeaderboard[vkExistingIndex] = userEntry;
                } else {
                    vkLeaderboard.push(userEntry);
                }
                
                // Сортируем и ограничиваем VK рейтинг
                vkLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
                const limitedVKLeaderboard = vkLeaderboard.slice(0, 100);
                
                // Сохраняем в VK Storage
                await vkBridge.send('VKWebAppStorageSet', {
                    key: VK_STORAGE_KEYS.GLOBAL_LEADERBOARD,
                    value: JSON.stringify(limitedVKLeaderboard)
                });
                
                // Обновляем локальный кеш данными из VK
                localStorage.setItem('cached_global_leaderboard', JSON.stringify(limitedVKLeaderboard));
                
                console.log('GLOBAL leaderboard updated in VK Storage:', limitedVKLeaderboard.length, 'entries');
            } catch (loadError) {
                console.log('Could not load existing GLOBAL leaderboard, starting fresh');
                
                // Если не удалось загрузить из VK Storage, сохраняем текущий кеш
                await vkBridge.send('VKWebAppStorageSet', {
                    key: VK_STORAGE_KEYS.GLOBAL_LEADERBOARD,
                    value: JSON.stringify(limitedLeaderboard)
                });
            }
        } else {
            console.log('Not in VK environment, updated local leaderboard cache');
        }
        
    } catch (error) {
        console.error('Error updating GLOBAL leaderboard:', error);
        throw error;
    }
};

// Функция для принудительного обновления рейтинга после игры
export const forceUpdateLeaderboardAfterGame = async (stats: UserStats, vkUser?: VKUser): Promise<LeaderboardEntry[]> => {
    try {
        console.log('Force updating GLOBAL leaderboard after game...');
        
        // Обновляем ГЛОБАЛЬНЫЙ рейтинг
        await updateSharedLeaderboard(stats, vkUser);
        
        // Загружаем обновленный ГЛОБАЛЬНЫЙ рейтинг
        const updatedLeaderboard = await loadSharedLeaderboard();
        console.log('GLOBAL leaderboard force updated after game:', updatedLeaderboard.length, 'entries');
        
        return updatedLeaderboard;
    } catch (error) {
        console.error('Error force updating GLOBAL leaderboard after game:', error);
        
        // В случае ошибки возвращаем текущий рейтинг
        const currentLeaderboard = await loadSharedLeaderboard();
        return currentLeaderboard;
    }
};

// Синхронная функция для быстрого доступа к кешированному рейтингу
export const getCachedLeaderboard = (): LeaderboardEntry[] => {
    try {
        const cached = localStorage.getItem('cached_global_leaderboard');
        return cached ? JSON.parse(cached) : [];
    } catch (error) {
        console.error('Error loading cached leaderboard:', error);
        return [];
    }
};

export const getCurrentUserRank = (leaderboard: LeaderboardEntry[], vkUser: VKUser | null): number => {
    if (!vkUser) return 0;
    const userId = `vk_${vkUser.id}`;
    const rank = leaderboard.findIndex(entry => entry.id === userId) + 1;
    return rank > 0 ? rank : 0;
};

export const isCurrentUser = (entry: LeaderboardEntry, vkUser: VKUser | null): boolean => {
    if (!vkUser) return entry.id.startsWith('guest_');
    return entry.id === `vk_${vkUser.id}`;
};