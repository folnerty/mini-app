import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';
import { Question, GameState } from '../types/quiz';
import { getRandomQuestions, calculateScore, getDifficultyColor, getCategoryColor, loadUserStats } from '../utils/gameUtils';

interface QuizGameProps {
  onGameEnd: (score: number, correctAnswers: number, totalQuestions: number, answers: number[], questions: Question[], timesSpent: number[]) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ onGameEnd }) => {
  const userStats = loadUserStats();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
    timeLeft: 30,
    isGameActive: true,
    selectedQuestions: getRandomQuestions(10, userStats.answeredQuestions)
  });
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeBonus, setTimeBonus] = useState(0);
  const [timesSpent, setTimesSpent] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Сбрасываем время начала вопроса при смене вопроса
    setQuestionStartTime(Date.now());
  }, [gameState.currentQuestionIndex]);

  useEffect(() => {
    if (!gameState.isGameActive || showFeedback) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          handleTimeUp();
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameActive, showFeedback, gameState.currentQuestionIndex]);

  const handleTimeUp = () => {
    setSelectedAnswer(-1);
    setShowFeedback(true);
    setTimeout(() => {
      nextQuestion(-1);
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    
    // Записываем время, потраченное на вопрос
    const timeSpent = Math.max(1, 30 - gameState.timeLeft);
    setTimesSpent(prev => [...prev, timeSpent]);
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const currentQuestion = gameState.selectedQuestions[gameState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const bonus = isCorrect ? Math.floor(gameState.timeLeft / 5) : 0;
    setTimeBonus(bonus);
    
    setTimeout(() => {
      nextQuestion(answerIndex);
    }, 2500);
  };

  const nextQuestion = (answerIndex: number) => {
    const newAnswers = [...gameState.answers, answerIndex];
    const newTimesSpent = answerIndex === -1 ? [...timesSpent, 30] : timesSpent;
    
    if (gameState.currentQuestionIndex >= gameState.selectedQuestions.length - 1) {
      // Game over
      const correctCount = newAnswers.reduce((count, answer, index) => {
        return count + (answer === gameState.selectedQuestions[index].correctAnswer ? 1 : 0);
      }, 0);
      
      const finalScore = calculateScore(correctCount, gameState.selectedQuestions.length, timeBonus);
      onGameEnd(finalScore, correctCount, gameState.selectedQuestions.length, newAnswers, gameState.selectedQuestions, newTimesSpent);
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      answers: newAnswers,
      timeLeft: 30
    }));
    
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeBonus(0);
    setQuestionStartTime(Date.now());
  };

  const currentQuestion = gameState.selectedQuestions[gameState.currentQuestionIndex];
  const progress = ((gameState.currentQuestionIndex + 1) / gameState.selectedQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Научный Квиз</h1>
                <p className="text-sm text-gray-600">
                  Вопрос {gameState.currentQuestionIndex + 1} из {gameState.selectedQuestions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className={`text-lg font-bold ${gameState.timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                  {gameState.timeLeft}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentQuestion.category)}`}>
              {currentQuestion.category}
            </span>
            <span className={`text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty === 'easy' ? 'Легкий' : 
               currentQuestion.difficulty === 'medium' ? 'Средний' : 'Сложный'}
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>
          
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02]";
              
              if (showFeedback) {
                if (index === currentQuestion.correctAnswer) {
                  buttonClass += " bg-green-100 border-green-500 text-green-800";
                } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                  buttonClass += " bg-red-100 border-red-500 text-red-800";
                } else {
                  buttonClass += " bg-gray-50 border-gray-200 text-gray-500";
                }
              } else {
                if (selectedAnswer === index) {
                  buttonClass += " bg-blue-100 border-blue-500 text-blue-800";
                } else {
                  buttonClass += " bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300";
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showFeedback && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                    {showFeedback && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Feedback */}
          {showFeedback && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Правильно!' : 'Неправильно'}
                  </h4>
                  <p className="text-gray-600 text-sm">{currentQuestion.explanation}</p>
                  {timeBonus > 0 && (
                    <p className="text-green-600 text-sm font-medium mt-2">
                      Бонус за скорость: +{timeBonus} очков!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;