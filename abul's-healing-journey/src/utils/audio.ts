// Web Audio API Retro Synthesizer and Sound Manager for Abul's Healing Journey

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private bgmVolume: GainNode | null = null;
  private sfxVolume: GainNode | null = null;
  private bgmInterval: any = null;
  private isMusicPlaying: boolean = false;
  private musicVolumeVal: number = 50; // 0-100
  private sfxVolumeVal: number = 70; // 0-100
  private isMusicOn: boolean = true;
  private isSfxOn: boolean = true;

  constructor() {
    // AudioContext is initialized lazily upon first interaction due to browser policies
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.connect(this.ctx.destination);
      this.masterVolume.gain.value = 1.0;

      this.bgmVolume = this.ctx.createGain();
      this.bgmVolume.connect(this.masterVolume);
      this.bgmVolume.gain.value = this.isMusicOn ? (this.musicVolumeVal / 100) * 0.3 : 0;

      this.sfxVolume = this.ctx.createGain();
      this.sfxVolume.connect(this.masterVolume);
      this.sfxVolume.gain.value = this.isSfxOn ? (this.sfxVolumeVal / 100) * 0.7 : 0;
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  setSettings(isMusicOn: boolean, isSfxOn: boolean, musicVol: number, sfxVol: number) {
    this.isMusicOn = isMusicOn;
    this.isSfxOn = isSfxOn;
    this.musicVolumeVal = musicVol;
    this.sfxVolumeVal = sfxVol;

    if (this.ctx) {
      if (this.bgmVolume) {
        this.bgmVolume.gain.setValueAtTime(isMusicOn ? (musicVol / 100) * 0.3 : 0, this.ctx.currentTime);
      }
      if (this.sfxVolume) {
        this.sfxVolume.gain.setValueAtTime(isSfxOn ? (sfxVol / 100) * 0.7 : 0, this.ctx.currentTime);
      }
    }

    if (isMusicOn && !this.isMusicPlaying) {
      this.startBGM();
    } else if (!isMusicOn && this.isMusicPlaying) {
      this.stopBGM();
    }
  }

  // Plays a sound effect with a list of notes: {freq, duration, type, delay}
  playTone(notes: { freq: number; duration: number; type?: OscillatorType; slideTo?: number }[]) {
    this.init();
    if (!this.ctx || !this.isSfxOn || !this.sfxVolume) return;

    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    let time = this.ctx.currentTime;
    notes.forEach((note) => {
      if (!this.ctx || !this.sfxVolume) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = note.type || 'sine';
      osc.frequency.setValueAtTime(note.freq, time);
      
      if (note.slideTo) {
        osc.frequency.exponentialRampToValueAtTime(note.slideTo, time + note.duration);
      }

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration);

      osc.connect(gain);
      gain.connect(this.sfxVolume);

      osc.start(time);
      osc.stop(time + note.duration);

      time += note.duration * 0.8; // slightly overlap notes
    });
  }

  playClick() {
    this.playTone([
      { freq: 400, duration: 0.05, type: 'sine' },
      { freq: 800, duration: 0.08, type: 'sine' }
    ]);
  }

  playSelect() {
    this.playTone([
      { freq: 600, duration: 0.06, type: 'triangle' }
    ]);
  }

  playSuccess() {
    this.playTone([
      { freq: 523.25, duration: 0.1, type: 'sine' }, // C5
      { freq: 659.25, duration: 0.1, type: 'sine' }, // E5
      { freq: 783.99, duration: 0.1, type: 'sine' }, // G5
      { freq: 1046.50, duration: 0.2, type: 'sine' } // C6
    ]);
  }

  playLevelUp() {
    this.playTone([
      { freq: 261.63, duration: 0.15, type: 'triangle' }, // C4
      { freq: 329.63, duration: 0.15, type: 'triangle' }, // E4
      { freq: 392.00, duration: 0.15, type: 'triangle' }, // G4
      { freq: 523.25, duration: 0.15, type: 'triangle' }, // C5
      { freq: 659.25, duration: 0.15, type: 'triangle' }, // E5
      { freq: 783.99, duration: 0.15, type: 'triangle' }, // G5
      { freq: 1046.50, duration: 0.4, type: 'sine', slideTo: 1500 } // C6 with high slide
    ]);
  }

  playAchievement() {
    this.playTone([
      { freq: 587.33, duration: 0.1, type: 'sine' }, // D5
      { freq: 587.33, duration: 0.05, type: 'sine' }, 
      { freq: 880.00, duration: 0.15, type: 'sine' }, // A5
      { freq: 783.99, duration: 0.1, type: 'sine' }, // G5
      { freq: 987.77, duration: 0.3, type: 'sine' } // B5
    ]);
  }

  playPop() {
    this.playTone([
      { freq: 600, duration: 0.05, type: 'sine', slideTo: 100 }
    ]);
  }

  playBomb() {
    this.playTone([
      { freq: 200, duration: 0.4, type: 'triangle', slideTo: 40 }
    ]);
  }

  playCollectStar() {
    this.playTone([
      { freq: 987.77, duration: 0.08, type: 'sine', slideTo: 1500 }
    ]);
  }

  playHit() {
    this.playTone([
      { freq: 150, duration: 0.15, type: 'triangle', slideTo: 20 }
    ]);
  }

  playPlant() {
    this.playTone([
      { freq: 300, duration: 0.1, type: 'triangle' },
      { freq: 450, duration: 0.15, type: 'sine' }
    ]);
  }

  playHarvest() {
    this.playTone([
      { freq: 440, duration: 0.1, type: 'sine' },
      { freq: 880, duration: 0.2, type: 'sine' }
    ]);
  }

  playLetter() {
    this.playTone([
      { freq: 349.23, duration: 0.1, type: 'sine' }, // F4
      { freq: 440.00, duration: 0.1, type: 'sine' }, // A4
      { freq: 523.25, duration: 0.2, type: 'sine' }  // C5
    ]);
  }

  playGameOver() {
    this.playTone([
      { freq: 392.00, duration: 0.15, type: 'sawtooth' }, // G4
      { freq: 349.23, duration: 0.15, type: 'sawtooth' }, // F4
      { freq: 311.13, duration: 0.2, type: 'sawtooth' },  // Eb4
      { freq: 246.94, duration: 0.4, type: 'sawtooth', slideTo: 150 }  // B3
    ]);
  }

  playVoucher() {
    this.playTone([
      { freq: 523.25, duration: 0.08, type: 'triangle' },
      { freq: 659.25, duration: 0.08, type: 'triangle' },
      { freq: 783.99, duration: 0.08, type: 'triangle' },
      { freq: 1046.50, duration: 0.08, type: 'triangle' },
      { freq: 1318.51, duration: 0.3, type: 'sine' }
    ]);
  }

  // Gentle procedural Background Music using a calming chord progression
  startBGM() {
    this.init();
    if (!this.isMusicOn || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    
    // Chord progression notes (soft soothing ambient pluck)
    // Cmaj7 (C, E, G, B), Fmaj7 (F, A, C, E), Am7 (A, C, E, G), G6 (G, B, D, E)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [349.23, 440.00, 261.63, 329.63], // Fmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [196.00, 246.94, 293.66, 329.63], // G6
    ];

    let chordIndex = 0;
    const playNextChord = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.bgmVolume) return;
      if (this.ctx.state === 'suspended') return;

      const time = this.ctx.currentTime;
      const notes = chords[chordIndex];

      // Arpeggiate the chord softly
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.bgmVolume) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time + idx * 0.15);
        
        // very slow fade in and fade out
        gain.gain.setValueAtTime(0, time + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.04, time + idx * 0.15 + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.15 + 2.5);

        osc.connect(gain);
        gain.connect(this.bgmVolume);

        osc.start(time + idx * 0.15);
        osc.stop(time + idx * 0.15 + 3.0);
      });

      chordIndex = (chordIndex + 1) % chords.length;
    };

    // Play immediately and then repeat every 3.5 seconds
    playNextChord();
    this.bgmInterval = setInterval(playNextChord, 3500);
  }

  stopBGM() {
    this.isMusicPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // Ensure context runs on user interaction
  interact() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isMusicOn && !this.isMusicPlaying) {
      this.startBGM();
    }
  }
}

export const sound = new SoundManager();
