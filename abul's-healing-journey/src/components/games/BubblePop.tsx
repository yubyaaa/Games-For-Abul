import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../../types';
import { sound } from '../../utils/audio';

interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
  speedY: number;
  type: 'normal' | 'gold' | 'heart' | 'bomb';
  color: string;
  popProgress: number; // 0 if active, 1+ if popping
}

interface BubblePopProps {
  gameState: GameState;
  onUpdateState: (newState: GameState) => void;
  onAddLog: (text: string, coins: number, icon: string) => void;
  onBack: () => void;
}

export default function BubblePop({ gameState, onUpdateState, onAddLog, onBack }: BubblePopProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [level, setLevel] = useState(gameState.gameProgress.bubblePop.level);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  const bubblesRef = useRef<Bubble[]>([]);
  const nextIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const scoreToWin = 100 + level * 50;

  // Start / restart the game
  const startGame = () => {
    sound.interact();
    setScore(0);
    setLives(3);
    setCombo(0);
    setBestCombo(0);
    setGameOver(false);
    setVictory(false);
    setIsPaused(false);
    setIsPlaying(true);
    bubblesRef.current = [];
    nextIdRef.current = 0;
  };

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = Math.min(container.clientWidth * 1.2, 500);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Primary game loop
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver || victory) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawn = 0;
    const spawnInterval = Math.max(1000 - level * 40, 300); // speed up spawning at higher levels

    const loop = (timestamp: number) => {
      // Clear canvas
      ctx.fillStyle = '#1e1736'; // deep lavender background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background grid lines (retro feel)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Spawn bubbles
      if (timestamp - lastSpawn > spawnInterval) {
        lastSpawn = timestamp;
        
        // Decide bubble type
        const rand = Math.random();
        let type: 'normal' | 'gold' | 'heart' | 'bomb' = 'normal';
        let color = '#38bdf8'; // light blue

        if (rand < 0.12) {
          type = 'bomb';
          color = '#f87171'; // soft red/black
        } else if (rand < 0.22) {
          type = 'gold';
          color = '#fbbf24'; // beautiful gold
        } else if (rand < 0.25) {
          type = 'heart';
          color = '#ec4899'; // deep pink
        }

        const maxRad = Math.max(35 - level, 18);
        const minRad = Math.max(25 - level, 12);
        const radius = Math.floor(Math.random() * (maxRad - minRad) + minRad);

        const newBubble: Bubble = {
          id: nextIdRef.current++,
          x: Math.random() * (canvas.width - radius * 2) + radius,
          y: canvas.height + radius,
          r: radius,
          speedY: -(Math.random() * (1.5 + level * 0.15) + 1.2), // float upwards
          type,
          color,
          popProgress: 0,
        };
        bubblesRef.current.push(newBubble);
      }

      // Update and draw bubbles
      const activeBubbles: Bubble[] = [];
      bubblesRef.current.forEach((b) => {
        if (b.popProgress > 0) {
          // Animate pop particles
          b.popProgress += 1;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Draw 4/8 outer pixel sparks
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const dist = b.r + b.popProgress * 2;
            const px = b.x + Math.cos(angle) * dist;
            const py = b.y + Math.sin(angle) * dist;
            ctx.rect(px - 2, py - 2, 4, 4);
          }
          ctx.stroke();

          if (b.popProgress < 12) {
            activeBubbles.push(b);
          }
          return;
        }

        // Float up
        b.y += b.speedY;

        // Draw bubble shadow & highlight (pixel art look)
        ctx.shadowBlur = 0;

        // Bubble main circle
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();

        // Outer crisp pixel border
        ctx.strokeStyle = '#100a1c';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cute highlight reflection on the top-left
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Icon inside bubble based on type
        ctx.fillStyle = '#100a1c';
        ctx.font = `${b.r}px "Pixelify Sans"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (b.type === 'bomb') {
          ctx.fillText('💀', b.x, b.y + 1);
        } else if (b.type === 'gold') {
          ctx.fillText('🪙', b.x, b.y + 1);
        } else if (b.type === 'heart') {
          ctx.fillText('❤️', b.x, b.y + 1);
        }

        // Check if missed normal/gold/heart bubble (letting it float away)
        if (b.y < -b.r) {
          if (b.type === 'normal' || b.type === 'gold') {
            setLives((prev) => {
              const next = prev - 1;
              if (next <= 0) {
                setGameOver(true);
                sound.playGameOver();
              }
              return next;
            });
            setCombo(0); // break combo on miss
          }
          return; // discards bubble
        }

        activeBubbles.push(b);
      });

      bubblesRef.current = activeBubbles;

      // Draw level metrics inside canvas corner for premium look
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(10, 10, 160, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText(`TARGET: ${scoreToWin}`, 20, 35);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isPaused, gameOver, victory, level]);

  // Click handler on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isPaused || gameOver || victory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked any active bubble
    let clickedAny = false;
    bubblesRef.current.forEach((b) => {
      if (b.popProgress > 0) return; // already popped

      const dist = Math.hypot(b.x - x, b.y - y);
      if (dist <= b.r + 5) { // slightly generous tap radius for mobile play
        clickedAny = true;
        b.popProgress = 1; // start popping

        if (b.type === 'bomb') {
          sound.playBomb();
          setLives((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setGameOver(true);
              sound.playGameOver();
            }
            return next;
          });
          setCombo(0);
        } else {
          sound.playPop();
          
          let pointsGained = 10;
          if (b.type === 'gold') {
            pointsGained = 50;
          }

          // Apply combo multiplier (e.g. +2 points per combo tier)
          const bonusCombo = Math.floor(combo / 5) * 5;
          const finalPoints = pointsGained + bonusCombo;

          setScore((prev) => {
            const nextScore = prev + finalPoints;
            if (nextScore >= scoreToWin) {
              setVictory(true);
              sound.playSuccess();
              handleGameCompletion(nextScore);
            }
            return nextScore;
          });

          // Handle custom inventory collection and stats update
          let expReward = 2;
          let extraGem = 0;

          if (b.type === 'gold') {
            expReward = 5;
          }
          if (b.type === 'heart') {
            setLives((prev) => Math.min(prev + 1, 5));
          }

          setCombo((prev) => {
            const next = prev + 1;
            if (next > bestCombo) {
              setBestCombo(next);
            }
            return next;
          });
        }
      }
    });

    if (!clickedAny) {
      setCombo(0); // miss tap breaks combo
    }
  };

  // Complete game successfully
  const handleGameCompletion = (finalScore: number) => {
    const isGoldCombo = bestCombo >= 15;
    const gemReward = Math.ceil(level / 2) + (isGoldCombo ? 2 : 0);
    const pointReward = 50 + level * 10;

    // 1. Prepare updated state
    const updatedState = { ...gameState };
    updatedState.totalPoints += pointReward;
    updatedState.collection.bubbleGem += gemReward;
    updatedState.stats.bubblesPopped += Math.floor(finalScore / 10);
    updatedState.stats.totalPointsEarned += pointReward;

    // Progression XP
    const expGain = level * 15 + 20;
    let nextExp = updatedState.exp + expGain;
    let nextLevel = updatedState.level;
    const expToNextLevel = nextLevel * 100;
    
    if (nextExp >= expToNextLevel) {
      nextExp -= expToNextLevel;
      nextLevel += 1;
      sound.playLevelUp();
    }
    updatedState.exp = nextExp;
    updatedState.level = nextLevel;

    // Update game specific level progress
    const currentMeta = updatedState.gameProgress.bubblePop;
    const nextGameLevel = Math.min(level + 1, 20);
    updatedState.gameProgress.bubblePop = {
      level: nextGameLevel,
      highScore: Math.max(currentMeta.highScore, finalScore),
      stars: Math.min(5, Math.ceil((finalScore / scoreToWin) * 5))
    };

    // Update Daily Mission
    updatedState.dailyMissions = updatedState.dailyMissions.map((mission) => {
      if (mission.type === 'pop_bubble') {
        const nextProg = Math.min(mission.progress + Math.floor(finalScore / 10), mission.target);
        return {
          ...mission,
          progress: nextProg,
          completed: nextProg >= mission.target && !mission.completed ? true : mission.completed
        };
      }
      return mission;
    });

    // Handle Achievements unlock checks
    updatedState.achievements = updatedState.achievements.map((ach) => {
      if (ach.category === 'bubble') {
        let currentProg = ach.progress;
        if (ach.id === 'b1' || ach.id === 'b2' || ach.id === 'b3') {
          currentProg = Math.min(updatedState.stats.bubblesPopped, ach.target);
        } else if (ach.id === 'b4' || ach.id === 'b5') {
          currentProg = Math.min(updatedState.stats.goldBubblesPopped, ach.target);
        } else if (ach.id === 'b6' || ach.id === 'b7') {
          currentProg = Math.max(ach.progress, bestCombo);
        } else if (ach.id === 'b8') {
          currentProg = Math.min(level, ach.target);
        }

        const isNewlyUnlocked = currentProg >= ach.target && !ach.unlocked;
        if (isNewlyUnlocked) {
          sound.playAchievement();
          onAddLog(`🏆 Achievement: ${ach.title} Unlocked!`, ach.rewardPoints, '⭐');
          updatedState.totalPoints += ach.rewardPoints;
        }

        return {
          ...ach,
          progress: currentProg,
          unlocked: currentProg >= ach.target ? true : ach.unlocked
        };
      }
      return ach;
    });

    onUpdateState(updatedState);
    onAddLog(`⭐ Selesai Level ${level} (Bubble Pop)!`, pointReward, '🫧');
    setLevel(nextGameLevel);
  };

  return (
    <div className="w-full flex flex-col p-2 select-none" id="bubble-pop-container">
      {/* Game Window Header */}
      <div className="pixel-box-pink p-3 rounded-md mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🫧</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">BUBBLE POP</h2>
            <p className="text-xs text-pink-200 mt-1">Pop bubbles, avoid bombs, build combos!</p>
          </div>
        </div>
        <button 
          onClick={() => { sound.playClick(); onBack(); }}
          className="pixel-btn bg-pink-800 text-pink-100 hover:bg-pink-700 px-3 py-1 font-heading text-[9px] rounded-sm"
        >
          KEMBALI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Game Stats & Left Menu Panel */}
        <div className="lg:col-span-1 pixel-box p-4 flex flex-col justify-between rounded-md gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-[10px] text-pink-300">STATISTIK</h3>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Level Game:</span>
              <span className="font-mono text-pink-200 text-sm">{level} / 20</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">High Score:</span>
              <span className="font-mono text-yellow-300 text-sm">
                {gameState.gameProgress.bubblePop.highScore} pts
              </span>
            </div>

            <hr className="border-gray-700 my-1" />

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Skor Sekarang:</span>
              <span className="font-mono text-green-300 text-base font-bold">{score}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Nyawa:</span>
              <span className="text-red-400 flex gap-0.5 tracking-tight text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < lives ? 'opacity-100' : 'opacity-20'}>❤️</span>
                ))}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Combo:</span>
              <span className="font-mono text-cyan-300 font-bold text-sm">
                x{combo} <span className="text-[10px] text-gray-500">(Max: {bestCombo})</span>
              </span>
            </div>

            {combo >= 5 && (
              <div className="bg-pink-900/40 border border-pink-700 p-2 rounded-sm text-center text-[10px] text-pink-300 font-heading animate-pulse">
                COMBO MULTIPLIER! +{Math.floor(combo / 5) * 5} pts
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {!isPlaying ? (
              <button 
                onClick={startGame}
                className="pixel-btn bg-pink-600 text-white font-heading text-xs py-3 rounded-md hover:bg-pink-500 w-full"
              >
                MULAI MAIN ▶
              </button>
            ) : (
              <>
                <button 
                  onClick={() => { sound.playSelect(); setIsPaused(!isPaused); }}
                  className="pixel-btn bg-yellow-600 text-white font-heading text-[10px] py-2 rounded-md hover:bg-yellow-500 w-full"
                >
                  {isPaused ? 'LANJUTKAN ⏯' : 'PAUSE ⏸'}
                </button>
                <button 
                  onClick={startGame}
                  className="pixel-btn bg-red-800 text-white font-heading text-[10px] py-2 rounded-md hover:bg-red-700 w-full"
                >
                  MULAI ULANG 🔄
                </button>
              </>
            )}
          </div>
        </div>

        {/* Game Canvas Container */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {/* Progress Bar To Win */}
          {isPlaying && !gameOver && !victory && (
            <div className="w-full bg-slate-900 p-1 rounded-sm border-2 border-slate-700">
              <div className="flex justify-between text-[10px] font-mono text-gray-400 px-1 mb-0.5">
                <span>Skor: {score}</span>
                <span>Target: {scoreToWin}</span>
              </div>
              <div className="w-full bg-slate-950 h-4 rounded-sm overflow-hidden relative">
                <div 
                  className="bg-pink-500 h-full transition-all duration-150" 
                  style={{ width: `${Math.min(100, (score / scoreToWin) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Active Stage Screen */}
          <div 
            ref={containerRef} 
            className="w-full relative bg-slate-950 rounded-md border-4 border-slate-800 overflow-hidden min-h-[350px] flex items-center justify-center cursor-crosshair"
          >
            <canvas 
              ref={canvasRef} 
              onMouseDown={handleCanvasClick}
              className="block w-full max-h-[500px]"
            />

            {/* Overlays */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl animate-float">🫧</span>
                <h3 className="font-heading text-sm text-pink-300 mt-4">BUBBLE POP</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                  Pecahkan gelembung-gelembung warna-warni yang mengambang. Dapatkan skor target untuk naik ke level berikutnya.
                </p>
                <div className="flex gap-4 mt-6 text-[10px] text-gray-400 font-mono bg-slate-900 p-3 border border-slate-800 rounded-md">
                  <div>🫧 Normal: +10 pts</div>
                  <div>🪙 Gold: +50 pts</div>
                  <div>❤️ Heart: +1 Nyawa</div>
                  <div className="text-red-400">💀 Bomb: -1 Nyawa</div>
                </div>
                <button 
                  onClick={startGame}
                  className="pixel-btn bg-pink-600 text-white font-heading text-xs py-3 px-8 rounded-md hover:bg-pink-500 mt-6"
                >
                  PRESS START 🎮
                </button>
              </div>
            )}

            {isPaused && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center">
                <h3 className="font-heading text-lg text-yellow-400 animate-pulse">GAME PAUSED</h3>
                <button 
                  onClick={() => { sound.playSelect(); setIsPaused(false); }}
                  className="pixel-btn bg-yellow-600 text-white font-heading text-xs py-2 px-6 rounded-md mt-4 hover:bg-yellow-500"
                >
                  LANJUTKAN BERMAIN
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <span className="text-5xl">💀</span>
                <h3 className="font-heading text-sm text-red-400 mt-4">GAME OVER</h3>
                <p className="text-xs text-gray-300 max-w-xs mt-2">
                  Sayang sekali gelembung merenggut semua nyawamu atau kamu memicu bom!
                </p>
                <div className="mt-4 font-mono text-sm text-gray-400">
                  Skor Akhir: <span className="text-white font-bold">{score}</span>
                </div>
                <button 
                  onClick={startGame}
                  className="pixel-btn bg-red-600 text-white font-heading text-xs py-2.5 px-8 rounded-md hover:bg-red-500 mt-6"
                >
                  MAIN LAGI 🔄
                </button>
              </div>
            )}

            {victory && (
              <div className="absolute inset-0 bg-green-950/90 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <span className="text-5xl animate-pixel-bounce">👑</span>
                <h3 className="font-heading text-sm text-green-300 mt-4">LEVEL SELESAI!</h3>
                <p className="text-xs text-gray-300 max-w-xs mt-2">
                  Kerja bagus, Abul! Kamu berhasil melampaui skor target level {level}!
                </p>
                <div className="mt-4 flex flex-col gap-1 font-mono text-xs text-gray-300 bg-green-900/40 p-3 rounded-md border border-green-700/50">
                  <div>Skor Diperoleh: <span className="text-white font-bold">{score}</span></div>
                  <div>Hadiah Poin: <span className="text-yellow-300 font-bold">+{50 + level * 10} Point</span></div>
                  <div>Hadiah Koleksi: <span className="text-cyan-300 font-bold">+{Math.ceil(level / 2)} Bubble Gem 💎</span></div>
                  {bestCombo >= 15 && <div className="text-pink-300">🔥 Combo Combo! Bonus +2 Gem!</div>}
                </div>
                <button 
                  onClick={() => {
                    sound.playClick();
                    startGame();
                  }}
                  className="pixel-btn bg-green-600 text-white font-heading text-xs py-2.5 px-8 rounded-md hover:bg-green-500 mt-6"
                >
                  LEVEL BERIKUTNYA ⏭
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
