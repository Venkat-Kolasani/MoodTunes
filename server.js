import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load tracks data
let tracksData = [];
try {
  const tracksFile = fs.readFileSync(path.join(__dirname, 'tracks.json'), 'utf8');
  tracksData = JSON.parse(tracksFile);
} catch (error) {
  console.error('Error loading tracks.json:', error);
  tracksData = [];
}

// Helper function to calculate mood similarity
function calculateMoodSimilarity(trackMood, userMood) {
  const moodSynonyms = {
    anxious: ['worried', 'nervous', 'stressed', 'tense', 'uneasy'],
    calm: ['peaceful', 'relaxed', 'serene', 'tranquil', 'quiet'],
    happy: ['joyful', 'cheerful', 'upbeat', 'positive', 'excited'],
    sad: ['melancholy', 'down', 'blue', 'depressed', 'gloomy'],
    energetic: ['active', 'dynamic', 'vibrant', 'lively', 'pumped'],
    tired: ['exhausted', 'weary', 'sleepy', 'drained', 'fatigued'],
    hopeful: ['optimistic', 'positive', 'encouraging', 'uplifting', 'inspiring'],
    romantic: ['loving', 'passionate', 'intimate', 'tender', 'affectionate'],
    focused: ['concentrated', 'determined', 'motivated', 'driven', 'productive'],
    nostalgic: ['reminiscent', 'wistful', 'sentimental', 'reflective', 'longing']
  };

  const userMoodLower = userMood.toLowerCase();
  const trackMoodLower = trackMood.toLowerCase();

  // Direct match
  if (userMoodLower.includes(trackMoodLower) || trackMoodLower.includes(userMoodLower)) {
    return 1.0;
  }

  // Check synonyms
  for (const [baseMood, synonyms] of Object.entries(moodSynonyms)) {
    if (trackMoodLower === baseMood || synonyms.includes(trackMoodLower)) {
      if (userMoodLower.includes(baseMood) || synonyms.some(syn => userMoodLower.includes(syn))) {
        return 0.8;
      }
    }
  }

  // Partial word matching
  const userWords = userMoodLower.split(/\s+/);
  const trackWords = trackMoodLower.split(/\s+/);
  
  let matchCount = 0;
  for (const userWord of userWords) {
    for (const trackWord of trackWords) {
      if (userWord.includes(trackWord) || trackWord.includes(userWord)) {
        matchCount++;
      }
    }
  }

  return matchCount > 0 ? 0.5 : 0;
}

// Helper function to calculate energy similarity
function calculateEnergySimilarity(trackEnergy, userEnergy) {
  const energyLevels = {
    'very low': 1,
    'low': 2,
    'medium': 3,
    'high': 4,
    'very high': 5
  };

  const trackLevel = energyLevels[trackEnergy.toLowerCase()] || 3;
  const userLevel = energyLevels[userEnergy.toLowerCase()] || 3;
  
  const difference = Math.abs(trackLevel - userLevel);
  return Math.max(0, 1 - (difference / 4));
}

// API endpoint to generate track
app.post('/api/generate-track', (req, res) => {
  try {
    const { mood, genre, energy } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    console.log(`Generating track for mood: "${mood}", genre: "${genre}", energy: "${energy}"`);

    // Filter and score tracks
    const scoredTracks = tracksData.map(track => {
      let score = 0;

      // Mood similarity (weight: 0.6)
      const moodSimilarity = calculateMoodSimilarity(track.mood, mood);
      score += moodSimilarity * 0.6;

      // Genre similarity (weight: 0.2)
      if (genre && track.genre) {
        const genreSimilarity = genre.toLowerCase() === track.genre.toLowerCase() ? 1 : 0;
        score += genreSimilarity * 0.2;
      }

      // Energy similarity (weight: 0.2)
      if (energy && track.energy) {
        const energySimilarity = calculateEnergySimilarity(track.energy, energy);
        score += energySimilarity * 0.2;
      }

      return { ...track, score };
    });

    // Sort by score and get the best match
    scoredTracks.sort((a, b) => b.score - a.score);
    
    // Add some randomness to avoid always returning the same track
    const topTracks = scoredTracks.slice(0, Math.min(3, scoredTracks.length));
    const selectedTrack = topTracks[Math.floor(Math.random() * topTracks.length)];

    if (!selectedTrack || selectedTrack.score === 0) {
      // Fallback to a random calm track if no good match found
      const fallbackTracks = tracksData.filter(track => 
        track.mood.toLowerCase().includes('calm') || 
        track.mood.toLowerCase().includes('peaceful')
      );
      
      if (fallbackTracks.length > 0) {
        const fallbackTrack = fallbackTracks[Math.floor(Math.random() * fallbackTracks.length)];
        return res.json(fallbackTrack);
      }
      
      // Ultimate fallback
      return res.json(tracksData[0] || {
        id: 'fallback',
        title: 'Peaceful Moments',
        duration: '3:24',
        mood: 'calm',
        genre: 'Ambient',
        energy: 'low',
        description: 'A gentle, calming track to help you find peace.',
        audioUrl: '/tracks/peaceful-moments.mp3'
      });
    }

    // Remove the score before sending response
    const { score, ...trackResponse } = selectedTrack;
    
    console.log(`Selected track: "${trackResponse.title}" (score: ${score.toFixed(2)})`);
    res.json(trackResponse);

  } catch (error) {
    console.error('Error generating track:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    tracksLoaded: tracksData.length,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 MoodTunes API server running on port ${PORT}`);
  console.log(`📚 Loaded ${tracksData.length} tracks`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});