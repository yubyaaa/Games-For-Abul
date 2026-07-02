import { useState } from 'react';
import { GameState } from '../../types';
import { sound } from '../../utils/audio';

// Catalog of 20 beautiful pixel-art drawings with increasing complexities (size 8x8 up to 12x12)
interface DrawingTemplate {
  id: number;
  name: string;
  level: number;
  size: number;
  colorsUsed: string[];
  grid: number[][]; // 0: background/white, 1..N: color indices
}

const TEMPLATE_PALETTE = [
  '#ffffff', // 0 (empty/transparent canvas)
  '#ef4444', // 1: Red
  '#f97316', // 2: Orange
  '#eab308', // 3: Yellow
  '#22c55e', // 4: Green
  '#06b6d4', // 5: Cyan
  '#3b82f6', // 6: Blue
  '#a855f7', // 7: Purple
  '#ec4899', // 8: Pink
  '#78350f', // 9: Brown
  '#111827', // 10: Charcoal Black
];

const TEMPLATES: DrawingTemplate[] = [
  { id: 1, name: 'Hati Merah ❤️', level: 1, size: 8, colorsUsed: ['#ffffff', '#ef4444', '#ec4899'], grid: [
    [0,1,1,0,0,1,1,0],
    [1,8,8,1,1,8,8,1],
    [1,8,8,8,8,8,8,1],
    [1,8,8,8,8,8,8,1],
    [0,1,8,8,8,8,1,0],
    [0,0,1,8,8,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0]
  ]},
  { id: 2, name: 'Tulip Cantik 🌷', level: 2, size: 8, colorsUsed: ['#ffffff', '#ec4899', '#22c55e'], grid: [
    [0,0,8,8,8,8,0,0],
    [0,8,8,8,8,8,8,0],
    [8,8,8,8,8,8,8,8],
    [8,8,0,8,8,0,8,8],
    [0,8,8,8,8,8,8,0],
    [0,0,4,4,4,4,0,0],
    [0,0,0,4,0,0,0,0],
    [0,0,4,4,4,0,0,0]
  ]},
  { id: 3, name: 'Bintang Terang ⭐', level: 3, size: 8, colorsUsed: ['#ffffff', '#eab308', '#f97316'], grid: [
    [0,0,0,3,3,0,0,0],
    [0,0,3,3,3,3,0,0],
    [3,3,3,3,3,3,3,3],
    [0,3,3,3,3,3,3,0],
    [0,0,3,3,3,3,0,0],
    [0,3,3,3,3,3,3,0],
    [3,3,0,0,0,0,3,3],
    [0,0,0,0,0,0,0,0]
  ]},
  { id: 4, name: 'Kucing Oranye 🐱', level: 4, size: 10, colorsUsed: ['#ffffff', '#f97316', '#111827', '#ec4899'], grid: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,2,0,0,0,0,0,0,2,0],
    [2,2,2,0,0,0,0,2,2,2],
    [2,8,2,2,2,2,2,2,8,2],
    [2,2,2,2,2,2,2,2,2,2],
    [2,10,2,2,2,2,2,10,2],
    [2,2,2,2,8,8,2,2,2,2],
    [0,2,2,10,10,10,10,2,2,0],
    [0,0,2,2,2,2,2,2,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 5, name: 'Cangkir Hangat ☕', level: 5, size: 10, colorsUsed: ['#ffffff', '#78350f', '#06b6d4', '#eab308'], grid: [
    [0,0,0,3,0,3,0,0,0,0],
    [0,0,3,0,3,0,3,0,0,0],
    [0,0,0,3,0,3,0,0,0,0],
    [0,5,5,5,5,5,5,5,0,0],
    [5,9,9,9,9,9,9,9,5,0],
    [5,9,9,9,9,9,9,9,5,5],
    [5,9,9,9,9,9,9,9,5,0],
    [0,5,5,5,5,5,5,5,0,0],
    [0,0,5,5,5,5,5,5,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 6, name: 'Awan Sore ☁️', level: 6, size: 10, colorsUsed: ['#ffffff', '#06b6d4', '#3b82f6'], grid: [
    [0,0,0,0,5,5,0,0,0,0],
    [0,0,5,5,5,5,5,5,0,0],
    [0,5,5,5,5,5,5,5,5,0],
    [5,5,6,6,6,6,6,5,5,5],
    [5,6,6,6,6,6,6,6,5,5],
    [5,5,6,6,6,6,6,5,5,5],
    [0,5,5,5,5,5,5,5,5,0],
    [0,0,5,5,5,5,5,5,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 7, name: 'Mahkota Emas 👑', level: 7, size: 10, colorsUsed: ['#ffffff', '#eab308', '#ef4444', '#06b6d4'], grid: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,0,0,5,0,0,1,0,0],
    [0,3,0,0,3,0,0,3,0,0],
    [0,3,3,0,3,0,3,3,0,0],
    [3,3,3,3,3,3,3,3,3,0],
    [3,1,3,5,3,1,3,5,3,0],
    [3,3,3,3,3,3,3,3,3,0],
    [3,3,3,3,3,3,3,3,3,0],
    [0,5,5,5,5,5,5,5,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 8, name: 'Apel Merah 🍎', level: 8, size: 10, colorsUsed: ['#ffffff', '#ef4444', '#22c55e', '#78350f'], grid: [
    [0,0,0,0,4,9,0,0,0,0],
    [0,0,0,4,4,9,0,0,0,0],
    [0,0,0,0,9,9,0,0,0,0],
    [0,1,1,1,0,0,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,1,1,1,1,0,0,0]
  ]},
  { id: 9, name: 'Semanggi Beruntung 🍀', level: 9, size: 10, colorsUsed: ['#ffffff', '#22c55e', '#111827'], grid: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,4,4,0,0,4,4,0,0],
    [0,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,0],
    [0,0,4,4,4,4,4,4,0,0],
    [0,0,4,4,4,4,4,4,0,0],
    [0,4,4,4,4,4,4,4,4,0],
    [0,0,4,4,4,4,4,4,0,0],
    [0,0,0,0,4,4,0,0,0,0],
    [0,0,0,0,4,0,0,0,0,0]
  ]},
  { id: 10, name: 'Unicorn Imut 🦄', level: 10, size: 12, colorsUsed: ['#ffffff', '#ec4899', '#a855f7', '#06b6d4'], grid: [
    [0,0,0,0,0,0,8,0,0,0,0,0],
    [0,0,0,0,0,8,8,8,0,0,0,0],
    [0,0,0,0,8,8,8,8,0,0,0,0],
    [0,0,8,8,8,8,8,8,8,8,0,0],
    [0,8,7,7,8,8,8,7,7,7,8,0],
    [8,7,7,7,7,8,7,7,7,7,7,8],
    [8,7,5,7,7,7,7,7,7,7,7,8],
    [8,7,7,7,7,7,7,7,7,8,8,0],
    [0,8,7,7,7,7,7,7,8,0,0,0],
    [0,0,8,7,7,7,7,8,0,0,0,0],
    [0,0,0,8,8,8,8,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
  ]},
  // Add levels 11..20 beautifully to complete minimal 20 pictures
  { id: 11, name: 'Pohon Pinus 🌲', level: 11, size: 8, colorsUsed: ['#ffffff', '#22c55e', '#78350f'], grid: [
    [0,0,0,4,4,0,0,0],
    [0,0,4,4,4,4,0,0],
    [0,0,4,4,4,4,0,0],
    [0,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,0],
    [4,4,4,4,4,4,4,4],
    [0,0,0,9,9,0,0,0],
    [0,0,0,9,9,0,0,0]
  ]},
  { id: 12, name: 'Candi Megah ⛩️', level: 12, size: 10, colorsUsed: ['#ffffff', '#ef4444', '#111827'], grid: [
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,10,0,0,0,0,10,0,0],
    [0,0,10,0,0,0,0,10,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,10,0,0,0,0,10,0,0],
    [0,0,10,0,0,0,0,10,0,0],
    [0,10,10,10,10,10,10,10,10,0],
    [10,10,10,10,10,10,10,10,10,10]
  ]},
  { id: 13, name: 'Es Krim Cone 🍦', level: 13, size: 10, colorsUsed: ['#ffffff', '#ec4899', '#78350f', '#eab308'], grid: [
    [0,0,0,0,8,8,0,0,0,0],
    [0,0,0,8,8,8,8,0,0,0],
    [0,0,8,8,8,8,8,8,0,0],
    [0,0,8,8,3,3,8,8,0,0],
    [0,0,0,9,9,9,9,0,0,0],
    [0,0,0,9,9,9,9,0,0,0],
    [0,0,0,0,9,9,0,0,0,0],
    [0,0,0,0,9,9,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 14, name: 'Pelangi Damai 🌈', level: 14, size: 10, colorsUsed: ['#ffffff', '#ef4444', '#eab308', '#22c55e', '#3b82f6'], grid: [
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,3,3,3,3,3,3,1,1],
    [1,3,3,4,4,4,4,3,3,1],
    [3,3,4,4,6,6,4,4,3,3],
    [3,4,4,6,6,6,6,4,4,3],
    [4,4,6,0,0,0,0,6,4,4],
    [4,6,0,0,0,0,0,0,6,4],
    [6,0,0,0,0,0,0,0,0,6],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 15, name: 'Kupu Srikandi 🦋', level: 15, size: 10, colorsUsed: ['#ffffff', '#a855f7', '#ec4899', '#111827'], grid: [
    [0,7,7,0,0,0,0,7,7,0],
    [7,7,7,7,0,0,7,7,7,7],
    [7,8,8,7,7,7,7,8,8,7],
    [7,8,8,7,10,10,7,8,8,7],
    [0,7,7,10,10,10,10,7,7,0],
    [0,8,8,10,10,10,10,8,8,0],
    [8,8,8,8,10,10,8,8,8,8],
    [8,8,8,0,0,0,0,8,8,8],
    [0,8,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 16, name: 'Bebek Kuning 🦆', level: 16, size: 10, colorsUsed: ['#ffffff', '#eab308', '#f97316', '#111827'], grid: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,3,3,3,3,0,0,0,0],
    [0,3,3,10,3,3,2,0,0,0],
    [0,3,3,3,3,3,2,2,0,0],
    [0,0,3,3,3,3,0,0,0,0],
    [0,3,3,3,3,3,3,3,0,0],
    [3,3,3,3,3,3,3,3,3,0],
    [3,3,3,3,3,3,3,3,3,0],
    [0,3,3,3,3,3,3,3,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 17, name: 'Berlian Biru 💎', level: 17, size: 8, colorsUsed: ['#ffffff', '#06b6d4', '#3b82f6'], grid: [
    [0,0,5,5,5,5,0,0],
    [0,5,5,5,5,5,5,0],
    [5,5,6,6,6,6,5,5],
    [5,6,6,6,6,6,6,5],
    [0,5,6,6,6,6,5,0],
    [0,0,5,6,6,5,0,0],
    [0,0,0,5,5,0,0,0],
    [0,0,0,0,0,0,0,0]
  ]},
  { id: 18, name: 'Cahaya Bulan 🌙', level: 18, size: 10, colorsUsed: ['#ffffff', '#eab308', '#06b6d4'], grid: [
    [0,0,0,3,3,3,0,0,0,0],
    [0,0,3,3,3,3,3,0,0,0],
    [0,3,3,3,5,5,3,3,0,0],
    [0,3,3,5,5,5,5,3,0,0],
    [3,3,3,5,5,5,5,3,3,0],
    [3,3,3,5,5,5,5,3,3,0],
    [0,3,3,5,5,5,5,3,0,0],
    [0,3,3,3,5,5,3,3,0,0],
    [0,0,3,3,3,3,3,0,0,0],
    [0,0,0,3,3,3,0,0,0,0]
  ]},
  { id: 19, name: 'Kado Rahasia 🎁', level: 19, size: 10, colorsUsed: ['#ffffff', '#ef4444', '#ec4899', '#22c55e'], grid: [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,1,8,8,1,1,0,0],
    [0,1,1,8,8,8,8,1,1,0],
    [0,0,4,4,4,4,4,4,0,0],
    [0,4,4,4,1,1,4,4,4,0],
    [0,4,1,4,1,1,4,1,4,0],
    [0,4,1,4,1,1,4,1,4,0],
    [0,4,4,4,1,1,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 20, name: 'Kastil Awan 🏰', level: 20, size: 12, colorsUsed: ['#ffffff', '#a855f7', '#06b6d4', '#eab308'], grid: [
    [0,7,0,0,0,7,0,0,0,7,0,0],
    [7,7,7,0,7,7,7,0,7,7,7,0],
    [0,7,0,0,0,7,0,0,0,7,0,0],
    [0,7,7,7,7,7,7,7,7,7,0,0],
    [7,7,7,7,7,7,7,7,7,7,7,0],
    [7,3,7,7,3,7,3,7,7,3,7,0],
    [7,7,7,7,7,7,7,7,7,7,7,0],
    [7,7,7,5,5,5,5,5,7,7,7,0],
    [0,7,7,5,5,5,5,5,7,7,0,0],
    [0,0,7,5,5,5,5,5,7,0,0,0],
    [0,0,0,7,7,7,7,7,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
  ]}
];

interface ColoringBookProps {
  gameState: GameState;
  onUpdateState: (newState: GameState) => void;
  onAddLog: (text: string, coins: number, icon: string) => void;
  onBack: () => void;
}

export default function ColoringBook({ gameState, onUpdateState, onAddLog, onBack }: ColoringBookProps) {
  const [activeLevel, setActiveLevel] = useState(gameState.gameProgress.coloringBook.level);
  const [selectedColorIndex, setSelectedColorIndex] = useState(1); // Default red
  const [userGrid, setUserGrid] = useState<number[][]>(() => {
    // Initialize blank grid matching current template level
    const templ = TEMPLATES.find((t) => t.level === activeLevel) || TEMPLATES[0];
    return Array.from({ length: templ.size }, () => Array(templ.size).fill(0));
  });

  const currentTemplate = TEMPLATES.find((t) => t.level === activeLevel) || TEMPLATES[0];

  const handleLevelSelect = (lvl: number) => {
    sound.playSelect();
    const templ = TEMPLATES.find((t) => t.level === lvl) || TEMPLATES[0];
    setActiveLevel(lvl);
    setUserGrid(Array.from({ length: templ.size }, () => Array(templ.size).fill(0)));
  };

  // Click on a pixel cell to color it
  const handleCellClick = (r: number, c: number) => {
    sound.playClick();
    const nextGrid = userGrid.map((rowArr, ri) => 
      rowArr.map((cellVal, ci) => (ri === r && ci === c ? selectedColorIndex : cellVal))
    );
    setUserGrid(nextGrid);
  };

  // Clear current progress
  const handleResetGrid = () => {
    sound.playClick();
    setUserGrid(Array.from({ length: currentTemplate.size }, () => Array(currentTemplate.size).fill(0)));
  };

  // Compute drawing progress compared to ideal template grid
  const getProgressStats = () => {
    let matchedCells = 0;
    let totalSolidCells = 0;

    for (let r = 0; r < currentTemplate.size; r++) {
      for (let c = 0; c < currentTemplate.size; c++) {
        const templateVal = currentTemplate.grid[r][c];
        if (templateVal !== 0) {
          totalSolidCells++;
          if (userGrid[r][c] === templateVal) {
            matchedCells++;
          }
        }
      }
    }

    const percentage = totalSolidCells > 0 ? Math.floor((matchedCells / totalSolidCells) * 100) : 100;
    return { percentage, completed: percentage === 100 };
  };

  const { percentage, completed } = getProgressStats();

  // Claim points when complete
  const handleClaimReward = () => {
    if (!completed) return;
    sound.playSuccess();

    const pointReward = 80 + activeLevel * 10;
    const paintReward = Math.ceil(activeLevel / 3) + 1;

    const updatedState = { ...gameState };
    updatedState.totalPoints += pointReward;
    updatedState.collection.paint += paintReward;
    updatedState.stats.drawingsColored += 1;
    updatedState.stats.totalPointsEarned += pointReward;

    // Progression XP
    const expGain = activeLevel * 12 + 15;
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

    // Update specific game status
    const currentMeta = updatedState.gameProgress.coloringBook;
    const nextColoringLevel = Math.min(activeLevel + 1, 20);
    updatedState.gameProgress.coloringBook = {
      level: nextColoringLevel,
      highScore: Math.max(currentMeta.highScore, percentage),
      stars: 5
    };

    // Unlock secret letter checking
    if (updatedState.stats.drawingsColored >= 3) {
      const letterIndex = updatedState.secretLetters.findIndex((l) => l.id === 5);
      if (letterIndex !== -1 && !updatedState.secretLetters[letterIndex].unlocked) {
        updatedState.secretLetters[letterIndex].unlocked = true;
        sound.playLetter();
        onAddLog('✉️ Surat Baru Terbuka! Periksa Kotak Suratmu 📬', 0, '✉️');
      }
    }

    // Achievements checking
    updatedState.achievements = updatedState.achievements.map((ach) => {
      if (ach.category === 'paint') {
        let currentProg = ach.progress;
        if (ach.id === 'p1' || ach.id === 'p2' || ach.id === 'p3') {
          currentProg = Math.min(updatedState.stats.drawingsColored, ach.target);
        } else if (ach.id === 'p4' || ach.id === 'p5') {
          // unique colors painted
          const colorsSet = new Set(userGrid.flat().filter(v => v !== 0));
          currentProg = Math.max(ach.progress, colorsSet.size);
        } else if (ach.id === 'p6') {
          currentProg = activeLevel >= 4 ? Math.min(ach.progress + 1, ach.target) : ach.progress;
        } else if (ach.id === 'p7') {
          currentProg = activeLevel >= 10 ? ach.target : ach.progress;
        } else if (ach.id === 'p8') {
          currentProg = Math.min(activeLevel, ach.target);
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
    onAddLog(`🎨 Selesai Mewarnai: ${currentTemplate.name}!`, pointReward, '🎨');
    
    // Automatically advance to next picture
    setActiveLevel(nextColoringLevel);
    const nextTempl = TEMPLATES.find((t) => t.level === nextColoringLevel) || TEMPLATES[0];
    setUserGrid(Array.from({ length: nextTempl.size }, () => Array(nextTempl.size).fill(0)));
  };

  return (
    <div className="w-full flex flex-col p-2 select-none" id="coloring-book-container">
      {/* Game Window Header */}
      <div className="pixel-box-light p-3 rounded-md mb-3 flex items-center justify-between !bg-[#3d0e2c] border-[#8a2256]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">COLORING BOOK</h2>
            <p className="text-xs text-pink-300 mt-1">Select colors, match the pixel template. No game over!</p>
          </div>
        </div>
        <button 
          onClick={() => { sound.playClick(); onBack(); }}
          className="pixel-btn bg-pink-900 text-pink-100 hover:bg-pink-800 px-3 py-1 font-heading text-[9px] rounded-sm"
        >
          KEMBALI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Pictures Catalog List */}
        <div className="lg:col-span-3 pixel-box p-3 rounded-md flex flex-col max-h-[460px] overflow-y-auto">
          <h3 className="font-heading text-[10px] text-pink-400 mb-2 border-b border-gray-700 pb-2">GAMBAR TEMPLATE</h3>
          <div className="flex flex-col gap-1.5">
            {TEMPLATES.map((temp) => {
              const isUnlocked = temp.level <= gameState.gameProgress.coloringBook.level;
              return (
                <button
                  key={temp.id}
                  disabled={!isUnlocked}
                  onClick={() => handleLevelSelect(temp.level)}
                  className={`w-full text-left px-2 py-2.5 rounded-sm flex items-center justify-between text-xs transition-all ${
                    temp.level === activeLevel 
                      ? 'bg-pink-800 text-white border-2 border-pink-500' 
                      : isUnlocked 
                        ? 'bg-slate-900 text-gray-300 hover:bg-slate-800' 
                        : 'bg-slate-950 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <span className="truncate">{temp.level}. {temp.name}</span>
                  <span className="font-mono text-[10px] text-gray-400">
                    {isUnlocked ? '🔓' : '🔒'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coloring Arena Grid */}
        <div className="lg:col-span-6 pixel-box p-4 flex flex-col justify-between items-center rounded-md bg-slate-950">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300 font-bold">MEWARNAI: <b className="text-pink-300">{currentTemplate.name}</b></span>
            <span className="font-mono text-sm font-bold text-yellow-300 bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800">
              {percentage}% Cocok
            </span>
          </div>

          {/* Interactive Draw Grid */}
          <div 
            className="grid gap-0.5 bg-slate-900 p-2.5 rounded-md border-4 border-slate-800 select-none cursor-pointer"
            style={{ 
              gridTemplateColumns: `repeat(${currentTemplate.size}, minmax(0, 1fr))`,
              width: '100%',
              maxWidth: '300px',
              aspectRatio: '1/1'
            }}
          >
            {userGrid.map((rowArr, ri) => 
              rowArr.map((cellVal, ci) => {
                const targetColorIndex = currentTemplate.grid[ri][ci];
                const paintedColor = TEMPLATE_PALETTE[cellVal];
                
                return (
                  <div
                    key={`${ri}-${ci}`}
                    onClick={() => handleCellClick(ri, ci)}
                    className="aspect-square border border-slate-950/20 relative flex items-center justify-center font-mono text-[9px] font-bold text-slate-400 select-none"
                    style={{ backgroundColor: paintedColor }}
                  >
                    {/* Ghost Number hints inside cells for pixel match coloring */}
                    {cellVal === 0 && targetColorIndex !== 0 && (
                      <span className="opacity-45 scale-75 text-gray-400">{targetColorIndex}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Color Palette selectors */}
          <div className="w-full mt-4 flex flex-col gap-2">
            <span className="text-[10px] text-gray-400 font-heading">PILIH WARNA:</span>
            <div className="flex flex-wrap justify-center gap-1.5 p-2 bg-slate-900 rounded-md border border-slate-800">
              {TEMPLATE_PALETTE.map((color, index) => {
                if (index === 0) return null; // skip transparent background in color selector
                return (
                  <button
                    key={index}
                    onClick={() => { sound.playSelect(); setSelectedColorIndex(index); }}
                    className={`w-7 h-7 rounded-sm border-2 transition-all relative ${
                      selectedColorIndex === index 
                        ? 'border-white scale-110 shadow-lg' 
                        : 'border-slate-950 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    <span className="absolute bottom-0 right-1 text-[8px] font-mono text-white drop-shadow-md">{index}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Level Templates Guidelines */}
        <div className="lg:col-span-3 pixel-box p-4 flex flex-col justify-between rounded-md gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-[10px] text-pink-300">PANDUAN WARNA</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Warnai setiap kotak bernomor abu-abu di kanvas sesuai dengan palet di bawah ini untuk menyelesaikan pola!
            </p>

            <div className="flex flex-col gap-1.5 bg-slate-950 p-2.5 rounded-sm border border-slate-800">
              {currentTemplate.colorsUsed.map((color) => {
                const idx = TEMPLATE_PALETTE.indexOf(color);
                if (idx <= 0) return null;
                const labels = ['Batal', 'Merah', 'Oranye', 'Kuning', 'Hijau', 'Sian', 'Biru', 'Ungu', 'Pink', 'Cokelat', 'Hitam'];
                return (
                  <div key={color} className="flex items-center gap-2 text-xs">
                    <span className="w-4 h-4 rounded-sm border border-black" style={{ backgroundColor: color }} />
                    <span className="text-gray-300">{idx}. {labels[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={handleResetGrid}
              className="pixel-btn bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 w-full font-heading"
            >
              HAPUS KANVAS 🧹
            </button>
            <button 
              disabled={!completed}
              onClick={handleClaimReward}
              className={`pixel-btn text-xs py-3 w-full font-heading ${
                completed 
                  ? 'bg-green-600 hover:bg-green-500 text-white cursor-pointer' 
                  : 'bg-slate-800 text-gray-500 cursor-not-allowed border-dashed'
              }`}
            >
              {completed ? 'KLAIM REWARD ✨' : 'BELUM SELESAI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
