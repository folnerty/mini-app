import React from 'react';
import { Trophy, Award, TrendingUp, RotateCcw, BarChart3 } from 'lucide-react';
import { Question } from '../types/quiz';
import { getCategoryColor } from '../utils/gameUtils';

interface QuizResultsProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  questions: Question[];
  answers: number[];
  onPlayAgain: () => void;
  onViewStats: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  correctAnswers,
  totalQuestions,
  questions,
  answers,
  onPlayAgain,
  onViewStats
}) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: 'Превосходно!', emoji: '🏆', color: 'text-yellow-600' };
    if (percentage >= 80) return { text: 'Отлично!', emoji: '🎉', color: 'text-green-600' };
    if (percentage >= 70) return { text: 'Хорошо!', emoji: '👍', color: 'text-blue-600' };
    if (percentage >= 50) return { text: 'Неплохо!', emoji: '👌', color: 'text-orange-600' };
    return { text: 'Попробуйте еще раз!', emoji: '💪', color: 'text-red-600' };
  };

  const performance = getPerformanceMessage();

  const categoryStats = questions.reduce((stats, question, index) => {
    const category = question.category;
    if (!stats[category]) {
      stats[category] = { correct: 0, total: 0 };
    }
    stats[category].total++;
    if (answers[index] === question.correctAnswer) {
      stats[category].correct++;
    }
    return stats;
  }, {} as Record<string, { correct: number; total: number }>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Квиз завершен!</h1>
          <p className={`text-2xl font-bold ${performance.color} mb-4`}>
            {performance.emoji} {performance.text}
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">Очков</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</div>
              <div className="text-sm text-gray-600">Правильно</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
              <div className="text-sm text-gray-600">Точность</div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Играть снова</span>
            </button>
            <button
              onClick={onViewStats}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Статистика</span>
            </button>
          </div>
        </div>

        {}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            Результаты по категориям
          </h3>
          
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const categoryPercentage = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                      {category}
                    </span>
                    <span className="text-gray-600">{stats.correct}/{stats.total}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${categoryPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10">{categoryPercentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-green-600" />
            Подробный разбор
          </h3>
          
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              const wasAnswered = userAnswer !== -1;
              
              return (
                <div key={question.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                      {question.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      {isCorrect ? (
                        <span className="text-green-600 text-sm font-medium">✓ Правильно</span>
                      ) : wasAnswered ? (
                        <span className="text-red-600 text-sm font-medium">✗ Неправильно</span>
                      ) : (
                        <span className="text-gray-600 text-sm font-medium">⏱ Время вышло</span>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-800 mb-2">{question.question}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {question.options.map((option, optionIndex) => {
                      let optionClass = "p-2 rounded-lg border ";
                      
                      if (optionIndex === question.correctAnswer) {
                        optionClass += "bg-green-100 border-green-300 text-green-800";
                      } else if (optionIndex === userAnswer && !isCorrect) {
                        optionClass += "bg-red-100 border-red-300 text-red-800";
                      } else {
                        optionClass += "bg-gray-50 border-gray-200 text-gray-600";
                      }
                      
                      return (
                        <div key={optionIndex} className={optionClass}>
                          {option}
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2 italic">{question.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;