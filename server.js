import dotenv from 'dotenv';
dotenv.config();

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

// Create necessary directories
const publicDir = path.join(__dirname, 'public');
const audioDir = path.join(publicDir, 'audio');
const tracksDir = path.join(publicDir, 'tracks');

[publicDir, audioDir, tracksDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Serve static files
app.use('/audio', express.static(audioDir));
app.use('/tracks', express.static(tracksDir));
app.use('/public', express.static(publicDir));

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'MoodTunes API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      generateTrack: 'POST /api/generate-track',
      narrate: 'POST /api/narrate'
    },
    staticFiles: {
      audio: '/audio',
      tracks: '/tracks',
      public: '/public'
    },
    documentation: 'Visit /api/health for server health information'
  });
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

// Input validation middleware for narration
const validateNarrateInput = (req, res, next) => {
  const { mood } = req.body;
  
  if (!mood || typeof mood !== 'string' || mood.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Mood is required and must be a non-empty string' 
    });
  }
  
  if (mood.length > 200) {
    return res.status(400).json({ 
      error: 'Mood description is too long (max 200 characters)' 
    });
  }
  
  req.body.mood = mood.trim();
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

// Helper function to generate enhanced track details using Google Gemini
async function generateEnhancedTrackDetails(mood, genre, energy, baseTrack) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GOOGLE_API_KEY) {
    // Return enhanced details without Gemini
    return {
      ...baseTrack,
      title: `${baseTrack.title} (Enhanced)`,
      description: `A personalized ${genre || baseTrack.genre} track crafted for your "${mood}" mood with ${energy || baseTrack.energy} energy.`
    };
  }

  const model = process.env.GOOGLE_GEMINI_MODEL || 'gemini-pro';
  const prompt = `Create an enhanced music track based on:
- Mood: ${mood}
- Genre: ${genre || baseTrack.genre}
- Energy: ${energy || baseTrack.energy}
- Base track: ${baseTrack.title}

Generate a JSON response with:
- title: A creative, mood-appropriate song title
- description: A compelling 1-2 sentence description of how this track matches the mood
- enhancedMood: A more nuanced description of the emotional tone

Keep it concise and engaging. Respond only with valid JSON.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (content) {
      try {
        const enhanced = JSON.parse(content);
        return {
          ...baseTrack,
          title: enhanced.title || baseTrack.title,
          description: enhanced.description || baseTrack.description,
          mood: enhanced.enhancedMood || baseTrack.mood
        };
      } catch (parseError) {
        console.warn('Failed to parse Gemini response, using base track');
      }
    }
  } catch (error) {
    console.error('Gemini enhancement error:', error);
  }

  // Fallback enhancement
  return {
    ...baseTrack,
    title: `${baseTrack.title} (Personalized)`,
    description: `A ${genre || baseTrack.genre} track perfectly tuned for your "${mood}" mood.`
  };
}

// Helper function to generate motivational quote using Google Gemini
async function generateMotivationalQuote(mood) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured. Please set GOOGLE_API_KEY environment variable.');
  }

  const model = process.env.GOOGLE_GEMINI_MODEL || 'gemini-pro';
  const prompt = `Generate a short, powerful motivational quote (1-2 sentences, max 100 words) for someone feeling "${mood}". The quote should be uplifting, encouraging, and help them feel better. Make it personal and inspiring.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    return content || 'You have the strength to overcome any challenge. Believe in yourself.';
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback quotes based on mood
    const fallbackQuotes = {
      sad: "Every storm runs out of rain. Your brighter days are coming, and you have the strength to weather this moment.",
      anxious: "You are braver than you believe, stronger than you seem, and more capable than you imagine. Take it one breath at a time.",
      stressed: "In the midst of chaos, find your calm. You've overcome challenges before, and you will overcome this too.",
      tired: "Rest is not a luxury, it's a necessity. Give yourself permission to pause, recharge, and rise again.",
      angry: "Your emotions are valid, but they don't define you. Channel this energy into positive change and growth.",
      lonely: "You are never truly alone. Your worth isn't measured by others' presence, but by the light you carry within.",
      hopeful: "Hope is the thing with feathers that perches in your soul. Keep nurturing that beautiful optimism within you.",
      happy: "Your joy is contagious and your light brightens the world. Embrace this beautiful moment and let it fuel your dreams.",
      default: "You are exactly where you need to be. Trust your journey, embrace your growth, and believe in your infinite potential."
    };

    // Find the best matching fallback quote
    const moodLower = mood.toLowerCase();
    for (const [key, quote] of Object.entries(fallbackQuotes)) {
      if (moodLower.includes(key)) {
        return quote;
      }
    }
    return fallbackQuotes.default;
  }
}

