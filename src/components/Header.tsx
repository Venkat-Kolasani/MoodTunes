import React from 'react';
import { Music, ArrowLeft, Crown } from 'lucide-react';
import { AppState, UserData } from '../types';
import ApiStatus from './ApiStatus';

interface HeaderProps {
  currentView: AppState;
  onBackToHome: () => void;
  userData: UserData;
  onSubscriptionView: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onBackToHome, 
  userData,
  onSubscriptionView 
}) => {
  const showBackButton = currentView !== 'landing';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={onBackToHome}
                className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full">
                <Music className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                MoodTunes
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* API Status Indicator */}
            <ApiStatus className="hidden sm:flex" />
            
            {!userData.isPremium && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-orange-700">
                <span>{userData.dailyListens}/3 free listens today</span>
              </div>
            )}
            
            <button
              onClick={onSubscriptionView}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                userData.isPremium
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                  : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">
                {userData.isPremium ? 'Premium' : 'Upgrade'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;