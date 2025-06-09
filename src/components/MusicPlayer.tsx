import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Share2, Download, Heart, Volume2, AlertCircle } from 'lucide-react';
import { GeneratedTrack } from '../types';

interface MusicPlayerProps {
  track: GeneratedTrack;
  mood: string;
  onBackToHome: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ track, mood, onBackToHome }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLiked, setIsLiked] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set up audio event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setAudioError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setAudioError(true);
      setIsLoading(false);
      setIsPlaying(false);
      console.warn('Audio file not found, using demo mode');
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    // Set initial volume
    audio.volume = volume;

    // Try to load the audio
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [track.audioUrl]);

  // Update volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioError) {
      // If there's an audio error, simulate playback
      simulatePlayback();
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.warn('Audio playback failed, falling back to simulation:', error);
      setAudioError(true);
      simulatePlayback();
    }
  };

  // Fallback simulation for when audio files don't exist
  const simulatePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const totalDurationSeconds = 204; // 3:24 in seconds
    setDuration(totalDurationSeconds);

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalDurationSeconds) {
          setIsPlaying(false);
          clearInterval(interval);
          return totalDurationSeconds;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const resetTrack = () => {
    const audio = audioRef.current;
    if (audio && !audioError) {
      audio.currentTime = 0;
      setCurrentTime(0);
    } else {
      setCurrentTime(0);
    }
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const audio = audioRef.current;
    
    if (audio && !audioError) {
      audio.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MoodTunes: ${track.title}`,
          text: `Check out this AI-generated track for "${mood}" mood!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Check out this AI-generated track for "${mood}" mood: ${track.title}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-orange-800 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          preload="metadata"
          crossOrigin="anonymous"
        >
          <source src={track.audioUrl} type="audio/mpeg" />
          <source src={track.audioUrl.replace('.mp3', '.ogg')} type="audio/ogg" />
          Your browser does not support the audio element.
        </audio>

        {/* Track Artwork */}
        <div className="relative mb-8">
          <div className="w-80 h-80 mx-auto bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
            {/* Animated background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-400/30 to-amber-600/30 ${isPlaying ? 'animate-pulse' : ''}`} />
            
            {/* Sound waves animation */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white/50 animate-bounce"
                      style={{
                        height: `${20 + Math.random() * 40}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Central play button when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Track Information */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl font-bold text-white">{track.title}</h1>
          <p className="text-xl text-orange-200 capitalize">Generated for "{mood}" mood</p>
          <p className="text-orange-100 max-w-lg mx-auto leading-relaxed">
            {track.description}
          </p>
          
          {/* Audio status indicator */}
          {audioError && (
            <div className="flex items-center justify-center space-x-2 text-orange-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Demo mode - Audio file not available</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 204}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-orange-200">
              <span>{formatTime(currentTime)}</span>
              <span>{duration ? formatTime(duration) : track.duration}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={resetTrack}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="p-4 bg-white text-orange-900 rounded-full hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-orange-900 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
            
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 rounded-full transition-all duration-200 ${
                isLiked 
                  ? 'text-red-400 bg-red-400/20' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-white/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white/70 text-sm w-8">{Math.round(volume * 100)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="text-center mt-8 space-y-4">
          <button
            onClick={onBackToHome}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Create Another Track
          </button>
          
          <p className="text-orange-200 text-sm">
            Loving MoodTunes? Share it with friends who could use some mood music!
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-400/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

export default MusicPlayer;