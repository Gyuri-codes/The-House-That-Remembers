/**
 * Procedural Web Audio horror sound engine
 * Completely self-contained, instant playback, zero lag.
 */

class HorrorAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Active ambient nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private heartbeatInterval: number | null = null;
  private clockInterval: number | null = null;

  public masterVolume = 0.8;
  public sfxVolume = 0.9;
  public musicVolume = 0.7;
  private isMuted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateVolumes(master: number, music: number, sfx: number) {
    this.masterVolume = master;
    this.musicVolume = music;
    this.sfxVolume = sfx;
    if (this.ctx && this.masterGain && this.ambientGain && this.sfxGain && this.musicGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(master, now, 0.05);
      this.ambientGain.gain.setTargetAtTime(music * 0.7, now, 0.05);
      this.musicGain.gain.setTargetAtTime(music, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(sfx, now, 0.05);
    }
  }

  // Start dark, psychological ambient drone
  public startAmbientDrone(intensity = 0.5) {
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;

    this.stopAmbientDrone();

    const t = this.ctx.currentTime;

    // Sub oscillator
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(45, t);

    // Detuned sub oscillator
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(43.5, t);

    // Low-pass filter for ominous rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(90 + intensity * 60, t);
    filter.Q.setValueAtTime(4, t);

    // LFO to slowly modulate filter cutoff (unsettling breathing feeling)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, t);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(35, t);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.28 * intensity, t + 3);

    this.droneOsc1.connect(filter);
    this.droneOsc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    lfo.start();
  }

  public stopAmbientDrone() {
    if (this.droneOsc1) {
      try {
        this.droneOsc1.stop();
        this.droneOsc1.disconnect();
      } catch {}
      this.droneOsc1 = null;
    }
    if (this.droneOsc2) {
      try {
        this.droneOsc2.stop();
        this.droneOsc2.disconnect();
      } catch {}
      this.droneOsc2 = null;
    }
  }

  // Heartbeat sound that speeds up with fear
  public startHeartbeat(bpm = 70) {
    this.stopHeartbeat();
    this.playHeartbeatThump();

    const intervalMs = (60 / bpm) * 1000;
    this.heartbeatInterval = window.setInterval(() => {
      this.playHeartbeatThump();
    }, intervalMs);
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public playHeartbeatThump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const playThump = (time: number, freq: number, duration: number, vol: number) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(25, time + duration);

      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(time);
      osc.stop(time + duration);
    };

    // "Lub-dub" double pulse
    playThump(t, 85, 0.15, 0.35);
    playThump(t + 0.14, 75, 0.18, 0.28);
  }

  // Footstep audio (wood / concrete)
  public playFootstep(surface: 'wood' | 'concrete' | 'carpet' = 'wood') {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const baseFreq = surface === 'wood' ? 70 : 120;
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 20, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(surface === 'wood' ? 400 : 800, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // Grandfather Clock Tick
  public playClockTick(isHigh = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isHigh ? 980 : 820, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Creaking Door sound
  public playDoorCreak() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(260, t + 0.4);
    osc.frequency.linearRampToValueAtTime(180, t + 0.9);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);
    filter.Q.setValueAtTime(8, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.2);
    gain.gain.linearRampToValueAtTime(0.001, t + 1.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.2);
  }

  // Door Slam
  public playDoorSlam() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.55);
  }

  // Water drip (Basement)
  public playWaterDrip() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const pitch = 1400 + Math.random() * 600;
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Music box note chime (Notes: 1=E5, 2=G5, 3=B5, 4=D6)
  public playMusicBoxNote(noteIndex: number) {
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    const frequencies = [659.25, 783.99, 987.77, 1174.66]; // E5, G5, B5, D6
    const freq = frequencies[(noteIndex - 1) % frequencies.length] || 659.25;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Bell envelope
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 1.7);
  }

  // Creepy music box full lullaby
  public playMusicBoxLullaby(onComplete?: () => void) {
    const sequence = [1, 3, 2, 4, 3, 1, 2];
    sequence.forEach((note, index) => {
      window.setTimeout(() => {
        this.playMusicBoxNote(note);
        if (index === sequence.length - 1 && onComplete) {
          window.setTimeout(onComplete, 1200);
        }
      }, index * 420);
    });
  }

  // VHS Tape / CRT TV Static
  public playVhsStatic(durationMs = 2500): () => void {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return () => {};

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();

    const stop = () => {
      try {
        gain.gain.setTargetAtTime(0.001, this.ctx?.currentTime || 0, 0.1);
        setTimeout(() => {
          noise.stop();
          noise.disconnect();
        }, 150);
      } catch {}
    };

    if (durationMs > 0) {
      setTimeout(stop, durationMs);
    }

    return stop;
  }

  // Whispers / Chilling breath
  public playWhisper(phrase: 'you_came_back' | 'behind_you' | 'stay' | 'dont_leave' = 'you_came_back') {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Synthesize vocal formants using filtered noise
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const formant1 = this.ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.setValueAtTime(phrase === 'behind_you' ? 900 : 750, t);
    formant1.Q.setValueAtTime(12, t);

    const formant2 = this.ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.setValueAtTime(phrase === 'behind_you' ? 1800 : 1500, t);
    formant2.Q.setValueAtTime(8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.26, t + 0.3);
    gain.gain.linearRampToValueAtTime(0.001, t + 1.4);

    noise.connect(formant1);
    noise.connect(formant2);
    formant1.connect(gain);
    formant2.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 1.5);
  }

  // Terrifying Jumpscare Stinger
  public playJumpscareStinger() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Screeching dissonant chord (FM cluster)
    const freqs = [310, 329, 620, 659, 1240, 1318];
    freqs.forEach((f) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.linearRampToValueAtTime(f * 1.3, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.8);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.95);
    });

    // Heavy bass drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.7);

    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(t);
    subOsc.stop(t + 0.85);
  }

  // Scratching sound inside wall
  public playScratching() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.08);
    osc.frequency.linearRampToValueAtTime(2200, t + 0.16);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Clue found / Item pickup chime
  public playItemPickup() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, t);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.18);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const horrorAudio = new HorrorAudioEngine();
