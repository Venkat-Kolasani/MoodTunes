import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Music, Heart, AlertCircle, RefreshCw } from 'lucide-react';
import { GeneratedTrack } from '../types';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';

interface MoodAnalysisProps {
  mood: string;
  onMusicGenerated: (track: GeneratedTrack) => void;
}

const MoodAnalysis: React.FC<MoodAnalysisProps> = ({ mood, onMusicGenerated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { data: track, loading, error, execute } = useApi<GeneratedTrack>();

  const steps = [
    { icon: Brain, text: 'Analyzing emotional tone...', color: 'text-orange-600' },
    { icon: Sparkles, text: 'Detecting energy levels...', color: 'text-amber-600' },
    { icon: Heart, text: 'Understanding context...', color: 'text-orange-600' },
    { icon: Music, text: 'Crafting your perfect soundtrack...', color: 'text-amber-600' }
  ];

  // Analyze mood and determine characteristics
  const analyzeMood = (moodText: string) => {
    const emotions = ['anxious', 'hopeful', 'excited', 'calm', 'sad', 'happy', 'stressed', 'peaceful', 'energetic', 'tired'];
    const detectedEmotions = emotions.filter(emotion => 
      moodText.toLowerCase().includes(emotion)
    );

    // Determine primary emotion and energy level
    let primaryEmotion = detectedEmotions[0] || 'neutral';
    let energyLevel = 'medium';
    let genre = 'Ambient';
    
    // Energy level detection
    if (moodText.toLowerCase().includes('excited') || 
        moodText.toLowerCase().includes('energetic') ||
        moodText.toLowerCase().includes('pumped')) {
      energyLevel = 'high';
    } else if (moodText.toLowerCase().includes('calm') || 
               moodText.toLowerCase().includes('tired') ||
               moodText.toLowerCase().includes('peaceful')) {
      energyLevel = 'low';
    }

    // Genre detection based on mood
    if (moodText.toLowerCase().includes('excited') || moodText.toLowerCase().includes('energetic')) {
      genre = 'Electronic Dance';
    } else if (moodText.toLowerCase().includes('sad') || moodText.toLowerCase().includes('melancholy')) {
      genre = 'Melancholic Indie';
    } else if (moodText.toLowerCase().includes('happy') || moodText.toLowerCase().includes('joyful')) {
      genre = 'Upbeat Folk';
    } else if (moodText.toLowerCase().includes('calm') || moodText.toLowerCase().includes('peaceful')) {
      genre = 'Meditation';
    } else if (moodText.toLowerCase().includes('romantic') || moodText.toLowerCase().includes('love')) {
      genre = 'Smooth Jazz';
    }

    return {
      primaryEmotion,
      energyLevel,
      genre,
      detectedEmotions
    };
  };

  const generateTrack = async (analysis: any) => {
    const response = await execute(() => 
      apiService.generateTrack({
        mood: mood,
        genre: analysis.genre,
        energy: analysis.energyLevel
      })
    );

    if (response.data) {
      setTimeout(() => {
        onMusicGenerated(response.data!);
      }, 1500);
    }
  };

  const retryGeneration = () => {
    if (analysisResults) {
      generateTrack(analysisResults);
    }
  };

  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    
    const runAnalysis = async () => {
      // Step through the analysis process
      stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            clearInterval(stepInterval);
            
            // Complete analysis and generate track
            setTimeout(async () => {
              const analysis = analyzeMood(mood);
              setAnalysisResults(analysis);
              await generateTrack(analysis);
            }, 1000);
            
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    };

    runAnalysis();

    return () => {
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [mood]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-orange-900">
            Analyzing Your Mood
          </h1>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-orange-800 italic">"{mood}"</p>
          </div>
        </div>

        {/* Error Message with Retry */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Generation Failed</p>
            </div>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={retryGeneration}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Retrying...' : 'Try Again'}</span>
            </button>
          </div>
        )}

        {/* Analysis Progress */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                  isActive ? 'bg-white shadow-lg border-2 border-orange-100' : 'bg-orange-50'
                }`}
              >
                <div className={`relative ${isActive && !isCompleted ? 'animate-pulse' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-100' 
                      : isActive 
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100' 
                        : 'bg-orange-200'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isCompleted 
                        ? 'text-green-600' 
                        : isActive 
                          ? step.color 
                          : 'text-orange-400'
                    }`} />
                  </div>
                  
                  {isActive && !isCompleted && (
                    <div className="absolute inset-0 rounded-full border-2 border-orange-300 animate-ping" />
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <p className={`font-medium ${
                    isCompleted 
                      ? 'text-green-600' 
                      : isActive 
                        ? 'text-orange-900' 
                        : 'text-orange-400'
                  }`}>
                    {step.text}
                  </p>
                </div>
                
                {isCompleted && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
              <p>Generating your track...</p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResults && !loading && !error && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200 space-y-4 animate-fade-in">
            <h3 className="text-xl font-semibold text-orange-900">Analysis Complete</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <span className="font-medium text-orange-700">Primary Emotion:</span>
                <p className="text-orange-600 capitalize">{analysisResults.primaryEmotion}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <span className="font-medium text-orange-700">Energy Level:</span>
                <p className="text-amber-600 capitalize">{analysisResults.energyLevel}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <span className="font-medium text-orange-700">Musical Genre:</span>
                <p className="text-orange-600">{analysisResults.genre}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <span className="font-medium text-orange-700">API Status:</span>
                <p className="text-green-600">Connected</p>
              </div>
            </div>
            <p className="text-orange-700 text-center">
              Fetching your personalized soundtrack from our music library...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodAnalysis;