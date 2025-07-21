import { Question, UserStats, LeaderboardEntry } from '../types/quiz';
import { questions } from '../data/questions';
import { VKUser, getUserDisplayName, getUserAvatar, generateUserKey } from './vkUtils';

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
    // Загружаем из localStorage с фиксированным ключом
    const saved = localStorage.getItem('quiz_global_leaderboard');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.error('Error parsing leaderboard:', error);
            return [];
        }
    }

    return [];
};

export const updateLeaderboard = (stats: UserStats, vkUser?: VKUser): void => {
    // Загружаем текущий рейтинг
    const leaderboard = loadLeaderboard();

    // Создаем уникальный ID пользователя
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

    // Обновляем или добавляем запись пользователя
    const existingIndex = leaderboard.findIndex(entry => entry.id === userId);
    if (existingIndex >= 0) {
        leaderboard[existingIndex] = userEntry;
    } else {
        leaderboard.push(userEntry);
    }

    // Сортируем по очкам
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Ограничиваем размер рейтинга (топ 100)
    const limitedLeaderboard = leaderboard.slice(0, 100);
    
    // Сохраняем локально
    localStorage.setItem('quiz_global_leaderboard', JSON.stringify(limitedLeaderboard));
    
    // Пытаемся сохранить в облачное хранилище
    saveToVKStorage(limitedLeaderboard, userEntry);
};

// Функция для сохранения в облачное хранилище ВК и внешний сервис
const saveToVKStorage = async (leaderboard: LeaderboardEntry[], userEntry: LeaderboardEntry): Promise<void> => {
    try {
        // Пытаемся сохранить в VK Storage
        try {
            const { isVKEnvironment } = await import('./vkUtils');
            if (isVKEnvironment()) {
                const bridge = (await import('@vkontakte/vk-bridge')).default;
                
                // Сохраняем только запись текущего пользователя
                await bridge.send('VKWebAppStorageSet', {
                    key: `user_${userEntry.id}`,
                    value: JSON.stringify(userEntry)
                });
                
                console.log('User entry saved to VK Storage');
            }
        } catch (vkError) {
            console.log('VK Storage save failed:', vkError);
        }
        
        // Пытаемся сохранить в внешний сервис (JSONBin или аналогичный)
        try {
            await saveToExternalService(userEntry);
        } catch (externalError) {
            console.log('External service save failed:', externalError);
        }
        
    } catch (error) {
        console.log('Failed to save leaderboard:', error);
    }
};

// Функция для сохранения в внешний сервис
const saveToExternalService = async (userEntry: LeaderboardEntry): Promise<void> => {
    try {
        // Используем простой внешний сервис для хранения данных
        const response = await fetch('https://api.jsonbin.io/v3/b/quiz-leaderboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': '$2a$10$your-api-key-here' // Замените на реальный ключ
            },
            body: JSON.stringify({
                action: 'update_user',
                user: userEntry,
                timestamp: Date.now()
            })
        });
        
        if (response.ok) {
            console.log('Saved to external service');
        }
    } catch (error) {
        console.log('External service error:', error);
    }
};

