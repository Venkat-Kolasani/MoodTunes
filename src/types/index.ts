export type AppState = 'landing' | 'moodCapture' | 'moodAnalysis' | 'musicPlayer' | 'subscription';

export interface UserData {
  isPremium: boolean;
  dailyListens: number;
  detectedMood: string;
  generatedTrack: GeneratedTrack | null;
}

export interface GeneratedTrack {
  id: string;
  title: string;
  duration: string;
  mood: string;
  description: string;
  audioUrl: string;
}