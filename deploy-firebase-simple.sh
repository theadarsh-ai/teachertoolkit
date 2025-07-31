#!/bin/bash

echo "🚀 Simple Firebase Deploy for EduAI Platform"
echo "============================================"

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install: npm install -g firebase-tools"
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# Build Firebase Functions
echo "📦 Building Firebase Functions..."
cd functions
npm install --silent
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Functions build failed!"
    cd ..
    exit 1
fi
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment completed!"
echo "🌐 Your app should be live at: https://genzion-ai.web.app"