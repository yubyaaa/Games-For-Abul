import { useState } from 'react';
import { GameState, Achievement } from '../types';
import { sound } from '../utils/audio';

interface AchievementsProps {
  gameState: GameState;
}

type CategoryFilter = 'all' | 'bubble' | 'star' | 'bee' | 'paint' | 'garden';

export default function Achievements({ gameState }: AchievementsProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filteredAchievements = gameState.achievements.filter((ach) => {
    if (filter === 'all') return true;
    return ach.category === filter;
  });

  const totalUnlocked = gameState.achievements.filter(a => a.unlocked).length;

  return (
    <div className="w-full flex flex-col p-2 select-none" id="achievements-container">
      {/* Header */}
      <div className="pixel-box p-3 rounded-md mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#201633] border-[#443366]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">PIXEL ACHIEVEMENTS</h2>
            <p className="text-xs text-purple-300 mt-1">Selesaikan misi game untuk membuka lencana dan bonus poin!</p>
          </div>
        </div>

        {/* Progress Tracker Banner */}
        <div className="flex items-center gap-2.5 font-mono text-xs text-yellow-300 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-md self-stretch sm:self-auto justify-center">
          <span>🏆 Unlocked:</span>
          <span>{totalUnlocked} / {gameState.achievements.length}</span>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap gap-1.5 mb-4 p-1.5 bg-slate-900 border border-slate-800 rounded-md">
        {(['all', 'bubble', 'star', 'bee', 'paint', 'garden'] as CategoryFilter[]).map((cat) => {
          const label = cat === 'all' ? 'SEMUA' : cat === 'bubble' ? 'BUBBLE' : cat === 'star' ? 'STAR' : cat === 'bee' ? 'BEE' : cat === 'paint' ? 'PAINT' : 'GARDEN';
          return (
            <button
              key={cat}
              onClick={() => { sound.playSelect(); setFilter(cat); }}
              className={`pixel-btn text-[8px] font-heading px-3 py-2 rounded-sm transition-all ${
                filter === cat 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-950 text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Achievements Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {filteredAchievements.map((ach) => {
          const isCompleted = ach.unlocked;
          return (
            <div
              key={ach.id}
              className={`pixel-box p-3 rounded-md flex flex-col justify-between gap-2.5 transition-all ${
                isCompleted 
                  ? 'bg-gradient-to-br from-[#1f3024] to-[#121c15] border-green-700' 
                  : 'bg-[#1c182a] opacity-80'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Badge Icon */}
                <div 
                  className={`w-10 h-10 aspect-square rounded-md border flex items-center justify-center text-xl select-none relative ${
                    isCompleted 
                      ? 'bg-yellow-950/40 border-yellow-500 animate-pixel-bounce' 
                      : 'bg-slate-950 border-slate-800 grayscale opacity-40'
                  }`}
                >
                  <span>{ach.badgeIcon}</span>
                  {!isCompleted && <span className="absolute text-[8px] bottom-0 right-1">🔒</span>}
                </div>

                {/* Info titles */}
                <div className="truncate">
                  <h4 className="font-heading text-[8px] text-white tracking-wide truncate">{ach.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight whitespace-normal">{ach.description}</p>
                </div>
              </div>

              {/* Progress gauge bar */}
              <div>
                <div className="flex justify-between text-[8px] font-mono text-gray-500 mb-0.5 px-0.5">
                  <span>Progres: {ach.progress} / {ach.target}</span>
                  <span className="text-yellow-400 font-bold">+{ach.rewardPoints}p</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-sm overflow-hidden border border-slate-900">
                  <div 
                    className={`h-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-purple-600'}`}
                    style={{ width: `${Math.min(100, (ach.progress / ach.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
