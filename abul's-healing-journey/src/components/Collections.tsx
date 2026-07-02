import { useState } from 'react';
import { GameState } from '../types';
import { sound } from '../utils/audio';

interface CollectionsProps {
  gameState: GameState;
}

export default function Collections({ gameState }: CollectionsProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>('bubbleGem');

  const items = [
    {
      id: 'bubbleGem',
      name: 'Bubble Gem 💎',
      count: gameState.collection.bubbleGem,
      icon: '💎',
      color: 'text-cyan-400',
      description: 'Kristal gelembung berkilau yang dikumpulkan dari Bubble Pop. Sangat ringan dan memantulkan pelangi saat terkena cahaya.',
      obtainedFrom: 'Dapatkan dengan menyelesaikan level di game Bubble Pop.'
    },
    {
      id: 'starCrystal',
      name: 'Star Crystal 🌟',
      count: gameState.collection.starCrystal,
      icon: '🌟',
      color: 'text-yellow-300',
      description: 'Patahan bintang kecil yang jatuh dari langit malam. Hangat saat disentuh dan memancarkan energi kedamaian.',
      obtainedFrom: 'Dapatkan dengan menyelesaikan level di game Catch the Stars.'
    },
    {
      id: 'honey',
      name: 'Madu Organik 🍯',
      count: gameState.collection.honey,
      icon: '🍯',
      color: 'text-amber-500',
      description: 'Madu kental murni yang diproduksi oleh koloni lebah kebunmu. Rasanya manis sekali, kaya akan nutrisi penyembuh.',
      obtainedFrom: 'Dapatkan dengan mengumpulkan sari madu di game Bee Collector.'
    },
    {
      id: 'paint',
      name: 'Kuas Cat Ajaib 🎨',
      count: gameState.collection.paint,
      icon: '🎨',
      color: 'text-pink-400',
      description: 'Satu set kuas lukis dengan pigmen warna impian. Digunakan oleh Abul untuk mengekspresikan imajinasinya yang indah.',
      obtainedFrom: 'Dapatkan dengan merampungkan lukisan di game Coloring Book.'
    },
    {
      id: 'flower',
      name: 'Bunga Abadi 🌸',
      count: gameState.collection.flower,
      icon: '🌸',
      color: 'text-green-300',
      description: 'Kelopak bunga abadi hasil panen kebun kedamaianmu. Baunya sangat wangi dan menenangkan ketegangan saraf.',
      obtainedFrom: 'Dapatkan dengan memanen bunga di game Healing Garden.'
    }
  ];

  const activeItem = items.find((i) => i.id === selectedItemId) || items[0];

  return (
    <div className="w-full flex flex-col p-2 select-none" id="collections-container">
      {/* Header */}
      <div className="pixel-box p-3 rounded-md mb-4 bg-[#112435] border-[#224466]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎒</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">PIXEL BACKPACK INVENTORY</h2>
            <p className="text-xs text-cyan-200 mt-1">Simpan dan amati koleksi bahan ajaib hasil penyembuhanmu!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Backpack Inventory Slots Grid */}
        <div className="md:col-span-7 pixel-box p-4 rounded-md bg-[#161224] flex flex-col gap-3">
          <h3 className="font-heading text-[10px] text-purple-400 mb-1">KANTONG UTAMA</h3>
          
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {items.map((item) => {
              const isSelected = item.id === selectedItemId;
              return (
                <div
                  key={item.id}
                  onClick={() => { sound.playSelect(); setSelectedItemId(item.id); }}
                  className={`aspect-square rounded-md border-2 p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all relative ${
                    isSelected 
                      ? 'border-yellow-400 bg-purple-950/40 scale-105 shadow-md' 
                      : 'border-slate-800 bg-[#0d091a] hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl m-auto animate-float">{item.icon}</span>
                  
                  {/* Item counter count badge */}
                  {item.count > 0 ? (
                    <span className="absolute bottom-1 right-1.5 bg-slate-950 border border-slate-700 px-1 py-0.5 rounded-sm font-mono text-[9px] font-bold text-yellow-300">
                      {item.count}
                    </span>
                  ) : (
                    <span className="absolute bottom-1 right-1.5 text-[8px] text-gray-500 font-bold">KOSONG</span>
                  )}
                </div>
              );
            })}

            {/* Empty slots for visual grid consistency */}
            {Array.from({ length: 10 }).map((_, idx) => (
              <div 
                key={idx} 
                className="aspect-square rounded-md border-2 border-dashed border-slate-800/40 bg-slate-950/20 flex items-center justify-center text-slate-800/10 text-2xl cursor-not-allowed"
              >
                🔒
              </div>
            ))}
          </div>
        </div>

        {/* Item Description Detail panel */}
        <div className="md:col-span-5 pixel-box p-4 rounded-md flex flex-col justify-between gap-4 bg-slate-950">
          {activeItem ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 bg-slate-900 rounded-md border border-slate-800">{activeItem.icon}</span>
                <div>
                  <h4 className="font-heading text-xs text-white tracking-wide">{activeItem.name}</h4>
                  <p className="text-xs text-yellow-400 mt-1 font-mono">Jumlah Dimiliki: {activeItem.count}</p>
                </div>
              </div>

              <hr className="border-gray-800" />

              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] text-cyan-400 font-heading">DESKRIPSI ITEM:</span>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">{activeItem.description}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-sm text-[10px] text-gray-400 leading-normal font-sans">
                <span className="text-yellow-500 font-bold">SUMBER:</span> {activeItem.obtainedFrom}
              </div>
            </div>
          ) : (
            <div className="m-auto text-center text-xs text-gray-500 py-12">
              Pilih salah satu item di laci kantong sebelah kiri untuk melihat deskripsi koleksinya!
            </div>
          )}

          <div className="bg-purple-900/10 border border-purple-700/30 p-2.5 rounded-md text-[9px] text-purple-300 leading-relaxed font-mono">
            Koleksi didapatkan murni dari mini-game dan tidak dapat dijual, melainkan sebagai tanda bukti keberhasilan proses healing Abul!
          </div>
        </div>
      </div>
    </div>
  );
}
