import { GameState, Achievement, SecretLetter, Voucher, DailyMission } from './types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Bubble Pop
  { id: 'b1', title: 'Bubble Novice', description: 'Pop 10 normal bubbles', badgeIcon: '🫧', unlocked: false, progress: 0, target: 10, rewardPoints: 50, category: 'bubble' },
  { id: 'b2', title: 'Bubble Popper', description: 'Pop 50 bubbles', badgeIcon: '🎈', unlocked: false, progress: 0, target: 50, rewardPoints: 100, category: 'bubble' },
  { id: 'b3', title: 'Bubble Fanatic', description: 'Pop 150 bubbles', badgeIcon: '🔮', unlocked: false, progress: 0, target: 150, rewardPoints: 250, category: 'bubble' },
  { id: 'b4', title: 'Golden Pop', description: 'Pop 5 gold bubbles', badgeIcon: '⭐', unlocked: false, progress: 0, target: 5, rewardPoints: 100, category: 'bubble' },
  { id: 'b5', title: 'Golden Rich', description: 'Pop 20 gold bubbles', badgeIcon: '🪙', unlocked: false, progress: 0, target: 20, rewardPoints: 300, category: 'bubble' },
  { id: 'b6', title: 'Combo Rookie', description: 'Pop 15 bubbles in a single run', badgeIcon: '⚡', unlocked: false, progress: 0, target: 15, rewardPoints: 80, category: 'bubble' },
  { id: 'b7', title: 'Combo Champ', description: 'Pop 30 bubbles in a single run', badgeIcon: '🔥', unlocked: false, progress: 0, target: 30, rewardPoints: 200, category: 'bubble' },
  { id: 'b8', title: 'Bubble Master', description: 'Reach Level 10 in Bubble Pop', badgeIcon: '👑', unlocked: false, progress: 0, target: 10, rewardPoints: 300, category: 'bubble' },

  // Catch the Stars
  { id: 's1', title: 'Star Catcher', description: 'Catch 10 stars in basket', badgeIcon: '🌟', unlocked: false, progress: 0, target: 10, rewardPoints: 50, category: 'star' },
  { id: 's2', title: 'Star Hunter', description: 'Catch 50 stars in basket', badgeIcon: '🌠', unlocked: false, progress: 0, target: 50, rewardPoints: 100, category: 'star' },
  { id: 's3', title: 'Star Collector', description: 'Catch 150 stars', badgeIcon: '🌌', unlocked: false, progress: 0, target: 150, rewardPoints: 250, category: 'star' },
  { id: 's4', title: 'Rainbow Sparkle', description: 'Catch 5 rainbow stars', badgeIcon: '🌈', unlocked: false, progress: 0, target: 5, rewardPoints: 100, category: 'star' },
  { id: 's5', title: 'Rainbow Prism', description: 'Catch 15 rainbow stars', badgeIcon: '💎', unlocked: false, progress: 0, target: 15, rewardPoints: 300, category: 'star' },
  { id: 's6', title: 'Meteor Dodger', description: 'Survive catching 20 stars without hitting a meteor', badgeIcon: '🛡️', unlocked: false, progress: 0, target: 20, rewardPoints: 120, category: 'star' },
  { id: 's7', title: 'Basket Star', description: 'Catch 35 stars in a single run', badgeIcon: '🧺', unlocked: false, progress: 0, target: 35, rewardPoints: 200, category: 'star' },
  { id: 's8', title: 'Star Master', description: 'Reach Level 10 in Catch the Stars', badgeIcon: '🪐', unlocked: false, progress: 0, target: 10, rewardPoints: 300, category: 'star' },

  // Bee Collector
  { id: 'e1', title: 'Flower Kiss', description: 'Gather 10 jars of honey', badgeIcon: '🌸', unlocked: false, progress: 0, target: 10, rewardPoints: 50, category: 'bee' },
  { id: 'e2', title: 'Sweet Buzz', description: 'Gather 50 jars of honey', badgeIcon: '🐝', unlocked: false, progress: 0, target: 50, rewardPoints: 100, category: 'bee' },
  { id: 'e3', title: 'Hive Leader', description: 'Gather 150 jars of honey', badgeIcon: '🍯', unlocked: false, progress: 0, target: 150, rewardPoints: 250, category: 'bee' },
  { id: 'e4', title: 'Garden Pollen', description: 'Collect 10 flowers as a bee', badgeIcon: '🌻', unlocked: false, progress: 0, target: 10, rewardPoints: 80, category: 'bee' },
  { id: 'e5', title: 'Spider Dodger', description: 'Complete a level without hitting spiders', badgeIcon: '🕸️', unlocked: false, progress: 0, target: 1, rewardPoints: 100, category: 'bee' },
  { id: 'e6', title: 'Flower Swarm', description: 'Complete Level 5 in Bee Collector', badgeIcon: '🥀', unlocked: false, progress: 0, target: 5, rewardPoints: 120, category: 'bee' },
  { id: 'e7', title: 'Honey Rush', description: 'Collect 25 honey in a single run', badgeIcon: '🥞', unlocked: false, progress: 0, target: 25, rewardPoints: 180, category: 'bee' },
  { id: 'e8', title: 'Busy Bee', description: 'Reach Level 10 in Bee Collector', badgeIcon: '🐝👑', unlocked: false, progress: 0, target: 10, rewardPoints: 300, category: 'bee' },

  // Coloring Book
  { id: 'p1', title: 'Color Stroke', description: 'Color 1 pixel picture fully', badgeIcon: '🎨', unlocked: false, progress: 0, target: 1, rewardPoints: 50, category: 'paint' },
  { id: 'p2', title: 'Canvas Lover', description: 'Color 5 pixel pictures', badgeIcon: '🖼️', unlocked: false, progress: 0, target: 5, rewardPoints: 120, category: 'paint' },
  { id: 'p3', title: 'Masterpiece Artist', description: 'Color 15 pixel pictures', badgeIcon: '🎭', unlocked: false, progress: 0, target: 15, rewardPoints: 300, category: 'paint' },
  { id: 'p4', title: 'Palette Explorer', description: 'Use 5 different colors on a single drawing', badgeIcon: '🖌️', unlocked: false, progress: 0, target: 5, rewardPoints: 80, category: 'paint' },
  { id: 'p5', title: 'Color Rainbow', description: 'Use 10 different colors on a single drawing', badgeIcon: '🌈', unlocked: false, progress: 0, target: 10, rewardPoints: 150, category: 'paint' },
  { id: 'p6', title: 'Mindful Painting', description: 'Complete coloring 3 drawings on Level 4+', badgeIcon: '🧘', unlocked: false, progress: 0, target: 3, rewardPoints: 150, category: 'paint' },
  { id: 'p7', title: 'Complex Mind', description: 'Complete Level 10 drawing', badgeIcon: '🦄', unlocked: false, progress: 0, target: 10, rewardPoints: 200, category: 'paint' },
  { id: 'p8', title: 'Healing Artist', description: 'Reach Level 15 in Coloring Book', badgeIcon: '🎨👑', unlocked: false, progress: 0, target: 15, rewardPoints: 300, category: 'paint' },

  // Healing Garden
  { id: 'g1', title: 'Green Thumb', description: 'Plant your first seed in the garden', badgeIcon: '🌱', unlocked: false, progress: 0, target: 1, rewardPoints: 50, category: 'garden' },
  { id: 'g2', title: 'Watering Sprout', description: 'Water plants 15 times', badgeIcon: '💧', unlocked: false, progress: 0, target: 15, rewardPoints: 100, category: 'garden' },
  { id: 'g3', title: 'Magic Compost', description: 'Give fertilizer to plants 10 times', badgeIcon: '💩', unlocked: false, progress: 0, target: 10, rewardPoints: 100, category: 'garden' },
  { id: 'g4', title: 'Floral Bloom', description: 'Harvest 5 fully grown flowers', badgeIcon: '🌷', unlocked: false, progress: 0, target: 5, rewardPoints: 100, category: 'garden' },
  { id: 'g5', title: 'Garden Caretaker', description: 'Harvest 15 flowers or trees', badgeIcon: '🌻', unlocked: false, progress: 0, target: 15, rewardPoints: 250, category: 'garden' },
  { id: 'g6', title: 'Butterfly Haven', description: 'Reach Garden Level 5 (Butterflies appear)', badgeIcon: '🦋', unlocked: false, progress: 0, target: 5, rewardPoints: 150, category: 'garden' },
  { id: 'g7', title: 'Sanctuary Space', description: 'Reach Garden Level 10 (Fountain appear)', badgeIcon: '⛲', unlocked: false, progress: 0, target: 10, rewardPoints: 250, category: 'garden' },
  { id: 'g8', title: 'Healing Gardener', description: 'Reach Garden Level 20 (Cozy Cottage appears)', badgeIcon: '🏡', unlocked: false, progress: 0, target: 20, rewardPoints: 400, category: 'garden' },
];

