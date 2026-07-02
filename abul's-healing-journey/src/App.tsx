import { useState, useEffect } from 'react';
import { GameState } from './types';
import { getInitialState } from './data';
import { loadSlotData, saveSlotData } from './utils/storage';
import { sound } from './utils/audio';

import SlotSelector from './components/SlotSelector';
import Dashboard from './components/Dashboard';
import VoucherShop from './components/VoucherShop';
import Achievements from './components/Achievements';
import Collections from './components/Collections';
import SecretLetters from './components/SecretLetters';
import Settings from './components/Settings';

// Mini-games imports
import BubblePop from './components/games/BubblePop';
import CatchStars from './components/games/CatchStars';
import BeeCollector from './components/games/BeeCollector';
import ColoringBook from './components/games/ColoringBook';
import HealingGarden from './components/games/HealingGarden';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false); // Splash screen state
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [sessionLogs, setSessionLogs] = useState<Array<{ text: string, time: string, icon: string }>>([]);

  // Auto-trigger procedural background melody once player enters splash screen
  useEffect(() => {
    if (hasStarted) {
      sound.startBGM();
    } else {
      sound.stopBGM();
    }
  }, [hasStarted]);

  // Handle slot loading
  const handleSelectSlot = (slotId: number, name: string) => {
    setActiveSlotId(slotId);
    const loadedData = loadSlotData(slotId, name);
    setGameState(loadedData);

    // Set initial audio configuration from saved settings
    sound.setSettings(
      loadedData.settings.isMusicOn,
      loadedData.settings.isSfxOn,
      loadedData.settings.musicVolume,
      loadedData.settings.sfxVolume
    );

    // Initial log
    addLog(`✨ Selamat Datang Kembali, ${loadedData.playerName}! Perjalanan penyembuhan dimulai.`, 0, '🌅');
  };

  // Add event log helper
  const addLog = (text: string, coins: number, icon: string) => {
    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSessionLogs((prev) => [{ text, time: timeString, icon }, ...prev].slice(0, 30));
  };

  // Save changes automatically on state update
  const handleUpdateState = (newState: GameState) => {
    setGameState(newState);
    if (activeSlotId !== null) {
      saveSlotData(activeSlotId, newState);
    }
  };

  const handleResetSlot = () => {
    if (activeSlotId !== null && gameState) {
      const resetState = getInitialState(gameState.playerName);
      setGameState(resetState);
      saveSlotData(activeSlotId, resetState);
      addLog('🧹 Seluruh progress telah di-reset ke awal.', 0, '🧹');
    }
  };

  // Return to slot selector screen
  const handleQuitToSlots = () => {
    sound.playSelect();
    setActiveSlotId(null);
    setGameState(null);
    setActiveGame(null);
  };

  if (!hasStarted) {
    // 16-bit Splash Screen Game Intro
    return (
      <div 
        onClick={() => { sound.playSuccess(); setHasStarted(true); }}
        className="w-full min-h-screen bg-[#0d071a] flex flex-col items-center justify-center p-4 relative scanlines select-none cursor-pointer"
        id="splash-screen"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-pink-300 text-opacity-10 text-4xl animate-float">✿</div>
          <div className="absolute bottom-20 right-10 text-purple-300 text-opacity-15 text-3xl animate-pixel-bounce">✿</div>
          <div className="absolute top-1/2 left-1/3 text-yellow-300 text-opacity-10 text-2xl animate-float">✦</div>
        </div>

        <div className="text-center z-10 flex flex-col items-center gap-4">
          <span className="text-5xl animate-float">🏡🌸🌾</span>
          
          <h1 className="font-heading text-xl sm:text-2xl text-yellow-300 drop-shadow-md tracking-widest leading-relaxed">
            ABUL'S HEALING JOURNEY
          </h1>
          <p className="text-xs text-gray-400 font-sans tracking-wide max-w-sm leading-relaxed">
            Temukan ketenangan jiwa lewat game santai retro, rawat kebun indahmu, dan tukarkan poin dengan hadiah spesial.
          </p>

          <div className="mt-8 animate-pixel-bounce bg-[#221332] border-4 border-yellow-400 p-3.5 px-6 rounded-md shadow-lg">
            <span className="font-heading text-[10px] text-yellow-300 tracking-widest">
              CLICK TO START THE JOURNEY
            </span>
          </div>

          <p className="text-[9px] font-mono text-gray-600 mt-12">
            MADE WITH retro LOVE FOR ABUL 💖
          </p>
        </div>
      </div>
    );
  }

  // Slot Selection Phase
  if (activeSlotId === null || gameState === null) {
    return <SlotSelector onSelectSlot={handleSelectSlot} />;
  }

  return (
    <div className="w-full min-h-screen bg-[#0e0a1b] text-gray-100 flex flex-col font-sans scanlines">
      {/* Sticky Premium Top Status bar */}
      <header className="sticky top-0 z-30 bg-[#160f29] border-b-4 border-slate-900 p-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-float">🏡</span>
          <div>
            <h1 className="font-heading text-[10px] text-yellow-300 tracking-wider">ABUL'S HEALING JOURNEY</h1>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
              <span>Slot: <b className="text-white font-mono">{gameState.playerName}</b></span>
              <span>•</span>
              <span className="text-pink-300 font-bold font-mono">Level {gameState.level}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Points indicator */}
          <div className="flex items-center gap-1.5 font-heading text-[9px] text-yellow-400 bg-slate-950 px-3 py-1.5 border-2 border-slate-800 rounded-sm">
            <span>⭐</span>
            <span>{gameState.totalPoints} PTS</span>
          </div>

          <button
            onClick={handleQuitToSlots}
            className="pixel-btn bg-red-950 text-red-200 hover:bg-red-900 text-[8px] font-heading px-3 py-2 rounded-sm border-red-850"
          >
            KELUAR SLOT ➔
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row p-3 gap-4">
        
        {/* Navigation Sidebar Panel */}
        <aside className="w-full lg:w-64 flex flex-col gap-2.5">
          <div className="pixel-box p-3.5 bg-[#171228] border-[#362758] rounded-md">
            <span className="font-heading text-[9px] text-purple-400 block mb-2 border-b border-purple-900/60 pb-1.5">MENU UTAMA</span>
            
            <nav className="flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-1.5">
              {[
                { id: 'dashboard', label: 'DASHBOARD', icon: '📊' },
                { id: 'games', label: 'PILIH GAME', icon: '🎮' },
                { id: 'shop', label: 'VOUCHER SHOP', icon: '🎁' },
                { id: 'achievements', label: 'PENCAPAIAN', icon: '🏆' },
                { id: 'collection', label: 'KOLEKSIMU', icon: '🎒' },
                { id: 'letters', label: 'KOTAK SURAT', icon: '✉️' },
                { id: 'settings', label: 'SETTING', icon: '⚙️' }
              ].map((tab) => {
                const isActive = activeTab === tab.id && activeGame === null;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sound.playSelect();
                      setActiveTab(tab.id);
                      setActiveGame(null); // return to normal views
                    }}
                    className={`flex-1 lg:flex-none text-left px-3 py-2.5 rounded-sm flex items-center gap-2.5 font-heading text-[8px] transition-all ${
                      isActive 
                        ? 'bg-purple-700 text-white border-2 border-purple-400' 
                        : 'bg-slate-950 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Player Card inside sidebar */}
          <div className="hidden lg:flex pixel-box p-3 bg-slate-950 rounded-md text-xs flex-col gap-2">
            <span className="font-heading text-[8px] text-gray-500">PETUNJUK</span>
            <p className="text-gray-400 leading-relaxed font-sans">
              Mainkan mini-game untuk mengumpulkan <b className="text-yellow-400">Poin</b>, menaikkan <b className="text-pink-400">Level</b>, dan mengumpulkan barang-barang langka untuk Abul!
            </p>
          </div>
        </aside>

        {/* Primary Content View Stage */}
        <main className="flex-1 min-w-0">
          {activeGame !== null ? (
            /* ACTIVE MINI GAME COMPONENT OVERLAY */
            (() => {
              if (activeGame === 'bubble') {
                return (
                  <BubblePop
                    gameState={gameState}
                    onUpdateState={handleUpdateState}
                    onAddLog={addLog}
                    onBack={() => setActiveGame(null)}
                  />
                );
              } else if (activeGame === 'star') {
                return (
                  <CatchStars
                    gameState={gameState}
                    onUpdateState={handleUpdateState}
                    onAddLog={addLog}
                    onBack={() => setActiveGame(null)}
                  />
                );
              } else if (activeGame === 'bee') {
                return (
                  <BeeCollector
                    gameState={gameState}
                    onUpdateState={handleUpdateState}
                    onAddLog={addLog}
                    onBack={() => setActiveGame(null)}
                  />
                );
              } else if (activeGame === 'paint') {
                return (
                  <ColoringBook
                    gameState={gameState}
                    onUpdateState={handleUpdateState}
                    onAddLog={addLog}
                    onBack={() => setActiveGame(null)}
                  />
                );
              } else if (activeGame === 'garden') {
                return (
                  <HealingGarden
                    gameState={gameState}
                    onUpdateState={handleUpdateState}
                    onAddLog={addLog}
                    onBack={() => setActiveGame(null)}
                  />
                );
              }
              return null;
            })()
          ) : (
            /* TAB SELECT VIEWS */
            (() => {
              if (activeTab === 'dashboard') {
                return (
                  <Dashboard
                    gameState={gameState}
                    onUpdateState={handleUpdateState}
                    onAddLog={addLog}
                    logs={sessionLogs}
                    onSelectTab={setActiveTab}
                  />
                );
              } else if (activeTab === 'games') {
                /* BEAUTIFUL GAMES LAUNCHER CATALOG */
                return (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="pixel-box p-3 bg-[#1e133d] border-[#42298c] rounded-md">
                      <h2 className="font-heading text-xs text-white tracking-wider">PIXEL MINI GAMES ARENA</h2>
                      <p className="text-xs text-purple-300 mt-1">Pilih permainan yang paling cocok dengan mood-mu untuk bersenang-senang dan bersantai.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* 1. Bubble Pop */}
                      <div className="pixel-box p-4 bg-[#231b35] rounded-md flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl animate-float">🫧</span>
                            <h3 className="font-heading text-xs text-white">BUBBLE POP</h3>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-sans">
                            Pecahkan gelembung-gelembung warna-warni yang mengapung di udara sebelum kehabisan nyawa!
                          </p>
                        </div>
                        <button
                          onClick={() => { sound.playSelect(); setActiveGame('bubble'); }}
                          className="pixel-btn bg-purple-600 hover:bg-purple-500 text-white font-heading text-[9px] w-full py-2.5 rounded-sm"
                        >
                          MAIN BUBBLE POP ➔
                        </button>
                      </div>

                      {/* 2. Catch the Stars */}
                      <div className="pixel-box p-4 bg-[#12233a] rounded-md flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl animate-float">🌠</span>
                            <h3 className="font-heading text-xs text-white">CATCH THE STARS</h3>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-sans">
                            Gerakkan keranjang kedamaianmu untuk menangkap bintang jatuh berkilau dan hindari meteor panas!
                          </p>
                        </div>
                        <button
                          onClick={() => { sound.playSelect(); setActiveGame('star'); }}
                          className="pixel-btn bg-blue-700 hover:bg-blue-600 text-white font-heading text-[9px] w-full py-2.5 rounded-sm"
                        >
                          MAIN CATCH STARS ➔
                        </button>
                      </div>

                      {/* 3. Bee Collector */}
                      <div className="pixel-box p-4 bg-[#2c2618] rounded-md flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl animate-float">🐝</span>
                            <h3 className="font-heading text-xs text-white">BEE COLLECTOR</h3>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-sans">
                            Bantu lebah madu ramah terbang mengitari bunga liar kebun untuk mengumpulkan sari madu murni!
                          </p>
                        </div>
                        <button
                          onClick={() => { sound.playSelect(); setActiveGame('bee'); }}
                          className="pixel-btn bg-yellow-600 hover:bg-yellow-500 text-white font-heading text-[9px] w-full py-2.5 rounded-sm"
                        >
                          MAIN BEE COLLECTOR ➔
                        </button>
                      </div>

                      {/* 4. Coloring Book */}
                      <div className="pixel-box p-4 bg-[#341629] rounded-md flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl animate-float">🎨</span>
                            <h3 className="font-heading text-xs text-white">COLORING BOOK</h3>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-sans">
                            Sandiwarnakan duniamu lewat buku gambar pixel santai. Warnai pola kesukaanmu tanpa batas waktu!
                          </p>
                        </div>
                        <button
                          onClick={() => { sound.playSelect(); setActiveGame('paint'); }}
                          className="pixel-btn bg-pink-700 hover:bg-pink-600 text-white font-heading text-[9px] w-full py-2.5 rounded-sm"
                        >
                          BUKA BUKU MEWARNAI ➔
                        </button>
                      </div>

                      {/* 5. Healing Garden */}
                      <div className="pixel-box p-4 bg-[#142921] rounded-md flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl animate-float">🏡</span>
                            <h3 className="font-heading text-xs text-white">HEALING GARDEN</h3>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-sans">
                            Tanam benih mawar atau pohon oak rindang, sirami secara rutin, dan bangun kebun impianmu level 1-20!
                          </p>
                        </div>
                        <button
                          onClick={() => { sound.playSelect(); setActiveGame('garden'); }}
                          className="pixel-btn bg-green-700 hover:bg-green-600 text-white font-heading text-[9px] w-full py-2.5 rounded-sm"
                        >
                          MASUK KE KEBUN ➔
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else if (activeTab === 'shop') {
                return (
                  <VoucherShop
                    gameState={gameState}
                    onUpdateState={handleUpdateState}
                    onAddLog={addLog}
                  />
                );
              } else if (activeTab === 'achievements') {
                return <Achievements gameState={gameState} />;
              } else if (activeTab === 'collection') {
                return <Collections gameState={gameState} />;
              } else if (activeTab === 'letters') {
                return <SecretLetters gameState={gameState} />;
              } else if (activeTab === 'settings') {
                return (
                  <Settings
                    gameState={gameState}
                    onUpdateState={handleUpdateState}
                    onResetSlot={handleResetSlot}
                  />
                );
              }
              return null;
            })()
          )}
        </main>
      </div>
    </div>
  );
}
