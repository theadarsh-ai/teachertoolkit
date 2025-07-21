#!/bin/bash

echo "🚀 Starting EduAI Platform in Local Development Mode"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists, if not create a template
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env template..."
    cat > .env << 'EOF'
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_postgresql_url_here
PORT=5000
EOF
    echo "⚠️ Please edit .env file with your actual API keys before running again"
    exit 1
fi

# Kill any existing process on port 5000
echo "🧹 Cleaning up any existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Set environment and start server
echo "🎯 Starting development server..."
export NODE_ENV=development
npm run dev