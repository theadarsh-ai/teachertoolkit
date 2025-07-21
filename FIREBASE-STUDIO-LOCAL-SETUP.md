# Firebase Studio Local Setup - Complete Guide

## Current Issue Analysis
The application isn't working because Firebase Studio environment has specific requirements that differ from Replit. Here's the complete fix:

## Method 1: Direct Local Development (Recommended)

### Step 1: Clean Installation
```bash
# Remove any existing node_modules and build files
rm -rf node_modules package-lock.json dist
npm install
```

### Step 2: Set Environment Variables
```bash
# Create .env file with your credentials
cat > .env << 'EOF'
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=your_postgresql_connection_string_here
PORT=5000
FIREBASE_PROJECT_ID=genzion-ai
EOF
```

### Step 3: Start Development Server
```bash
# This runs the exact same setup as Replit
NODE_ENV=development npm run dev
```

### Step 4: Verify Working
Open: `http://localhost:5000`

## Method 2: Firebase Emulator Setup (Alternative)

If you want to use Firebase emulators specifically:

### Step 1: Initialize Firebase Properly
```bash
firebase logout
firebase login
firebase use --add genzion-ai
```

### Step 2: Configure Firebase
```bash
# Set your environment config
firebase functions:config:set gemini.api_key="your_key"
firebase functions:config:set database.url="your_db_url"
```

### Step 3: Build and Run
```bash
npm run build
firebase emulators:start --only hosting,functions
```

## Method 3: Standalone Express Server

### Step 1: Simple Server Start
```bash
# Install dependencies
npm install

# Start just the Express server
node -e "
import('./server/index.ts').then(() => {
  console.log('Server started successfully');
}).catch(err => {
  console.error('Server failed:', err);
});
"
```

## Troubleshooting Common Issues

### Issue 1: Port Already in Use
```bash
# Kill any process using port 5000
sudo lsof -ti:5000 | xargs kill -9
npm run dev
```

### Issue 2: Build Fails
```bash
# Check TypeScript compilation
npm run check

# Manual build
npx vite build
```

### Issue 3: Database Connection
```bash
# Test database connection
node -e "
import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'your_database_url' });
client.connect().then(() => {
  console.log('Database connected successfully');
  client.end();
}).catch(err => console.error('Database error:', err));
"
```

## Expected Results

When working correctly, you should see:
- Server running on localhost:5000
- Platform detection showing appropriate environment
- Dashboard with 11 AI agents
- Functional content generation and image processing

## Quick Test Commands

```bash
# Test 1: Server health
curl http://localhost:5000/api/health

# Test 2: Dashboard loads
curl http://localhost:5000/

# Test 3: API endpoints
curl http://localhost:5000/api/agents
```

The key is ensuring your environment variables are properly set and the development server starts correctly with `npm run dev`.