export const INITIAL_LETTERS: SecretLetter[] = [
  { id: 1, title: 'Selamat Datang!', sender: 'Sahabat Misterius', content: 'Hai Abul!\n\nSelamat datang di Healing Journey-mu. Dunia ini dibuat khusus untukmu, tempat di mana kamu bisa melepas penat, melupakan sejenak beban pikiran, dan menikmati hal-hal kecil. Jangan terburu-buru, nikmatilah setiap detiknya.\n\nDengan kasih, Teman Baikmu.', unlocked: true, milestoneDesc: 'Awal dari perjalanan' },
  { id: 2, title: 'Menyiram Harapan', sender: 'Bunga Kecil', content: 'Hai Abul!\n\nSeperti benih di kebunmu, semua hal baik membutuhkan waktu untuk tumbuh. Jangan berkecil hati jika semuanya terasa lambat. Kamu sedang berproses, menyirami harapan setiap harinya. Teruskan langkahmu yang hebat ini!\n\nSangat bangga padamu.', unlocked: false, milestoneDesc: 'Mencapai Player Level 3' },
  { id: 3, title: 'Bintang yang Menuntunmu', sender: 'Langit Malam', content: 'Halo Abul!\n\nKetika malam terasa sangat gelap, ingatlah bahwa bintang-bintang bersinar lebih terang. Jangan takut tersesat, karena kebaikan dalam hatimu adalah kompas terbaik. Tangkaplah mimpi-mimpimu seperti bintang di langit!\n\nDari penjaga malammu.', unlocked: false, milestoneDesc: 'Menangkap 30 Bintang' },
  { id: 4, title: 'Kemanisan di Setiap Usaha', sender: 'Lebah Pekerja', content: 'Abul!\n\nTahu tidak? Lebah harus terbang ribuan kali hanya untuk mengumpulkan sedikit madu. Sama sepertimu, usaha kecil yang kamu lakukan hari ini—meski tak terlihat—akan menghasilkan sesuatu yang sangat manis di kemudian hari. Tetap semangat ya!\n\nBzz, peluk hangat!', unlocked: false, milestoneDesc: 'Mengumpulkan 30 Madu' },
  { id: 5, title: 'Warna-warni Jiwamu', sender: 'Kuas Ajaib', content: 'Hai Abul!\n\nHidup ini tidak selalu hitam dan putih. Kadang ada warna abu-abu yang redup, tapi ingatlah bahwa kamu memegang kuasnya. Kamu bebas mewarnai duniamu sesukamu. Jangan takut berekspresi dan menjadi dirimu sendiri yang luar biasa!\n\nPeluk penuh warna.', unlocked: false, milestoneDesc: 'Mewarnai 3 Gambar' },
  { id: 6, title: 'Napas yang Menenangkan', sender: 'Angin Pagi', content: 'Abul yang baik,\n\nTarik napas dalam-dalam... embuskan perlahan... Rasakan kesejukan yang menyelimuti jiwamu. Ketika dunia terasa berisik, kembalilah ke kebunmu, dengarkan gemercik air dan bisikan dedaunan. Kamu aman di sini.\n\nSalam damai.', unlocked: false, milestoneDesc: 'Mencapai Garden Level 6' },
  { id: 7, title: 'Petualangan Menantimu', sender: 'Kucing Kebun', content: 'Meow Abul!\n\nAku suka memperhatikanmu merawat tanaman. Kamu begitu lembut dan penyayang. Di luar sana mungkin melelahkan, tapi di sini, kamu adalah pahlawan bagi kami para hewan kecil. Terima kasih sudah merawat kebun ini!\n\nMeow dan sayang!', unlocked: false, milestoneDesc: 'Mencapai Player Level 10' },
  { id: 8, title: 'Menghargai Diri Sendiri', sender: 'Cermin Hati', content: 'Hai Abul,\n\nSudahkah kamu berterima kasih pada dirimu hari ini? Atas kekuatanmu, kesabaranmu, dan senyummu yang manis. Kamu pantas mendapatkan es krim lezat atau segelas minuman dingin yang segar. Manjakan dirimu hari ini!\n\nDari dirimu yang mencintaimu.', unlocked: false, milestoneDesc: 'Mengklaim Voucher Pertamamu' },
  { id: 9, title: 'Keindahan dalam Kesederhanaan', sender: 'Kupu-Kupu Indah', content: 'Halo Abul!\n\nAku dulunya hanya ulat kecil yang lambat dan tersembunyi. Namun dengan sabar menanti, sekarang aku bisa terbang bebas di tamanmu yang indah. Perubahan besar dimulai dari kepompong kesabaran. Percayalah pada prosesmu!\n\nKecupan kupu-kupu.', unlocked: false, milestoneDesc: 'Mencapai Player Level 18' },
  { id: 10, title: 'Perjalanan yang Sempurna', sender: 'Dunia Healing', content: 'Abul yang tersayang,\n\nKamu telah berjalan sejauh ini. Lihatlah taman yang mekar, pencapaian yang terbuka, dan kebahagiaan yang kamu kumpulkan. Perjalanan ini membuktikan bahwa kamu adalah jiwa yang tangguh dan indah. Terima kasih telah memilih untuk pulih dan bahagia.\n\nSelamanya bersamamu.', unlocked: false, milestoneDesc: 'Mencapai Player Level 25' }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  { id: 'v1', name: 'Es Krim Spesial Abul 🍦', icon: '🍦', costPoints: 500, claimed: false },
  { id: 'v2', name: 'Minuman Segar Favorit 🧋', icon: '🧋', costPoints: 750, claimed: false },
  { id: 'v3', name: 'Makan Bareng Orang Tersayang 🍜', icon: '🍜', costPoints: 1500, claimed: false },
  { id: 'v4', name: 'Tiket Nonton Bioskop Santai 🎬', icon: '🎬', costPoints: 2500, claimed: false },
  { id: 'v5', name: 'Mystery Gift Istimewa 🎁', icon: '🎁', costPoints: 4000, claimed: false },
];

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  { id: 'dm1', title: 'Pecahkan 30 Bubble', progress: 0, target: 30, rewardCoins: 100, completed: false, claimed: false, type: 'pop_bubble' },
  { id: 'dm2', title: 'Tangkap 20 Bintang', progress: 0, target: 20, rewardCoins: 100, completed: false, claimed: false, type: 'catch_star' },
  { id: 'dm3', title: 'Kumpulkan 15 Madu Lebah', progress: 0, target: 15, rewardCoins: 120, completed: false, claimed: false, type: 'collect_honey' },
];

