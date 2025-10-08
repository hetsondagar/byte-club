#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Byte Club Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExample = fs.readFileSync(path.join(__dirname, '..', 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created. Please update the MONGO_URI and JWT_SECRET values.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Run migrations
console.log('🗄️  Running database migrations...');
try {
  execSync('npm run migrate', { stdio: 'inherit' });
  console.log('✅ Migrations completed successfully.\n');
} catch (error) {
  console.error('❌ Failed to run migrations:', error.message);
  process.exit(1);
}

// Run seeds
console.log('🌱 Seeding database...');
try {
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully.\n');
} catch (error) {
  console.error('❌ Failed to seed database:', error.message);
  process.exit(1);
}

console.log('🎉 Byte Club Backend setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with the correct MONGO_URI and JWT_SECRET');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. The API will be available at http://localhost:3001');
console.log('4. Health check: http://localhost:3001/health');
console.log('\n🔗 API Endpoints:');
console.log('- POST /api/auth/signup');
console.log('- POST /api/auth/login');
console.log('- GET /api/challenges');
console.log('- GET /api/daily');
console.log('- GET /api/users/leaderboard');
console.log('\nHappy coding! 🚀');
