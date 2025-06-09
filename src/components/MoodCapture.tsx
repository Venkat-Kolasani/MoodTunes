import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { UserData } from '../types';

interface MoodCaptureProps {
  onMoodCaptured: (mood: string) => void;
  userData: UserData;
  onSubscriptionView: () => void;
}

const MoodCapture: React.FC<MoodCaptureProps> = ({ 
  onMoodCaptured, 
  userData, 
  onSubscriptionView 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  // Check if user can use the service
  const canUseService = userData.isPremium || userData.dailyListens < 3;

  useEffect(() => {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript) {
        setTimeout(() => onMoodCaptured(transcript), 1000);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setError(`Speech recognition error: ${event.error}`);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript, onMoodCaptured]);

  const startListening = () => {
    if (!canUseService) {
      onSubscriptionView();
      return;
    }

    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Demo moods for fallback
  const demoMoods = [
    'feeling anxious but hopeful',
    'excited and energetic',
    'calm and peaceful',
    'sad but looking forward',
    'stressed and overwhelmed',
    'happy and content'
  ];

  const handleDemoMood = (mood: string) => {
    if (!canUseService) {
      onSubscriptionView();
      return;
    }
    setTranscript(mood);
    setTimeout(() => onMoodCaptured(mood), 500);
  };

  if (!canUseService) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
            <MicOff className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-orange-900">Upgrade Required</h2>
          <p className="text-orange-700">
            You've used all 3 free listens today. Upgrade to Premium for unlimited access to mood-based music generation.
          </p>
          <button
            onClick={onSubscriptionView}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
          >
            View Premium Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-orange-900">
            How are you feeling?
          </h1>
          <p className="text-lg text-orange-700">
            Speak naturally about your current mood and emotions. The more you share, the better we can craft your perfect soundtrack.
          </p>
        </div>

        {/* Voice Capture Interface */}
        <div className="space-y-6">
          <div className="relative">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!!error}
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isListening
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse scale-110'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-105'
              } ${error ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>
            
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping" />
            )}
          </div>

          <div className="space-y-2">
            {isListening ? (
              <p className="text-orange-600 font-medium">Listening... Speak now</p>
            ) : transcript ? (
              <p className="text-green-600 font-medium">Got it! Processing your mood...</p>
            ) : (
              <p className="text-orange-700">Click the microphone to start</p>
            )}
            
            {transcript && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-800 italic">"{transcript}"</p>
              </div>
            )}
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>

        {/* Demo Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 justify-center">
            <div className="h-px bg-orange-300 flex-1" />
            <span className="text-sm text-orange-600 px-3">Or try these examples</span>
            <div className="h-px bg-orange-300 flex-1" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoMoods.map((mood, index) => (
              <button
                key={index}
                onClick={() => handleDemoMood(mood)}
                className="p-3 text-sm bg-white border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors duration-200 text-orange-700 hover:text-orange-800"
              >
                "{mood}"
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 space-y-3">
          <div className="flex items-center space-x-2 justify-center">
            <Volume2 className="w-5 h-5 text-orange-600" />
            <h3 className="font-medium text-orange-900">Tips for better results</h3>
          </div>
          <ul className="text-sm text-orange-800 space-y-1 text-left max-w-md mx-auto">
            <li>• Speak clearly and describe specific emotions</li>
            <li>• Mention energy levels (calm, energetic, tired)</li>
            <li>• Include context ("stressed about work", "excited for the weekend")</li>
            <li>• Be authentic - there's no wrong way to feel</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MoodCapture;