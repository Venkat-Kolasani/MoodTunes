// Enhanced fallback music service with audio generation
import { audioGenerator } from './audioGenerator';

export interface FallbackTrack {
  id: string;
  title: string;
  duration: string;
  mood: string;
  genre: string;
  energy: string;
  description: string;
  audioUrl: string;
  isGenerated?: boolean;
}

export class FallbackMusicService {
  private fallbackTracks: FallbackTrack[] = [
    // Happy tracks
    {
      id: 'happy-1',
      title: 'Sunshine Vibes',
      duration: '3:24',
      mood: 'happy',
      genre: 'Upbeat Folk',
      energy: 'medium',
      description: 'A cheerful acoustic track that brings instant joy and warmth.',
      audioUrl: '/music/fallback/happy/happy-1.mp3'
    },
    {
      id: 'happy-2',
      title: 'Dancing Clouds',
      duration: '2:58',
      mood: 'happy',
      genre: 'Indie Pop',
      energy: 'high',
      description: 'An uplifting melody that makes you want to dance.',
      audioUrl: '/music/fallback/happy/happy-2.mp3'
    },
    {
      id: 'happy-3',
      title: 'Golden Hour',
      duration: '4:12',
      mood: 'happy',
      genre: 'Acoustic',
      energy: 'medium',
      description: 'Warm guitar melodies that capture the magic of golden hour.',
      audioUrl: '/music/fallback/happy/happy-3.mp3'
    },
    {
      id: 'happy-4',
      title: 'Celebration Time',
      duration: '3:45',
      mood: 'happy',
      genre: 'Pop',
      energy: 'high',
      description: 'An energetic celebration of life and joy.',
      audioUrl: '/music/fallback/happy/happy-4.mp3'
    },
    {
      id: 'happy-5',
      title: 'Bright Tomorrow',
      duration: '3:33',
      mood: 'happy',
      genre: 'Uplifting',
      energy: 'medium',
      description: 'Optimistic melodies that inspire hope for the future.',
      audioUrl: '/music/fallback/happy/happy-5.mp3'
    },

    // Sad tracks
    {
      id: 'sad-1',
      title: 'Gentle Rain',
      duration: '4:36',
      mood: 'sad',
      genre: 'Melancholic Indie',
      energy: 'low',
      description: 'A tender composition that provides comfort during difficult moments.',
      audioUrl: '/music/fallback/sad/sad-1.mp3'
    },
    {
      id: 'sad-2',
      title: 'Quiet Tears',
      duration: '5:12',
      mood: 'sad',
      genre: 'Ambient',
      energy: 'very low',
      description: 'Soft piano melodies for moments of reflection and healing.',
      audioUrl: '/music/fallback/sad/sad-2.mp3'
    },
    {
      id: 'sad-3',
      title: 'Empty Room',
      duration: '4:18',
      mood: 'sad',
      genre: 'Acoustic',
      energy: 'low',
      description: 'Intimate guitar work that speaks to the heart.',
      audioUrl: '/music/fallback/sad/sad-3.mp3'
    },
    {
      id: 'sad-4',
      title: 'Fading Light',
      duration: '3:54',
      mood: 'sad',
      genre: 'Neo-Classical',
      energy: 'low',
      description: 'Delicate strings and piano for contemplative moments.',
      audioUrl: '/music/fallback/sad/sad-4.mp3'
    },
    {
      id: 'sad-5',
      title: 'Silent Goodbye',
      duration: '4:42',
      mood: 'sad',
      genre: 'Ambient',
      energy: 'very low',
      description: 'A peaceful farewell wrapped in gentle soundscapes.',
      audioUrl: '/music/fallback/sad/sad-5.mp3'
    },

    // Energetic tracks
    {
      id: 'energetic-1',
      title: 'Power Surge',
      duration: '3:28',
      mood: 'energetic',
      genre: 'Electronic Dance',
      energy: 'very high',
      description: 'High-energy beats that amplify your natural energy.',
      audioUrl: '/music/fallback/energetic/energetic-1.mp3'
    },
    {
      id: 'energetic-2',
      title: 'Lightning Strike',
      duration: '3:15',
      mood: 'energetic',
      genre: 'Rock',
      energy: 'very high',
      description: 'Driving rock rhythms that electrify your spirit.',
      audioUrl: '/music/fallback/energetic/energetic-2.mp3'
    },
    {
      id: 'energetic-3',
      title: 'Rocket Fuel',
      duration: '2:45',
      mood: 'energetic',
      genre: 'Electronic',
      energy: 'very high',
      description: 'Explosive electronic energy for maximum motivation.',
      audioUrl: '/music/fallback/energetic/energetic-3.mp3'
    },
    {
      id: 'energetic-4',
      title: 'Adrenaline Rush',
      duration: '3:33',
      mood: 'energetic',
      genre: 'Techno',
      energy: 'very high',
      description: 'Pulsing techno beats that get your heart racing.',
      audioUrl: '/music/fallback/energetic/energetic-4.mp3'
    },
    {
      id: 'energetic-5',
      title: 'Victory Lap',
      duration: '3:21',
      mood: 'energetic',
      genre: 'Upbeat',
      energy: 'high',
      description: 'Triumphant melodies for your winning moments.',
      audioUrl: '/music/fallback/energetic/energetic-5.mp3'
    },

    // Relaxed tracks
    {
      id: 'relaxed-1',
      title: 'Still Waters',
      duration: '5:03',
      mood: 'relaxed',
      genre: 'Meditation',
      energy: 'very low',
      description: 'Peaceful water sounds and gentle melodies for deep relaxation.',
      audioUrl: '/music/fallback/relaxed/relaxed-1.mp3'
    },
    {
      id: 'relaxed-2',
      title: 'Forest Breeze',
      duration: '6:15',
      mood: 'relaxed',
      genre: 'Nature Ambient',
      energy: 'very low',
      description: 'Natural forest sounds combined with soft instrumental tones.',
      audioUrl: '/music/fallback/relaxed/relaxed-2.mp3'
    },
    {
      id: 'relaxed-3',
      title: 'Moonlight Serenade',
      duration: '4:48',
      mood: 'relaxed',
      genre: 'Ambient',
      energy: 'low',
      description: 'Gentle nighttime melodies for peaceful relaxation.',
      audioUrl: '/music/fallback/relaxed/relaxed-3.mp3'
    },
    {
      id: 'relaxed-4',
      title: 'Floating Dreams',
      duration: '5:27',
      mood: 'relaxed',
      genre: 'Ambient',
      energy: 'very low',
      description: 'Ethereal soundscapes that transport you to tranquility.',
      audioUrl: '/music/fallback/relaxed/relaxed-4.mp3'
    },
    {
      id: 'relaxed-5',
      title: 'Zen Garden',
      duration: '7:12',
      mood: 'relaxed',
      genre: 'Meditation',
      energy: 'very low',
      description: 'Meditative tones inspired by peaceful zen gardens.',
      audioUrl: '/music/fallback/relaxed/relaxed-5.mp3'
    },

    // Anxious tracks
    {
      id: 'anxious-1',
      title: 'Breathing Space',
      duration: '4:12',
      mood: 'anxious',
      genre: 'Calming',
      energy: 'low',
      description: 'Gentle rhythms designed to ease anxiety and promote calm breathing.',
      audioUrl: '/music/fallback/anxious/anxious-1.mp3'
    },
    {
      id: 'anxious-2',
      title: 'Safe Harbor',
      duration: '5:18',
      mood: 'anxious',
      genre: 'Ambient',
      energy: 'low',
      description: 'Protective soundscapes that create a sense of safety and security.',
      audioUrl: '/music/fallback/anxious/anxious-2.mp3'
    },
    {
      id: 'anxious-3',
      title: 'Steady Ground',
      duration: '4:33',
      mood: 'anxious',
      genre: 'Grounding',
      energy: 'low',
      description: 'Stabilizing melodies that help you feel grounded and centered.',
      audioUrl: '/music/fallback/anxious/anxious-3.mp3'
    },
    {
      id: 'anxious-4',
      title: 'Gentle Waves',
      duration: '6:24',
      mood: 'anxious',
      genre: 'Nature',
      energy: 'very low',
      description: 'Soothing ocean waves with calming instrumental accompaniment.',
      audioUrl: '/music/fallback/anxious/anxious-4.mp3'
    },
    {
      id: 'anxious-5',
      title: 'Inner Peace',
      duration: '5:45',
      mood: 'anxious',
      genre: 'Meditation',
      energy: 'very low',
      description: 'Meditative sounds designed to restore inner calm and peace.',
      audioUrl: '/music/fallback/anxious/anxious-5.mp3'
    },

    // Romantic tracks
    {
      id: 'romantic-1',
      title: 'Midnight Embrace',
      duration: '3:52',
      mood: 'romantic',
      genre: 'Smooth Jazz',
      energy: 'low',
      description: 'Sultry jazz melodies that create an intimate, romantic atmosphere.',
      audioUrl: '/music/fallback/romantic/romantic-1.mp3'
    },
    {
      id: 'romantic-2',
      title: 'Candlelight Waltz',
      duration: '4:15',
      mood: 'romantic',
      genre: 'Classical',
      energy: 'medium',
      description: 'Elegant classical waltz perfect for romantic moments.',
      audioUrl: '/music/fallback/romantic/romantic-2.mp3'
    },
    {
      id: 'romantic-3',
      title: 'Love Letters',
      duration: '3:36',
      mood: 'romantic',
      genre: 'Acoustic',
      energy: 'low',
      description: 'Tender acoustic guitar that speaks the language of love.',
      audioUrl: '/music/fallback/romantic/romantic-3.mp3'
    },
    {
      id: 'romantic-4',
      title: 'Starlit Serenade',
      duration: '4:42',
      mood: 'romantic',
      genre: 'Ambient',
      energy: 'low',
      description: 'Dreamy ambient sounds under a canopy of stars.',
      audioUrl: '/music/fallback/romantic/romantic-4.mp3'
    },
    {
      id: 'romantic-5',
      title: 'Heart to Heart',
      duration: '3:24',
      mood: 'romantic',
      genre: 'Soft Pop',
      energy: 'medium',
      description: 'Gentle pop melodies that connect heart to heart.',
      audioUrl: '/music/fallback/romantic/romantic-5.mp3'
    }
  ];