export const COLORING_IMAGES = [
  { id: 1, name: 'Bunga Tulip', complex: 'Mudah', size: 8, grid: [
    [0,0,1,1,1,1,0,0],
    [0,1,2,2,2,2,1,0],
    [1,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
    [0,1,2,2,2,2,1,0],
    [0,0,1,3,3,1,0,0],
    [0,0,0,3,0,0,0,0],
    [0,0,3,3,3,0,0,0]
  ]},
  { id: 2, name: 'Hati Berkilau', complex: 'Mudah', size: 8, grid: [
    [0,1,1,0,0,1,1,0],
    [1,2,2,1,1,2,2,1],
    [1,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
    [0,1,2,2,2,2,1,0],
    [0,0,1,2,2,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0]
  ]},
  { id: 3, name: 'Bintang Kejora', complex: 'Mudah', size: 8, grid: [
    [0,0,0,1,1,0,0,0],
    [0,0,1,2,2,1,0,0],
    [1,1,2,2,2,2,1,1],
    [0,1,2,2,2,2,1,0],
    [0,0,1,2,2,1,0,0],
    [0,1,2,2,2,2,1,0],
    [1,1,2,1,1,2,1,1],
    [0,0,0,0,0,0,0,0]
  ]},
  { id: 4, name: 'Kucing Oranye', complex: 'Sedang', size: 10, grid: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,1,0],
    [1,2,1,0,0,0,0,1,2,1],
    [1,2,2,1,1,1,1,2,2,1],
    [1,2,2,2,2,2,2,2,2,1],
    [1,2,3,2,2,2,2,3,2,1],
    [1,2,2,2,4,4,2,2,2,1],
    [0,1,2,2,2,2,2,2,1,0],
    [0,0,1,2,1,1,2,1,0,0],
    [0,0,0,1,0,0,1,0,0,0]
  ]},
  { id: 5, name: 'Cangkir Kopi Hangat', complex: 'Sedang', size: 10, grid: [
    [0,0,0,1,0,1,0,0,0,0],
    [0,0,1,0,1,0,1,0,0,0],
    [0,0,0,1,0,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,0,0],
    [1,2,2,2,2,2,2,2,1,0],
    [1,2,3,3,3,3,2,2,1,1],
    [1,2,2,2,2,2,2,2,1,0],
    [0,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]},
  { id: 6, name: 'Unicorn Imut', complex: 'Sulit', size: 12, grid: [
    [0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,0,0,0,0],
    [0,0,0,0,1,2,2,1,0,0,0,0],
    [0,0,1,1,1,2,1,1,1,1,0,0],
    [0,1,3,3,1,1,1,3,3,3,1,0],
    [1,3,3,3,3,1,3,3,3,3,3,1],
    [1,3,4,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,1,1,0],
    [0,1,3,3,3,3,3,3,1,0,0,0],
    [0,0,1,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
  ]}
];

export const getInitialState = (name: string = 'Abul'): GameState => ({
  playerName: name,
  level: 1,
  exp: 0,
  totalPoints: 0,
  stats: {
    playTime: 0,
    bubblesPopped: 0,
    goldBubblesPopped: 0,
    starsCaught: 0,
    rainbowStarsCaught: 0,
    honeyCollected: 0,
    drawingsColored: 0,
    plantsWatered: 0,
    plantsFertilized: 0,
    plantsHarvested: 0,
    totalPointsEarned: 0,
    vouchersClaimedCount: 0,
  },
  gameProgress: {
    bubblePop: { level: 1, highScore: 0, stars: 1 },
    catchStars: { level: 1, highScore: 0, stars: 1 },
    beeCollector: { level: 1, highScore: 0, stars: 1 },
    coloringBook: { level: 1, highScore: 0, stars: 1 },
    healingGarden: { level: 1, highScore: 0, stars: 1 },
  },
  achievements: [...INITIAL_ACHIEVEMENTS],
  vouchers: [...INITIAL_VOUCHERS],
  collection: {
    bubbleGem: 0,
    starCrystal: 0,
    honey: 0,
    paint: 0,
    flower: 0,
  },
  secretLetters: [...INITIAL_LETTERS],
  garden: {
    level: 1,
    plants: [
      { id: 'g_p_1', type: 'flower', name: 'Mawar Pink', stage: 3, watered: true, fertilized: false, growth: 100, gridIndex: 1 },
      { id: 'g_p_2', type: 'tree', name: 'Pohon Oak Rindang', stage: 3, watered: true, fertilized: true, growth: 100, gridIndex: 4 },
    ],
    decorations: ['fence_white']
  },
  dailyReward: {
    lastClaimedDate: null,
    streakCount: 0,
    isClaimedToday: false,
  },
  dailyMissions: [...INITIAL_DAILY_MISSIONS],
  settings: {
    musicVolume: 50,
    sfxVolume: 70,
    isMusicOn: true,
    isSfxOn: true,
    theme: 'default',
    isFullscreen: false,
  }
});
