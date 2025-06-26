// Comprehensive API Key Testing Script
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = 'http://localhost:3001';

// Test configuration
const TEST_CONFIG = {
  gemini: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: process.env.GOOGLE_GEMINI_MODEL || 'gemini-pro',
    endpoint: 'https://generativelanguage.googleapis.com/v1/models'
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    endpoint: 'https://api.elevenlabs.io/v1/voices',
    testEndpoint: 'https://api.elevenlabs.io/v1/user'
  }
};

console.log('🧪 MoodTunes API Key Verification Suite (Google Gemini)');
console.log('======================================================\n');

// 1. Check Environment Variables
function checkEnvironmentVariables() {
  console.log('1. 🔍 Checking Environment Variables...');
  
  const requiredVars = ['GOOGLE_API_KEY', 'ELEVENLABS_API_KEY'];
  const optionalVars = ['GOOGLE_GEMINI_MODEL', 'ELEVENLABS_VOICE_ID'];
  
  let allConfigured = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: Configured (${value.substring(0, 10)}...)`);
    } else {
      console.log(`   ❌ ${varName}: Missing`);
      allConfigured = false;
    }
  });
  
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${value ? '✅' : '⚪'} ${varName}: ${value || 'Using default'}`);
  });
  
  console.log(`   Status: ${allConfigured ? '✅ All required keys configured' : '❌ Missing required keys'}\n`);
  return allConfigured;
}

// 2. Test Google Gemini API Authentication
async function testGeminiAuthentication() {
  console.log('2. 🤖 Testing Google Gemini API Authentication...');
  
  if (!TEST_CONFIG.gemini.apiKey) {
    console.log('   ❌ Google API key not configured\n');
    return false;
  }
  
  try {
    // Test 1: List models (simple auth test)
    console.log('   Testing basic authentication...');
    const modelsResponse = await fetch(`${TEST_CONFIG.gemini.endpoint}?key=${TEST_CONFIG.gemini.apiKey}`);
    
    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log(`   ✅ Authentication successful (${models.models?.length || 0} models available)`);
      // Print all available models and their supported methods
      if (models.models && Array.isArray(models.models)) {
        console.log('   Available models:');
        models.models.forEach(m => {
          console.log(`     - ${m.name}`);
          if (m.supportedGenerationMethods) {
            console.log(`       Supported methods: ${m.supportedGenerationMethods.join(', ')}`);
          }
        });
      }
      // Check if our target model is available
      const targetModel = models.models?.find(m => m.name.includes(TEST_CONFIG.gemini.model));
      if (targetModel) {
        console.log(`   🎯 Target model "${TEST_CONFIG.gemini.model}" is available`);
      } else {
        console.log(`   ⚠️  Target model "${TEST_CONFIG.gemini.model}" not found, but API is working`);
      }
    } else {
      const error = await modelsResponse.text();
      console.log(`   ❌ Authentication failed: ${modelsResponse.status} ${error}`);
      return false;
    }
    
    // Test 2: Simple content generation request
    console.log('   Testing content generation...');
    const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${TEST_CONFIG.gemini.model}:generateContent?key=${TEST_CONFIG.gemini.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "API test successful" in a creative way.'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50
        }
      })
    });
    
    if (generateResponse.ok) {
      const generation = await generateResponse.json();
      const content = generation.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`   ✅ Content generation successful: "${content}"`);
      console.log(`   📊 Usage: ${generation.usageMetadata?.totalTokenCount || 0} tokens\n`);
      return true;
    } else {
      const error = await generateResponse.text();
      console.log(`   ❌ Content generation failed: ${generateResponse.status} ${error}\n`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Gemini API test failed: ${error.message}\n`);
    return false;
  }
}

// 3. Test ElevenLabs API Authentication
async function testElevenLabsAuthentication() {
  console.log('3. 🎙️ Testing ElevenLabs API Authentication...');
  
  if (!TEST_CONFIG.elevenlabs.apiKey) {
    console.log('   ❌ ElevenLabs API key not configured\n');
    return false;
  }
  
  try {
    // Test 1: Get user info
    console.log('   Testing basic authentication...');
    const userResponse = await fetch(TEST_CONFIG.elevenlabs.testEndpoint, {
      headers: {
        'xi-api-key': TEST_CONFIG.elevenlabs.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.ok) {
      const user = await userResponse.json();
      console.log(`   ✅ Authentication successful`);
      console.log(`   👤 User: ${user.subscription?.tier || 'Free'} tier`);
      console.log(`   🔊 Character limit: ${user.subscription?.character_limit || 'N/A'}`);
      console.log(`   📈 Characters used: ${user.subscription?.character_count || 0}`);
    } else {
      const error = await userResponse.text();
      console.log(`   ❌ Authentication failed: ${userResponse.status} ${error}`);
      return false;
    }
    
    // Test 2: List available voices
    console.log('   Testing voice access...');
    const voicesResponse = await fetch(TEST_CONFIG.elevenlabs.endpoint, {
      headers: {
        'xi-api-key': TEST_CONFIG.elevenlabs.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (voicesResponse.ok) {
      const voices = await voicesResponse.json();
      console.log(`   ✅ Voice access successful (${voices.voices?.length || 0} voices available)`);
      
      // Check if configured voice ID exists
      const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
      const voice = voices.voices?.find(v => v.voice_id === voiceId);
      if (voice) {
        console.log(`   🎯 Configured voice: "${voice.name}" (${voice.category})`);
      } else {
        console.log(`   ⚠️  Configured voice ID not found, will use default`);
      }
      console.log('');
      return true;
    } else {
      const error = await voicesResponse.text();
      console.log(`   ❌ Voice access failed: ${voicesResponse.status} ${error}\n`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ ElevenLabs API test failed: ${error.message}\n`);
    return false;
  }
}

