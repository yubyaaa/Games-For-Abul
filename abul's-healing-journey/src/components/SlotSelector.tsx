import React, { useState, useEffect } from 'react';
import { SaveSlot } from '../types';
import { loadSaveSlots, deleteSlot } from '../utils/storage';
import { sound } from '../utils/audio';

interface SlotSelectorProps {
  onSelectSlot: (slotId: number, name: string) => void;
}

export default function SlotSelector({ onSelectSlot }: SlotSelectorProps) {
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [showNewGameModal, setShowNewGameModal] = useState<number | null>(null);
  const [newName, setNewName] = useState('Abul');

  useEffect(() => {
    setSlots(loadSaveSlots());
  }, []);

  const handleContinue = (slot: SaveSlot) => {
    sound.playSuccess();
    onSelectSlot(slot.id, slot.name);
  };

  const handleStartNewGame = (slotId: number) => {
    sound.playSelect();
    setShowNewGameModal(slotId);
    setNewName('Abul');
  };

  const handleConfirmNewGame = () => {
    if (!newName.trim()) return;
    sound.playSuccess();
    onSelectSlot(showNewGameModal!, newName.trim());
    setShowNewGameModal(null);
  };

  const handleDelete = (slotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Apakah kamu yakin ingin menghapus Slot ini? Seluruh progress penyembuhan akan hilang selamanya!")) {
      sound.playBomb();
      deleteSlot(slotId);
      setSlots(loadSaveSlots());
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0f0a1c] flex flex-col items-center justify-center p-4 relative scanlines overflow-hidden select-none">
      {/* Sparkly Star Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-1/4 text-white text-opacity-10 animate-float text-4xl">★</div>
        <div className="absolute top-2/3 right-1/4 text-white text-opacity-15 animate-pixel-bounce text-3xl">★</div>
        <div className="absolute top-1/3 right-12 text-white text-opacity-10 animate-float text-xl">★</div>
      </div>

      <div className="w-full max-w-xl z-10 flex flex-col items-center">
        {/* Title Screen header */}
        <span className="text-4xl animate-float mb-3">🏡✨</span>
        <h1 className="font-heading text-lg sm:text-xl text-center text-yellow-300 drop-shadow-md tracking-wider leading-relaxed">
          ABUL'S HEALING JOURNEY
        </h1>
        <p className="text-xs text-gray-400 font-sans text-center mt-2 max-w-sm mb-8">
          Masuki dunia damai penuh ketenangan. Pilih Slot Penyembuhanmu untuk memulai perjalanan indah ini.
        </p>

        {/* 3 Save Slots */}
        <div className="w-full flex flex-col gap-4">
          {slots.map((slot) => {
            return (
              <div
                key={slot.id}
                onClick={() => slot.exists ? handleContinue(slot) : handleStartNewGame(slot.id)}
                className={`pixel-box p-4 rounded-md transition-all relative group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:border-yellow-400 ${
                  slot.exists ? 'bg-[#2c2445]' : 'bg-[#181124] border-dashed border-gray-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{slot.exists ? '🎒' : '➕'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-xs text-white">SLOT {slot.id}</span>
                      {slot.exists ? (
                        <span className="bg-green-900 border border-green-600 text-green-300 text-[8px] font-heading px-1 py-0.5 rounded-sm">
                          AKTIF
                        </span>
                      ) : (
                        <span className="bg-slate-900 border border-gray-700 text-gray-500 text-[8px] font-heading px-1 py-0.5 rounded-sm">
                          KOSONG
                        </span>
                      )}
                    </div>
                    {slot.exists ? (
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-gray-300">
                        <span>Nama: <b className="text-yellow-300">{slot.name}</b></span>
                        <span>Level: <b className="text-pink-300">{slot.level}</b></span>
                        <span>Poin: <b className="text-green-300">{slot.totalPoints}</b></span>
                        <span>Kebun: <b className="text-cyan-300">Lv.{slot.gardenLevel}</b></span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 font-sans mt-1">Tekan untuk membuat game baru</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {slot.exists && (
                    <button
                      onClick={(e) => handleDelete(slot.id, e)}
                      className="pixel-btn bg-red-950 hover:bg-red-900 text-red-200 text-[9px] font-heading px-2 py-1 rounded-sm border-red-700"
                    >
                      HAPUS 🗑️
                    </button>
                  )}
                  <button
                    className={`pixel-btn text-[10px] font-heading px-4 py-2 rounded-sm w-full sm:w-auto ${
                      slot.exists 
                        ? 'bg-purple-600 text-white hover:bg-purple-500' 
                        : 'bg-yellow-600 text-white hover:bg-yellow-500'
                    }`}
                  >
                    {slot.exists ? 'LANJUT ▶' : 'BUAT 🎮'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <p className="text-[9px] font-mono text-gray-600 mt-10">
          PROSES DISIMPAN SECARA OTOMATIS (AUTO-SAVE) KE LOCAL STORAGE 💾
        </p>
      </div>

      {/* New Game Modal Popup */}
      {showNewGameModal !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4 animate-fade-in">
          <div className="pixel-box-cyan max-w-sm w-full p-5 rounded-md flex flex-col gap-4 text-center">
            <span className="text-3xl">🎒🌾</span>
            <h3 className="font-heading text-xs text-white">MASUKKAN NAMAMU</h3>
            <p className="text-xs text-gray-400">Siapakah nama petualang yang akan memulai perjalanan damai ini?</p>
            
            <input
              type="text"
              maxLength={15}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-slate-900 border-2 border-slate-700 text-yellow-300 text-center font-heading text-xs py-2 px-3 rounded-md w-full focus:outline-none focus:border-yellow-400 uppercase"
            />

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { sound.playSelect(); setShowNewGameModal(null); }}
                className="pixel-btn bg-slate-800 hover:bg-slate-700 text-white text-[10px] py-2 flex-1 font-heading"
              >
                BATAL
              </button>
              <button
                onClick={handleConfirmNewGame}
                className="pixel-btn bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] py-2 flex-1 font-heading"
              >
                MULAI GAME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