// Функция для загрузки из всех источников
export const loadFromVKStorage = async (): Promise<LeaderboardEntry[]> => {
    const allEntries: LeaderboardEntry[] = [];
    
    try {
        // Загружаем локальные данные
        const localLeaderboard = loadLeaderboard();
        allEntries.push(...localLeaderboard);
        
        // Пытаемся загрузить из VK Storage
        try {
            const { isVKEnvironment } = await import('./vkUtils');
            if (isVKEnvironment()) {
                const bridge = (await import('@vkontakte/vk-bridge')).default;
                
                // Получаем список всех ключей пользователей
                const result = await bridge.send('VKWebAppStorageGetKeys', {
                    count: 1000,
                    offset: 0
                });
                
                if (result.keys) {
                    const userKeys = result.keys.filter(key => key.startsWith('user_'));
                    
                    if (userKeys.length > 0) {
                        const userData = await bridge.send('VKWebAppStorageGet', {
                            keys: userKeys
                        });
                        
                        if (userData.keys) {
                            userData.keys.forEach(item => {
                                if (item.value) {
                                    try {
                                        const userEntry = JSON.parse(item.value);
                                        allEntries.push(userEntry);
                                    } catch (e) {
                                        console.log('Error parsing user data:', e);
                                    }
                                }
                            });
                        }
                    }
                }
            }
        } catch (vkError) {
            console.log('VK Storage load failed:', vkError);
        }
        
        // Пытаемся загрузить из внешнего сервиса
        try {
            const externalData = await loadFromExternalService();
            allEntries.push(...externalData);
        } catch (externalError) {
            console.log('External service load failed:', externalError);
        }
        
        // Объединяем и дедуплицируем записи
        const uniqueEntries = new Map<string, LeaderboardEntry>();
        
        allEntries.forEach(entry => {
            const existing = uniqueEntries.get(entry.id);
            if (!existing || entry.totalPoints > existing.totalPoints) {
                uniqueEntries.set(entry.id, entry);
            }
        });
        
        const finalLeaderboard = Array.from(uniqueEntries.values())
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, 100);
        
        // Сохраняем объединенный результат локально
        localStorage.setItem('quiz_global_leaderboard', JSON.stringify(finalLeaderboard));
        
        return finalLeaderboard;
        
    } catch (error) {
        console.log('Failed to load from cloud storage:', error);
        return loadLeaderboard();
    }
};

// Функция для загрузки из внешнего сервиса
const loadFromExternalService = async (): Promise<LeaderboardEntry[]> => {
    try {
        const response = await fetch('https://api.jsonbin.io/v3/b/quiz-leaderboard/latest', {
            headers: {
                'X-Master-Key': '$2a$10$your-api-key-here' // Замените на реальный ключ
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.record && Array.isArray(data.record.users)) {
                return data.record.users;
            }
        }
    } catch (error) {
        console.log('External service load error:', error);
    }
    
    return [];
};

// Альтернативная функция для простого общего хранилища
export const initSharedLeaderboard = (): void => {
    // Создаем общий ключ для всех пользователей
    const SHARED_KEY = 'vk_quiz_shared_leaderboard_v1';
    
    // Проверяем, есть ли уже данные
    const existing = localStorage.getItem(SHARED_KEY);
    if (!existing) {
        // Инициализируем пустой рейтинг
        localStorage.setItem(SHARED_KEY, JSON.stringify([]));
    }
};

// Простая функция для обновления общего рейтинга
export const updateSharedLeaderboard = (stats: UserStats, vkUser?: VKUser): void => {
    const SHARED_KEY = 'vk_quiz_shared_leaderboard_v1';
    
    try {
        // Загружаем текущий общий рейтинг
        const saved = localStorage.getItem(SHARED_KEY);
        const leaderboard: LeaderboardEntry[] = saved ? JSON.parse(saved) : [];
        
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
        
        // Обновляем или добавляем запись
        const existingIndex = leaderboard.findIndex(entry => entry.id === userId);
        if (existingIndex >= 0) {
            leaderboard[existingIndex] = userEntry;
        } else {
            leaderboard.push(userEntry);
        }
        
        // Сортируем и ограничиваем
        leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
        const limitedLeaderboard = leaderboard.slice(0, 100);
        
        // Сохраняем обратно
        localStorage.setItem(SHARED_KEY, JSON.stringify(limitedLeaderboard));
        
        console.log('Shared leaderboard updated:', limitedLeaderboard.length, 'entries');
        
    } catch (error) {
        console.error('Error updating shared leaderboard:', error);
    }
};

// Простая функция для загрузки общего рейтинга
export const loadSharedLeaderboard = (): LeaderboardEntry[] => {
    const SHARED_KEY = 'vk_quiz_shared_leaderboard_v1';
    
    try {
        const saved = localStorage.getItem(SHARED_KEY);
        if (saved) {
            const leaderboard = JSON.parse(saved);
            console.log('Loaded shared leaderboard:', leaderboard.length, 'entries');
            return leaderboard;
        }
    } catch (error) {
        console.error('Error loading shared leaderboard:', error);
    }
    
    return [];
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