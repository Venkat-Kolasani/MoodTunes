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

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

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
    return this.request<GeneratedTrack>('/api/generate-track', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; tracksLoaded: number; timestamp: string }>> {
    return this.request('/api/health');
  }
}

export const apiService = new ApiService();