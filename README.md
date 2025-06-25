# 🎧 MoodTunes – AI-Generated Music Based on Your Mood

## 🧠 Concept
MoodTunes is a web-based AI experience that allows users to speak their current mood, which is then interpreted by AI to generate a custom, royalty-free music track in real time. It aims to merge mental well-being with creativity and entertainment.

## 🌐 Live Demo Flow (Website Version)
1. **Landing Page**
   - Clean UI (like Calm or Headspace)
   - CTA: "Tell us how you feel"

2. **Mood Capture (Voice-Based)**
   - User clicks a microphone icon
   - Speaks: "I'm feeling anxious but hopeful"
   - Uses ElevenLabs + Web Speech API to transcribe and interpret tone

3. **Mood Analysis & Generation**
   - Google Gemini AI interprets emotion (e.g., "anxious + hopeful" → calm piano with uplifting melody)
   - Backend selects or generates music using fallback audio generation
   - Serves pre-generated royalty-free tracks tagged by mood

4. **Play the Song + AI Voice**
   - Song starts playing
   - AI voice (via ElevenLabs) gives a personalized intro:
     "Here's something to help you feel balanced again."

5. **Share or Subscribe**
   - Free listens per day, then asks to subscribe to unlock:
     - Higher-quality audio
     - Daily mood-based tracks
     - Save favorite moods

## 🛠 Tech Stack

### 🖥️ Frontend:
- **React + TypeScript** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Web Speech API** for voice recognition

### 🔊 Voice AI:
- **ElevenLabs** (Text-to-Speech)
- **Web Speech API** (Speech-to-Text)

### 🎵 Music AI:
- **Fallback Audio Generator** - Real-time audio synthesis
- **Curated royalty-free sound library**
- **Prompt-based generation** tied to mood keywords

### 🧠 AI/NLP:
- **Google Gemini (AI Studio)** - For sentiment classification and mood understanding
- **Free tier available** - No rate limiting issues

### 💳 Monetization:
- **Freemium Plan**: 3 free tracks/day
- **Pro Plan**: Unlimited access with enhanced features

### 🌍 Hosting:
- **Netlify** (Deploy Challenge compatible)
- **Node.js/Express** backend

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Google AI Studio account (free)
- ElevenLabs account (optional, for voice narration)

### 1. Clone and Install
```bash
git clone <repository-url>
cd moodtunes
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env
```

### 3. Get API Keys

#### Google AI Studio (Free Tier)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file:
```env
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_GEMINI_MODEL=gemini-pro
```

#### ElevenLabs (Optional - for voice narration)
1. Visit [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
2. Create an account and get your API key
3. Add to your `.env` file:
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### 4. Run the Application
```bash
# Start both frontend and backend
npm run dev:full

# Or run separately:
npm run dev:server  # Backend on port 3001
npm run dev         # Frontend on port 5173
```

### 5. Test the Integration
```bash
# Test API keys and functionality
node test-api-keys.js
```

## 🔧 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and feature availability.

### Generate Track
```
POST /api/generate-track
Content-Type: application/json

{
  "mood": "feeling anxious but hopeful",
  "genre": "Ambient",
  "energy": "low"
}
```

### Generate Narration
```
POST /api/narrate
Content-Type: application/json

{
  "mood": "feeling excited about the future"
}
```

## 🎵 Features

### ✅ Current Features
- **Voice mood capture** with Web Speech API
- **AI mood analysis** using Google Gemini
- **Real-time audio generation** with fallback system
- **Motivational voice narration** with ElevenLabs
- **Responsive design** with beautiful UI
- **Offline mode** with generated audio tracks
- **Free tier limits** (3 tracks/day)
- **Premium subscription** mockup

### 🚧 Planned Features
- **User accounts** and mood history
- **Playlist creation** and saving
- **Social sharing** capabilities
- **Mobile app** version
- **Advanced mood analysis** with voice tone detection
- **Custom voice selection**
- **Mood journaling** integration

## 💸 Monetization Options

### Free Plan
- 3 free tracks per day
- Basic mood analysis
- Standard audio quality
- Web access only

### Premium Plan ($9.99/month)
- Unlimited daily tracks
- Advanced AI mood analysis
- High-quality audio (320kbps)
- Save favorite tracks
- Download tracks for offline
- Mood history & insights
- Priority customer support
- Early access to new features

## 🔒 Privacy & Security
- **No mood data stored** without user consent
- **Local audio processing** when possible
- **Secure API key management**
- **GDPR compliant** data handling

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- **Google AI Studio** for free Gemini API access
- **ElevenLabs** for high-quality voice synthesis
- **Lucide React** for beautiful icons
- **Tailwind CSS** for rapid UI development

## 🆘 Support
If you encounter any issues:
1. Check the [troubleshooting guide](#troubleshooting)
2. Run `node test-api-keys.js` to verify your setup
3. Check the console for error messages
4. Open an issue on GitHub

## 🧪 Troubleshooting

### Common Issues

#### "Google API key not configured"
- Ensure you have a valid Google AI Studio API key
- Check that `GOOGLE_API_KEY` is set in your `.env` file
- Verify the key has access to Gemini models

#### "Audio generation failed"
- This is normal - the app will fall back to generated audio
- Check your internet connection
- Verify ElevenLabs API key if using voice narration

#### "Speech recognition not working"
- Ensure you're using Chrome or Edge browser
- Check microphone permissions
- Try the example mood buttons instead

---

**Built with ❤️ using Google Gemini AI and modern web technologies**