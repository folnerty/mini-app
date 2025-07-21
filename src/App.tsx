import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import QuizGame from './components/QuizGame';
import QuizResults from './components/QuizResults';
import UserStats from './components/UserStats';
import Leaderboard from './components/Leaderboard';
import { UserStats as UserStatsType, Question } from './types/quiz';
import { loadUserStats, updateUserStats, loadLeaderboard, updateLeaderboard } from './utils/gameUtils';
import { VKUser, initVK, getVKUserWithFallback, isVKEnvironment } from './utils/vkUtils';
import vkBridge from '@vkontakte/vk-bridge';
type AppState = 'home' | 'quiz' | 'results' | 'stats' | 'leaderboard';


function App() {
    const [currentState, setCurrentState] = useState<AppState>('home');
    const [userStats, setUserStats] = useState<UserStatsType>(loadUserStats());
    const [leaderboard, setLeaderboard] = useState(loadLeaderboard());
    const [vkUser, setVkUser] = useState<VKUser | null>(null);
    const [isVkInitialized, setIsVkInitialized] = useState(false);
    const [gameResults, setGameResults] = useState<{
        score: number;
        correctAnswers: number;
        totalQuestions: number;
        questions: Question[];
        answers: number[];
    } | null>(null);

    useEffect(() => {
        document.title = 'Научный Квиз';

        const initializeVK = async () => {
            try {
                console.log('Initializing VK Bridge...');

                // Всегда пытаемся инициализировать VK Bridge
                await initVK();
                console.log('VK Bridge initialized successfully');

                console.log('Getting VK user info...');
                const user = await getVKUserWithFallback();
                setVkUser(user);

                console.log('VK User loaded:', user);

                const userStats = loadUserStats();
                setUserStats(userStats);

                updateLeaderboard(userStats, user);
                setLeaderboard(loadLeaderboard());

                setIsVkInitialized(true);
            } catch (error) {
                console.error('VK initialization failed:', error);

                // В случае ошибки все равно пытаемся получить пользователя
                const defaultUser = await getVKUserWithFallback();
                setVkUser(defaultUser);

                const userStats = loadUserStats();
                setUserStats(userStats);
                updateLeaderboard(userStats, defaultUser);
                setLeaderboard(loadLeaderboard());

                setIsVkInitialized(true);
            }
        };

        initializeVK();
        
        // Обработчик событий VK Bridge
        const handleVKEvent = (event: any) => {
            console.log('VK Bridge event:', event);
            
            if (event.detail?.type === 'VKWebAppUpdateConfig') {
                // Обновление конфигурации приложения
                console.log('App config updated:', event.detail.data);
            }
        };
        
        // Подписываемся на события VK Bridge
        vkBridge.subscribe(handleVKEvent);
        
        return () => {
            vkBridge.unsubscribe(handleVKEvent);
        };
    }, []);

    const handleStartQuiz = () => {
        setCurrentState('quiz');
    };

    const handleGameEnd = (score: number, correctAnswers: number, totalQuestions: number, answers: number[], gameQuestions: Question[], timesSpent: number[]) => {

        setGameResults({
            score,
            correctAnswers,
            totalQuestions,
            questions: gameQuestions,
            answers
        });

        const categories = gameQuestions.map(q => q.category);
        const newStats = updateUserStats(correctAnswers, totalQuestions, score, categories, gameQuestions, answers, timesSpent);
        setUserStats(newStats);

        updateLeaderboard(newStats, vkUser || undefined);
        setLeaderboard(loadLeaderboard());

        setCurrentState('results');
    };

    const handleViewStats = () => {
        setCurrentState('stats');
    };

    const handleViewLeaderboard = () => {
        setCurrentState('leaderboard');
    };

    const handleBackToHome = () => {
        setCurrentState('home');
    };

    const handlePlayAgain = () => {
        setCurrentState('quiz');
    };

    if (!isVkInitialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-2xl">🧠</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Загрузка...</h2>
                    <p className="text-gray-600">Инициализация приложения</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen">
            {currentState === 'home' && (
                <HomePage
                    userStats={userStats}
                    leaderboard={leaderboard}
                    vkUser={vkUser}
                    onStartQuiz={handleStartQuiz}
                    onViewStats={handleViewStats}
                    onViewLeaderboard={handleViewLeaderboard}
                />
            )}

            {currentState === 'quiz' && (
                <QuizGame onGameEnd={handleGameEnd} />
            )}

            {currentState === 'results' && gameResults && (
                <QuizResults
                    score={gameResults.score}
                    correctAnswers={gameResults.correctAnswers}
                    totalQuestions={gameResults.totalQuestions}
                    questions={gameResults.questions}
                    answers={gameResults.answers}
                    onPlayAgain={handlePlayAgain}
                    onViewStats={handleViewStats}
                />
            )}

            {currentState === 'stats' && (
                <UserStats
                    stats={userStats}
                    onBack={handleBackToHome}
                />
            )}

            {currentState === 'leaderboard' && (
                <Leaderboard
                    leaderboard={leaderboard}
                    vkUser={vkUser}
                    onBack={handleBackToHome}
                />
            )}
        </div>
    );
}

export default App;