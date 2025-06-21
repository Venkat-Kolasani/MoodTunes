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
      // Use relative URL when API_BASE_URL is not set (works with Vite proxy)
      const url = API_BASE_URL ? `${API_BASE_URL}/api${endpoint}` : `/api${endpoint}`;
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
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
          data = { error: 'Invalid JSON response format' };
        }
      } else {
        const text = await response.text();
        console.warn('Non-JSON response received:', text);
        console.warn('Response length:', text.length);
        console.warn('First 200 characters:', text.substring(0, 200));
        data = { error: 'Invalid response format - expected JSON' };
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