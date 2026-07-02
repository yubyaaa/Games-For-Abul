import { useState } from 'react';
import { GameState, SecretLetter } from '../types';
import { sound } from '../utils/audio';

interface SecretLettersProps {
  gameState: GameState;
}

export default function SecretLetters({ gameState }: SecretLettersProps) {
  const [selectedLetter, setSelectedLetter] = useState<SecretLetter | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenLetter = (letter: SecretLetter) => {
    if (!letter.unlocked) return;
    
    sound.playLetter();
    setIsOpening(true);
    setSelectedLetter(letter);

    // delay slightly to simulate paper slide out animation
    setTimeout(() => {
      setIsOpening(false);
    }, 850);
  };

  const totalUnlocked = gameState.secretLetters.filter(l => l.unlocked).length;

  return (
    <div className="w-full flex flex-col p-2 select-none" id="secret-letters-container">
      {/* Header */}
      <div className="pixel-box p-3 rounded-md mb-4 bg-[#3a2010] border-[#664422]">
        <div className="flex items-center gap-2">
          <span className="text-xl">✉️</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">KOTAK SURAT RAHASIA</h2>
            <p className="text-xs text-amber-200 mt-1">Buka dan baca surat-surat penuh kehangatan yang dikirim khusus untukmu!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Letters List Column */}
        <div className="md:col-span-5 pixel-box p-3 rounded-md bg-[#2a1b12] flex flex-col gap-2 max-h-[460px] overflow-y-auto">
          <div className="flex justify-between items-center mb-1 pb-2 border-b border-amber-900">
            <h3 className="font-heading text-[10px] text-amber-400">DAFTAR SURAT</h3>
            <span className="font-mono text-[10px] text-yellow-300">📬 Unlocked: {totalUnlocked} / 10</span>
          </div>

          <div className="flex flex-col gap-2">
            {gameState.secretLetters.map((letter) => {
              return (
                <div
                  key={letter.id}
                  onClick={() => handleOpenLetter(letter)}
                  className={`border-2 p-2.5 rounded-sm flex items-center justify-between transition-all cursor-pointer ${
                    letter.unlocked 
                      ? selectedLetter?.id === letter.id
                        ? 'border-yellow-400 bg-amber-950/40'
                        : 'border-amber-800 bg-amber-950/20 hover:border-yellow-600'
                      : 'border-dashed border-gray-800 bg-slate-950/45 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-2xl">{letter.unlocked ? '✉️' : '🔒'}</span>
                    <div className="truncate">
                      <h4 className="font-heading text-[8px] text-white tracking-wide truncate">
                        {letter.unlocked ? letter.title : 'SURAT TERKUNCI'}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 truncate">Dari: {letter.unlocked ? letter.sender : '???'}</p>
                    </div>
                  </div>

                  {!letter.unlocked && (
                    <span className="font-mono text-[8px] text-amber-500 text-right shrink-0 bg-slate-900 px-1 py-0.5 rounded-sm">
                      {letter.milestoneDesc}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Letter Reading & Visual Envelope Opening Arena */}
        <div className="md:col-span-7 pixel-box p-4 rounded-md min-h-[380px] bg-slate-950 flex flex-col justify-between relative overflow-hidden">
          {selectedLetter ? (
            isOpening ? (
              /* Envelope Opening Animation State */
              <div className="m-auto flex flex-col items-center justify-center text-center gap-4">
                <div className="w-24 h-16 bg-amber-250 border-4 border-amber-900 rounded-sm relative flex flex-col items-center justify-center animate-bounce shadow-xl">
                  {/* Visual Envelope triangular flap swinging */}
                  <div className="absolute top-0 inset-x-0 h-0 border-t-[32px] border-t-amber-800 border-x-[48px] border-x-transparent origin-top transform transition-transform duration-500 scale-y-[-1] translate-y-[-32px]" />
                  <span className="text-2xl z-20">📜</span>
                </div>
                <span className="font-heading text-[9px] text-amber-400 animate-pulse mt-4">MEMBUKA AMPLOP SURAT...</span>
              </div>
            ) : (
              /* Letter Parchment Content View */
              <div className="flex flex-col justify-between h-full gap-4 animate-fade-in bg-[#fdf6e2] text-[#3c2f1b] border-4 border-[#d3bca2] p-5 rounded-md shadow-inner">
                <div className="flex flex-col gap-2 font-serif text-sm">
                  <div className="flex justify-between items-center border-b-2 border-[#d3bca2]/60 pb-2 mb-2 font-mono text-xs text-gray-600">
                    <span className="font-bold">#Surat Rahasia {selectedLetter.id}</span>
                    <span>Pengirim: {selectedLetter.sender}</span>
                  </div>
                  
                  <h3 className="font-heading text-xs text-[#543b17] tracking-wider mb-2">{selectedLetter.title}</h3>
                  
                  <p className="whitespace-pre-line leading-relaxed italic text-gray-800 select-text font-serif">
                    {selectedLetter.content}
                  </p>
                </div>

                <div className="flex justify-end pt-2 border-t border-[#d3bca2]/60 mt-4">
                  <button
                    onClick={() => { sound.playSelect(); setSelectedLetter(null); }}
                    className="pixel-btn bg-amber-900 hover:bg-amber-800 text-amber-100 text-[8px] font-heading px-3 py-1.5 rounded-sm"
                  >
                    LIPAT SURAT 📁
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="m-auto text-center text-xs text-gray-500 py-16 px-6">
              <span className="text-4xl animate-float block mb-2">📬</span>
              Pilih salah satu surat yang sudah terbuka di daftar sebelah kiri untuk membacanya. 
              <p className="mt-2 text-[11px] text-gray-600 font-sans max-w-sm">
                Kamu bisa membuka surat baru dengan meningkatkan Player Level atau mencapai target di mini-game kebun kedamaian!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
