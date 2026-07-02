import { useState, useEffect } from 'react';
import { GameState, DailyMission } from '../types';
import { sound } from '../utils/audio';

interface DashboardProps {
  gameState: GameState;
  onUpdateState: (newState: GameState) => void;
  onAddLog: (text: string, coins: number, icon: string) => void;
  logs: Array<{ text: string, time: string, icon: string }>;
  onSelectTab: (tab: string) => void;
}

export default function Dashboard({ gameState, onUpdateState, onAddLog, logs, onSelectTab }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [playSeconds, setPlaySeconds] = useState(gameState.stats.playTime);

  // Update clock every second
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Update play duration timer
    const playTimer = setInterval(() => {
      setPlaySeconds((prev) => {
        const nextSec = prev + 1;
        // Periodically sync up to save state
        if (nextSec % 10 === 0) {
          const nextState = { ...gameState };
          nextState.stats.playTime = nextSec;
          onUpdateState(nextState);
        }
        return nextSec;
      });
    }, 1000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(playTimer);
    };
  }, [gameState, onUpdateState]);

  // Format time of day visual banner background based on hours
  const getTimeOfDayVisuals = () => {
    const hours = currentTime.getHours();
    if (hours >= 5 && hours < 8) {
      return {
        bg: 'from-orange-850 to-amber-700',
        title: 'Matahari Terbit 🌅',
        subtitle: 'Hirup udara pagi sedalam-dalamnya. Hari baru penuh harapan!',
        character: '🌅'
      };
    } else if (hours >= 8 && hours < 16) {
      return {
        bg: 'from-sky-800 to-sky-650',
        title: 'Pagi Menuju Siang ☀️',
        subtitle: 'Sinar matahari menyinari kebun kedamaianmu. Selamat beraktivitas!',
        character: '☀️'
      };
    } else if (hours >= 16 && hours < 19) {
      return {
        bg: 'from-[#3d132e] to-[#732a51]',
        title: 'Senja Tenang 🌆',
        subtitle: 'Sore yang damai. Waktunya melepas lelah bersama Abul.',
        character: '🌆'
      };
    } else {
      return {
        bg: 'from-[#0a071c] to-[#1c143d]',
        title: 'Malam Berbintang 🌌',
        subtitle: 'Langit gelap berhias taburan bintang. Istirahatlah dengan tenang.',
        character: '🌌'
      };
    }
  };

  const currentVisuals = getTimeOfDayVisuals();

  // Handle Daily Login Reward Claim
  const handleClaimDailyReward = () => {
    if (gameState.dailyReward.isClaimedToday) return;

    sound.playSuccess();
    const streakReward = 50 + (gameState.dailyReward.streakCount * 10);
    const updatedState = { ...gameState };
    
    updatedState.totalPoints += streakReward;
    updatedState.dailyReward.isClaimedToday = true;
    updatedState.dailyReward.streakCount += 1;
    updatedState.dailyReward.lastClaimedDate = new Date().toDateString();
    updatedState.stats.totalPointsEarned += streakReward;

    onUpdateState(updatedState);
    onAddLog(`✨ Hadiah Harian Diklaim (Streak Day ${updatedState.dailyReward.streakCount})!`, streakReward, '🎁');
  };

  // Handle Daily Mission Completion Claim
  const handleClaimMission = (missionId: string) => {
    const mission = gameState.dailyMissions.find(m => m.id === missionId);
    if (!mission || mission.claimed || mission.progress < mission.target) return;

    sound.playSuccess();
    
    const updatedState = { ...gameState };
    updatedState.totalPoints += mission.rewardCoins;
    updatedState.stats.totalPointsEarned += mission.rewardCoins;

    updatedState.dailyMissions = updatedState.dailyMissions.map((m) => {
      if (m.id === missionId) {
        return { ...m, claimed: true };
      }
      return m;
    });

    onUpdateState(updatedState);
    onAddLog(`🏆 Misi Harian Selesai: ${mission.title}!`, mission.rewardCoins, '🌟');
  };

  // Convert play duration seconds to readable hh:mm:ss
  const formatPlayTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours}j ${minutes}m ${secs}s`;
  };

  const expNeeded = gameState.level * 100;
  const expPercentage = Math.floor((gameState.exp / expNeeded) * 100);

  return (
    <div className="w-full flex flex-col p-2 select-none" id="dashboard-container">
      {/* 1. Time-of-day dynamic header banner */}
      <div className={`pixel-box bg-gradient-to-r ${currentVisuals.bg} p-4 rounded-md mb-4 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[130px]`}>
        <div className="absolute top-2 right-4 text-3xl opacity-20 select-none pointer-events-none animate-float">
          {currentVisuals.character}
        </div>
        
        <div className="z-10 flex items-center justify-between">
          <span className="font-heading text-[10px] text-yellow-300 drop-shadow-sm tracking-wider">
            {currentVisuals.title}
          </span>
          <span className="font-mono text-xs text-white bg-slate-950/40 px-2 py-0.5 rounded-sm">
            🕰️ {currentTime.toLocaleTimeString('id-ID')}
          </span>
        </div>

        <div className="z-10 mt-4 max-w-lg">
          <h2 className="font-heading text-xs sm:text-xs text-white leading-normal drop-shadow-sm">
            {currentVisuals.subtitle}
          </h2>
        </div>
      </div>

      {/* 2. Core Bento Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Player Profile & Stats Card */}
        <div className="md:col-span-4 pixel-box p-4 rounded-md bg-[#211a36] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2.5 bg-slate-900 border border-slate-800 rounded-md animate-pixel-bounce">🎒</span>
              <div className="truncate">
                <span className="text-[10px] text-gray-500 font-mono">PLAYER PROFILE</span>
                <h3 className="font-heading text-xs text-white tracking-wide truncate">{gameState.playerName}</h3>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="mt-5 bg-slate-950 p-2.5 border border-slate-800 rounded-sm">
              <div className="flex justify-between text-[9px] font-mono text-gray-400 mb-1">
                <span>EXP: {Math.floor(gameState.exp)} / {expNeeded}</span>
                <span>{expPercentage}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-sm overflow-hidden">
                <div 
                  className="bg-purple-500 h-full transition-all duration-300" 
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
              <div className="text-[10px] text-pink-300 mt-2 font-bold font-mono">
                Level Player: {gameState.level} / 30
              </div>
            </div>

            {/* Minor counts table */}
            <div className="mt-4 flex flex-col gap-1.5 font-sans text-xs text-gray-300 border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Poin Terkumpul:</span>
                <span className="font-mono font-bold text-yellow-300">{gameState.totalPoints} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Durasi Bermain:</span>
                <span className="font-mono font-bold text-cyan-300">{formatPlayTime(playSeconds)}</span>
              </div>
              <div className="flex justify-between">
                <span>Penyelamatan:</span>
                <span className="font-mono font-bold text-green-400">Auto Saved ✅</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1.5 pt-3 border-t border-slate-800">
            <button
              onClick={() => { sound.playSelect(); onSelectTab('games'); }}
              className="pixel-btn py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-heading text-[9px] w-full"
            >
              PILIH MINI GAME ▶
            </button>
          </div>
        </div>

        {/* Daily Mission & Daily Rewards panel */}
        <div className="md:col-span-5 pixel-box p-4 rounded-md bg-slate-950 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-[9px] text-yellow-300 border-b border-gray-800 pb-2 mb-3">MISI & LOGIN HARIAN</h3>
            
            {/* Daily Login Reward clicker */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-sm mb-3 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-float">🎁</span>
                <div>
                  <h4 className="font-bold text-xs text-white">Login Harian</h4>
                  <p className="text-[10px] text-gray-500 font-mono">Streak: {gameState.dailyReward.streakCount} Hari</p>
                </div>
              </div>
              
              <button
                disabled={gameState.dailyReward.isClaimedToday}
                onClick={handleClaimDailyReward}
                className={`pixel-btn text-[8px] font-heading px-2.5 py-2 rounded-sm ${
                  gameState.dailyReward.isClaimedToday 
                    ? 'bg-slate-800 text-gray-500 cursor-not-allowed border-dashed' 
                    : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                }`}
              >
                {gameState.dailyReward.isClaimedToday ? 'KLAIMED' : 'KLAIM +50p'}
              </button>
            </div>

            {/* Daily Missions list */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-gray-400 font-mono">MISI HARIAN HARI INI:</span>
              
              {gameState.dailyMissions.map((mission) => {
                const canClaim = mission.progress >= mission.target && !mission.claimed;
                return (
                  <div key={mission.id} className="bg-[#141822] border border-slate-800 p-2 rounded-sm flex items-center justify-between text-xs text-gray-300 gap-2">
                    <div className="truncate">
                      <div className="font-bold text-white truncate text-[11px]">{mission.title}</div>
                      <div className="font-mono text-[9px] text-gray-500 mt-0.5">
                        Kemajuan: {mission.progress} / {mission.target} • +{mission.rewardCoins}p
                      </div>
                    </div>

                    <button
                      disabled={!canClaim && !mission.claimed}
                      onClick={() => handleClaimMission(mission.id)}
                      className={`pixel-btn text-[8px] font-heading px-2 py-1.5 rounded-sm shrink-0 ${
                        mission.claimed 
                          ? 'bg-green-950 text-green-400 border border-green-800' 
                          : canClaim 
                            ? 'bg-green-600 hover:bg-green-500 text-white' 
                            : 'bg-slate-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {mission.claimed ? 'SELESAI' : canClaim ? 'KLAIM' : 'BELUM'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <p className="text-[8px] font-mono text-gray-600 mt-4">
            MISI DAN REWARD BERUBAH SECARA DINAMIS SETIAP HARI UTAMA ⏱️
          </p>
        </div>

        {/* Recent Activity Log list feed */}
        <div className="md:col-span-3 pixel-box p-4 rounded-md flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-heading text-[9px] text-purple-400 border-b border-gray-800 pb-2 mb-2">CATATAN PERJALANAN</h3>
            <div className="flex flex-col gap-1.5 max-h-[190px] overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="text-[11px] font-sans leading-relaxed text-gray-300 flex items-start gap-1.5 p-1 bg-slate-900/30 rounded-sm">
                    <span className="shrink-0">{log.icon}</span>
                    <div>
                      <span>{log.text}</span>
                      <span className="block text-[8px] text-gray-600 font-mono">{log.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-gray-600 py-12">
                  Memulai petualangan... Catatan penyembuhanmu akan tampil di sini!
                </div>
              )}
            </div>
          </div>

          <div className="bg-purple-950/15 border border-purple-850/40 p-2.5 rounded-md text-[9px] text-purple-300 leading-normal font-sans">
            Abuyy siap menemanimu bersantai di tengah hiruk pikuk kesibukan harian. Nikmati musik santai dan bermainlah dengan tenang tanpa terburu-buru!
          </div>
        </div>

      </div>
    </div>
  );
}
