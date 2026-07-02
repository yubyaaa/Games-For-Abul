import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../../types';
import { sound } from '../../utils/audio';

interface HoneyFlower {
  id: number;
  x: number;
  y: number;
  r: number;
  nectar: boolean;
  pulse: number;
}

interface PoisonSpider {
  x: number;
  y: number;
  r: number;
  speedY: number;
  rangeMin: number;
  rangeMax: number;
}

interface BeeCollectorProps {
  gameState: GameState;
  onUpdateState: (newState: GameState) => void;
  onAddLog: (text: string, coins: number, icon: string) => void;
  onBack: () => void;
}

export default function BeeCollector({ gameState, onUpdateState, onAddLog, onBack }: BeeCollectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [level, setLevel] = useState(gameState.gameProgress.beeCollector.level);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [nectarCarried, setNectarCarried] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  const beeRef = useRef({ x: 50, y: 50, r: 15, speed: 5 });
  const hiveRef = useRef({ x: 150, y: 150, r: 25 });
  const flowersRef = useRef<HoneyFlower[]>([]);
  const spidersRef = useRef<PoisonSpider[]>([]);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const animationFrameRef = useRef<number | null>(null);

  const maxNectar = 3;
  const scoreToWin = 100 + level * 50;

  // Setup keys
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
        canvas.height = Math.min(container.clientWidth * 1.1, 450);
        
        // Setup initial position of elements on resize
        hiveRef.current = {
          x: canvas.width / 2,
          y: canvas.height / 2,
          r: 25
        };
        beeRef.current.x = 40;
        beeRef.current.y = canvas.height / 2;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Steer bee using pointer
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isPaused || gameOver || victory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    beeRef.current.x = Math.max(beeRef.current.r, Math.min(canvas.width - beeRef.current.r, x));
    beeRef.current.y = Math.max(beeRef.current.r, Math.min(canvas.height - beeRef.current.r, y));
  };

  const startGame = () => {
    sound.interact();
    setScore(0);
    setLives(3);
    setNectarCarried(0);
    setGameOver(false);
    setVictory(false);
    setIsPaused(false);
    setIsPlaying(true);
    
    const canvas = canvasRef.current;
    if (canvas) {
      beeRef.current.x = 40;
      beeRef.current.y = canvas.height / 2;

      // Spawn 5 static flowers around the arena
      const newFlowers: HoneyFlower[] = [];
      const flowerPositions = [
        { x: 60, y: 70 },
        { x: canvas.width - 60, y: 70 },
        { x: 60, y: canvas.height - 70 },
        { x: canvas.width - 60, y: canvas.height - 70 },
        { x: canvas.width / 2, y: canvas.height - 60 },
      ];
      flowerPositions.forEach((pos, idx) => {
        newFlowers.push({
          id: idx,
          x: pos.x,
          y: pos.y,
          r: 15,
          nectar: true,
          pulse: Math.random() * Math.PI
        });
      });
      flowersRef.current = newFlowers;

      // Spawn spiders climbing up/down based on level
      const newSpiders: PoisonSpider[] = [];
      const spiderCount = Math.min(2 + Math.floor(level / 3), 6);
      
      for (let i = 0; i < spiderCount; i++) {
        // distribute horizontally but don't spawn right on hive
        let sx = 100 + i * ((canvas.width - 200) / (spiderCount - 1 || 1));
        if (Math.abs(sx - canvas.width / 2) < 40) {
          sx += 45; // nudge away from hive center
        }

        const spiderSpeed = (Math.random() * 1.5 + 1.0) * (1 + level * 0.08);
        newSpiders.push({
          x: sx,
          y: Math.random() * (canvas.height - 100) + 50,
          r: 10,
          speedY: Math.random() > 0.5 ? spiderSpeed : -spiderSpeed,
          rangeMin: 40,
          rangeMax: canvas.height - 40
        });
      }
      spidersRef.current = newSpiders;
    }
  };

  // Main Loop
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

    const loop = (timestamp: number) => {
      // Background (Charming Green Meadow)
      ctx.fillStyle = '#1e3a1e'; // deep grass green
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background grass blades (pixel art style)
      ctx.fillStyle = '#14532d';
      for (let i = 0; i < 20; i++) {
        const gx = (Math.sin(i * 987) * 0.5 + 0.5) * canvas.width;
        const gy = (Math.cos(i * 321) * 0.5 + 0.5) * canvas.height;
        ctx.fillRect(gx, gy, 4, 8);
        ctx.fillRect(gx + 4, gy + 4, 4, 4);
      }

      // Keyboard movement of bee
      const bee = beeRef.current;
      const bSpeed = bee.speed;
      if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['a'] || keysPressedRef.current['A']) {
        bee.x = Math.max(bee.r, bee.x - bSpeed);
      }
      if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['d'] || keysPressedRef.current['D']) {
        bee.x = Math.min(canvas.width - bee.r, bee.x + bSpeed);
      }
      if (keysPressedRef.current['ArrowUp'] || keysPressedRef.current['w'] || keysPressedRef.current['W']) {
        bee.y = Math.max(bee.r, bee.y - bSpeed);
      }
      if (keysPressedRef.current['ArrowDown'] || keysPressedRef.current['s'] || keysPressedRef.current['S']) {
        bee.y = Math.min(canvas.height - bee.r, bee.y + bSpeed);
      }

      // 1. Draw Hive (Honeycomb center)
      const hive = hiveRef.current;
      ctx.fillStyle = '#f59e0b'; // golden yellow honeycomb
      ctx.beginPath();
      ctx.arc(hive.x, hive.y, hive.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f'; // brown border
      ctx.lineWidth = 4;
      ctx.stroke();

      // Honeycomb cell detail
      ctx.fillStyle = '#d97706';
      ctx.font = '10px "Pixelify Sans"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍯 HIVE', hive.x, hive.y);

      // Check collision with Hive to deliver nectar
      const distToHive = Math.hypot(bee.x - hive.x, bee.y - hive.y);
      if (distToHive <= bee.r + hive.r) {
        if (nectarCarried > 0) {
          sound.playSuccess();
          const deliveredPoints = nectarCarried * 20;
          setScore((prev) => {
            const nextScore = prev + deliveredPoints;
            if (nextScore >= scoreToWin) {
              setVictory(true);
              sound.playSuccess();
              handleGameCompletion(nextScore);
            }
            return nextScore;
          });
          setNectarCarried(0);
        }
      }

      // 2. Update and Draw Flowers
      flowersRef.current.forEach((flow) => {
        flow.pulse += 0.05;
        const bounce = Math.sin(flow.pulse) * 2;

        // Draw flower
        ctx.fillStyle = '#fef08a'; // yellow petals
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const petalX = flow.x + Math.cos((a * Math.PI) / 3) * (flow.r + bounce);
          const petalY = flow.y + Math.sin((a * Math.PI) / 3) * (flow.r + bounce);
          ctx.arc(petalX, petalY, 8, 0, Math.PI * 2);
        }
        ctx.fill();

        // Flower center
        ctx.fillStyle = flow.nectar ? '#fbbf24' : '#b45309'; // bright orange if has nectar, dull brown if empty
        ctx.beginPath();
        ctx.arc(flow.x, flow.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Check bee collision with flower to collect nectar
        const distToFlower = Math.hypot(bee.x - flow.x, bee.y - flow.y);
        if (distToFlower <= bee.r + flow.r && flow.nectar && nectarCarried < maxNectar) {
          sound.playCollectStar();
          flow.nectar = false;
          setNectarCarried((prev) => prev + 1);

          // Reset flower nectar after 4 seconds
          setTimeout(() => {
            flow.nectar = true;
          }, 4000);
        }
      });

      // 3. Update and Draw Spiders (Dodging hazards)
      spidersRef.current.forEach((spid) => {
        spid.y += spid.speedY;
        
        // Bounce spider back
        if (spid.y <= spid.rangeMin || spid.y >= spid.rangeMax) {
          spid.speedY = -spid.speedY;
        }

        // Draw spider web line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(spid.x, 0);
        ctx.lineTo(spid.x, spid.y);
        ctx.stroke();

        // Draw fuzzy spider body (pixelated circles)
        ctx.fillStyle = '#111827'; // dark grey/black
        ctx.beginPath();
        ctx.arc(spid.x, spid.y, spid.r, 0, Math.PI * 2);
        ctx.fill();

        // Draw spider legs
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 3;
        // Draw 4 legs left/right
        [-1, 1].forEach((dir) => {
          for (let l = -1.5; l <= 1.5; l += 1) {
            ctx.beginPath();
            ctx.moveTo(spid.x, spid.y);
            ctx.lineTo(spid.x + dir * 18, spid.y + l * 8);
            ctx.stroke();
          }
        });

        // Glowing red spider eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(spid.x - 4, spid.y - 2, 2, 2);
        ctx.fillRect(spid.x + 2, spid.y - 2, 2, 2);

        // Check collision with bee
        const distToSpider = Math.hypot(bee.x - spid.x, bee.y - spid.y);
        if (distToSpider <= bee.r + spid.r) {
          sound.playHit();
          setLives((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setGameOver(true);
              sound.playGameOver();
            }
            return next;
          });
          // Respawn bee safely back to hive
          bee.x = 40;
          bee.y = canvas.height / 2;
          setNectarCarried(0);
        }
      });

      // 4. Draw Bee (Yellow and black stripes, fluttering white wings)
      const flap = Math.sin(timestamp / 50) > 0;
      
      // Bee shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.arc(bee.x, bee.y + 12, bee.r - 2, 0, Math.PI * 2);
      ctx.fill();

      // Bee wings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      if (flap) {
        ctx.ellipse(bee.x - 4, bee.y - 12, 6, 12, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(bee.x + 6, bee.y - 12, 6, 12, Math.PI / 6, 0, Math.PI * 2);
      } else {
        ctx.ellipse(bee.x - 6, bee.y - 8, 4, 10, -Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(bee.x + 8, bee.y - 8, 4, 10, Math.PI / 4, 0, Math.PI * 2);
      }
      ctx.fill();

      // Bee Body
      ctx.fillStyle = '#fbbf24'; // beautiful bright yellow
      ctx.beginPath();
      ctx.arc(bee.x, bee.y, bee.r, 0, Math.PI * 2);
      ctx.fill();

      // Black stripes
      ctx.fillStyle = '#171717';
      ctx.fillRect(bee.x - 8, bee.y - bee.r, 4, bee.r * 2);
      ctx.fillRect(bee.x, bee.y - bee.r, 4, bee.r * 2);
      ctx.fillRect(bee.x + 8, bee.y - bee.r, 4, bee.r * 2);

      // Bee face
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bee.x + 8, bee.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(bee.x + 9, bee.y - 3, 2, 2);

      // Carry indicator
      if (nectarCarried > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(`+${nectarCarried}`, bee.x, bee.y - 18);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isPaused, gameOver, victory, level, nectarCarried]);

  // Complete game successfully
  const handleGameCompletion = (finalScore: number) => {
    const honeyReward = Math.ceil(level / 2) + 1;
    const pointReward = 50 + level * 10;

    const updatedState = { ...gameState };
    updatedState.totalPoints += pointReward;
    updatedState.collection.honey += honeyReward;
    updatedState.stats.honeyCollected += honeyReward;
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
    const currentMeta = updatedState.gameProgress.beeCollector;
    const nextGameLevel = Math.min(level + 1, 20);
    updatedState.gameProgress.beeCollector = {
      level: nextGameLevel,
      highScore: Math.max(currentMeta.highScore, finalScore),
      stars: Math.min(5, Math.ceil((finalScore / scoreToWin) * 5))
    };

    // Update Daily Mission
    updatedState.dailyMissions = updatedState.dailyMissions.map((mission) => {
      if (mission.type === 'collect_honey') {
        const nextProg = Math.min(mission.progress + honeyReward, mission.target);
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
      if (ach.category === 'bee') {
        let currentProg = ach.progress;
        if (ach.id === 'e1' || ach.id === 'e2' || ach.id === 'e3') {
          currentProg = Math.min(updatedState.stats.honeyCollected, ach.target);
        } else if (ach.id === 'e4') {
          currentProg = Math.min(updatedState.stats.honeyCollected, ach.target);
        } else if (ach.id === 'e5') {
          currentProg = lives === 3 ? ach.target : ach.progress;
        } else if (ach.id === 'e6') {
          currentProg = Math.min(level, ach.target);
        } else if (ach.id === 'e7') {
          currentProg = Math.max(ach.progress, Math.floor(finalScore / 15));
        } else if (ach.id === 'e8') {
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
    onAddLog(`⭐ Selesai Level ${level} (Bee Collector)!`, pointReward, '🐝');
    setLevel(nextGameLevel);
  };

  return (
    <div className="w-full flex flex-col p-2 select-none" id="bee-collector-container">
      {/* Game Window Header */}
      <div className="pixel-box-green p-3 rounded-md mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐝</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">BEE COLLECTOR</h2>
            <p className="text-xs text-green-200 mt-1">Fly to flowers, gather nectar, dodge climbing spiders!</p>
          </div>
        </div>
        <button 
          onClick={() => { sound.playClick(); onBack(); }}
          className="pixel-btn bg-green-900 text-green-100 hover:bg-green-800 px-3 py-1 font-heading text-[9px] rounded-sm"
        >
          KEMBALI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Game Stats & Left Menu Panel */}
        <div className="lg:col-span-1 pixel-box p-4 flex flex-col justify-between rounded-md gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-[10px] text-green-300">STATISTIK</h3>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Level Game:</span>
              <span className="font-mono text-green-200 text-sm">{level} / 20</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">High Score:</span>
              <span className="font-mono text-yellow-300 text-sm">
                {gameState.gameProgress.beeCollector.highScore} pts
              </span>
            </div>

            <hr className="border-gray-700 my-1" />

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Skor Sekarang:</span>
              <span className="font-mono text-green-300 text-base font-bold">{score}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Sari Bunga (Nectar):</span>
              <span className="font-mono text-yellow-400 font-bold text-sm">
                {nectarCarried} / {maxNectar} {nectarCarried === maxNectar ? '(Penuh!)' : ''}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Nyawa Lebah:</span>
              <span className="text-red-400 flex gap-0.5 tracking-tight text-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < lives ? 'opacity-100' : 'opacity-20'}>❤️</span>
                ))}
              </span>
            </div>

            <div className="text-[10px] text-gray-400 mt-2 leading-relaxed bg-slate-900 p-2.5 rounded-sm border border-slate-800">
              <span className="text-green-400 font-bold">CARA BERMAIN:</span> Sentuh/klik bunga oranye terang untuk mengambil madu (Maks 3 madu). Terbangkan lebah kembali ke <b className="text-yellow-400">HIVE</b> di tengah untuk menyetorkan madu dan mendapatkan skor!
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {!isPlaying ? (
              <button 
                onClick={startGame}
                className="pixel-btn bg-green-600 text-white font-heading text-xs py-3 rounded-md hover:bg-green-500 w-full"
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
                  className="bg-green-500 h-full transition-all duration-150" 
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
              className="block w-full max-h-[450px]"
            />

            {/* Overlays */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl animate-float">🐝</span>
                <h3 className="font-heading text-sm text-green-300 mt-4">BEE COLLECTOR</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                  Bantu lebah kecil mengumpulkan sari bunga dari kelopak tulip liar dan membawanya pulang ke sarang lebah yang hangat!
                </p>
                <div className="flex gap-4 mt-6 text-[10px] text-gray-400 font-mono bg-slate-900 p-3 border border-slate-800 rounded-md">
                  <div>🐝 Gerakan Bebas</div>
                  <div>🌷 Kelopak Tulip: Ambil Nectar</div>
                  <div>🍯 Hive di Tengah: Setor Point</div>
                  <div className="text-red-400">🕷️ Laba-Laba: Musuh Berbahaya</div>
                </div>
                <button 
                  onClick={startGame}
                  className="pixel-btn bg-green-600 text-white font-heading text-xs py-3 px-8 rounded-md hover:bg-green-500 mt-6"
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
                <span className="text-5xl">🕸️</span>
                <h3 className="font-heading text-sm text-red-400 mt-4">GAME OVER</h3>
                <p className="text-xs text-gray-300 max-w-xs mt-2">
                  Laba-laba hutan melumpuhkan lebah kecilmu. Mari kita coba lagi secara perlahan!
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
                <span className="text-5xl animate-pixel-bounce">🍯</span>
                <h3 className="font-heading text-sm text-green-300 mt-4">SARANG PENUH MADU!</h3>
                <p className="text-xs text-gray-300 max-w-xs mt-2">
                  Sempurna! Kamu telah menyumbang banyak madu manis tingkat {level} untuk koloni!
                </p>
                <div className="mt-4 flex flex-col gap-1 font-mono text-xs text-gray-300 bg-green-900/40 p-3 rounded-md border border-green-700/50">
                  <div>Skor Diperoleh: <span className="text-white font-bold">{score}</span></div>
                  <div>Hadiah Poin: <span className="text-yellow-300 font-bold">+{50 + level * 10} Point</span></div>
                  <div>Hadiah Koleksi: <span className="text-yellow-300 font-bold">+{Math.ceil(level / 2) + 1} Honey Jars 🍯</span></div>
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
