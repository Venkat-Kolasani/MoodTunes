import React from 'react';
import { Check, Crown, Zap, Music, Heart } from 'lucide-react';
import { UserData } from '../types';

interface SubscriptionProps {
  onUpgrade: () => void;
  onBackToHome: () => void;
  userData: UserData;
}

const Subscription: React.FC<SubscriptionProps> = ({ onUpgrade, onBackToHome, userData }) => {
  const features = {
    free: [
      'Up to 3 tracks per day',
      'Basic mood analysis',
      'Standard audio quality',
      'Web access only'
    ],
    premium: [
      'Unlimited daily tracks',
      'Advanced AI mood analysis',
      'High-quality audio (320kbps)',
      'Save favorite tracks',
      'Download tracks for offline',
      'Mood history & insights',
      'Priority customer support',
      'Early access to new features'
    ]
  };

  const handleUpgrade = () => {
    // In a real app, this would integrate with Stripe
    alert('Redirecting to secure payment processing...\n\nIn a real implementation, this would integrate with Stripe for payment processing.');
    onUpgrade();
  };

  if (userData.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-orange-900">You're Premium!</h1>
            <p className="text-xl text-orange-700">
              Enjoy unlimited access to AI-generated mood music
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
            <h3 className="font-semibold text-orange-900 mb-4">Your Premium Benefits:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {features.premium.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-orange-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Start Creating Music
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-orange-900">
            Choose Your Plan
          </h1>
          <p className="text-xl text-orange-700 max-w-2xl mx-auto">
            Upgrade to Premium for unlimited access to AI-generated mood music
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-8 relative">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-orange-900">Free</h3>
                <div className="text-4xl font-bold text-orange-900">
                  $0<span className="text-lg font-normal text-orange-700">/month</span>
                </div>
                <p className="text-orange-700">Perfect for trying out MoodTunes</p>
              </div>

              <div className="space-y-3">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-orange-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4">
                <div className="text-sm text-orange-600 mb-3">
                  {userData.dailyListens}/3 free listens used today
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(userData.dailyListens / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-xl text-white p-8 relative transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-4 right-4">
              <div className="bg-amber-300 text-orange-900 px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="w-8 h-8 text-amber-200" />
                  <h3 className="text-2xl font-bold">Premium</h3>
                </div>
                <div className="text-4xl font-bold">
                  $9.99<span className="text-lg font-normal text-orange-200">/month</span>
                </div>
                <p className="text-orange-200">Unlimited mood music generation</p>
              </div>

              <div className="space-y-3">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-amber-200 flex-shrink-0" />
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full bg-white text-orange-600 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors duration-200 mt-6"
              >
                Upgrade to Premium
              </button>

              <p className="text-center text-orange-200 text-sm">
                Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="mt-20 text-center space-y-12">
          <h2 className="text-3xl font-bold text-orange-900">
            Why Choose MoodTunes Premium?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-orange-900">Unlimited Generation</h3>
              <p className="text-orange-700">
                Create as many mood-based tracks as you want, whenever inspiration strikes.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-orange-900">Superior Quality</h3>
              <p className="text-orange-700">
                Enjoy high-fidelity audio and more sophisticated AI analysis for better results.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-orange-900">Personal Library</h3>
              <p className="text-orange-700">
                Save your favorite tracks and build a personalized collection of mood music.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-16">
          <button
            onClick={onBackToHome}
            className="text-orange-700 hover:text-orange-900 font-medium transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;