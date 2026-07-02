import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../../types';
import { sound } from '../../utils/audio';

interface FallingObject {
  id: number;
  x: number;
  y: number;
  r: number;
  speedY: number;
  type: 'normal' | 'rainbow' | 'meteor';
  rotation: number;
  rotSpeed: number;
}

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface CatchStarsProps {
  gameState: GameState;
  onUpdateState: (newState: GameState) => void;
  onAddLog: (text: string, coins: number, icon: string) => void;
  onBack: () => void;
}

export default function CatchStars({ gameState, onUpdateState, onAddLog, onBack }: CatchStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [level, setLevel] = useState(gameState.gameProgress.catchStars.level);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  const objectsRef = useRef<FallingObject[]>([]);
  const particlesRef = useRef<StarParticle[]>([]);
  const nextIdRef = useRef(0);
  const basketRef = useRef({ x: 150, width: 70, height: 20 });
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const animationFrameRef = useRef<number | null>(null);

  const scoreToWin = 100 + level * 50;

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = Math.min(container.clientWidth * 1.2, 500);
        // Position basket in center initially
        basketRef.current.x = canvas.width / 2 - basketRef.current.width / 2;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Control basket via mouse or touch dragging
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isPaused || gameOver || victory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Set center of basket to pointer
    basketRef.current.x = Math.max(0, Math.min(canvas.width - basketRef.current.width, x - basketRef.current.width / 2));
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upward float
        color,
        alpha: 1.0,
        size: Math.random() * 4 + 2
      });
    }
  };

  const startGame = () => {
    sound.interact();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setVictory(false);
    setIsPaused(false);
    setIsPlaying(true);
    objectsRef.current = [];
    particlesRef.current = [];
    nextIdRef.current = 0;
    if (canvasRef.current) {
      basketRef.current.x = canvasRef.current.width / 2 - basketRef.current.width / 2;
    }
  };

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
    const spawnInterval = Math.max(900 - level * 35, 350); // fast spawning on high levels

    const loop = (timestamp: number) => {
      // Background (Stunning Twilight Sky gradient)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0a0d1e'); // near black space
      grad.addColorStop(0.6, '#18122b'); // deep twilight purple
      grad.addColorStop(1, '#393053'); // soft mauve horizon
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background ambient stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 15; i++) {
        const sx = (Math.sin(i * 1234.5) * 0.5 + 0.5) * canvas.width;
        const sy = (Math.cos(i * 5432.1) * 0.5 + 0.5) * canvas.height * 0.7;
        const size = Math.abs(Math.sin(timestamp / 500 + i)) * 3 + 1;
        ctx.fillRect(sx, sy, size, size);
      }

      // Keyboard Controls
      const basketSpeed = 6.5;
      if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['a'] || keysPressedRef.current['A']) {
        basketRef.current.x = Math.max(0, basketRef.current.x - basketSpeed);
      }
      if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['d'] || keysPressedRef.current['D']) {
        basketRef.current.x = Math.min(canvas.width - basketRef.current.width, basketRef.current.x + basketSpeed);
      }

      // Spawn falling objects
      if (timestamp - lastSpawn > spawnInterval) {
        lastSpawn = timestamp;

        const rand = Math.random();
        let type: 'normal' | 'rainbow' | 'meteor' = 'normal';
        
        // Meteor probability scales with level
        const meteorChance = Math.min(0.12 + level * 0.015, 0.4);
        const rainbowChance = 0.1;

        if (rand < meteorChance) {
          type = 'meteor';
        } else if (rand < meteorChance + rainbowChance) {
          type = 'rainbow';
        }

        const size = type === 'meteor' ? 18 : 12;
        const newObj: FallingObject = {
          id: nextIdRef.current++,
          x: Math.random() * (canvas.width - size * 2) + size,
          y: -size,
          r: size,
          speedY: Math.random() * (2 + level * 0.2) + (type === 'meteor' ? 2.5 : 1.5), // meteors are faster
          type,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.05
        };
        objectsRef.current.push(newObj);
      }

      // Update and draw falling items
      const activeObjects: FallingObject[] = [];
      objectsRef.current.forEach((obj) => {
        obj.y += obj.speedY;
        obj.rotation += obj.rotSpeed;

        // Collision Check with Basket
        const basket = basketRef.current;
        const bY = canvas.height - basket.height - 10;
        
        const isXIntersect = obj.x + obj.r > basket.x && obj.x - obj.r < basket.x + basket.width;
        const isYIntersect = obj.y + obj.r >= bY && obj.y - obj.r <= bY + basket.height;

        if (isXIntersect && isYIntersect) {
          // Object caught!
          if (obj.type === 'meteor') {
            sound.playHit();
            setLives((prev) => {
              const next = prev - 1;
              if (next <= 0) {
                setGameOver(true);
                sound.playGameOver();
              }
              return next;
            });
            spawnParticles(obj.x, obj.y, '#f87171');
          } else {
            sound.playCollectStar();
            const pointsGained = obj.type === 'rainbow' ? 50 : 10;
            setScore((prev) => {
              const nextScore = prev + pointsGained;
              if (nextScore >= scoreToWin) {
                setVictory(true);
                sound.playSuccess();
                handleGameCompletion(nextScore);
              }
              return nextScore;
            });

            // Particles
            spawnParticles(obj.x, obj.y, obj.type === 'rainbow' ? '#fb7185' : '#fef08a');
          }
          return; // skip adding to active objects (despawns)
        }

        // Out of boundary
        if (obj.y > canvas.height + obj.r) {
          if (obj.type === 'normal') {
            // loose minor points or break combo if we had any, no life lost to keep it casual
          }
          return; // despawns
        }

        // Draw objects
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);

        if (obj.type === 'meteor') {
          // Draw blazing pixel-art meteor
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, obj.r, 0, Math.PI * 2);
          ctx.fill();
          
          // Outer blazing orange ring
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Tail
          ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
          ctx.beginPath();
          ctx.moveTo(-obj.r * 0.5, -obj.r * 0.5);
          ctx.lineTo(-obj.r * 2.5, -obj.r * 1.5);
          ctx.lineTo(-obj.r * 1.5, -obj.r * 2.5);
          ctx.fill();
        } else {
          // Draw pixel star
          const isRainbow = obj.type === 'rainbow';
          const hue = isRainbow ? (timestamp / 2) % 360 : 54;
          ctx.fillStyle = isRainbow ? `hsl(${hue}, 90%, 65%)` : '#facc15';

          // Standard 5-point star path
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * obj.r, -Math.sin(((18 + i * 72) * Math.PI) / 180) * obj.r);
            ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (obj.r * 0.4), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (obj.r * 0.4));
          }
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#0a0a0f';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();
        activeObjects.push(obj);
      });
      objectsRef.current = activeObjects;

      // Update and draw particles
      const activeParticles: StarParticle[] = [];
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          // Draw square pixel-looking particle
          ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
          ctx.restore();
          activeParticles.push(p);
        }
      });
      particlesRef.current = activeParticles;

      // Draw Basket (Charming pixel style wooden basket)
      const basket = basketRef.current;
      const bY = canvas.height - basket.height - 10;
      
      // Draw outer pixel bounds for basket
      ctx.fillStyle = '#854d0e'; // dark brown
      ctx.fillRect(basket.x, bY, basket.width, basket.height);
      ctx.fillStyle = '#a16207'; // lighter brown
      ctx.fillRect(basket.x + 4, bY + 4, basket.width - 8, basket.height - 8);

      // Basket weave lines
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      for (let bx = basket.x + 8; bx < basket.x + basket.width; bx += 12) {
        ctx.beginPath();
        ctx.moveTo(bx, bY);
        ctx.lineTo(bx, bY + basket.height);
        ctx.stroke();
      }
      ctx.strokeRect(basket.x, bY, basket.width, basket.height);

      // Simple rim highlight
      ctx.fillStyle = '#eab308';
      ctx.fillRect(basket.x - 2, bY, basket.width + 4, 4);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isPaused, gameOver, victory, level]);

  // Complete game successfully
  const handleGameCompletion = (finalScore: number) => {
    const starReward = Math.ceil(level / 2) + 1;
    const pointReward = 50 + level * 10;

    const updatedState = { ...gameState };
    updatedState.totalPoints += pointReward;
    updatedState.collection.starCrystal += starReward;
    updatedState.stats.starsCaught += Math.floor(finalScore / 10);
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
    const currentMeta = updatedState.gameProgress.catchStars;
    const nextGameLevel = Math.min(level + 1, 20);
    updatedState.gameProgress.catchStars = {
      level: nextGameLevel,
      highScore: Math.max(currentMeta.highScore, finalScore),
      stars: Math.min(5, Math.ceil((finalScore / scoreToWin) * 5))
    };

    // Update Daily Mission
    updatedState.dailyMissions = updatedState.dailyMissions.map((mission) => {
      if (mission.type === 'catch_star') {
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
      if (ach.category === 'star') {
        let currentProg = ach.progress;
        if (ach.id === 's1' || ach.id === 's2' || ach.id === 's3') {
          currentProg = Math.min(updatedState.stats.starsCaught, ach.target);
        } else if (ach.id === 's4' || ach.id === 's5') {
          currentProg = Math.min(updatedState.stats.rainbowStarsCaught, ach.target);
        } else if (ach.id === 's6') {
          currentProg = lives === 3 ? ach.target : ach.progress;
        } else if (ach.id === 's7') {
          currentProg = Math.max(ach.progress, Math.floor(finalScore / 10));
        } else if (ach.id === 's8') {
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
    onAddLog(`⭐ Selesai Level ${level} (Catch Stars)!`, pointReward, '🌟');
    setLevel(nextGameLevel);
  };

  return (
    <div className="w-full flex flex-col p-2 select-none" id="catch-stars-container">
      {/* Game Window Header */}
      <div className="pixel-box-cyan p-3 rounded-md mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌟</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">CATCH THE STARS</h2>
            <p className="text-xs text-cyan-200 mt-1">Catch stars with your basket, avoid meteors!</p>
          </div>
        </div>
        <button 
          onClick={() => { sound.playClick(); onBack(); }}
          className="pixel-btn bg-cyan-900 text-cyan-100 hover:bg-cyan-800 px-3 py-1 font-heading text-[9px] rounded-sm"
        >
          KEMBALI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Game Stats & Left Menu Panel */}
        <div className="lg:col-span-1 pixel-box p-4 flex flex-col justify-between rounded-md gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-[10px] text-cyan-300">STATISTIK</h3>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Level Game:</span>
              <span className="font-mono text-cyan-200 text-sm">{level} / 20</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">High Score:</span>
              <span className="font-mono text-yellow-300 text-sm">
                {gameState.gameProgress.catchStars.highScore} pts
              </span>
            </div>

            <hr className="border-gray-700 my-1" />

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Skor Sekarang:</span>
              <span className="font-mono text-green-300 text-base font-bold">{score}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Nyawa Keranjang:</span>
              <span className="text-red-400 flex gap-0.5 tracking-tight text-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < lives ? 'opacity-100' : 'opacity-20'}>❤️</span>
                ))}
              </span>
            </div>

            <div className="text-[10px] text-gray-400 mt-2 leading-relaxed bg-slate-900 p-2.5 rounded-sm border border-slate-800">
              <span className="text-cyan-400 font-bold">KONTROL:</span> Gunakan tombol <b className="text-white">A/D</b> atau <b className="text-white">Arrow Kiri/Kanan</b> di keyboard, atau geser mouse / seret jari Anda pada Canvas di HP untuk menggerakkan keranjang!
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {!isPlaying ? (
              <button 
                onClick={startGame}
                className="pixel-btn bg-cyan-600 text-white font-heading text-xs py-3 rounded-md hover:bg-cyan-500 w-full"
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
                  className="bg-cyan-500 h-full transition-all duration-150" 
                  style={{ width: `${Math.min(100, (score / scoreToWin) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Active Stage Screen */}
          <div 
            ref={containerRef} 
            className="w-full relative bg-slate-950 rounded-md border-4 border-slate-800 overflow-hidden min-h-[350px] flex items-center justify-center"
          >
            <canvas 
              ref={canvasRef} 
              onPointerMove={handlePointerMove}
              className="block w-full max-h-[500px]"
            />

            {/* Overlays */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl animate-float">🌠</span>
                <h3 className="font-heading text-sm text-cyan-300 mt-4">CATCH THE STARS</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                  Gerakkan keranjang untuk menangkap bintang yang berjatuhan. Hindari meteor merah panas yang akan merusak keranjangmu!
                </p>
                <div className="flex gap-4 mt-6 text-[10px] text-gray-400 font-mono bg-slate-900 p-3 border border-slate-800 rounded-md">
                  <div>⭐ Normal Star: +10 pts</div>
                  <div className="text-yellow-300">🌈 Rainbow Star: +50 pts</div>
                  <div className="text-red-400">☄️ Meteor: -1 Nyawa</div>
                </div>
                <button 
                  onClick={startGame}
                  className="pixel-btn bg-cyan-600 text-white font-heading text-xs py-3 px-8 rounded-md hover:bg-cyan-500 mt-6"
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
                <span className="text-5xl">☄️</span>
                <h3 className="font-heading text-sm text-red-400 mt-4">GAME OVER</h3>
                <p className="text-xs text-gray-300 max-w-xs mt-2">
                  Meteormeteor berhasil menghancurkan keranjangmu. Tenang, Abul, silakan coba lagi!
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
                <span className="text-5xl animate-pixel-bounce">🌠</span>
                <h3 className="font-heading text-sm text-green-300 mt-4">LEVEL SELESAI!</h3>
                <p className="text-xs text-gray-300 max-w-xs mt-2">
                  Luar biasa! Basket-mu penuh dengan keajaiban bintang tingkat {level}!
                </p>
                <div className="mt-4 flex flex-col gap-1 font-mono text-xs text-gray-300 bg-green-900/40 p-3 rounded-md border border-green-700/50">
                  <div>Skor Diperoleh: <span className="text-white font-bold">{score}</span></div>
                  <div>Hadiah Poin: <span className="text-yellow-300 font-bold">+{50 + level * 10} Point</span></div>
                  <div>Hadiah Koleksi: <span className="text-yellow-300 font-bold">+{Math.ceil(level / 2) + 1} Star Crystal 🌟</span></div>
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
