import React from 'react';
import { Mic, Sparkles, Heart, TrendingUp, Zap } from 'lucide-react';
import { UserData } from '../types';

interface LandingProps {
  onStartJourney: () => void;
  userData: UserData;
  onSubscriptionView: () => void;
}

const Landing: React.FC<LandingProps> = ({ 
  onStartJourney, 
  userData, 
  onSubscriptionView 
}) => {
  const canUseService = userData.isPremium || userData.dailyListens < 3;

  return (
    <div className="min-h-screen relative">
      {/* Built on Bolt Badge - Top Right */}
      <div className="fixed top-20 right-4 z-50">
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-black text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span>Built on Bolt</span>
        </a>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-orange-900 leading-tight">
                Music That Matches
                <span className="block bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Your Mood
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-orange-700 max-w-3xl mx-auto leading-relaxed">
                Speak your feelings and let AI create the perfect soundtrack for your emotional state. 
                From anxious to joyful, we'll craft music that moves you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {canUseService ? (
                <button
                  onClick={onStartJourney}
                  className="group bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                >
                  <Mic className="w-6 h-6 group-hover:animate-pulse" />
                  <span>Tell us how you feel</span>
                </button>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-orange-700">You've used all 3 free listens today</p>
                  <button
                    onClick={onSubscriptionView}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                  >
                    <Sparkles className="w-6 h-6" />
                    <span>Upgrade to Premium</span>
                  </button>
                </div>
              )}
            </div>

            {!userData.isPremium && canUseService && (
              <p className="text-sm text-orange-600">
                {3 - userData.dailyListens} free listens remaining today
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-orange-900">
              How It Works
            </h2>
            <p className="text-xl text-orange-700 max-w-2xl mx-auto">
              Three simple steps to transform your emotions into beautiful music
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-orange-900">Speak Your Mood</h3>
              <p className="text-orange-700 leading-relaxed">
                Simply describe how you're feeling right now. Our AI listens and understands the nuances of your emotional state.
              </p>
            </div>

            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-orange-900">AI Analysis</h3>
              <p className="text-orange-700 leading-relaxed">
                Advanced AI analyzes your emotional tone, energy level, and mood patterns to craft the perfect musical response.
              </p>
            </div>

            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-orange-900">Enjoy Your Music</h3>
              <p className="text-orange-700 leading-relaxed">
                Listen to your personalized track designed to complement, enhance, or transform your current emotional state.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">10K+</div>
              <div className="text-orange-700">Tracks Generated</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-amber-600">50+</div>
              <div className="text-orange-700">Mood Categories</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">95%</div>
              <div className="text-orange-700">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-orange-900">
            Ready to discover your soundtrack?
          </h2>
          <p className="text-xl text-orange-700">
            Join thousands who've found their perfect mood music
          </p>
          
          {canUseService ? (
            <button
              onClick={onStartJourney}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Start Your Musical Journey</span>
            </button>
          ) : (
            <button
              onClick={onSubscriptionView}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3"
            >
              <Sparkles className="w-6 h-6" />
              <span>Unlock Unlimited Access</span>
            </button>
          )}
        </div>
      </section>

      {/* Built on Bolt Badge - Footer */}
      <footer className="bg-gradient-to-r from-orange-900 to-amber-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            {/* Built on Bolt Badge */}
            <div className="flex justify-center">
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-lg">Built on Bolt</span>
                <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white transition-colors duration-300"></div>
              </a>
            </div>
            
            {/* Additional Footer Content */}
            <div className="text-orange-200 text-sm">
              <p>© 2024 MoodTunes. Crafted with AI to transform your emotions into music.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;