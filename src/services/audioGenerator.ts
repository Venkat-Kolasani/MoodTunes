// Audio generation service for creating playable fallback tracks
export class AudioGeneratorService {
  private audioContext: AudioContext | null = null;
  private generatedTracks: Map<string, string> = new Map();

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate a simple tone-based track for each mood
  async generateTrackAudio(trackId: string, mood: string, duration: number = 180): Promise<string> {
    // Check if we already have this track generated
    if (this.generatedTracks.has(trackId)) {
      return this.generatedTracks.get(trackId)!;
    }

    const audioContext = this.initAudioContext();
    const sampleRate = audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = audioContext.createBuffer(2, numSamples, sampleRate);

    // Generate audio based on mood
    const moodConfig = this.getMoodConfig(mood);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < numSamples; i++) {
        const time = i / sampleRate;
        let sample = 0;

        // Generate multiple harmonics for richer sound
        for (const harmonic of moodConfig.harmonics) {
          const frequency = harmonic.frequency;
          const amplitude = harmonic.amplitude * this.getEnvelope(time, duration);
          const phase = harmonic.phase || 0;
          
          sample += amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
        }

        // Add some gentle noise for texture
        sample += (Math.random() - 0.5) * 0.02 * this.getEnvelope(time, duration);
        
        // Apply mood-specific modulation
        sample *= moodConfig.modulation(time);
        
        channelData[i] = Math.max(-1, Math.min(1, sample));
      }
    }

    // Convert to blob URL
    const audioBlob = await this.bufferToBlob(buffer);
    const blobUrl = URL.createObjectURL(audioBlob);
    
    this.generatedTracks.set(trackId, blobUrl);
    return blobUrl;
  }

  private getMoodConfig(mood: string) {
    const configs = {
      happy: {
        harmonics: [
          { frequency: 261.63, amplitude: 0.3 }, // C4
          { frequency: 329.63, amplitude: 0.25 }, // E4
          { frequency: 392.00, amplitude: 0.2 }, // G4
          { frequency: 523.25, amplitude: 0.15 }, // C5
        ],
        modulation: (time: number) => 1 + 0.1 * Math.sin(time * 0.5)
      },
      sad: {
        harmonics: [
          { frequency: 220.00, amplitude: 0.4 }, // A3
          { frequency: 261.63, amplitude: 0.3 }, // C4
          { frequency: 311.13, amplitude: 0.2 }, // Eb4
        ],
        modulation: (time: number) => 1 + 0.05 * Math.sin(time * 0.2)
      },
      energetic: {
        harmonics: [
          { frequency: 440.00, amplitude: 0.3 }, // A4
          { frequency: 554.37, amplitude: 0.25 }, // C#5
          { frequency: 659.25, amplitude: 0.2 }, // E5
          { frequency: 880.00, amplitude: 0.15 }, // A5
        ],
        modulation: (time: number) => 1 + 0.2 * Math.sin(time * 2)
      },
      relaxed: {
        harmonics: [
          { frequency: 174.61, amplitude: 0.4 }, // F3
          { frequency: 220.00, amplitude: 0.3 }, // A3
          { frequency: 261.63, amplitude: 0.2 }, // C4
        ],
        modulation: (time: number) => 1 + 0.03 * Math.sin(time * 0.1)
      },
      anxious: {
        harmonics: [
          { frequency: 196.00, amplitude: 0.35 }, // G3
          { frequency: 246.94, amplitude: 0.3 }, // B3
          { frequency: 293.66, amplitude: 0.25 }, // D4
        ],
        modulation: (time: number) => 1 + 0.08 * Math.sin(time * 0.3)
      },
      romantic: {
        harmonics: [
          { frequency: 233.08, amplitude: 0.4 }, // Bb3
          { frequency: 293.66, amplitude: 0.3 }, // D4
          { frequency: 349.23, amplitude: 0.25 }, // F4
          { frequency: 466.16, amplitude: 0.2 }, // Bb4
        ],
        modulation: (time: number) => 1 + 0.06 * Math.sin(time * 0.4)
      }
    };

    return configs[mood as keyof typeof configs] || configs.relaxed;
  }

  private getEnvelope(time: number, duration: number): number {
    const attackTime = 2;
    const releaseTime = 3;
    
    if (time < attackTime) {
      return time / attackTime;
    } else if (time > duration - releaseTime) {
      return (duration - time) / releaseTime;
    }
    return 1;
  }

  private async bufferToBlob(buffer: AudioBuffer): Promise<Blob> {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * 4);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 4, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 4, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < 2; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Clean up generated tracks to free memory
  cleanup() {
    this.generatedTracks.forEach(url => URL.revokeObjectURL(url));
    this.generatedTracks.clear();
  }
}

export const audioGenerator = new AudioGeneratorService();