export interface GameMeta {
  level: number;
  highScore: number;
  stars: number;
}

export interface SaveSlot {
  id: number;
  name: string;
  level: number;
  exp: number;
  totalPoints: number;
  gardenLevel: number;
  lastPlayed: string;
  exists: boolean;
}

export interface PlayerStats {
  playTime: number; // in seconds
  bubblesPopped: number;
  goldBubblesPopped: number;
  starsCaught: number;
  rainbowStarsCaught: number;
  honeyCollected: number;
  drawingsColored: number;
  plantsWatered: number;
  plantsFertilized: number;
  plantsHarvested: number;
  totalPointsEarned: number;
  vouchersClaimedCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  rewardPoints: number;
  category: 'bubble' | 'star' | 'bee' | 'paint' | 'garden' | 'voucher' | 'collector' | 'general';
}

export interface Voucher {
  id: string;
  name: string;
  icon: string;
  costPoints: number;
  claimed: boolean;
  claimDate?: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
  description: string;
}

export interface SecretLetter {
  id: number;
  title: string;
  sender: string;
  content: string;
  unlocked: boolean;
  milestoneDesc: string;
}

export interface DailyMission {
  id: string;
  title: string;
  progress: number;
  target: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  type: 'pop_bubble' | 'catch_star' | 'collect_honey' | 'color_pixel' | 'water_plant';
}

export interface DailyRewardState {
  lastClaimedDate: string | null; // Date string
  streakCount: number;
  isClaimedToday: boolean;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  isMusicOn: boolean;
  isSfxOn: boolean;
  theme: 'default' | 'cozy' | 'twilight';
  isFullscreen: boolean;
}

export interface GardenPlant {
  id: string;
  type: 'flower' | 'tree' | 'shrub';
  name: string;
  stage: number; // 0 (seed), 1 (sprout), 2 (growing), 3 (mature), 4 (harvestable)
  watered: boolean;
  fertilized: boolean;
  growth: number; // 0 to 100
  gridIndex: number;
}

export interface GameState {
  playerName: string;
  level: number;
  exp: number;
  totalPoints: number;
  stats: PlayerStats;
  gameProgress: {
    bubblePop: GameMeta;
    catchStars: GameMeta;
    beeCollector: GameMeta;
    coloringBook: GameMeta;
    healingGarden: GameMeta;
  };
  achievements: Achievement[];
  vouchers: Voucher[];
  collection: {
    bubbleGem: number;
    starCrystal: number;
    honey: number;
    paint: number;
    flower: number;
  };
  secretLetters: SecretLetter[];
  garden: {
    level: number;
    plants: GardenPlant[];
    decorations: string[]; // list of unlocked decoration ids
  };
  dailyReward: DailyRewardState;
  dailyMissions: DailyMission[];
  settings: GameSettings;
}