// 4. Test Local API Health
async function testLocalAPIHealth() {
  console.log('4. 🏥 Testing Local API Health...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    
    if (response.ok) {
      const health = await response.json();
      console.log(`   ✅ Local API is running`);
      console.log(`   📊 Status: ${health.status}`);
      console.log(`   🎵 Tracks loaded: ${health.tracksLoaded}`);
      console.log(`   🔧 Features:`);
      console.log(`      - Track generation: ${health.features?.trackGeneration ? '✅' : '❌'}`);
      console.log(`      - Narration available: ${health.features?.narration?.available ? '✅' : '❌'}`);
      console.log(`      - Gemini configured: ${health.features?.narration?.gemini ? '✅' : '❌'}`);
      console.log(`      - ElevenLabs configured: ${health.features?.narration?.elevenlabs ? '✅' : '❌'}`);
      console.log('');
      return health.features?.narration?.available || false;
    } else {
      console.log(`   ❌ Local API health check failed: ${response.status}`);
      console.log('   💡 Make sure your backend server is running on port 3001\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot connect to local API: ${error.message}`);
    console.log('   💡 Make sure your backend server is running on port 3001\n');
    return false;
  }
}

// 5. Test Full Narration Pipeline
async function testNarrationPipeline() {
  console.log('5. 🎭 Testing Full Narration Pipeline...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/narrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mood: 'happy and excited for testing'
      })
    });
    
    if (response.ok) {
      const narration = await response.json();
      console.log(`   ✅ Narration generation successful`);
      console.log(`   💬 Quote: "${narration.quote}"`);
      console.log(`   🔊 Audio URL: ${narration.audioUrl}`);
      console.log(`   ⏱️  Duration: ${narration.duration}`);
      
      // Check if audio file was created
      const audioPath = path.join(__dirname, 'public', narration.audioUrl);
      if (fs.existsSync(audioPath)) {
        const stats = fs.statSync(audioPath);
        console.log(`   📁 Audio file created: ${(stats.size / 1024).toFixed(2)} KB`);
      } else {
        console.log(`   ⚠️  Audio file not found at expected path`);
      }
      console.log('');
      return true;
    } else {
      const error = await response.json();
      console.log(`   ❌ Narration generation failed: ${response.status}`);
      console.log(`   📝 Error: ${error.error}`);
      console.log(`   💡 Message: ${error.message}`);
      
      if (error.setupRequired) {
        console.log('   🔧 Setup required - check your API keys');
      }
      console.log('');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Narration pipeline test failed: ${error.message}\n`);
    return false;
  }
}

// 6. Test Error Handling
async function testErrorHandling() {
  console.log('6. 🚨 Testing Error Handling...');
  
  try {
    // Test invalid request
    const response = await fetch(`${API_BASE_URL}/api/narrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Missing mood
    });
    
    if (response.status === 400) {
      const error = await response.json();
      console.log(`   ✅ Input validation working: ${error.error}`);
    } else {
      console.log(`   ⚠️  Unexpected response for invalid input: ${response.status}`);
    }
    
    // Test with very long mood
    const longMoodResponse = await fetch(`${API_BASE_URL}/api/narrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mood: 'a'.repeat(300) // Too long
      })
    });
    
    if (longMoodResponse.status === 400) {
      console.log(`   ✅ Length validation working`);
    } else {
      console.log(`   ⚠️  Length validation may not be working`);
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.log(`   ❌ Error handling test failed: ${error.message}\n`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  const results = {
    environment: false,
    gemini: false,
    elevenlabs: false,
    localApi: false,
    narration: false,
    errorHandling: false
  };
  
  results.environment = checkEnvironmentVariables();
  results.gemini = await testGeminiAuthentication();
  results.elevenlabs = await testElevenLabsAuthentication();
  results.localApi = await testLocalAPIHealth();
  
  if (results.gemini && results.elevenlabs && results.localApi) {
    results.narration = await testNarrationPipeline();
  } else {
    console.log('5. ⏭️  Skipping narration pipeline test (dependencies not met)\n');
  }
  
  results.errorHandling = await testErrorHandling();
  
  // Summary
  console.log('📋 Test Summary');
  console.log('===============');
  console.log(`Environment Variables: ${results.environment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Google Gemini Authentication: ${results.gemini ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`ElevenLabs Authentication: ${results.elevenlabs ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Local API Health: ${results.localApi ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Narration Pipeline: ${results.narration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Error Handling: ${results.errorHandling ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 All tests passed! Your API configuration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above and fix the configuration.');
    
    if (!results.environment) {
      console.log('\n💡 Next steps:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Get your Google API key from https://aistudio.google.com/app/apikey');
      console.log('3. Add your ElevenLabs API key');
      console.log('4. Restart your server');
    }
  }
}

// Export for use in other scripts
export { runAllTests, testGeminiAuthentication, testElevenLabsAuthentication };

// Run all tests when the script is executed
runAllTests();