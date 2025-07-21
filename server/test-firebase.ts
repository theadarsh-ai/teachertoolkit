// Test Firebase connection without private key issues
console.log('Testing Firebase environment variables...');

console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing');
console.log('FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY?.length || 0);

if (process.env.FIREBASE_PRIVATE_KEY) {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  console.log('Private key starts with:', key.substring(0, 50) + '...');
  console.log('Contains BEGIN marker:', key.includes('-----BEGIN'));
  console.log('Contains END marker:', key.includes('-----END'));
  console.log('Contains \\n literals:', key.includes('\\n'));
  console.log('Contains actual newlines:', key.includes('\n'));
}