#!/bin/bash

echo "🚀 EduAI Platform - Quick Firebase Deploy"
echo "========================================"

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://genzion-ai.web.app"