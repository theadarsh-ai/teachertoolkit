#!/bin/bash

echo "🚀 EduAI Platform - Firebase Deployment Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo -e "${BLUE}🔐 Checking Firebase authentication...${NC}"
firebase login --no-localhost

# Check if project is initialized
if [ ! -f ".firebaserc" ]; then
    echo -e "${YELLOW}⚠️  Firebase project not initialized. Please run 'firebase init' first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Building frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build completed${NC}"

echo -e "${BLUE}📦 Building Firebase Functions...${NC}"
cd functions
npm install
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Functions build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Functions build completed${NC}"
cd ..

echo -e "${BLUE}🚀 Deploying to Firebase...${NC}"
firebase deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${GREEN}Your app is now live at: https://$(firebase projects:list | grep -E '^\s*genzion-ai' | awk '{print $1}').web.app${NC}"
    echo ""
    echo -e "${BLUE}📱 Your deployed services:${NC}"
    echo -e "   • Frontend: Firebase Hosting"
    echo -e "   • Backend API: Firebase Functions"
    echo -e "   • Database: PostgreSQL (Neon)"
    echo -e "   • Authentication: Firebase Auth"
    echo ""
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi