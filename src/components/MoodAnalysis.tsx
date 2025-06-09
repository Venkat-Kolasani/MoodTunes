import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Music, Heart, AlertCircle, RefreshCw, Mic } from 'lucide-react';
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
  const [showNarrationOption, setShowNarrationOption] = useState(false);
  const [narrationAudio, setNarrationAudio] = useState<string | null>(null);
  const [narrationQuote, setNarrationQuote] = useState<string | null>(null);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  
  const { data: track, loading, error, execute } = useApi<GeneratedTrack>();
  const { 
    data: narration, 
    loading: narrationLoading, 
    error: narrationError, 
    execute: executeNarration 
  } = useApi<any>();

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
        setShowNarrationOption(true);
        onMusicGenerated(response.data!);
      }, 1500);
    }
  };

  const generateNarration = async () => {
    const response = await executeNarration(() => 
      apiService.generateNarration({ mood })
    );

    if (response.data) {
      setNarrationAudio(response.data.audioUrl);
      setNarrationQuote(response.data.quote);
    }
  };

  const playNarration = () => {
    if (narrationAudio) {
      const audio = new Audio(narrationAudio);
      audio.play().then(() => {
        setIsPlayingNarration(true);
        audio.onended = () => setIsPlayingNarration(false);
      }).catch(error => {
        console.error('Error playing narration:', error);
      });
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

        {/* Narration Option */}
        {showNarrationOption && !narrationAudio && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200 space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Mic className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-purple-900">Get Motivational Audio</h3>
            </div>
            <p className="text-purple-700 text-center">
              Want a personalized motivational message? We can generate an AI-powered voice narration to uplift your spirits!
            </p>
            
            {narrationError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-red-600 text-sm text-center">{narrationError}</p>
                {narrationError.includes('API key') && (
                  <p className="text-red-500 text-xs text-center mt-1">
                    API keys required for this feature
                  </p>
                )}
              </div>
            )}
            
            <button
              onClick={generateNarration}
              disabled={narrationLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {narrationLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating Narration...</span>
                </div>
              ) : (
                'Generate Motivational Audio'
              )}
            </button>
          </div>
        )}

        {/* Narration Player */}
        {narrationAudio && narrationQuote && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Mic className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-green-900">Your Motivational Message</h3>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-100">
              <p className="text-green-800 italic text-center">"{narrationQuote}"</p>
            </div>
            
            <button
              onClick={playNarration}
              disabled={isPlayingNarration}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isPlayingNarration ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-pulse w-4 h-4 bg-white rounded-full"></div>
                  <span>Playing...</span>
                </div>
              ) : (
                'Play Motivational Audio'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodAnalysis;