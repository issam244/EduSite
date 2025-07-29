// Comprehensive test script for MathTunis platform
const fetch = require('node-fetch');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(url, options = {}, testName = '') {
  try {
    const response = await fetch(url, options);
    const data = await response.text();
    
    if (response.ok) {
      log('green', `✓ ${testName} - SUCCESS`);
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } else {
      log('red', `✗ ${testName} - FAILED (${response.status})`);
      return null;
    }
  } catch (error) {
    log('red', `✗ ${testName} - ERROR: ${error.message}`);
    return null;
  }
}

async function runComprehensiveTests() {
  log('blue', '🧪 STARTING COMPREHENSIVE VERIFICATION OF MATHTUNIS PLATFORM');
  log('blue', '================================================================');

  // 1. Test Server Health
  log('yellow', '\n1. Testing Server Health...');
  await testAPI(`${API_URL}/health`, {}, 'Server Health Check');

  // 2. Test Authentication System
  log('yellow', '\n2. Testing Authentication System...');
  
  // Test user registration
  const registerData = {
    email: 'testuser@mathtunis.com',
    displayName: 'Ahmed Ben Ali',
    schoolLevel: 'lycee',
    firebaseUid: 'test-firebase-uid-123'
  };
  
  const newUser = await testAPI(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerData)
  }, 'User Registration');

  // Test user login
  await testAPI(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firebaseUid: 'test-firebase-uid-123' })
  }, 'User Login');

  // Test auth status
  await testAPI(`${API_URL}/auth/status`, {}, 'Auth Status Check');

  // 3. Test Chat/Math Solving System
  log('yellow', '\n3. Testing Math Solving System...');
  
  // Create a conversation
  const conversation = await testAPI(`${API_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: null })
  }, 'Create Conversation');

  if (conversation) {
    // Test different types of math problems
    const mathProblems = [
      'Résoudre: 2x + 5 = 13',
      'Calculer la dérivée de f(x) = x² + 3x + 2',
      'Trouver la limite de (x² - 1)/(x - 1) quand x → 1',
      'Factoriser: x² - 9',
      'حل المعادلة: 3x - 7 = 14' // Arabic test
    ];

    for (const problem of mathProblems) {
      await testAPI(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: problem,
          type: 'user',
          conversationId: conversation.conversation.id
        })
      }, `Math Problem: ${problem.substring(0, 30)}...`);
    }
  }

  // 4. Test Admin System
  log('yellow', '\n4. Testing Admin System...');
  
  // Test admin user creation
  const adminData = {
    email: 'admin@mathtunis.com',
    displayName: 'Admin User',
    schoolLevel: 'superieur',
    firebaseUid: 'admin-firebase-uid-456',
    isAdmin: true
  };

  await testAPI(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminData)
  }, 'Admin User Registration');

  // Test admin endpoints
  await testAPI(`${API_URL}/admin/users`, {}, 'Get All Users (Admin)');
  
  // Test article creation
  await testAPI(`${API_URL}/admin/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Guide de Calcul Différentiel',
      content: 'Ce guide explique les bases du calcul différentiel...',
      category: 'mathematics'
    })
  }, 'Create Article (Admin)');

  // 5. Test Data Persistence
  log('yellow', '\n5. Testing Data Persistence...');
  
  // Get conversations
  await testAPI(`${API_URL}/conversations`, {}, 'Get Conversations');
  
  // Get messages for conversation
  if (conversation) {
    await testAPI(`${API_URL}/conversations/${conversation.conversation.id}/messages`, {}, 'Get Conversation Messages');
  }

  // 6. Test Multi-Language Support
  log('yellow', '\n6. Testing Multi-Language Support...');
  
  const multiLangTests = [
    { content: 'What is 2+2?', lang: 'en' },
    { content: 'Qu\'est-ce que 2+2?', lang: 'fr' },
    { content: 'ما هو 2+2؟', lang: 'ar' },
    { content: 'Chnou 2+2?', lang: 'tn' }
  ];

  for (const test of multiLangTests) {
    if (conversation) {
      await testAPI(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: test.content,
          type: 'user',
          conversationId: conversation.conversation.id,
          metadata: { language: test.lang }
        })
      }, `Multi-language test (${test.lang})`);
    }
  }

  // 7. Test Frontend Accessibility
  log('yellow', '\n7. Testing Frontend Accessibility...');
  
  // Test main page
  await testAPI(BASE_URL, {}, 'Main Page Load');
  
  // Test admin page
  await testAPI(`${BASE_URL}/admin`, {}, 'Admin Page Load');

  log('blue', '\n================================================================');
  log('green', '🎉 COMPREHENSIVE VERIFICATION COMPLETED');
  log('blue', '================================================================');
}

// Run the tests
runComprehensiveTests().catch(console.error);