// Helper function to convert text to speech using ElevenLabs
async function textToSpeech(text, mood) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured. Please set ELEVENLABS_API_KEY environment variable.');
  }

  // Default voice ID (Rachel - a warm, friendly voice)
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.3,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw error;
  }
}

// Helper function to save audio file
function saveAudioFile(audioBuffer, mood) {
  // Generate filename based on mood and timestamp
  const timestamp = Date.now();
  const sanitizedMood = mood.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `motivation-${sanitizedMood}-${timestamp}.mp3`;
  const filepath = path.join(audioDir, filename);

  // Save the audio file
  fs.writeFileSync(filepath, Buffer.from(audioBuffer));
  
  return `/audio/${filename}`;
}

// Helper function to create placeholder audio files for tracks
function createPlaceholderAudioFiles() {
  console.log('🎵 Creating placeholder audio files for tracks...');
  
  tracksData.forEach(track => {
    const trackPath = track.audioUrl.replace('/tracks/', '');
    const fullPath = path.join(tracksDir, trackPath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create a minimal MP3 file if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      // Create a minimal valid MP3 header (silent audio)
      const mp3Header = Buffer.from([
        0xFF, 0xFB, 0x90, 0x00, // MP3 frame header
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
      
      try {
        fs.writeFileSync(fullPath, mp3Header);
        console.log(`   📁 Created placeholder: ${trackPath}`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to create placeholder for ${trackPath}:`, error.message);
      }
    }
  });
}

// Create placeholder files on startup
createPlaceholderAudioFiles();

// API endpoint to generate track
app.post('/api/generate-track', validateGenerateTrackInput, async (req, res) => {
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
        
        const enhancedTrack = await generateEnhancedTrackDetails(mood, genre, energy, fallbackTrack);
        const response = {
          ...enhancedTrack,
          url: enhancedTrack.audioUrl
        };
        
        return res.json(response);
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
        audioUrl: '/tracks/peaceful-moments.mp3',
        url: '/tracks/peaceful-moments.mp3'
      };
      
      console.log(`🆘 Using ultimate fallback track`);
      return res.json(ultimateFallback);
    }

    // Enhance the track with Gemini if available
    const enhancedTrack = await generateEnhancedTrackDetails(mood, genre, energy, selectedTrack);
    
    // Remove the score and format response
    const { score, ...trackData } = enhancedTrack;
    const response = {
      ...trackData,
      url: trackData.audioUrl
    };
    
    console.log(`✅ Selected track: "${response.title}" (score: ${score.toFixed(2)})`);
    res.json(response);

  } catch (error) {
    console.error('❌ Error generating track:', error);
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API endpoint to generate motivational narration
app.post('/api/narrate', validateNarrateInput, async (req, res) => {
  try {
    const { mood } = req.body;

    console.log(`🎙️ Generating motivational narration for mood: "${mood}"`);

    // Check if API keys are configured
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(503).json({
        error: 'Google API key not configured',
        message: 'Please set your GOOGLE_API_KEY environment variable to use this feature.',
        setupRequired: true
      });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(503).json({
        error: 'ElevenLabs API key not configured',
        message: 'Please set your ELEVENLABS_API_KEY environment variable to use this feature.',
        setupRequired: true
      });
    }

    // Step 1: Generate motivational quote using Google Gemini
    console.log('📝 Generating motivational quote...');
    const motivationalQuote = await generateMotivationalQuote(mood);
    console.log(`✅ Generated quote: "${motivationalQuote}"`);

    // Step 2: Convert text to speech using ElevenLabs
    console.log('🔊 Converting to speech...');
    const audioBuffer = await textToSpeech(motivationalQuote, mood);
    console.log('✅ Audio generated successfully');

    // Step 3: Save audio file
    console.log('💾 Saving audio file...');
    const audioUrl = saveAudioFile(audioBuffer, mood);
    console.log(`✅ Audio saved: ${audioUrl}`);

    // Return response
    const response = {
      audioUrl: audioUrl,
      quote: motivationalQuote,
      mood: mood,
      duration: '0:15', // Estimated duration for motivational quotes
      timestamp: new Date().toISOString()
    };

    console.log(`🎉 Narration complete for mood: "${mood}"`);
    res.json(response);

  } catch (error) {
    console.error('❌ Error generating narration:', error);
    
    // Provide specific error messages for different failure types
    if (error.message.includes('Google API key')) {
      return res.status(503).json({
        error: 'Google API configuration error',
        message: 'Please check your Google API key and try again.',
        setupRequired: true
      });
    }
    
    if (error.message.includes('ElevenLabs API key')) {
      return res.status(503).json({
        error: 'ElevenLabs API configuration error',
        message: 'Please check your ElevenLabs API key and try again.',
        setupRequired: true
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate motivational narration',
      message: 'An error occurred while generating your motivational audio. Please try again.',
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
    version: '1.0.0',
    features: {
      trackGeneration: true,
      trackEnhancement: !!process.env.GOOGLE_API_KEY,
      narration: {
        available: !!(process.env.GOOGLE_API_KEY && process.env.ELEVENLABS_API_KEY),
        gemini: !!process.env.GOOGLE_API_KEY,
        elevenlabs: !!process.env.ELEVENLABS_API_KEY
      }
    },
    staticFiles: {
      audioDir: fs.existsSync(audioDir),
      tracksDir: fs.existsSync(tracksDir),
      publicDir: fs.existsSync(publicDir)
    }
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
      'POST /api/generate-track',
      'POST /api/narrate'
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
  console.log(`🔗 Root: http://localhost:${PORT}/`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`🎯 Generate track: POST http://localhost:${PORT}/api/generate-track`);
  console.log(`🎙️ Generate narration: POST http://localhost:${PORT}/api/narrate`);
  console.log(`🎵 Music tracks: http://localhost:${PORT}/tracks/`);
  console.log(`🔊 Audio files: http://localhost:${PORT}/audio/`);
  
  // Check API key configuration
  const hasGemini = !!process.env.GOOGLE_API_KEY;
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  
  console.log('\n🔑 API Key Status:');
  console.log(`   Google Gemini: ${hasGemini ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   ElevenLabs: ${hasElevenLabs ? '✅ Configured' : '❌ Missing'}`);
  
  console.log('\n📁 Directory Status:');
  console.log(`   Public: ${fs.existsSync(publicDir) ? '✅ Created' : '❌ Missing'}`);
  console.log(`   Audio: ${fs.existsSync(audioDir) ? '✅ Created' : '❌ Missing'}`);
  console.log(`   Tracks: ${fs.existsSync(tracksDir) ? '✅ Created' : '❌ Missing'}`);
  
  if (!hasGemini || !hasElevenLabs) {
    console.log('\n⚠️  Some features require API keys:');
    if (!hasGemini) console.log('   Set GOOGLE_API_KEY for enhanced track details and narration');
    if (!hasElevenLabs) console.log('   Set ELEVENLABS_API_KEY for voice narration');
    console.log('   Optional: Set GOOGLE_GEMINI_MODEL for custom model');
  }
  
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