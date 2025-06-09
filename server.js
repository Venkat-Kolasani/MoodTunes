import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:5173', 'https://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enhanced middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Load tracks data with error handling
let tracksData = [];
try {
  const tracksFile = fs.readFileSync(path.join(__dirname, 'tracks.json'), 'utf8');
  tracksData = JSON.parse(tracksFile);
  console.log(`✅ Loaded ${tracksData.length} tracks from tracks.json`);
} catch (error) {
  console.error('❌ Error loading tracks.json:', error.message);
  tracksData = [];
}

// Input validation middleware
const validateGenerateTrackInput = (req, res, next) => {
  const { mood, genre, energy } = req.body;
  
  if (!mood || typeof mood !== 'string' || mood.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Mood is required and must be a non-empty string' 
    });
  }
  
  if (mood.length > 500) {
    return res.status(400).json({ 
      error: 'Mood description is too long (max 500 characters)' 
    });
  }
  
  // Sanitize inputs
  req.body.mood = mood.trim();
  if (genre) req.body.genre = genre.trim();
  if (energy) req.body.energy = energy.trim();
  
  next();
};

// Helper function to calculate mood similarity
function calculateMoodSimilarity(trackMood, userMood) {
  const moodSynonyms = {
    anxious: ['worried', 'nervous', 'stressed', 'tense', 'uneasy', 'restless'],
    calm: ['peaceful', 'relaxed', 'serene', 'tranquil', 'quiet', 'still'],
    happy: ['joyful', 'cheerful', 'upbeat', 'positive', 'excited', 'elated'],
    sad: ['melancholy', 'down', 'blue', 'depressed', 'gloomy', 'sorrowful'],
    energetic: ['active', 'dynamic', 'vibrant', 'lively', 'pumped', 'vigorous'],
    tired: ['exhausted', 'weary', 'sleepy', 'drained', 'fatigued', 'worn'],
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

  const trackLevel = energyLevels[trackEnergy?.toLowerCase()] || 3;
  const userLevel = energyLevels[userEnergy?.toLowerCase()] || 3;
  
  const difference = Math.abs(trackLevel - userLevel);
  return Math.max(0, 1 - (difference / 4));
}

// API endpoint to generate track
app.post('/api/generate-track', validateGenerateTrackInput, (req, res) => {
  try {
    const { mood, genre, energy } = req.body;

    console.log(`🎵 Generating track for mood: "${mood}", genre: "${genre}", energy: "${energy}"`);

    if (tracksData.length === 0) {
      return res.status(503).json({ 
        error: 'Music library is currently unavailable. Please try again later.' 
      });
    }

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

    // Sort by score and get the best matches
    scoredTracks.sort((a, b) => b.score - a.score);
    
    // Add some randomness to avoid always returning the same track
    const topTracks = scoredTracks.slice(0, Math.min(5, scoredTracks.length));
    const selectedTrack = topTracks[Math.floor(Math.random() * topTracks.length)];

    if (!selectedTrack || selectedTrack.score === 0) {
      // Fallback to a random calm track if no good match found
      const fallbackTracks = tracksData.filter(track => 
        track.mood.toLowerCase().includes('calm') || 
        track.mood.toLowerCase().includes('peaceful')
      );
      
      if (fallbackTracks.length > 0) {
        const fallbackTrack = fallbackTracks[Math.floor(Math.random() * fallbackTracks.length)];
        console.log(`🔄 Using fallback track: "${fallbackTrack.title}"`);
        return res.json(fallbackTrack);
      }
      
      // Ultimate fallback
      const ultimateFallback = {
        id: 'fallback',
        title: 'Peaceful Moments',
        duration: '3:24',
        mood: 'calm',
        genre: 'Ambient',
        energy: 'low',
        description: 'A gentle, calming track to help you find peace.',
        audioUrl: '/tracks/peaceful-moments.mp3'
      };
      
      console.log(`🆘 Using ultimate fallback track`);
      return res.json(ultimateFallback);
    }

    // Remove the score before sending response
    const { score, ...trackResponse } = selectedTrack;
    
    console.log(`✅ Selected track: "${trackResponse.title}" (score: ${score.toFixed(2)})`);
    res.json(trackResponse);

  } catch (error) {
    console.error('❌ Error generating track:', error);
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint with detailed information
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    tracksLoaded: tracksData.length,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  };
  
  console.log(`🏥 Health check requested`);
  res.json(healthData);
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    api: 'MoodTunes API',
    version: '1.0.0',
    status: 'operational',
    endpoints: [
      'GET /api/health',
      'GET /api/status',
      'POST /api/generate-track'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Start server with enhanced logging
app.listen(PORT, () => {
  console.log('\n🎵 MoodTunes API Server Started');
  console.log('================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 Loaded ${tracksData.length} tracks`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`🎯 Generate track: POST http://localhost:${PORT}/api/generate-track`);
  console.log('================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});