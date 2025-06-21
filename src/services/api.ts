// API service configuration and methods
import { fallbackMusicService, FallbackTrack } from './fallbackMusic';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  isFallback?: boolean;
}

export interface GenerateTrackRequest {
  mood: string;
  genre?: string;
  energy?: string;
}

export interface GeneratedTrack {
  id: string;
  title: string;
  duration: string;
  mood: string;
  genre?: string;
  energy?: string;
  description: string;
  audioUrl: string;
}

export interface NarrateRequest {
  mood: string;
}

export interface NarrationResponse {
  audioUrl: string;
  quote: string;
  mood: string;
  duration: string;
  timestamp: string;
}

class ApiService {
  private isApiAvailable = true;
  private lastApiCheck = 0;
  private readonly API_CHECK_INTERVAL = 30000; // 30 seconds

  private async checkApiAvailability(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastApiCheck < this.API_CHECK_INTERVAL) {
      return this.isApiAvailable;
    }

    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      const contentType = response.headers.get('content-type');
      this.isApiAvailable = response.ok && contentType?.includes('application/json');
      this.lastApiCheck = now;
      
      console.log(`🔍 API availability check: ${this.isApiAvailable ? 'Available' : 'Unavailable'}`);
      return this.isApiAvailable;
    } catch (error) {
      console.log('🚫 API unavailable:', error);
      this.isApiAvailable = false;
      this.lastApiCheck = now;
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Use relative URL when API_BASE_URL is not set (works with Vite proxy)
      const url = API_BASE_URL ? `${API_BASE_URL}/api${endpoint}` : `/api${endpoint}`;
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        ...options,
      });

      console.log(`API response status: ${response.status}`);
      console.log(`API response headers:`, Object.fromEntries(response.headers.entries()));

      let data;
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('Successfully parsed JSON response:', data);
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          const text = await response.text();
          console.warn('Raw response text:', text);
          throw new Error('Invalid JSON response format');
        }
      } else {
        const text = await response.text();
        console.warn('Non-JSON response received:', text);
        console.warn('Response length:', text.length);
        console.warn('First 200 characters:', text.substring(0, 200));
        throw new Error('Invalid response format - expected JSON');
      }

      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('API request successful:', data);
      this.isApiAvailable = true;
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      this.isApiAvailable = false;
      throw error;
    }
  }

  async generateTrack(request: GenerateTrackRequest): Promise<ApiResponse<GeneratedTrack>> {
    console.log('Generating track with request:', request);
    
    // Check if API is available
    const apiAvailable = await this.checkApiAvailability();
    
    if (!apiAvailable) {
      console.log('🔄 API unavailable, using fallback music service');
      const fallbackTrack = fallbackMusicService.getTrackForMood(request.mood);
      
      // Convert FallbackTrack to GeneratedTrack format
      const generatedTrack: GeneratedTrack = {
        id: fallbackTrack.id,
        title: fallbackTrack.title,
        duration: fallbackTrack.duration,
        mood: fallbackTrack.mood,
        genre: fallbackTrack.genre,
        energy: fallbackTrack.energy,
        description: `${fallbackTrack.description} (Offline Mode)`,
        audioUrl: fallbackTrack.audioUrl
      };
      
      return {
        data: generatedTrack,
        status: 200,
        isFallback: true
      };
    }

    try {
      return await this.request<GeneratedTrack>('/generate-track', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.log('🔄 API request failed, falling back to offline music');
      const fallbackTrack = fallbackMusicService.getTrackForMood(request.mood);
      
      const generatedTrack: GeneratedTrack = {
        id: fallbackTrack.id,
        title: fallbackTrack.title,
        duration: fallbackTrack.duration,
        mood: fallbackTrack.mood,
        genre: fallbackTrack.genre,
        energy: fallbackTrack.energy,
        description: `${fallbackTrack.description} (Offline Mode)`,
        audioUrl: fallbackTrack.audioUrl
      };
      
      return {
        data: generatedTrack,
        status: 200,
        isFallback: true
      };
    }
  }

  async generateNarration(request: NarrateRequest): Promise<ApiResponse<NarrationResponse>> {
    console.log('Generating narration with request:', request);
    
    // Check if API is available
    const apiAvailable = await this.checkApiAvailability();
    
    if (!apiAvailable) {
      return {
        error: 'Narration service unavailable in offline mode. API connection required for voice generation.',
        status: 503,
        isFallback: true
      };
    }

    try {
      return await this.request<NarrationResponse>('/narrate', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      return {
        error: 'Narration service temporarily unavailable. Please try again later.',
        status: 503,
        isFallback: true
      };
    }
  }

  async healthCheck(): Promise<ApiResponse<{ 
    status: string; 
    tracksLoaded: number; 
    timestamp: string;
    features: {
      trackGeneration: boolean;
      trackEnhancement: boolean;
      narration: {
        available: boolean;
        openai: boolean;
        elevenlabs: boolean;
      };
    };
  }>> {
    console.log('Performing health check...');
    
    // Check if API is available
    const apiAvailable = await this.checkApiAvailability();
    
    if (!apiAvailable) {
      // Return fallback health status
      const fallbackIntegrity = fallbackMusicService.verifyTrackIntegrity();
      return {
        data: {
          status: 'offline',
          tracksLoaded: fallbackIntegrity.available,
          timestamp: new Date().toISOString(),
          features: {
            trackGeneration: true, // Fallback tracks available
            trackEnhancement: false,
            narration: {
              available: false,
              openai: false,
              elevenlabs: false
            }
          }
        },
        status: 200,
        isFallback: true
      };
    }

    try {
      return await this.request('/health');
    } catch (error) {
      // Return fallback health status on error
      const fallbackIntegrity = fallbackMusicService.verifyTrackIntegrity();
      return {
        data: {
          status: 'offline',
          tracksLoaded: fallbackIntegrity.available,
          timestamp: new Date().toISOString(),
          features: {
            trackGeneration: true,
            trackEnhancement: false,
            narration: {
              available: false,
              openai: false,
              elevenlabs: false
            }
          }
        },
        status: 200,
        isFallback: true
      };
    }
  }
}

export const apiService = new ApiService();