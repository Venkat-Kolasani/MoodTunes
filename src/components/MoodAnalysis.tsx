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

  const steps = [
    { icon: Brain, text: 'Analyzing emotional tone...', color: 'text-orange-600' },
    { icon: Sparkles, text: 'Detecting energy levels...', color: 'text-amber-600' },
    { icon: Heart, text: 'Understanding context...', color: 'text-orange-600' },
    { icon: Music, text: 'Crafting your perfect soundtrack...', color: 'text-amber-600' }
  ];

  // Simulate AI mood analysis
  const analyzeMood = (moodText: string) => {
    const emotions = ['anxious', 'hopeful', 'excited', 'calm', 'sad', 'happy', 'stressed', 'peaceful', 'energetic', 'tired'];
    const detectedEmotions = emotions.filter(emotion => 
      moodText.toLowerCase().includes(emotion)
    );

    // Determine primary emotion and energy level
    let primaryEmotion = detectedEmotions[0] || 'neutral';
    let energyLevel = 'medium';
    
    if (moodText.toLowerCase().includes('excited') || moodText.toLowerCase().includes('energetic')) {
      energyLevel = 'high';
    } else if (moodText.toLowerCase().includes('calm') || moodText.toLowerCase().includes('tired')) {
      energyLevel = 'low';
    }

    // Generate musical characteristics
    const musicStyles = {
      anxious: { genre: 'Ambient', tempo: 'Slow', instruments: 'Piano, Strings' },
      hopeful: { genre: 'Uplifting Pop', tempo: 'Medium', instruments: 'Guitar, Synth' },
      excited: { genre: 'Electronic Dance', tempo: 'Fast', instruments: 'Synth, Drums' },
      calm: { genre: 'Meditation', tempo: 'Very Slow', instruments: 'Nature Sounds, Flute' },
      sad: { genre: 'Melancholic Indie', tempo: 'Slow', instruments: 'Acoustic Guitar, Cello' },
      happy: { genre: 'Upbeat Folk', tempo: 'Medium-Fast', instruments: 'Ukulele, Violin' },
      stressed: { genre: 'Calming Classical', tempo: 'Slow', instruments: 'Piano, Harp' },
      peaceful: { genre: 'Nature Ambient', tempo: 'Very Slow', instruments: 'Ocean Waves, Bells' },
      energetic: { genre: 'Rock Pop', tempo: 'Fast', instruments: 'Electric Guitar, Drums' },
      tired: { genre: 'Gentle Lullaby', tempo: 'Very Slow', instruments: 'Soft Piano, Strings' }
    };

    const style = musicStyles[primaryEmotion as keyof typeof musicStyles] || musicStyles.calm;

    return {
      primaryEmotion,
      energyLevel,
      detectedEmotions,
      musicStyle: style
    };
  };

  // Generate a track based on analysis
  const generateTrack = (analysis: any): GeneratedTrack => {
    const trackTitles = {
      anxious: ['Breathing Space', 'Gentle Waves', 'Finding Peace'],
      hopeful: ['Rising Dawn', 'New Horizons', 'Bright Tomorrow'],
      excited: ['Electric Dreams', 'Energy Surge', 'Celebration'],
      calm: ['Still Waters', 'Quiet Mind', 'Serene Moments'],
      sad: ['Healing Rain', 'Soft Embrace', 'Tomorrow\'s Light'],
      happy: ['Sunshine Melody', 'Dancing Clouds', 'Joyful Heart'],
      stressed: ['Stress Relief', 'Calm Harbor', 'Inner Balance'],
      peaceful: ['Tranquil Garden', 'Meditation Flow', 'Silent Lake'],
      energetic: ['Power Surge', 'High Voltage', 'Unstoppable'],
      tired: ['Rest Easy', 'Gentle Dreams', 'Sleep Well']
    };

    const titles = trackTitles[analysis.primaryEmotion as keyof typeof trackTitles] || trackTitles.calm;
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    const durations = ['3:24', '4:12', '2:58', '5:03', '3:47'];
    const randomDuration = durations[Math.floor(Math.random() * durations.length)];

    return {
      id: `track_${Date.now()}`,
      title: randomTitle,
      duration: randomDuration,
      mood: analysis.primaryEmotion,
      description: `A ${analysis.musicStyle.genre.toLowerCase()} composition designed for ${analysis.primaryEmotion} moods, featuring ${analysis.musicStyle.instruments.toLowerCase()}.`,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder
    };
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
            setTimeout(() => {
              const analysis = analyzeMood(mood);
              setAnalysisResults(analysis);
              const track = generateTrack(analysis);
              
              setTimeout(() => {
                onMusicGenerated(track);
              }, 1500);
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
                <p className="text-orange-600">{analysisResults.musicStyle.genre}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <span className="font-medium text-orange-700">Instruments:</span>
                <p className="text-amber-600">{analysisResults.musicStyle.instruments}</p>
              </div>
            </div>
            <p className="text-orange-700 text-center">
              Creating your personalized soundtrack...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodAnalysis;