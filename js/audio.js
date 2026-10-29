/**
 * Potter's Global Prayer Ministry - Sacred Ambient Audio Engine
 * Pure Web Audio API synthesized choir & prayer pad (No external MP3 dependencies).
 * Generates an ethereal, warm 432Hz meditative drone chord progression.
 */

class SanctuaryAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.filter = null;
    this.oscillators = [];
    this.chordIndex = 0;
    this.timer = null;

    // Sacred chord progression (D minor, F major, Bb major, C major, A minor modal frequencies)
    this.chords = [
      [146.83, 220.00, 261.63, 349.23, 440.00], // D3, A3, C4, F4, A4
      [174.61, 220.00, 261.63, 349.23, 523.25], // F3, A3, C4, F4, C5
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bb2, F3, Bb3, D4, F4
      [130.81, 196.00, 261.63, 329.63, 392.00], // C3, G3, C4, E4, G4
      [110.00, 164.81, 220.00, 261.63, 329.63]  // A2, E3, A3, C4, E4
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    // Warm sanctuary acoustic low-pass filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(550, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Gentle stereo panner if available
    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  start() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Smooth fade in
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 3.0);

    this.playChord(this.chords[this.chordIndex]);
    this.scheduleNextChords();
  }

  playChord(frequencies) {
    if (!this.ctx || !this.isPlaying) return;

    // Smoothly release previous voices
    const now = this.ctx.currentTime;
    const oldOscs = [...this.oscillators];
    this.oscillators = [];

    oldOscs.forEach(o => {
      try {
        o.gainNode.gain.cancelScheduledValues(now);
        o.gainNode.gain.setValueAtTime(o.gainNode.gain.value, now);
        o.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
        setTimeout(() => {
          try {
            o.osc.stop();
            o.osc.disconnect();
          } catch(e) {}
        }, 3600);
      } catch (e) {}
    });

    // Create new warm voices
    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      // Alternate waveform for organic orchestral texture
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      
      // Slight detune for angelic chorus shimmer
      const detuneCents = (Math.random() - 0.5) * 8;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneCents, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      // Soft staggered attack
      gainNode.gain.exponentialRampToValueAtTime(0.08 / frequencies.length, now + 2.5 + (idx * 0.2));

      osc.connect(gainNode);
      gainNode.connect(this.filter);

      osc.start(now);
      this.oscillators.push({ osc, gainNode });
    });
  }

  scheduleNextChords() {
    if (!this.isPlaying) return;

    this.timer = setTimeout(() => {
      if (!this.isPlaying) return;
      this.chordIndex = (this.chordIndex + 1) % this.chords.length;
      this.playChord(this.chords[this.chordIndex]);
      this.scheduleNextChords();
    }, 7000);
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    setTimeout(() => {
      this.oscillators.forEach(o => {
        try {
          o.osc.stop();
          o.osc.disconnect();
        } catch(e) {}
      });
      this.oscillators = [];
    }, 2200);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  setVolume(val) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0.0001, Math.min(1, val));
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(clamped * 0.25, this.ctx.currentTime + 0.1);
  }
}

window.sanctuaryAudio = new SanctuaryAudioEngine();
