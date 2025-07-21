#!/bin/bash

# Set Java environment for Firebase emulators
export JAVA_HOME=$(find /nix/store -name "*openjdk*" -type d | head -1)/lib/openjdk
export PATH=$JAVA_HOME/bin:$PATH

echo "🔥 Starting Firebase Emulators for EduAI Platform"
echo "📍 Java version: $(java -version 2>&1 | head -1)"
echo "📍 Firebase tools version: $(npx firebase-tools --version)"

# Start Firebase emulators
echo "🚀 Starting Firestore emulator..."
npx firebase-tools emulators:start --only firestore --project genzion-ai

echo "✅ Firebase emulators started!"
echo "🌐 Firebase Studio: http://127.0.0.1:4000"
echo "📊 Firestore UI: http://127.0.0.1:4000/firestore"
echo "🎯 EduAI Platform: http://localhost:5000"