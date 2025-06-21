import React, { useState } from 'react';
import { ExternalLink, Music, Shield, Users } from 'lucide-react';
import { legitimateMusicSources, MusicSource } from '../services/musicSources';

interface MusicSourceSelectorProps {
  onSourceSelect: (source: MusicSource) => void;
  selectedMood: string;
}

const MusicSourceSelector: React.FC<MusicSourceSelectorProps> = ({ 
  onSourceSelect, 
  selectedMood 
}) => {
  const [selectedSource, setSelectedSource] = useState<MusicSource | null>(null);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'creative-commons':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'royalty-free':
        return <Shield className="w-5 h-5 text-blue-600" />;
      default:
        return <Music className="w-5 h-5 text-purple-600" />;
    }
  };

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'creative-commons':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'royalty-free':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      default:
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-orange-900">
          Choose Your Music Source
        </h3>
        <p className="text-orange-700">
          Select from legitimate, legal music sources for your "{selectedMood}" mood
        </p>
      </div>

      <div className="grid gap-4">
        {legitimateMusicSources.map((source) => (
          <button
            key={source.name}
            onClick={() => {
              setSelectedSource(source);
              onSourceSelect(source);
            }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedSource?.name === source.name 
                ? 'ring-2 ring-orange-300' 
                : ''
            } ${getSourceColor(source.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getSourceIcon(source.type)}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    source.type === 'creative-commons' 
                      ? 'bg-green-200 text-green-800'
                      : source.type === 'royalty-free'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-purple-200 text-purple-800'
                  }`}>
                    {source.type.replace('-', ' ').toUpperCase()}
                  </span>
                  {!source.requiresAuth && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                      No Auth Required
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-900">Legal & Ethical Music</h4>
            <p className="text-sm text-orange-700 mt-1">
              All sources provide properly licensed music that respects artist rights and copyright law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicSourceSelector;