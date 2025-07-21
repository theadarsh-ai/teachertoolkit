#!/bin/bash

echo "🔧 EduAI Platform - Environment Setup Helper"
echo "==========================================="

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to backup and recreate it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backed up existing .env file"
    else
        echo "❌ Cancelled. Keeping existing .env file."
        exit 1
    fi
fi

# Copy template
if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
else
    echo "❌ .env.example file not found!"
    exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "1. Edit the .env file with your actual API keys:"
echo "   nano .env    (or use your preferred editor)"
echo ""
echo "🔑 Required API Keys:"
echo "   • GEMINI_API_KEY: Get from https://aistudio.google.com/app/apikey"
echo "   • DATABASE_URL: Your PostgreSQL connection string"
echo "   • VITE_FIREBASE_*: From Firebase Console -> Project Settings"
echo ""
echo "🚀 After setting up .env, run:"
echo "   npm run dev"
echo ""

# Check if required tools are available
echo "🧪 Checking system requirements..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found! Please install Node.js first."
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found! Please install npm first."
fi

if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found! Are you in the right directory?"
fi

echo ""
echo "💡 Tip: Use 'npm run dev' to start the development server after setting up .env"