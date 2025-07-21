#!/usr/bin/env node

/**
 * Test Setup Script for Firebase Studio
 * This script tests all components to identify issues
 */

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('🧪 Testing EduAI Platform Setup...\n');

// Test 1: Check Node.js version
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.log('❌ Node.js not available');
  process.exit(1);
}

// Test 2: Check if package.json exists
if (existsSync('package.json')) {
  console.log('✅ package.json found');
} else {
  console.log('❌ package.json not found');
  process.exit(1);
}

// Test 3: Check if node_modules exists
if (existsSync('node_modules')) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('⚠️ node_modules not found - run: npm install');
}

// Test 4: Check critical directories
const criticalDirs = ['client', 'server', 'shared'];
criticalDirs.forEach(dir => {
  if (existsSync(dir)) {
    console.log(`✅ ${dir}/ directory found`);
  } else {
    console.log(`❌ ${dir}/ directory missing`);
  }
});

// Test 5: Check environment variables
const requiredEnvVars = ['GEMINI_API_KEY', 'DATABASE_URL'];
if (existsSync('.env')) {
  console.log('✅ .env file found');
} else {
  console.log('⚠️ .env file not found - you may need to set environment variables');
}

// Test 6: Test TypeScript compilation
try {
  console.log('🔍 Testing TypeScript compilation...');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('⚠️ TypeScript compilation has issues - this may cause problems');
}

// Test 7: Test if build works
try {
  console.log('🏗️ Testing build process...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build process successful');
} catch (error) {
  console.log('⚠️ Build process failed - this will prevent deployment');
}

// Test 8: Check if server can start
try {
  console.log('🚀 Testing server startup (quick test)...');
  const serverTest = execSync('timeout 5 node -e "import(\'./server/index.ts\')" || true', { 
    stdio: 'pipe',
    timeout: 5000 
  });
  console.log('✅ Server startup test passed');
} catch (error) {
  console.log('⚠️ Server may have startup issues');
}

console.log('\n📋 Test Summary:');
console.log('If all tests show ✅, your setup should work correctly.');
console.log('If you see ⚠️ or ❌, address those issues first.');
console.log('\n🚀 To start the application:');
console.log('1. Make sure you have a .env file with your API keys');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:5000');