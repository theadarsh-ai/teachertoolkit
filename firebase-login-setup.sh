#!/bin/bash

echo "🔑 Firebase Login Setup for EduAI Platform"
echo "=========================================="

# Check Firebase CLI installation
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not installed. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI available"

# Check current login status
echo "🔍 Checking current Firebase login status..."
firebase list --only hosting,functions 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Already logged in to Firebase"
else
    echo "📝 Not logged in to Firebase"
    echo ""
    echo "🔐 To login to Firebase, run this command:"
    echo "firebase login --no-localhost"
    echo ""
    echo "📋 This will:"
    echo "1. Open a browser for Google authentication"
    echo "2. Allow you to select your Google account"
    echo "3. Grant Firebase CLI permissions"
    echo "4. Return you to the terminal"
    echo ""
    echo "⚡ Alternative: Generate CI token"
    echo "firebase login:ci"
    echo ""
fi

# Check if project is initialized
if [ -f "firebase.json" ]; then
    echo "✅ Firebase project initialized"
    
    # Show current project
    CURRENT_PROJECT=$(firebase use 2>/dev/null | grep "active project" | cut -d: -f2 | xargs)
    if [ ! -z "$CURRENT_PROJECT" ]; then
        echo "📱 Active project: $CURRENT_PROJECT"
    else
        echo "⚠️  No active project set"
        echo "🔧 Set active project with: firebase use <project-id>"
    fi
else
    echo "⚠️  Firebase not initialized in this directory"
    echo "🔧 Initialize with: firebase init"
fi

echo ""
echo "🎯 Firebase Setup Status:"
echo "- Firebase Config: $([ -f 'firebase.json' ] && echo '✅' || echo '❌')"
echo "- Environment Keys: $([ ! -z "$VITE_FIREBASE_API_KEY" ] && echo '✅' || echo '❌')"
echo "- Application: $([ -f 'client/src/lib/firebase.ts' ] && echo '✅' || echo '❌')"

echo ""
echo "🚀 Next Steps:"
echo "1. Run: firebase login --no-localhost"
echo "2. Run: firebase use genzion-ai"
echo "3. Run: firebase emulators:start"
echo ""