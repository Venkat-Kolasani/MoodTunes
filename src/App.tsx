import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import MoodCapture from './components/MoodCapture';
import MoodAnalysis from './components/MoodAnalysis';
import MusicPlayer from './components/MusicPlayer';
import Subscription from './components/Subscription';
import Header from './components/Header';
import { AppState, UserData } from './types';
import { fallbackMusicService } from './services/fallbackMusic';

function App() {
  const [currentView, setCurrentView] = useState<AppState>('landing');
  const [userData, setUserData] = useState<UserData>({
    isPremium: false,
    dailyListens: 0,
    detectedMood: '',
    generatedTrack: null
  });
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  // Load user data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moodtunes-user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserData(parsed);
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('moodtunes-user', JSON.stringify(userData));
  }, [userData]);

  // Cleanup generated audio on unmount
  useEffect(() => {
    return () => {
      fallbackMusicService.cleanup();
    };
  }, []);

  const handleStartJourney = () => {
    setCurrentView('moodCapture');
  };

  const handleMoodCaptured = (mood: string) => {
    setUserData(prev => ({ ...prev, detectedMood: mood }));
    setCurrentView('moodAnalysis');
  };

  const handleMusicGenerated = (track: any, fallbackMode: boolean = false) => {
    setUserData(prev => ({ 
      ...prev, 
      generatedTrack: track,
      dailyListens: prev.dailyListens + 1
    }));
    setIsFallbackMode(fallbackMode);
    setCurrentView('musicPlayer');
  };

  const handleSubscriptionUpgrade = () => {
    setUserData(prev => ({ ...prev, isPremium: true }));
    setCurrentView('landing');
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    setIsFallbackMode(false);
  };

  const handleSubscriptionView = () => {
    setCurrentView('subscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Header 
        currentView={currentView} 
        onBackToHome={handleBackToHome}
        userData={userData}
        onSubscriptionView={handleSubscriptionView}
      />
      
      <main className="pt-16">
        {currentView === 'landing' && (
          <Landing 
            onStartJourney={handleStartJourney}
            userData={userData}
            onSubscriptionView={handleSubscriptionView}
          />
        )}
        
        {currentView === 'moodCapture' && (
          <MoodCapture 
            onMoodCaptured={handleMoodCaptured}
            userData={userData}
            onSubscriptionView={handleSubscriptionView}
          />
        )}
        
        {currentView === 'moodAnalysis' && (
          <MoodAnalysis 
            mood={userData.detectedMood}
            onMusicGenerated={(track, fallbackMode) => handleMusicGenerated(track, fallbackMode)}
          />
        )}
        
        {currentView === 'musicPlayer' && (
          <MusicPlayer 
            track={userData.generatedTrack}
            mood={userData.detectedMood}
            onBackToHome={handleBackToHome}
            isFallbackMode={isFallbackMode}
          />
        )}
        
        {currentView === 'subscription' && (
          <Subscription 
            onUpgrade={handleSubscriptionUpgrade}
            onBackToHome={handleBackToHome}
            userData={userData}
          />
        )}
      </main>
    </div>
  );
}

export default App;