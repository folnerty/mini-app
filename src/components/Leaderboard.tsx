import React from 'react';
import { Crown, Trophy, Medal, ArrowLeft, TrendingUp } from 'lucide-react';
import { LeaderboardEntry } from '../types/quiz';
import { VKUser } from '../utils/vkUtils';
import { isCurrentUser } from '../utils/gameUtils';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  vkUser: VKUser | null;
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, vkUser, onBack }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-500" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
    }
  };

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100';
      case 2: return 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100';
      case 3: return 'border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100';
      default: return 'border-gray-200 bg-white';
    }
  };

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
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Рейтинг игроков</h1>
          <p className="text-gray-600">Топ игроков по общему количеству очков</p>
        </div>

        {}
        {leaderboard.length >= 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-end justify-center space-x-4 mb-6">
              {}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-2xl">{leaderboard[1].avatar}</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 min-h-[60px] flex flex-col justify-end">
                  <p className="font-semibold text-gray-800 text-sm">{leaderboard[1].name}</p>
                  <p className="text-gray-600 text-xs">{leaderboard[1].totalPoints}</p>
                </div>
                <div className="w-8 h-8 bg-silver-400 rounded-full flex items-center justify-center mt-2 mx-auto">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
              </div>

              {}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-3xl">{leaderboard[0].avatar}</span>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 min-h-[80px] flex flex-col justify-end">
                  <p className="font-bold text-gray-800">{leaderboard[0].name}</p>
                  <p className="text-gray-600 text-sm">{leaderboard[0].totalPoints}</p>
                  <Crown className="w-5 h-5 text-yellow-600 mx-auto mt-1" />
                </div>
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mt-2 mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
              </div>

              {}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-2xl">{leaderboard[2].avatar}</span>
                </div>
                <div className="bg-orange-100 rounded-lg p-3 min-h-[60px] flex flex-col justify-end">
                  <p className="font-semibold text-gray-800 text-sm">{leaderboard[2].name}</p>
                  <p className="text-gray-600 text-xs">{leaderboard[2].totalPoints}</p>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mt-2 mx-auto">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            Полный рейтинг
          </h3>
          
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUserEntry = isCurrentUser(entry, vkUser);
              
              return (
                <div
                  key={entry.id}
                  className={`border-2 rounded-xl p-4 transition-all duration-300 ${getRankBorder(rank)} ${
                    isCurrentUserEntry ? 'ring-2 ring-blue-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(rank)}
                      </div>
                      
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                        {entry.avatar.startsWith('http') ? (
                          <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{entry.avatar}</span>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                          <span>{entry.name}</span>
                          {isCurrentUserEntry && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Вы</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {entry.gamesPlayed} игр • Средний счет: {entry.averageScore}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">{entry.totalPoints}</div>
                      <div className="text-sm text-gray-600">очков</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Рейтинг пуст</h3>
              <p className="text-gray-500">Сыграйте первую игру, чтобы попасть в рейтинг!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;