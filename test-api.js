// API Testing Script
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing MoodTunes API...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log(`   Tracks loaded: ${healthData.tracksLoaded}`);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test 2: Generate Track - Happy Mood
  try {
    console.log('\n2. Testing Track Generation (Happy)...');
    const trackResponse = await fetch(`${API_BASE_URL}/api/generate-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood: 'feeling really happy and excited',
        genre: 'Upbeat Folk',
        energy: 'high'
      })
    });
    const trackData = await trackResponse.json();
    if (trackResponse.ok) {
      console.log('✅ Track Generated:', trackData.title);
      console.log(`   Duration: ${trackData.duration}`);
      console.log(`   Mood: ${trackData.mood}`);
    } else {
      console.log('❌ Track Generation failed:', trackData.error);
    }
  } catch (error) {
    console.log('❌ Track Generation failed:', error.message);
  }

  // Test 3: Generate Track - Sad Mood
  try {
    console.log('\n3. Testing Track Generation (Sad)...');
    const trackResponse = await fetch(`${API_BASE_URL}/api/generate-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood: 'feeling down and melancholy',
        energy: 'low'
      })
    });
    const trackData = await trackResponse.json();
    if (trackResponse.ok) {
      console.log('✅ Track Generated:', trackData.title);
      console.log(`   Duration: ${trackData.duration}`);
      console.log(`   Mood: ${trackData.mood}`);
    } else {
      console.log('❌ Track Generation failed:', trackData.error);
    }
  } catch (error) {
    console.log('❌ Track Generation failed:', error.message);
  }

  // Test 4: Invalid Request
  try {
    console.log('\n4. Testing Invalid Request...');
    const invalidResponse = await fetch(`${API_BASE_URL}/api/generate-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const invalidData = await invalidResponse.json();
    if (invalidResponse.status === 400) {
      console.log('✅ Validation working:', invalidData.error);
    } else {
      console.log('❌ Validation not working properly');
    }
  } catch (error) {
    console.log('❌ Invalid request test failed:', error.message);
  }

  console.log('\n🏁 API Testing Complete!');
}

// Test API connectivity
async function testApi() {
  console.log('Testing API connectivity...');
  
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI();
  testApi();
}

export { testAPI };