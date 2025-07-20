import React from 'react';
import { Play, BarChart3, Trophy, Brain, Zap, Target, Users, Award } from 'lucide-react';
import { UserStats, LeaderboardEntry } from '../types/quiz';

interface HomePageProps {
    userStats: UserStats;
    leaderboard: LeaderboardEntry[];
    onStartQuiz: () => void;
    onViewStats: () => void;
    onViewLeaderboard: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
    userStats,
    leaderboard,
    vkUser,
    onStartQuiz,
    onViewStats,
    onViewLeaderboard
}) => {
    const gamesPlayed = Math.floor(userStats.totalQuestions / 10);
    const accuracy = userStats.totalQuestions > 0 ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100) : 0;

    const userRank = leaderboard.findIndex(entry => entry.id === 'current-user') + 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {}
            <div className="bg-white shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Научный Квиз</h1>
                                <p className="text-gray-600">Проверьте свои знания!</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-800">{userStats.totalPoints}</div>
                                <div className="text-xs text-gray-600">очков</div>
                            </div>
                            {userRank > 0 && (
                                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">#{userRank}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 pt-6">
                {}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Начать новую игру</h2>
                    <p className="text-gray-600 mb-6">10 вопросов из различных областей науки</p>

                    <button
                        onClick={onStartQuiz}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    >
                        Играть
                    </button>

                    <div className="grid grid-cols-4 gap-4 mt-6 text-center">
                        <div className="p-3">
                            <Brain className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">Физика</div>
                        </div>
                        <div className="p-3">
                            <Zap className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">Химия</div>
                        </div>
                        <div className="p-3">
                            <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">Биология</div>
                        </div>
                        <div className="p-3">
                            <Award className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">Астрономия</div>
                        </div>
                    </div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 className="w-8 h-8 text-blue-500" />
                            <span className="text-2xl font-bold text-gray-800">{accuracy}%</span>
                        </div>
                        <h3 className="font-semibold text-gray-700">Точность</h3>
                        <p className="text-sm text-gray-500">{userStats.correctAnswers}/{userStats.totalQuestions} правильно</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            <span className="text-2xl font-bold text-gray-800">{gamesPlayed}</span>
                        </div>
                        <h3 className="font-semibold text-gray-700">Игр сыграно</h3>
                        <p className="text-sm text-gray-500">Средний счет: {userStats.averageScore}</p>
                    </div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={onViewStats}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-left"
                    >
                        <BarChart3 className="w-8 h-8 text-blue-500 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1">Моя статистика</h3>
                        <p className="text-sm text-gray-600">Подробные результаты</p>
                    </button>

                    <button
                        onClick={onViewLeaderboard}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-left"
                    >
                        <Users className="w-8 h-8 text-green-500 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1">Рейтинг</h3>
                        <p className="text-sm text-gray-600">
                            {userRank > 0 ? `Ваше место: #${userRank}` : 'Сравните результаты'}
                        </p>
                    </button>
                </div>

                {}
                {userStats.achievements.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Award className="w-6 h-6 mr-2 text-yellow-500" />
                            Последние достижения
                        </h3>

                        <div className="flex space-x-3 overflow-x-auto">
                            {userStats.achievements.slice(-3).map((achievement, index) => (
                                <div key={index} className="flex-shrink-0 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 min-w-[140px]">
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🏆</div>
                                        <h4 className="font-semibold text-gray-800 text-sm">{achievement}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {}
                {gamesPlayed === 0 && (
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 mt-6 border border-blue-200">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Добро пожаловать!</h3>
                            <p className="text-gray-600 mb-4">
                                Проверьте свои знания в области науки. Отвечайте на вопросы, зарабатывайте очки и поднимайтесь в рейтинге!
                            </p>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="bg-white rounded-lg p-2">
                                    <div className="font-semibold text-gray-800">10</div>
                                    <div className="text-gray-600">вопросов</div>
                                </div>
                                <div className="bg-white rounded-lg p-2">
                                    <div className="font-semibold text-gray-800">30</div>
                                    <div className="text-gray-600">секунд</div>
                                </div>
                                <div className="bg-white rounded-lg p-2">
                                    <div className="font-semibold text-gray-800">4</div>
                                    <div className="text-gray-600">категории</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;