/*
  Script: checkChallenges.js
  Purpose: Verify number of challenges in DB and that they are "detailed" (have content.question, starterCode, and testCases when type is 'code').
*/

const mongoose = require('mongoose');

async function main() {
  try {
    // Load config from compiled dist
    const { config } = require('../dist/config');
    const connStr = config.mongoUri.endsWith('/')
      ? `${config.mongoUri}byte_club`
      : `${config.mongoUri}/byte_club`;

    // Import compiled Challenge model
    const Challenge = require('../dist/models/Challenge').default;

    await mongoose.connect(connStr);

    const total = await Challenge.countDocuments({});
    const active = await Challenge.countDocuments({ isActive: true });

    const byDifficultyAgg = await Challenge.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    const byDifficulty = Object.fromEntries(byDifficultyAgg.map(d => [d._id || 'unknown', d.count]));

    // Fetch a subset to validate details (limit large transfers)
    const cursor = Challenge.find({}, {
      slug: 1,
      title: 1,
      type: 1,
      difficulty: 1,
      'content.question': 1,
      'content.starterCode': 1,
      'content.testCases': 1
    }).cursor();

    let missingDetails = [];
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const c = doc;
      const hasQuestion = !!(c.content && c.content.question);
      const hasStarter = !!(c.content && c.content.starterCode);
      const hasTests = !!(c.content && Array.isArray(c.content.testCases) && c.content.testCases.length > 0);
      if (c.type === 'code') {
        if (!hasQuestion || !hasStarter || !hasTests) {
          missingDetails.push({ slug: c.slug, title: c.title, type: c.type, hasQuestion, hasStarter, hasTests });
        }
      } else {
        // For non-code types, ensure at least question exists
        if (!hasQuestion) {
          missingDetails.push({ slug: c.slug, title: c.title, type: c.type, hasQuestion, hasStarter, hasTests });
        }
      }
    }

    console.log(JSON.stringify({
      counts: {
        total,
        active,
        byDifficulty
      },
      missingDetailsCount: missingDetails.length,
      missingDetails: missingDetails.slice(0, 20) // show first 20 if many
    }, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('checkChallenges failed:', err && err.message ? err.message : err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();


