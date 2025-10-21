const mongoose = require('mongoose');

// Simple test to verify challenge structure
async function testChallengeStructure() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://shani:shani123@cluster0.8frjugg.mongodb.net/byte_club');
    console.log('✅ Connected to MongoDB');

    // Get a few challenges to check their structure
    const Challenge = mongoose.model('Challenge', new mongoose.Schema({}, { strict: false }));
    
    const challenges = await Challenge.find({ slug: { $in: ['remove-duplicates', 'two-sum', 'merge-sorted'] } })
      .select('title description content.question')
      .limit(3);

    console.log('\n📋 Challenge Structure Test Results:');
    console.log('=====================================');
    
    challenges.forEach((challenge, index) => {
      console.log(`\n${index + 1}. ${challenge.title}`);
      console.log(`   Description: "${challenge.description}"`);
      console.log(`   Question starts with: "${challenge.content?.question?.substring(0, 100)}..."`);
      console.log(`   Description matches question: ${challenge.description === challenge.content?.question?.split('\n')[0]}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testChallengeStructure();
