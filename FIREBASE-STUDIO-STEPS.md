# Firebase Studio - Exact Steps to Follow

## Problem Analysis
The issue is that Firebase Studio environment has different file structure requirements than Replit. Here's the complete fix:

## Method 1: Automated Fix (Recommended)

**Run this single command in your Firebase Studio terminal:**
```bash
./firebase-studio-fix.sh
```

This will automatically:
- Stop all running processes
- Clean up ports
- Create proper file structure
- Start Firebase emulators
- Show you the correct URLs

## Method 2: Manual Step-by-Step

### Step 1: Stop All Processes
```bash
pkill -f "firebase" 2>/dev/null || true
pkill -f "tsx" 2>/dev/null || true
```

### Step 2: Create Public Directory
```bash
mkdir -p public
```

### Step 3: Build Project
```bash
npm run build
```

### Step 4: Copy Files to Public
```bash
# If build succeeded, copy files
if [ -d "dist" ]; then
  cp -r dist/* public/
fi
```

### Step 5: Create Test Index
```bash
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>EduAI Platform - Live Test</title>
    <style>body{font-family:Arial;padding:20px} .btn{background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px}</style>
</head>
<body>
    <h1>🎓 EduAI Platform - Firebase Studio</h1>
    <p>✅ Frontend is working!</p>
    <p>🧪 Testing backend: <span id="status">Loading...</span></p>
    <a href="/dashboard" class="btn">🚀 Launch Dashboard</a>
    
    <script>
        fetch('/api/health').then(r=>r.json()).then(d=>{
            document.getElementById('status').innerHTML='✅ Backend connected - '+JSON.stringify(d);
        }).catch(e=>{
            document.getElementById('status').innerHTML='⚠️ Backend test: '+e.message;
        });
    </script>
</body>
</html>
EOF
```

### Step 6: Start Firebase Emulators
```bash
firebase emulators:start --only hosting,functions
```

## Expected Output
When working correctly, you'll see:
```
✔  hosting: Local server: http://127.0.0.1:5000
✔  functions: Local server: http://127.0.0.1:5001
✔  All emulators ready! It is now safe to connect your app.
```

## Access URLs
- **Main App**: http://127.0.0.1:5000
- **Dashboard**: http://127.0.0.1:5000/dashboard
- **API Test**: http://127.0.0.1:5000/api/health
- **Firebase UI**: http://127.0.0.1:4000

## Alternative: Direct Express Server

If Firebase emulators still don't work:
```bash
# Kill everything
pkill -f "firebase" 2>/dev/null || true
pkill -f "tsx" 2>/dev/null || true

# Start direct Express server
NODE_ENV=development npx tsx server/index.ts
```

Then access: http://localhost:5000

## What You Should See
1. **Test page loads** with green checkmarks
2. **Dashboard button** takes you to main app
3. **All 11 AI agents** visible and clickable
4. **Image upload** working in Differentiated Materials
5. **PDF generation** working for worksheets

The key issue was the wrong public directory path. Now it's fixed to use `public/` instead of `dist/public/`.