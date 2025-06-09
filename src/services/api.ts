// API service configuration and methods
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
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
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api${endpoint}`;
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`API response status: ${response.status}`);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Non-JSON response received:', text);
        data = { error: 'Invalid response format' };
      }

      if (!response.ok) {
        console.error('API error response:', data);
        return {
          error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      console.log('API request successful:', data);
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
      };
    }
  }

  async generateTrack(request: GenerateTrackRequest): Promise<ApiResponse<GeneratedTrack>> {
    console.log('Generating track with request:', request);
    return this.request<GeneratedTrack>('/generate-track', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateNarration(request: NarrateRequest): Promise<ApiResponse<NarrationResponse>> {
    console.log('Generating narration with request:', request);
    return this.request<NarrationResponse>('/narrate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
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
    return this.request('/health');
  }
}

export const apiService = new ApiService();