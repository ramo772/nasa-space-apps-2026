/**
 * All sound is synthesized here with the Web Audio API, so the game ships no recorded or third-party
 * audio. Written for this project. Important sounds are always captioned on screen.
 */

export type Channel = "music" | "tones" | "effects";
export type Levels = Record<Channel, number>;
export type Cue =
  | "select"
  | "confirm"
  | "delta"
  | "connection"
  | "warning"
  | "source"
  | "chirp"
  | "burn"
  | "reveal"
  | "resolve"
  | "encourage"
  | "clack";

const PULSE = [0, null, 7, null, 12, null, 7, 10, 0, null, 7, null, 12, 14, 10, 7] as const;
const BASS = [0, null, null, null, 0, null, null, null, -5, null, null, null, -2, null, null, null] as const;
const ROOT_HZ = 196;

const note = (semitones: number) => ROOT_HZ * 2 ** (semitones / 12);

class AudioManager {
  private context: AudioContext | null = null;
  private buses: Partial<Record<Channel, GainNode>> = {};
  private levels: Levels = { music: 0.6, tones: 0.8, effects: 0.8 };
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;

  /** Browsers only allow audio after a user gesture, so call this from a click or key press. */
  unlock() {
    if (!this.context) {
      const Context = window.AudioContext;
      if (!Context) return;
      this.context = new Context();
      for (const channel of ["music", "tones", "effects"] as const) {
        const bus = this.context.createGain();
        bus.gain.value = this.levels[channel];
        bus.connect(this.context.destination);
        this.buses[channel] = bus;
      }
    }
    if (this.context.state === "suspended") void this.context.resume();
  }

  setLevels(levels: Levels) {
    this.levels = levels;
    for (const channel of ["music", "tones", "effects"] as const) {
      const bus = this.buses[channel];
      if (bus && this.context) bus.gain.setTargetAtTime(levels[channel], this.context.currentTime, 0.02);
    }
  }

  private tone(channel: Channel, frequency: number, at: number, length: number, volume: number, type: OscillatorType = "sine", endFrequency?: number) {
    const bus = this.buses[channel];
    if (!this.context || !bus) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + length);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    oscillator.connect(gain).connect(bus);
    oscillator.start(at);
    oscillator.stop(at + length + 0.02);
  }

  private noise(channel: Channel, at: number, length: number, volume: number, cutoff: number) {
    const bus = this.buses[channel];
    if (!this.context || !bus) return;
    const buffer = this.context.createBuffer(1, Math.max(1, Math.floor(this.context.sampleRate * length)), this.context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(volume, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    source.connect(filter).connect(gain).connect(bus);
    source.start(at);
  }

  /** A quiet plucked pulse and warm bass, with a look-ahead scheduler so timing does not drift. */
  startMusic() {
    if (!this.context || this.timer !== null) return;
    this.nextTime = this.context.currentTime + 0.1;
    const stepLength = 0.27;
    this.timer = window.setInterval(() => {
      const context = this.context;
      if (!context) return;
      while (this.nextTime < context.currentTime + 0.2) {
        const at = this.nextTime;
        const pluck = PULSE[this.step % PULSE.length];
        const bass = BASS[this.step % BASS.length];
        if (pluck !== null && pluck !== undefined) this.tone("music", note(pluck), at, 0.32, 0.05, "triangle");
        if (bass !== null && bass !== undefined) this.tone("music", note(bass) / 2, at, 0.8, 0.07, "sine");
        if (this.step % 4 === 2) this.noise("music", at, 0.05, 0.03, 2400);
        this.step += 1;
        this.nextTime += stepLength;
      }
    }, 40);
  }

  stopMusic() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  play(cue: Cue) {
    const context = this.context;
    if (!context) return;
    const now = context.currentTime + 0.005;
    switch (cue) {
      case "select":
        this.noise("effects", now, 0.03, 0.06, 3000);
        break;
      case "confirm":
        this.noise("effects", now, 0.06, 0.14, 1400);
        this.tone("effects", 130, now, 0.12, 0.16, "square", 90);
        break;
      case "delta":
        this.tone("effects", 520, now, 0.1, 0.04);
        break;
      case "connection":
        this.tone("tones", note(12), now, 0.14, 0.09);
        this.tone("tones", note(19), now + 0.11, 0.24, 0.09);
        break;
      case "warning":
        this.tone("tones", 150, now, 0.4, 0.16, "sine", 120);
        break;
      case "source":
        this.noise("tones", now, 0.02, 0.1, 5000);
        this.noise("tones", now + 0.1, 0.02, 0.1, 5000);
        break;
      case "chirp":
        this.tone("tones", 880, now, 0.2, 0.08, "sine", 440);
        break;
      case "burn":
        this.noise("effects", now, 1.1, 0.16, 500);
        this.tone("effects", 70, now, 1.1, 0.12, "sine", 50);
        break;
      case "reveal":
        this.stopMusic();
        this.tone("music", note(-5), now + 1.2, 0.5, 0.1, "triangle");
        this.tone("music", note(6), now + 1.65, 0.8, 0.09, "triangle");
        break;
      case "resolve":
        for (const [index, step] of [0, 7, 12, 16].entries()) this.tone("music", note(step), now + index * 0.16, 0.7, 0.09, "triangle");
        break;
      case "clack":
        this.noise("effects", now, 0.05, 0.1, 1800);
        this.tone("effects", 190, now, 0.06, 0.05, "square", 120);
        break;
      case "encourage":
        this.tone("music", note(0), now, 0.4, 0.07, "triangle");
        this.tone("music", note(5), now + 0.22, 0.6, 0.07, "triangle");
        break;
    }
  }
}

export const audio = new AudioManager();
