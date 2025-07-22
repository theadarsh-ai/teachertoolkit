# 🚨 Firestore Database Manual Setup Required

## Current Issue
The Firestore database for project `genzion-ai` doesn't exist yet and needs to be created manually in the Firebase Console.

## ✅ Step-by-Step Setup

### 1. Open Firebase Console
Visit: **https://console.firebase.google.com/project/genzion-ai/firestore**

### 2. Create Database
- Click **"Create database"** button
- Choose **"Start in test mode"** (allows read/write access during development)
- Select a location closest to your users (recommended: `us-central1`)
- Click **"Done"**

### 3. Verify Setup
After creating the database:
- The page should show an empty Firestore database
- Collections will be created automatically when data is first stored

### 4. Test the Connection
Run these API calls to verify everything works:

```bash
# Initialize database structure
curl -X POST http://localhost:5000/api/firestore/init

# Start NCERT data scraping (will populate 228 textbooks)
curl -X POST http://localhost:5000/api/ncert/scrape

# Check stored data
curl http://localhost:5000/api/ncert/textbooks
```

## 🔧 What Happens After Setup

Once Firestore is created, the application will automatically:
- ✅ Create required collections (`ncert_textbooks`, `users`, `chat_sessions`, etc.)
- ✅ Scrape and store 228 NCERT textbooks (Classes 1-12, multiple languages)  
- ✅ Enable all 11 AI agents with persistent data storage
- ✅ Support multi-language content (English, Hindi, Urdu)

## 📊 Expected Data After Scraping
- **228 NCERT Textbooks** covering Classes 1-12
- **All Major Subjects**: Math, Science, English, Hindi, Social Studies, etc.
- **Multi-language Support**: English, Hindi, Urdu editions
- **Chapter-level Organization** with page numbers and content structure

## 🛠️ Alternative: Using Sample Data
The application currently shows sample NCERT data for demonstration. To access the complete database with all 228 textbooks, please complete the Firestore setup above.

## ⚠️ Important Notes
- **Test Mode**: Allows unrestricted read/write access (good for development)
- **Production Mode**: Requires security rules (set up later for live deployment)  
- **Location**: Choose closest to your users for better performance
- **Billing**: Firestore has a generous free tier suitable for development

## 🆘 Need Help?
If you encounter issues:
1. Ensure you're logged into the correct Google account
2. Verify you have access to the `genzion-ai` Firebase project  
3. Check that Firestore is enabled in your Firebase project settings