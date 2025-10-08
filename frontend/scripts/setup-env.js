#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Byte Club Environment Setup\n');

// Check if .env already exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('📝 Current configuration:');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      console.log(`   ${key}=${value}`);
    }
  });
} else {
  console.log('📋 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
    console.log('📝 Please edit .env file with your configuration');
  } else {
    console.log('❌ env.example file not found');
    console.log('📝 Creating basic .env file...');
    
    const basicEnv = `# Byte Club Frontend Environment Variables

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Development Settings
VITE_APP_NAME=Byte Club
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_DEBUG_LOGS=true
VITE_ENABLE_API_LOGGING=true
`;
    
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created');
  }
}

console.log('\n🚀 Next steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Run: npm run dev');
console.log('3. Check browser console for configuration logs');

console.log('\n📚 For more information, see:');
console.log('- ENVIRONMENT_SETUP.md');
console.log('- env.example (development template)');
console.log('- env.production.example (production template)');
