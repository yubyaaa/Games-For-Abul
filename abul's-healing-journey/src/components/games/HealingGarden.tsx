import { useState, useEffect } from 'react';
import { GameState, GardenPlant } from '../../types';
import { sound } from '../../utils/audio';

interface HealingGardenProps {
  gameState: GameState;
  onUpdateState: (newState: GameState) => void;
  onAddLog: (text: string, coins: number, icon: string) => void;
  onBack: () => void;
}

const SEED_TYPES = [
  { id: 's_rose', name: 'Mawar Pink 🌹', type: 'flower' as const, time: 20, cost: 0, reward: 80, icon: '🌹' },
  { id: 's_lavender', name: 'Lavender Harum 🪻', type: 'flower' as const, time: 30, cost: 0, reward: 120, icon: '🪻' },
  { id: 's_sunflower', name: 'Bunga Matahari 🌻', type: 'flower' as const, time: 45, cost: 0, reward: 180, icon: '🌻' },
  { id: 's_oak', name: 'Pohon Oak Rindang 🌳', type: 'tree' as const, time: 60, cost: 0, reward: 250, icon: '🌳' },
];

export default function HealingGarden({ gameState, onUpdateState, onAddLog, onBack }: HealingGardenProps) {
  const [gardenLevel, setGardenLevel] = useState(gameState.garden.level);
  const [gardenExp, setGardenExp] = useState(0); // 0 to 100 to level up garden
  const [plants, setPlants] = useState<GardenPlant[]>(gameState.garden.plants);
  const [activeSoilId, setActiveSoilId] = useState<number | null>(null);

  const gardenExpNeeded = gardenLevel * 40 + 50;

  // Run real-time growth tick every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      const updatedPlants = plants.map((plant) => {
        if (plant.stage < 4) {
          changed = true;
          const speedMultiplier = (plant.watered ? 1.5 : 1) * (plant.fertilized ? 2.0 : 1);
          const nextGrowth = Math.min(100, plant.growth + (3.5 * speedMultiplier));
          
          // Determine stage based on growth percentage
          let nextStage = plant.stage;
          if (nextGrowth >= 100) {
            nextStage = 4; // harvestable
          } else if (nextGrowth >= 70) {
            nextStage = 3; // bud / near mature
          } else if (nextGrowth >= 40) {
            nextStage = 2; // growing plant
          } else if (nextGrowth >= 15) {
            nextStage = 1; // sprout
          }

          return {
            ...plant,
            growth: nextGrowth,
            stage: nextStage
          };
        }
        return plant;
      });

      if (changed) {
        setPlants(updatedPlants);
        // Persist silently inside parent state
        const nextState = { ...gameState };
        nextState.garden.plants = updatedPlants;
        onUpdateState(nextState);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [plants, gameState]);

  // Handle sowing seed
  const handlePlantSeed = (gridIndex: number, seedId: string) => {
    sound.playPlant();
    const seed = SEED_TYPES.find((s) => s.id === seedId)!;
    
    const newPlant: GardenPlant = {
      id: `plant_${Date.now()}`,
      type: seed.type,
      name: seed.name,
      stage: 0,
      watered: false,
      fertilized: false,
      growth: 0,
      gridIndex
    };

    const nextPlants = [...plants.filter(p => p.gridIndex !== gridIndex), newPlant];
    setPlants(nextPlants);
    setActiveSoilId(null);

    // Save
    const updatedState = { ...gameState };
    updatedState.garden.plants = nextPlants;
    updatedState.stats.plantsWatered += 1; // initial planting action stats
    onUpdateState(updatedState);
    onAddLog(`🌱 Menanam benih: ${seed.name}!`, 0, '🌱');
  };

  // Water plant
  const handleWater = (gridIndex: number) => {
    const plant = plants.find(p => p.gridIndex === gridIndex);
    if (!plant || plant.watered) return;
    sound.playTone([{ freq: 350, duration: 0.1, type: 'triangle' }, { freq: 600, duration: 0.2, type: 'sine' }]); // splash sound

    const nextPlants = plants.map((p) => {
      if (p.gridIndex === gridIndex) {
        return { ...p, watered: true, growth: Math.min(100, p.growth + 15) };
      }
      return p;
    });
    setPlants(nextPlants);

    // Give Garden EXP
    addGardenExp(10);

    // Save
    const updatedState = { ...gameState };
    updatedState.garden.plants = nextPlants;
    updatedState.stats.plantsWatered += 1;
    onUpdateState(updatedState);
  };

  // Fertilize plant
  const handleFertilize = (gridIndex: number) => {
    const plant = plants.find(p => p.gridIndex === gridIndex);
    if (!plant || plant.fertilized) return;
    sound.playTone([{ freq: 500, duration: 0.08, type: 'sine' }, { freq: 1000, duration: 0.15, type: 'sine' }]); // magic sparkle

    const nextPlants = plants.map((p) => {
      if (p.gridIndex === gridIndex) {
        return { ...p, fertilized: true, growth: Math.min(100, p.growth + 30) };
      }
      return p;
    });
    setPlants(nextPlants);

    // Give Garden EXP
    addGardenExp(20);

    // Save
    const updatedState = { ...gameState };
    updatedState.garden.plants = nextPlants;
    updatedState.stats.plantsFertilized += 1;
    onUpdateState(updatedState);
  };

  // Harvest plant
  const handleHarvest = (gridIndex: number) => {
    const plant = plants.find(p => p.gridIndex === gridIndex);
    if (!plant || plant.stage < 4) return;
    sound.playHarvest();

    // Determine rewards based on plant type
    const seed = SEED_TYPES.find((s) => s.name === plant.name) || SEED_TYPES[0];
    const pointReward = seed.reward;
    const flowerReward = plant.type === 'flower' ? 1 : 0;

    const nextPlants = plants.filter((p) => p.gridIndex !== gridIndex);
    setPlants(nextPlants);

    // Give Garden EXP & Player EXP
    addGardenExp(40);

    // 1. Prepare updated state
    const updatedState = { ...gameState };
    updatedState.totalPoints += pointReward;
    updatedState.collection.flower += flowerReward;
    updatedState.stats.plantsHarvested += 1;
    updatedState.stats.totalPointsEarned += pointReward;
    updatedState.garden.plants = nextPlants;

    // Progression XP
    const expGain = 40 + gardenLevel * 5;
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

    // Save garden levels meta inside specific progress too
    updatedState.gameProgress.healingGarden = {
      level: Math.max(gameState.gameProgress.healingGarden.level, gardenLevel),
      highScore: Math.max(gameState.gameProgress.healingGarden.highScore, updatedState.stats.plantsHarvested),
      stars: 5
    };

    // Unlock secret letter checking
    if (gardenLevel >= 6) {
      const letterIndex = updatedState.secretLetters.findIndex((l) => l.id === 6);
      if (letterIndex !== -1 && !updatedState.secretLetters[letterIndex].unlocked) {
        updatedState.secretLetters[letterIndex].unlocked = true;
        sound.playLetter();
        onAddLog('✉️ Surat Baru Terbuka! Periksa Kotak Suratmu 📬', 0, '✉️');
      }
    }

    // Handle Achievements unlock checks
    updatedState.achievements = updatedState.achievements.map((ach) => {
      if (ach.category === 'garden') {
        let currentProg = ach.progress;
        if (ach.id === 'g1') {
          currentProg = Math.min(updatedState.stats.plantsHarvested, ach.target);
        } else if (ach.id === 'g2') {
          currentProg = Math.min(updatedState.stats.plantsWatered, ach.target);
        } else if (ach.id === 'g3') {
          currentProg = Math.min(updatedState.stats.plantsFertilized, ach.target);
        } else if (ach.id === 'g4' || ach.id === 'g5') {
          currentProg = Math.min(updatedState.stats.plantsHarvested, ach.target);
        } else if (ach.id === 'g6' || ach.id === 'g7' || ach.id === 'g8') {
          currentProg = Math.min(gardenLevel, ach.target);
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
    onAddLog(`🌻 Memanen: ${plant.name}!`, pointReward, '🌷');
  };

  // Helper to add Garden experience and handle level ups up to Level 20
  const addGardenExp = (amount: number) => {
    setGardenExp((prev) => {
      let nextExp = prev + amount;
      let nextLvl = gardenLevel;
      const needed = nextLvl * 40 + 50;
      
      if (nextExp >= needed && nextLvl < 20) {
        nextExp -= needed;
        nextLvl += 1;
        setGardenLevel(nextLvl);
        sound.playLevelUp();
        onAddLog(`🏡 Kebunmu Naik ke Level ${nextLvl}!`, 100, '🏡');
        
        // Save level up
        const nextState = { ...gameState };
        nextState.garden.level = nextLvl;
        nextState.totalPoints += 100; // level up bonus points
        onUpdateState(nextState);
      }
      return nextExp;
    });
  };

  return (
    <div className="w-full flex flex-col p-2 select-none" id="healing-garden-container">
      {/* Game Window Header */}
      <div className="pixel-box-green p-3 rounded-md mb-3 flex items-center justify-between !bg-[#1c352d] border-[#295847]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏡</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">HEALING GARDEN</h2>
            <p className="text-xs text-green-300 mt-1">Sow seeds, water, watch them grow. Develop your sanctuary level 1-20!</p>
          </div>
        </div>
        <button 
          onClick={() => { sound.playClick(); onBack(); }}
          className="pixel-btn bg-green-900 text-green-100 hover:bg-green-800 px-3 py-1 font-heading text-[9px] rounded-sm"
        >
          KEMBALI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Garden Visual Canvas Simulation Scene */}
        <div className="lg:col-span-8 pixel-box-green bg-gradient-to-b from-sky-900 to-sky-750 p-4 rounded-md relative overflow-hidden min-h-[220px] flex flex-col justify-between">
          
          {/* Sunny/Twilight Sky elements */}
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <span className="text-3xl text-yellow-300 animate-float drop-shadow-md">☀️</span>
            <div className="text-white drop-shadow-sm font-heading text-[9px] tracking-wide">
              LEVEL SANCTUARY: {gardenLevel} / 20
            </div>
          </div>

          {/* Procedural Visual features added dynamically based on Garden level */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Level 5+ Cute Wild Flowers scattered around */}
            {gardenLevel >= 5 && (
              <div className="absolute bottom-6 left-12 flex gap-4 text-xs animate-pixel-bounce">
                <span>🌸</span><span>🌷</span><span>🌼</span>
              </div>
            )}
            {/* Level 8+ Beautiful pine/oak trees */}
            {gardenLevel >= 8 && (
              <>
                <span className="absolute bottom-10 left-4 text-3xl">🌲</span>
                <span className="absolute bottom-10 right-4 text-3xl">🌳</span>
              </>
            )}
            {/* Level 10+ Flying butterflies */}
            {gardenLevel >= 10 && (
              <div className="absolute top-10 right-16 text-sm animate-float">
                🦋
              </div>
            )}
            {/* Level 12+ Small animated birds */}
            {gardenLevel >= 12 && (
              <div className="absolute top-12 left-1/3 text-xs animate-pixel-bounce">
                🐦 <span className="text-[7px] text-white bg-slate-900/60 p-0.5 rounded-sm">Chirp!</span>
              </div>
            )}
            {/* Level 15+ bubbling stone fountain */}
            {gardenLevel >= 15 && (
              <div className="absolute bottom-4 right-16 flex flex-col items-center animate-pixel-bounce">
                <span className="text-xs text-cyan-300">💦</span>
                <span className="text-2xl">⛲</span>
              </div>
            )}
            {/* Level 18+ Small cottage with smoking chimney */}
            {gardenLevel >= 18 && (
              <div className="absolute bottom-6 left-1/4 flex flex-col items-center">
                <span className="text-[10px] text-gray-400 animate-float">☁️</span>
                <span className="text-4xl">🏡</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center z-20 mt-12">
            {/* Garden EXP progression indicator */}
            <div className="w-full max-w-sm bg-slate-950/80 p-2 border-2 border-slate-800 rounded-sm">
              <div className="flex justify-between text-[10px] font-mono text-gray-300 mb-0.5">
                <span>Garden EXP: {Math.floor(gardenExp)} / {gardenExpNeeded}</span>
                <span>{Math.floor((gardenExp / gardenExpNeeded) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-sm overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-300" 
                  style={{ width: `${(gardenExp / gardenExpNeeded) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Grassy field banner footer */}
          <div className="w-full bg-green-950 border-t-4 border-green-800 h-10 mt-4 -mx-4 -mb-4 px-4 flex items-center justify-between z-10 text-[10px] font-mono text-green-200">
            <span>Suka cita taman kedamaianmu 🌻</span>
            <span>{plants.length} tanaman aktif</span>
          </div>
        </div>

        {/* 6 Grid Soil slots & Details panel */}
        <div className="lg:col-span-4 pixel-box p-3 rounded-md flex flex-col gap-3 justify-between bg-slate-950">
          <div>
            <h3 className="font-heading text-[10px] text-green-300 border-b border-gray-800 pb-2 mb-2">TATA KEBUN (6 PLOT)</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, idx) => {
                const plant = plants.find(p => p.gridIndex === idx);
                
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      sound.playSelect();
                      setActiveSoilId(activeSoilId === idx ? null : idx);
                    }}
                    className={`aspect-square rounded-sm border-2 p-1 relative flex flex-col items-center justify-between cursor-pointer transition-all ${
                      activeSoilId === idx 
                        ? 'border-yellow-400 bg-amber-950/30' 
                        : plant 
                          ? 'border-green-800 bg-green-950/20' 
                          : 'border-slate-800 bg-amber-950/15 hover:border-slate-700'
                    }`}
                  >
                    <span className="absolute top-0.5 left-1 text-[9px] font-mono text-gray-500">#{idx+1}</span>
                    
                    {plant ? (
                      <div className="flex flex-col items-center justify-center gap-1 w-full h-full pt-2">
                        {/* Render stage graphics */}
                        <span className="text-xl">
                          {plant.stage === 0 ? '🌱' : plant.stage === 1 ? '🌿' : plant.stage === 2 ? '🪴' : plant.type === 'tree' ? '🌳' : '🌷'}
                        </span>
                        
                        {/* Mini growth progress */}
                        <div className="w-full bg-slate-900 h-1 rounded-sm overflow-hidden mt-1">
                          <div 
                            className={`h-full ${plant.stage === 4 ? 'bg-yellow-400' : 'bg-green-500'}`}
                            style={{ width: `${plant.growth}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xl text-amber-900/40 m-auto">🕳️</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Trigger panel based on active slot selection */}
          <div className="p-2 bg-slate-900 rounded-md border border-slate-800 min-h-[140px] flex flex-col justify-between">
            {activeSoilId !== null ? (
              (() => {
                const plant = plants.find(p => p.gridIndex === activeSoilId);
                if (plant) {
                  return (
                    <div className="flex flex-col justify-between h-full gap-2 text-xs">
                      <div>
                        <div className="font-bold text-green-300">{plant.name}</div>
                        <div className="text-[10px] text-gray-400">Pertumbuhan: {Math.floor(plant.growth)}% ({plant.stage === 4 ? 'Siap Panen!' : 'Sedang tumbuh'})</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={plant.watered}
                          onClick={() => handleWater(activeSoilId)}
                          className={`pixel-btn py-1 px-2 text-[10px] font-heading ${
                            plant.watered ? 'bg-slate-800 text-gray-500 cursor-not-allowed' : 'bg-cyan-700 hover:bg-cyan-600 text-white'
                          }`}
                        >
                          {plant.watered ? 'DISIRAM 💧' : 'SIRAM AIR'}
                        </button>
                        <button
                          disabled={plant.fertilized}
                          onClick={() => handleFertilize(activeSoilId)}
                          className={`pixel-btn py-1 px-2 text-[10px] font-heading ${
                            plant.fertilized ? 'bg-slate-800 text-gray-500 cursor-not-allowed' : 'bg-yellow-700 hover:bg-yellow-600 text-white'
                          }`}
                        >
                          {plant.fertilized ? 'DIPUPUK ✨' : 'BERI PUPUK'}
                        </button>
                      </div>

                      {plant.stage === 4 && (
                        <button
                          onClick={() => handleHarvest(activeSoilId)}
                          className="pixel-btn py-2 bg-green-600 hover:bg-green-500 text-white text-[10px] font-heading w-full mt-1"
                        >
                          PANEN DAN KUMPULKAN ✨
                        </button>
                      )}
                    </div>
                  );
                } else {
                  // Soil empty: offer seeds
                  return (
                    <div className="flex flex-col gap-1.5 h-full">
                      <div className="text-[10px] text-gray-300 font-bold mb-1">PILIH BENIH UNTUK DI TANAM:</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SEED_TYPES.map((seed) => (
                          <button
                            key={seed.id}
                            onClick={() => handlePlantSeed(activeSoilId, seed.id)}
                            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-sm p-1.5 text-left text-[10px] flex items-center gap-1.5 transition-all text-white"
                          >
                            <span>{seed.icon}</span>
                            <div className="truncate">
                              <div className="font-bold">{seed.name.split(' ')[0]}</div>
                              <div className="text-[8px] text-gray-500">{seed.time}s • +{seed.reward}p</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
              })()
            ) : (
              <div className="m-auto text-center text-xs text-gray-500 p-4 leading-relaxed">
                <span className="text-2xl animate-float block mb-1">👩‍🌾</span>
                Pilih salah satu plot tanah tilled di atas untuk menanam bibit baru atau merawat tanaman!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
