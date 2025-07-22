/**
 * Platform Configuration Module
 * Detects platform and provides appropriate configuration
 */

export interface PlatformConfig {
  platform: string;
  port: number;
  host: string;
  isDevelopment: boolean;
  databaseUrl: string;
  staticPath?: string;
}

export function detectPlatform(): string {
  if (process.env.REPL_ID) return 'replit';
  if (process.env.FUNCTIONS_EMULATOR) return 'firebase-emulator';
  if (process.env.FIREBASE_CONFIG) return 'firebase';
  if (process.env.VERCEL) return 'vercel';
  if (process.env.DYNO) return 'heroku';
  if (process.env.NETLIFY) return 'netlify';
  return 'local';
}

export function getPlatformConfig(): PlatformConfig {
  const platform = detectPlatform();

  const config: PlatformConfig = {
    platform,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
    host: '0.0.0.0', // Always bind to 0.0.0.0 for accessibility
    isDevelopment: process.env.NODE_ENV === 'development',
    databaseUrl: process.env.DATABASE_URL || '',
  };

  // Platform-specific adjustments
  switch (platform) {
    case 'replit':
      config.host = '0.0.0.0';
      config.port = parseInt(process.env.PORT || '5000', 10);
      break;

    case 'firebase':
    case 'firebase-emulator':
      config.host = 'localhost';
      config.port = parseInt(process.env.PORT || '5000', 10);
      break;

    case 'vercel':
      // Vercel handles port automatically
      config.port = parseInt(process.env.PORT || '3000', 10);
      break;

    case 'heroku':
      config.port = parseInt(process.env.PORT || '5000', 10);
      config.host = '0.0.0.0';
      break;

    case 'local':
    default:
      config.host = 'localhost';
      config.port = parseInt(process.env.PORT || '5000', 10);
      break;
  }

  return config;
}

export function getEnvironmentVariables() {
  const platform = detectPlatform();

  // Common environment variables
  const env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  };

  // Platform-specific environment handling
  switch (platform) {
    case 'firebase':
      // Firebase Functions config
      const functions = require('firebase-functions');
      return {
        ...env,
        GEMINI_API_KEY: functions.config().gemini?.api_key || env.GEMINI_API_KEY,
        DATABASE_URL: functions.config().database?.url || env.DATABASE_URL,
      };

    case 'vercel':
      // Vercel automatically handles environment variables
      return env;

    case 'heroku':
      // Heroku config vars
      return env;

    default:
      return env;
  }
}

export function logPlatformInfo() {
  const config = getPlatformConfig();
  console.log(`🚀 Platform: ${config.platform.toUpperCase()}`);
  console.log(`🌐 Server: ${config.host}:${config.port}`);
  console.log(`🔧 Environment: ${config.isDevelopment ? 'Development' : 'Production'}`);

  if (config.platform !== 'replit') {
    console.log(`📋 Platform detected: ${config.platform}`);
    console.log(`💡 Use platform-specific commands for optimal experience`);
  }
}