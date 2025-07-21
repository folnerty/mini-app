import React from 'react';
import { BarChart3, Trophy, Target, Calendar, Award, TrendingUp, ArrowLeft, History, CheckCircle, XCircle } from 'lucide-react';
import { UserStats as UserStatsType } from '../types/quiz';
import { getCategoryColor } from '../utils/gameUtils';
import { questions } from '../data/questions';

interface UserStatsProps {
  stats: UserStatsType;
  onBack: () => void;
}

const UserStats: React.FC<UserStatsProps> = ({ stats, onBack }) => {
  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
  const gamesPlayed = Math.floor(stats.totalQuestions / 10);
  const totalAvailableQuestions = questions.length;
  const answeredPercentage = Math.round((stats.answeredQuestions.length / totalAvailableQuestions) * 100);
  
  const achievementIcons: Record<string, string> = {
    'Новичок': '🎯',
    'Знаток': '📚',
    'Эрудит': '🧠',
    'Мастер': '🏆'
  };

  const categoryEntries = Object.entries(stats.categoriesStats);
  const recentHistory = stats.questionHistory.slice(-10).reverse(); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад</span>
            </button>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ваша статистика</h1>
          <p className="text-gray-600">
            {stats.lastPlayed ? `Последняя игра: ${new Date(stats.lastPlayed).toLocaleDateString('ru-RU')}` : 'Еще не играли'}
          </p>
        </div>

        {}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">{stats.totalPoints}</span>
            </div>
            <h3 className="font-semibold text-gray-700">Всего очков</h3>
            <p className="text-sm text-gray-500">Накоплено за все время</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-800">{accuracy}%</span>
            </div>
            <h3 className="font-semibold text-gray-700">Точность</h3>
            <p className="text-sm text-gray-500">{stats.correctAnswers} из {stats.totalQuestions}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">{gamesPlayed}</span>
            </div>
            <h3 className="font-semibold text-gray-700">Игр сыграно</h3>
            <p className="text-sm text-gray-500">По 10 вопросов в игре</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-800">{stats.averageScore}</span>
            </div>
            <h3 className="font-semibold text-gray-700">Средний счет</h3>
            <p className="text-sm text-gray-500">За одну игру</p>
          </div>
        </div>

        {}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2 text-green-600" />
            Прогресс по вопросам
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700">Отвечено вопросов</span>
            <span className="font-bold text-gray-800">{stats.answeredQuestions.length} из {totalAvailableQuestions}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${answeredPercentage}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600 text-center">{answeredPercentage}% от всех вопросов</p>
        </div>

        {}
        {stats.achievements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-500" />
              Достижения
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {stats.achievements.map((achievement, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex items-center space-x-3">
                  <span className="text-2xl">{achievementIcons[achievement] || '🏅'}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{achievement}</h4>
                    <p className="text-sm text-gray-600">Достижение разблокировано</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {recentHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <History className="w-6 h-6 mr-2 text-purple-600" />
              Последние ответы
            </h3>
            
            <div className="space-y-3">
              {recentHistory.map((historyItem, index) => {
                const question = questions.find(q => q.id === historyItem.questionId);
                if (!question) return null;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {historyItem.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                          {question.category}
                        </span>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{new Date(historyItem.timestamp).toLocaleDateString('ru-RU')}</div>
                        <div>{historyItem.timeSpent}с</div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-800 mb-2 text-sm">{question.question}</h4>
                    
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {question.options.map((option, optionIndex) => {
                        let optionClass = "p-2 rounded border ";
                        
                        if (optionIndex === question.correctAnswer) {
                          optionClass += "bg-green-100 border-green-300 text-green-800";
                        } else if (optionIndex === historyItem.userAnswer && !historyItem.isCorrect) {
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {}
        {categoryEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              Статистика по категориям
            </h3>
            
            <div className="space-y-4">
              {categoryEntries.map(([category, data]) => {
                const categoryAccuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                
                return (
                  <div key={category} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                        {category}
                      </span>
                      <span className="text-lg font-bold text-gray-800">{categoryAccuracy}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Правильных ответов: {data.correct}</span>
                      <span>Всего вопросов: {data.total}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${categoryAccuracy}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {}
        {stats.totalQuestions === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Пока нет статистики</h3>
            <p className="text-gray-600 mb-4">Сыграйте первую игру, чтобы увидеть свои результаты!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStats;