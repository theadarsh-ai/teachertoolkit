# Firestore Database Setup Guide

## Current Status

The application has successfully integrated with Firebase Firestore for storing NCERT textbook data. However, if you encounter "Database not found" errors, you may need to manually create the Firestore database in the Firebase Console.

## Quick Setup Steps

### 1. Access Firebase Console
Visit: https://console.firebase.google.com/project/genzion-ai/firestore

### 2. Create Firestore Database
1. Click "Create database"
2. Choose "Start in production mode" (for live deployment) or "Test mode" (for development)
3. Select a location closest to your users (e.g., "us-central1")
4. Click "Done"

### 3. Verify Connection
After creating the database, the application will automatically:
- Initialize required collections
- Start storing NCERT textbook data
- Enable all agent functionalities

## Collections Created

The application automatically creates these collections:
- `ncert_textbooks` - Complete NCERT curriculum database
- `ncert_chapters` - Individual chapter content
- `scraping_logs` - Activity tracking
- `users` - User profile information
- `agent_configs` - Per-user agent settings
- `chat_sessions` - Conversation history
- `chat_messages` - Individual messages
- `generated_content` - AI-produced materials

## Current Data Status

✅ **228 NCERT Textbooks Available**
- Classes 1-12 covered
- Multiple languages: English, Hindi, Urdu  
- All major subjects included

## API Endpoints

- `POST /api/ncert/scrape` - Populate database with NCERT data
- `GET /api/ncert/textbooks` - Retrieve all textbooks
- `GET /api/ncert/textbooks/class/:classNum` - Get textbooks by class
- `GET /api/ncert/textbooks/subject/:subject` - Get textbooks by subject

## Troubleshooting

If you see "5 NOT_FOUND" errors:
1. Ensure Firestore is enabled in Firebase Console
2. Check that the service account has proper permissions
3. Run `POST /api/firestore/init` to initialize collections
4. Verify environment variables are correctly set

## Environment Variables Required

```
FIREBASE_PROJECT_ID=genzion-ai
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key-in-pem-format
```