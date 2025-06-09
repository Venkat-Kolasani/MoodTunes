import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Music, Heart } from 'lucide-react';
import { GeneratedTrack } from '../types';

interface MoodAnalysisProps {
  mood: string;
  onMusicGenerated: (track: GeneratedTrack) => void;
}

const MoodAnalysis: React.FC<MoodAnalysisProps> = ({ mood, onMusicGenerated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

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

  // Call backend API to generate track
  const generateTrackFromAPI = async (analysis: any): Promise<GeneratedTrack> => {
    try {
      const response = await fetch('http://localhost:3001/api/generate-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: mood,
          genre: analysis.genre,
          energy: analysis.energyLevel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const track = await response.json();
      return track;
    } catch (error) {
      console.error('Error calling API:', error);
      
      // Fallback track if API fails
      return {
        id: `track_fallback_${Date.now()}`,
        title: 'Peaceful Moments',
        duration: '3:24',
        mood: analysis.primaryEmotion,
        description: `A calming composition designed for ${analysis.primaryEmotion} moods. (Generated offline due to connection issue)`,
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      };
    }
  };

  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    
    const runAnalysis = async () => {
      setError('');
      
      // Step through the analysis process
      stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            clearInterval(stepInterval);
            
            // Complete analysis and generate track
            setTimeout(async () => {
              try {
                const analysis = analyzeMood(mood);
                setAnalysisResults(analysis);
                
                // Call backend API to get track
                const track = await generateTrackFromAPI(analysis);
                
                setTimeout(() => {
                  onMusicGenerated(track);
                }, 1500);
              } catch (error) {
                console.error('Error in analysis:', error);
                setError('Failed to generate track. Please try again.');
              }
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
  }, [mood, onMusicGenerated]);

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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
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
                <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
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

        {/* Analysis Results */}
        {analysisResults && (
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