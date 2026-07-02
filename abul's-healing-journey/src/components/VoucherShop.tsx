import { useState } from 'react';
import { GameState, Voucher } from '../types';
import { sound } from '../utils/audio';

interface VoucherShopProps {
  gameState: GameState;
  onUpdateState: (newState: GameState) => void;
  onAddLog: (text: string, coins: number, icon: string) => void;
}

export default function VoucherShop({ gameState, onUpdateState, onAddLog }: VoucherShopProps) {
  const [whatsappNumber, setWhatsappNumber] = useState('628123456789'); // default Indonesian template number
  const [showConfig, setShowConfig] = useState(false);

  const handleClaim = (voucher: Voucher) => {
    if (gameState.totalPoints < voucher.costPoints) return;

    sound.playVoucher();

    // 1. Deduct points, mark claimed, and log
    const updatedState = { ...gameState };
    updatedState.totalPoints -= voucher.costPoints;
    
    // Mark voucher as claimed in history
    updatedState.vouchers = updatedState.vouchers.map((v) => {
      if (v.id === voucher.id) {
        return { ...v, claimed: true, claimDate: new Date().toLocaleDateString('id-ID') };
      }
      return v;
    });

    updatedState.stats.vouchersClaimedCount += 1;

    // Trigger secret letter unlock for first claim
    if (updatedState.stats.vouchersClaimedCount === 1) {
      const letterIndex = updatedState.secretLetters.findIndex((l) => l.id === 8);
      if (letterIndex !== -1 && !updatedState.secretLetters[letterIndex].unlocked) {
        updatedState.secretLetters[letterIndex].unlocked = true;
        sound.playLetter();
        onAddLog('✉️ Surat Baru Terbuka! Periksa Kotak Suratmu 📬', 0, '✉️');
      }
    }

    // Achievements checking
    updatedState.achievements = updatedState.achievements.map((ach) => {
      if (ach.category === 'voucher') {
        const nextProg = Math.min(updatedState.stats.vouchersClaimedCount, ach.target);
        const isNewlyUnlocked = nextProg >= ach.target && !ach.unlocked;
        if (isNewlyUnlocked) {
          sound.playAchievement();
          onAddLog(`🏆 Achievement: ${ach.title} Unlocked!`, ach.rewardPoints, '⭐');
          updatedState.totalPoints += ach.rewardPoints;
        }
        return { ...ach, progress: nextProg, unlocked: nextProg >= ach.target };
      }
      return ach;
    });

    onUpdateState(updatedState);
    onAddLog(`🎁 Voucher Di-Klaim: ${voucher.name}!`, 0, '🎁');

    // 2. Format WhatsApp Text and Open WA
    const message = `Halo Admin! Saya ${gameState.playerName} ingin mengklaim Voucher "${voucher.name}" senilai ${voucher.costPoints} Poin dari game Abul's Healing Journey! Tolong diproses ya, terima kasih! 💖`;
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="w-full flex flex-col p-2 select-none" id="voucher-shop-container">
      {/* Page Header */}
      <div className="pixel-box-pink p-3 rounded-md mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">VOUCHER REWARD SHOP</h2>
            <p className="text-xs text-pink-200 mt-1">Tukarkan poin hasil penyembuhanmu dengan hadiah manis!</p>
          </div>
        </div>
        
        <button 
          onClick={() => { sound.playSelect(); setShowConfig(!showConfig); }}
          className="pixel-btn bg-pink-900 text-pink-100 hover:bg-pink-800 px-3 py-1 font-heading text-[8px] rounded-sm"
        >
          {showConfig ? 'TUTUP SETTING' : 'SETTING NO WA'}
        </button>
      </div>

      {/* WhatsApp Configuration Bar */}
      {showConfig && (
        <div className="pixel-box-cyan p-3 rounded-md mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1e2a38]">
          <div className="text-xs text-cyan-200">
            <span className="font-bold">Konfigurasi Tujuan WhatsApp:</span> Masukkan nomor telepon admin lengkap dengan kode negara (contoh: 628123456789) tanpa tanda '+' atau spasi.
          </div>
          <input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="Kode Negara + Nomor WA"
            className="bg-slate-950 border-2 border-slate-800 text-yellow-300 font-mono text-xs py-1.5 px-3 rounded-sm focus:outline-none focus:border-cyan-400 w-full sm:w-48 text-center"
          />
        </div>
      )}

      {/* Current Points Meter */}
      <div className="pixel-box p-3 rounded-md mb-4 flex justify-between items-center bg-[#211a36]">
        <span className="text-xs text-gray-300">Poin Tersedia untuk Penukaran:</span>
        <div className="flex items-center gap-2 font-heading text-xs text-yellow-300 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-md">
          <span>⭐</span>
          <span>{gameState.totalPoints.toLocaleString('id-ID')} Poin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voucher Cards Column */}
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-[10px] text-pink-400">DAFTAR HADIAH VOUCHER</h3>
          
          {gameState.vouchers.map((voucher) => {
            const isAffordable = gameState.totalPoints >= voucher.costPoints;
            return (
              <div
                key={voucher.id}
                className={`pixel-box p-3.5 rounded-md flex items-center justify-between gap-3 transition-all ${
                  voucher.claimed 
                    ? 'border-green-800 bg-[#16291d] opacity-90' 
                    : 'bg-[#2c2445]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-float p-1 bg-slate-900/40 rounded-md border border-slate-800">{voucher.icon}</span>
                  <div>
                    <h4 className="font-heading text-[9px] text-white tracking-wide">{voucher.name}</h4>
                    <p className="text-xs text-pink-300 mt-1.5 font-mono">
                      Harga: <b className="text-yellow-400">{voucher.costPoints} Poin</b>
                    </p>
                  </div>
                </div>

                <div>
                  {voucher.claimed ? (
                    <span className="bg-green-950 text-green-300 border border-green-700 font-heading text-[8px] px-2 py-1.5 rounded-sm">
                      SUDAH DIKLAIM ✅
                    </span>
                  ) : (
                    <button
                      disabled={!isAffordable}
                      onClick={() => handleClaim(voucher)}
                      className={`pixel-btn font-heading text-[8px] px-3.5 py-2.5 rounded-sm ${
                        isAffordable 
                          ? 'bg-pink-600 hover:bg-pink-500 text-white cursor-pointer' 
                          : 'bg-slate-800 text-gray-500 cursor-not-allowed border-dashed'
                      }`}
                    >
                      {isAffordable ? 'KLAIM ➔' : 'POIN KURANG'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Claim History Column */}
        <div className="pixel-box p-4 rounded-md flex flex-col justify-between gap-4 bg-slate-950">
          <div>
            <h3 className="font-heading text-[10px] text-pink-400 border-b border-gray-800 pb-2 mb-3">RIWAYAT PENUKARAN VOUCHER</h3>
            
            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
              {gameState.vouchers.filter(v => v.claimed).length > 0 ? (
                gameState.vouchers.filter(v => v.claimed).map((voucher) => (
                  <div key={voucher.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-sm flex items-center justify-between text-xs text-gray-300">
                    <span className="flex items-center gap-2">
                      <span>{voucher.icon}</span>
                      <span className="font-bold">{voucher.name.split(' ')[0]}</span>
                    </span>
                    <div className="flex flex-col items-end font-mono text-[10px] text-gray-500">
                      <span className="text-green-400">-{voucher.costPoints} pts</span>
                      <span>Klaim: {voucher.claimDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-gray-500 py-12">
                  <span className="text-3xl animate-float block mb-1">📦</span>
                  Belum ada voucher yang diklaim. Kumpulkan koin dan beli voucher pertamamu!
                </div>
              )}
            </div>
          </div>

          <div className="bg-pink-900/20 border border-pink-700/40 p-3 rounded-md text-[10px] text-pink-200 leading-relaxed font-sans">
            <span className="font-bold text-yellow-300">CARA KLAIM:</span> Ketika kamu menekan tombol <b className="text-white">KLAIM</b>, poinmu akan langsung dikurangi dan riwayat klaim tersimpan. Browser akan otomatis mengarahkan ke nomor WhatsApp Admin dengan template pesan yang telah disediakan untuk konfirmasi pengiriman hadiah secara manual!
          </div>
        </div>
      </div>
    </div>
  );
}
