import { useState } from 'react';
import { GameState, GameSettings } from '../types';
import { sound } from '../utils/audio';

interface SettingsProps {
  gameState: GameState;
  onUpdateState: (newState: GameState) => void;
  onResetSlot: () => void;
}

export default function Settings({ gameState, onUpdateState, onResetSlot }: SettingsProps) {
  const [settings, setSettings] = useState<GameSettings>(gameState.settings);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    sound.playSelect();
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);

    // Update sound manager values instantly
    sound.setSettings(
      nextSettings.isMusicOn,
      nextSettings.isSfxOn,
      nextSettings.musicVolume,
      nextSettings.sfxVolume
    );

    // Save back to main state
    const nextState = { ...gameState };
    nextState.settings = nextSettings;
    onUpdateState(nextState);
  };

  const handleToggleFullscreen = () => {
    updateSetting('isFullscreen', !settings.isFullscreen);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen mode', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleReset = () => {
    if (confirm("Peringatan Kritis! Apakah kamu benar-benar ingin mereset seluruh progres petualangan penyembuhanmu di slot ini? Semua pencapaian, koin, surat rahasia, dan level kebunmu akan dikosongkan!")) {
      if (confirm("Konfirmasi Terakhir: Anda yakin? Tindakan ini tidak dapat dibatalkan!")) {
        sound.playBomb();
        onResetSlot();
      }
    }
  };

  return (
    <div className="w-full flex flex-col p-2 select-none" id="settings-container">
      {/* Header */}
      <div className="pixel-box p-3 rounded-md mb-4 bg-[#1e102d] border-[#3e1d52]">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <div>
            <h2 className="font-heading text-xs text-white tracking-wider">GAME SETTINGS</h2>
            <p className="text-xs text-purple-300 mt-1">Konfigurasikan audio, visual, dan kelola slot penyimpanan datamu.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audio Configuration Column */}
        <div className="pixel-box p-4 rounded-md bg-[#261f3d] flex flex-col gap-4">
          <h3 className="font-heading text-[10px] text-purple-300 border-b border-gray-700 pb-2 mb-1">KONFIGURASI AUDIO</h3>
          
          {/* Music Toggle & Volume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-gray-200 font-bold">
              <span>MUTE MUSIK RETRO 🎵</span>
              <button
                onClick={() => updateSetting('isMusicOn', !settings.isMusicOn)}
                className={`pixel-btn text-[9px] font-heading px-3 py-1.5 rounded-sm ${
                  settings.isMusicOn ? 'bg-green-700 text-white' : 'bg-red-800 text-white'
                }`}
              >
                {settings.isMusicOn ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-gray-500 font-mono w-8">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) => updateSetting('musicVolume', parseInt(e.target.value, 10))}
                className="flex-1 accent-purple-500 bg-slate-950 h-2 rounded-sm cursor-pointer"
              />
              <span className="text-[10px] text-gray-300 font-mono w-10 text-right">{settings.musicVolume}%</span>
            </div>
          </div>

          <hr className="border-gray-800" />

          {/* SFX Toggle & Volume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-gray-200 font-bold">
              <span>EFEK SUARA (SFX) 🔊</span>
              <button
                onClick={() => updateSetting('isSfxOn', !settings.isSfxOn)}
                className={`pixel-btn text-[9px] font-heading px-3 py-1.5 rounded-sm ${
                  settings.isSfxOn ? 'bg-green-700 text-white' : 'bg-red-800 text-white'
                }`}
              >
                {settings.isSfxOn ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-gray-500 font-mono w-8">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sfxVolume}
                onChange={(e) => updateSetting('sfxVolume', parseInt(e.target.value, 10))}
                className="flex-1 accent-pink-500 bg-slate-950 h-2 rounded-sm cursor-pointer"
              />
              <span className="text-[10px] text-gray-300 font-mono w-10 text-right">{settings.sfxVolume}%</span>
            </div>
          </div>
        </div>

        {/* Visual & Slot Configuration Column */}
        <div className="pixel-box p-4 rounded-md bg-slate-950 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-[10px] text-purple-300 border-b border-gray-800 pb-2 mb-1">LAINNYA</h3>
            
            {/* Fullscreen Option */}
            <div className="flex items-center justify-between text-xs text-gray-200">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">LAYAR PENUH (FULLSCREEN)</span>
                <span className="text-[10px] text-gray-500">Maksimal layar agar game terasa lebih imersif.</span>
              </div>
              <button
                onClick={handleToggleFullscreen}
                className="pixel-btn bg-purple-700 text-white text-[9px] font-heading px-3 py-2 rounded-sm hover:bg-purple-650"
              >
                {settings.isFullscreen ? 'EXIT' : 'ENTER'}
              </button>
            </div>

            <hr className="border-gray-800" />

            {/* Theme selection */}
            <div className="flex items-center justify-between text-xs text-gray-200">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">TEMA VISUAL BACKGROUND</span>
                <span className="text-[10px] text-gray-500">Pilih gradien langit-langit yang menenangkan.</span>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value as any)}
                className="bg-slate-900 border-2 border-slate-800 text-yellow-300 text-xs font-heading py-1 px-2 rounded-sm focus:outline-none"
              >
                <option value="default">TWILIGHT</option>
                <option value="cozy">WARM COZY</option>
                <option value="twilight">COSMIC DUSK</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <button
              onClick={handleReset}
              className="pixel-btn bg-red-850 hover:bg-red-800 text-white text-[10px] font-heading py-3.5 w-full rounded-sm"
            >
              HAPUS PROGRESS DI SLOT INI ⚠️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
