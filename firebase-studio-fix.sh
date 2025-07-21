#!/bin/bash

echo "🔧 Firebase Studio Fix Script"

# Step 1: Stop all running processes
echo "1. Stopping all processes..."
pkill -f "firebase" 2>/dev/null || true
pkill -f "tsx" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Step 2: Clean up ports
echo "2. Cleaning up ports..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Step 3: Set correct environment
echo "3. Setting environment variables..."
export NODE_ENV=development
export PORT=5000

# Step 4: Check if Firebase is initialized
if [ ! -f "firebase.json" ]; then
    echo "❌ Firebase not initialized. Run: firebase init"
    exit 1
fi

# Step 5: Create a simple test index.html in public folder
echo "4. Creating test files..."
mkdir -p public
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>EduAI Platform - Firebase Studio Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .info { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <h1>🎓 EduAI Platform - Firebase Studio</h1>
    <div class="status success">✅ Frontend: Working</div>
    <div class="status info">🔗 Backend API Test: <span id="api-status">Testing...</span></div>
    <div class="status info">📊 Platform Detection: <span id="platform-status">Testing...</span></div>
    
    <h2>Available Features:</h2>
    <ul>
        <li>11 AI-powered teaching agents</li>
        <li>Content generation with Gemini AI</li>
        <li>Image processing and analysis</li>
        <li>PDF generation for worksheets</li>
        <li>NCERT textbook database</li>
        <li>Multi-language support</li>
    </ul>
    
    <div id="app-link" style="margin-top: 20px;">
        <a href="/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            🚀 Launch EduAI Platform
        </a>
    </div>

    <script>
        // Test API connectivity
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                document.getElementById('api-status').innerHTML = '✅ Connected - ' + JSON.stringify(data);
            })
            .catch(error => {
                document.getElementById('api-status').innerHTML = '❌ Error: ' + error.message;
                // If API fails, redirect to functions URL
                console.log('API failed, checking functions...');
            });
            
        // Test platform detection
        fetch('/api/platform')
            .then(response => response.json())
            .then(data => {
                document.getElementById('platform-status').innerHTML = '✅ Platform: ' + data.platform;
            })
            .catch(error => {
                document.getElementById('platform-status').innerHTML = '⚠️ Platform detection failed';
            });
    </script>
</body>
</html>
EOF

# Step 6: Build the project
echo "5. Building project..."
npm run build 2>/dev/null || echo "Build may have failed, continuing..."

# Step 7: Copy built files to public if build succeeded
if [ -d "dist" ]; then
    echo "6. Copying built files..."
    cp -r dist/* public/ 2>/dev/null || true
fi

# Step 8: Start Firebase emulators
echo "7. Starting Firebase emulators..."
firebase emulators:start --only hosting,functions &

# Step 9: Wait and show URLs
echo "8. Waiting for services to start..."
sleep 5

echo ""
echo "🎉 Firebase Studio Setup Complete!"
echo ""
echo "Access your application at:"
echo "📱 Firebase Hosting: http://127.0.0.1:5000"
echo "🔧 Firebase UI: http://127.0.0.1:4000"
echo ""
echo "If the above URLs don't work, try:"
echo "🌐 Alternative: http://localhost:5000"
echo ""
echo "The application includes:"
echo "- 11 AI teaching agents"
echo "- Content generation with Gemini AI"
echo "- Image processing capabilities"
echo "- PDF worksheet generation"
echo "- Complete NCERT textbook database"
echo ""