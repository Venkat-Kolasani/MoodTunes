import React, { useState } from 'react';
import { Play, Pause, ExternalLink, Download, Heart, Info } from 'lucide-react';

interface LegalTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  license: string;
  sourceUrl: string;
  downloadUrl?: string;
  mood: string;
  description: string;
}

interface LegalMusicPlayerProps {
  track: LegalTrack;
  onBackToSearch: () => void;
}

const LegalMusicPlayer: React.FC<LegalMusicPlayerProps> = ({ track, onBackToSearch }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control actual audio playback
  };

  const handleExternalLink = () => {
    window.open(track.sourceUrl, '_blank', 'noopener,noreferrer');
  };

  const getLicenseColor = (license: string) => {
    if (license.includes('Creative Commons')) return 'bg-green-100 text-green-800';
    if (license.includes('Royalty Free')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Track Artwork */}
      <div className="relative">
        <div className="w-80 h-80 mx-auto bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 rounded-3xl shadow-2xl flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Track Information */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-orange-900">{track.title}</h1>
        <p className="text-xl text-orange-700">by {track.artist}</p>
        <p className="text-orange-600">{track.description}</p>
        
        {/* License Information */}
        <div className="flex justify-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLicenseColor(track.license)}`}>
            {track.license}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
            isLiked 
              ? 'bg-red-100 text-red-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>

        <button
          onClick={handleExternalLink}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-all duration-200"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Source</span>
        </button>

        {track.downloadUrl && (
          <button
            onClick={() => window.open(track.downloadUrl, '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        )}
      </div>

      {/* Legal Notice */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Legal Usage</h4>
            <p className="text-sm text-blue-700 mt-1">
              This track is provided under {track.license}. Please respect the artist's rights and licensing terms.
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={onBackToSearch}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Find More Music
        </button>
      </div>
    </div>
  );
};

export default LegalMusicPlayer;