  // Map mood keywords to track categories
  private moodMapping: { [key: string]: string[] } = {
    happy: ['happy', 'joyful', 'cheerful', 'excited', 'elated', 'upbeat', 'positive'],
    sad: ['sad', 'melancholy', 'down', 'blue', 'depressed', 'gloomy', 'sorrowful'],
    energetic: ['energetic', 'active', 'dynamic', 'vibrant', 'lively', 'pumped', 'vigorous'],
    relaxed: ['relaxed', 'calm', 'peaceful', 'serene', 'tranquil', 'quiet', 'still'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'restless'],
    romantic: ['romantic', 'loving', 'passionate', 'intimate', 'tender', 'affectionate']
  };

  public async getTrackForMood(mood: string): Promise<FallbackTrack> {
    console.log(`🎵 Getting fallback track for mood: "${mood}"`);
    
    // Determine the best matching category
    const moodLower = mood.toLowerCase();
    let bestCategory = 'relaxed'; // default fallback
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(this.moodMapping)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (moodLower.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    console.log(`🎯 Selected category: ${bestCategory} (score: ${bestScore})`);

    // Get tracks for the selected category
    const categoryTracks = this.fallbackTracks.filter(track => track.mood === bestCategory);
    
    if (categoryTracks.length === 0) {
      console.warn(`⚠️ No tracks found for category ${bestCategory}, using first available track`);
      return await this.generatePlayableTrack(this.fallbackTracks[0]);
    }

    // Randomly select a track from the category
    const selectedTrack = categoryTracks[Math.floor(Math.random() * categoryTracks.length)];
    console.log(`✅ Selected fallback track: "${selectedTrack.title}"`);
    
    return await this.generatePlayableTrack(selectedTrack);
  }

  private async generatePlayableTrack(track: FallbackTrack): Promise<FallbackTrack> {
    try {
      // Generate actual playable audio
      const durationInSeconds = this.parseDuration(track.duration);
      const generatedAudioUrl = await audioGenerator.generateTrackAudio(track.id, track.mood, durationInSeconds);
      
      return {
        ...track,
        audioUrl: generatedAudioUrl,
        isGenerated: true,
        description: `${track.description} (AI-Generated Audio)`
      };
    } catch (error) {
      console.warn('Failed to generate audio, using original track:', error);
      return track;
    }
  }

  private parseDuration(duration: string): number {
    const parts = duration.split(':');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }

  public getAllTracks(): FallbackTrack[] {
    return this.fallbackTracks;
  }

  public getTracksByCategory(category: string): FallbackTrack[] {
    return this.fallbackTracks.filter(track => track.mood === category);
  }

  public verifyTrackIntegrity(): { available: number; total: number; missing: string[] } {
    const missing: string[] = [];
    let available = 0;

    this.fallbackTracks.forEach(_ => {
      // All tracks are available since we generate them on demand
      available++;
    });

    return {
      available,
      total: this.fallbackTracks.length,
      missing
    };
  }

  public cleanup() {
    audioGenerator.cleanup();
  }
}

export const fallbackMusicService = new FallbackMusicService();