// High-fidelity Web Audio API Engine for An Tâm
import { Haptics, ImpactStyle } from '@capacitor/haptics';
// Generates natural synthesized singing bowls, pink noise rain, soothing bamboo streams, theta binaural waves, and temple bells

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeGenerators: Map<string, { gain: GainNode; stop: () => void }> = new Map();
  private sleepTimerId: any = null;
  private fadeIntervalId: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a resonant Tibetan Singing Bowl note
  public playSingingBowl(freq = 216, duration = 6.0, volume = 0.7) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const partials = [
      { ratio: 1.0, amp: 1.0 },
      { ratio: 2.76, amp: 0.5 },
      { ratio: 5.4, amp: 0.25 },
      { ratio: 8.9, amp: 0.12 },
    ];

    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.exponentialRampToValueAtTime(volume, now + 0.08);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    voiceGain.connect(this.masterGain);

    partials.forEach(p => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p.ratio, now);
      pGain.gain.setValueAtTime(p.amp, now);

      osc.connect(pGain);
      pGain.connect(voiceGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  // Play a soft wooden temple block (Mõ thiền)
  public playWoodBlock(volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Start continuous rain ambient sound (synthesized pink noise with dynamic lowpass filter)
  public startRain(volume = 0.4): string {
    this.initContext();
    if (!this.ctx || !this.masterGain) return '';

    const trackId = 'rain';
    this.stopAmbient(trackId);

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();

    this.activeGenerators.set(trackId, {
      gain,
      stop: () => {
        try {
          whiteNoise.stop();
          whiteNoise.disconnect();
        } catch (e) {}
      },
    });

    return trackId;
  }

  // Start continuous bubbling water/stream sound
  public startStream(volume = 0.35): string {
    this.initContext();
    if (!this.ctx || !this.masterGain) return '';

    const trackId = 'stream';
    this.stopAmbient(trackId);

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // LFO to simulate water gurgling
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.7, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    this.activeGenerators.set(trackId, {
      gain,
      stop: () => {
        try {
          noise.stop();
          lfo.stop();
          noise.disconnect();
          lfo.disconnect();
        } catch (e) {}
      },
    });

    return trackId;
  }

  // Start Theta Binaural Drone (432 Hz + 438 Hz => 6 Hz Theta meditation state)
  public startThetaDrone(volume = 0.25): string {
    this.initContext();
    if (!this.ctx || !this.masterGain) return '';

    const trackId = 'theta_drone';
    this.stopAmbient(trackId);

    const now = this.ctx.currentTime;
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(216, now); // Sub-harmonic 432 / 2

    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(222, now); // 6 Hz binaural beat

    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);

    merger.connect(gain);
    gain.connect(this.masterGain);

    oscL.start();
    oscR.start();

    this.activeGenerators.set(trackId, {
      gain,
      stop: () => {
        try {
          oscL.stop();
          oscR.stop();
          oscL.disconnect();
          oscR.disconnect();
        } catch (e) {}
      },
    });

    return trackId;
  }

  // Periodic Singing Bowl Chimes (Loops every 12s)
  public startSingingBowlLoop(volume = 0.4): string {
    const trackId = 'singing_bowl';
    this.stopAmbient(trackId);

    this.playSingingBowl(216, 8.0, volume);
    const interval = setInterval(() => {
      const freqs = [216, 288, 324, 432];
      const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
      this.playSingingBowl(randomFreq, 9.0, volume);
    }, 12000);

    const dummyGain = this.ctx?.createGain() || null;

    this.activeGenerators.set(trackId, {
      gain: dummyGain!,
      stop: () => {
        clearInterval(interval);
      },
    });

    return trackId;
  }

  // Start Bamboo Wind ambient sound (modulated bandpass pink noise)
  public startBambooWind(volume = 0.35): string {
    this.initContext();
    if (!this.ctx || !this.masterGain) return '';

    const trackId = 'bamboo_wind';
    this.stopAmbient(trackId);

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // LFO for slow wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    this.activeGenerators.set(trackId, {
      gain,
      stop: () => {
        try {
          noise.stop();
          lfo.stop();
          noise.disconnect();
          lfo.disconnect();
        } catch (e) {}
      },
    });

    return trackId;
  }

  // Start Ocean Waves ambient sound (periodic low frequency surge)
  public startOceanWaves(volume = 0.35): string {
    this.initContext();
    if (!this.ctx || !this.masterGain) return '';

    const trackId = 'waves';
    this.stopAmbient(trackId);

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12-second wave period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    this.activeGenerators.set(trackId, {
      gain,
      stop: () => {
        try {
          noise.stop();
          lfo.stop();
          noise.disconnect();
          lfo.disconnect();
        } catch (e) {}
      },
    });

    return trackId;
  }

  // Start Morning Birds chirping generator
  public startMorningBirds(volume = 0.25): string {
    this.initContext();
    if (!this.ctx || !this.masterGain) return '';

    const trackId = 'birds';
    this.stopAmbient(trackId);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    gainNode.connect(this.masterGain);

    const playChirp = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const chirpGain = this.ctx.createGain();

      const baseFreq = 2600 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 700, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + 0.14);

      chirpGain.gain.setValueAtTime(0.001, now);
      chirpGain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(chirpGain);
      chirpGain.connect(gainNode);

      osc.start(now);
      osc.stop(now + 0.18);
    };

    const intervalId = setInterval(() => {
      if (Math.random() > 0.3) {
        playChirp();
        setTimeout(playChirp, 140);
        if (Math.random() > 0.5) setTimeout(playChirp, 320);
      }
    }, 4500);

    this.activeGenerators.set(trackId, {
      gain: gainNode,
      stop: () => {
        clearInterval(intervalId);
        gainNode.disconnect();
      },
    });

    return trackId;
  }

  // Play resonant Temple Bell (Đại hồng chung 108Hz)
  public playTempleBell(volume = 0.6) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const fundamental = 108; // 108 phiền não
    const partials = [
      { ratio: 1.0, amp: 1.0, decay: 10.0 },
      { ratio: 2.02, amp: 0.65, decay: 7.5 },
      { ratio: 3.01, amp: 0.35, decay: 5.0 },
      { ratio: 4.88, amp: 0.18, decay: 3.5 }
    ];

    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.exponentialRampToValueAtTime(volume, now + 0.03);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 10.0);
    voiceGain.connect(this.masterGain);

    partials.forEach(p => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * p.ratio, now);
      pGain.gain.setValueAtTime(p.amp, now);

      osc.connect(pGain);
      pGain.connect(voiceGain);

      osc.start(now);
      osc.stop(now + p.decay);
    });
  }

  // Play crystalline Wind Chimes (Chuông gió)
  public playWindChime(volume = 0.4) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chimeFreqs = [1568, 1760, 2093, 2349, 2793]; // G6, A6, C7, D7, F7
    const now = this.ctx.currentTime;

    chimeFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const offset = idx * 0.12 + Math.random() * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + offset);

      gain.gain.setValueAtTime(0.001, now + offset);
      gain.gain.exponentialRampToValueAtTime(volume * 0.3, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + offset);
      osc.stop(now + offset + 2.5);
    });
  }

  // Adjust volume for an active ambient track
  public setTrackVolume(trackId: string, volume: number) {
    const gen = this.activeGenerators.get(trackId);
    if (gen && gen.gain && this.ctx) {
      gen.gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  // Stop a specific ambient track
  public stopAmbient(trackId: string) {
    const gen = this.activeGenerators.get(trackId);
    if (gen) {
      gen.stop();
      this.activeGenerators.delete(trackId);
    }
  }

  // Stop all ambient tracks
  public stopAll() {
    this.activeGenerators.forEach((gen) => {
      gen.stop();
    });
    this.activeGenerators.clear();
    this.clearSleepTimer();
  }

  // Set Master Volume
  public setMasterVolume(vol: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  // Sleep Timer with smooth 30-second volume fade out
  public setSleepTimer(minutes: number, onComplete?: () => void) {
    this.clearSleepTimer();
    const durationMs = minutes * 60 * 1000;
    const fadeDurationMs = Math.min(30000, durationMs * 0.2);
    const startFadeMs = durationMs - fadeDurationMs;

    this.sleepTimerId = setTimeout(() => {
      // Begin fade out
      const startTime = Date.now();
      const initialVolume = this.masterGain?.gain.value || 0.8;

      this.fadeIntervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / fadeDurationMs;
        if (progress >= 1) {
          clearInterval(this.fadeIntervalId);
          this.stopAll();
          if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(initialVolume, this.ctx.currentTime);
          }
          if (onComplete) onComplete();
        } else {
          const currentVol = initialVolume * (1 - progress);
          if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(currentVol, this.ctx.currentTime);
          }
        }
      }, 200);
    }, startFadeMs);
  }

  public clearSleepTimer() {
    if (this.sleepTimerId) {
      clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    if (this.fadeIntervalId) {
      clearInterval(this.fadeIntervalId);
      this.fadeIntervalId = null;
    }
  }

  // 3D Spatial Audio & Dual-Carrier Binaural Beats Generator
  // Creates brainwave entrainment (Alpha, Theta, Delta, Gamma) with gentle 3D spherical acoustic movement
  public startBinauralBeats(
    carrierFreq = 216,
    beatFreq = 6.0,
    volume = 0.45,
    spatial3D = true
  ): string {
    this.initContext();
    if (!this.ctx || !this.masterGain) return '';

    const trackId = 'binaural_3d';
    this.stopAmbient(trackId);

    const now = this.ctx.currentTime;
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.exponentialRampToValueAtTime(volume, now + 1.5);

    // Left Ear Oscillator (Base Carrier)
    const leftOsc = this.ctx.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(carrierFreq, now);

    // Right Ear Oscillator (Carrier + Target Brainwave Beat)
    const rightOsc = this.ctx.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.setValueAtTime(carrierFreq + beatFreq, now);

    // Stereo Channel Merger (2 audio channels: 0 = L, 1 = R)
    const merger = this.ctx.createChannelMerger(2);
    const leftGain = this.ctx.createGain();
    const rightGain = this.ctx.createGain();
    leftGain.gain.setValueAtTime(0.5, now);
    rightGain.gain.setValueAtTime(0.5, now);

    leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0); // L channel

    rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1); // R channel

    let lastNode: AudioNode = merger;

    // Optional 3D Spatial Orbit Panner (gentle 360 drift around head)
    let lfoOsc: OscillatorNode | null = null;
    if (spatial3D && 'createStereoPanner' in this.ctx) {
      try {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(0, now);

        // Slow 0.04 Hz circular drifting LFO (25s per cycle)
        lfoOsc = this.ctx.createOscillator();
        lfoOsc.type = 'sine';
        lfoOsc.frequency.setValueAtTime(0.04, now);

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.35, now);

        lfoOsc.connect(lfoGain);
        lfoGain.connect(panner.pan);
        lfoOsc.start(now);

        merger.connect(panner);
        lastNode = panner;
      } catch (e) {
        merger.connect(voiceGain);
        lastNode = merger;
      }
    }

    lastNode.connect(voiceGain);
    voiceGain.connect(this.masterGain);

    leftOsc.start(now);
    rightOsc.start(now);

    this.activeGenerators.set(trackId, {
      gain: voiceGain,
      stop: () => {
        try {
          leftOsc.stop();
          rightOsc.stop();
          if (lfoOsc) lfoOsc.stop();
        } catch (e) {}
      }
    });

    return trackId;
  }

  public stopBinauralBeats() {
    this.stopAmbient('binaural_3d');
  }

  // Speak meditation instructions / scriptures using Web Speech API with Vietnamese voice
  public speakText(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.85; // Slow, gentle zen pace
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VIE'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Native Capacitor Haptic feedback for breathing & bells with web fallback
  public async triggerHaptic(pattern: number | number[] = 40) {
    try {
      if (Array.isArray(pattern)) {
        await Haptics.vibrate({ duration: pattern[0] || 40 });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch (err) {}
      }
    }
  }

  // Update MediaSession for OS lock screen & background controls
  public updateMediaSession(title: string, artist: string, album: string, artworkUrl: string, onPlayPause?: () => void) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: [
          { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      if (onPlayPause) {
        navigator.mediaSession.setActionHandler('play', onPlayPause);
        navigator.mediaSession.setActionHandler('pause', onPlayPause);
      }
    }
  }
}

export const soundEngine = new SoundEngine();
