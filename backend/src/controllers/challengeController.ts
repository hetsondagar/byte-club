import { Request, Response } from 'express';
import { Challenge, Attempt, User } from '../models';
import { calculateXP, updateUserXP, updateStreak } from '../utils/xp';
import { checkAndUnlockBadges } from '../utils/badges';
import { executeCode } from '../utils/codeExecution';
import logger from '../config/logger';
import { runOnJudge0 } from '../utils/judge0';

export const getChallenges = async (req: Request, res: Response) => {
  try {
    const { difficulty, type, tags, isDaily } = req.query;
    
    const filter: any = { isActive: true };
    
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (isDaily !== undefined) filter.isDaily = isDaily === 'true';

    const challenges = await Challenge.find(filter)
      .select('-content.correctAnswer')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      message: 'Challenges retrieved successfully',
      data: { challenges }
    });
  } catch (error) {
    logger.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getChallenge = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const challenge = await Challenge.findOne({ slug, isActive: true });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Remove correct answer from response
    const challengeData = {
      ...challenge.toObject(),
      content: {
        ...(challenge as any).content,
        correctAnswer: undefined
      }
    };

    return res.json({
      success: true,
      message: 'Challenge retrieved successfully',
      data: { challenge: challengeData }
    });
  } catch (error) {
    logger.error('Get challenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const submitChallenge = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;
    const { answer } = req.body;
    const userId = req.user._id;

    const challenge = await Challenge.findOne({ slug, isActive: true });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user already completed this challenge
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if ((user as any).completedChallenges.includes(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Challenge already completed'
      });
    }

    let isCorrect = false;
    let xpEarned = 0;
    let runResults: any[] | undefined;

    // Check answer based on challenge type
    if ((challenge as any).type === 'code') {
      const testCases = Array.isArray((challenge as any).content?.testCases) ? (challenge as any).content.testCases : [];
      const forbiddenMethods = Array.isArray((challenge as any).content?.forbiddenMethods) ? (challenge as any).content.forbiddenMethods : [];
      
      // Check for forbidden methods first (same logic as runCodeForChallenge)
      for (const method of forbiddenMethods) {
        if ((answer as string).includes(method)) {
          isCorrect = false;
          runResults = [{
            input: "Code validation",
            expected: "Manual implementation",
            actual: `Used built-in method: ${method}`,
            passed: false,
            error: `❌ You used the built-in ${method} method! This challenge requires you to implement the solution manually. Try using a loop or other approach instead.`
          }];
          break;
        }
      }
      
      // Additional check for reverse method variations
      if (!runResults && forbiddenMethods.some((m: string) => m.includes('reverse'))) {
        const reversePatterns = [
          { pattern: /\.reverse\s*\(/g, name: ".reverse()" },
          { pattern: /arr\.reverse\s*\(/g, name: "arr.reverse()" },
          { pattern: /array\.reverse\s*\(/g, name: "array.reverse()" },
          { pattern: /\.reverse\s*\(\s*\)/g, name: ".reverse()" },
          { pattern: /reverse\s*\(/g, name: "reverse()" }
        ];
        
        for (const { pattern, name } of reversePatterns) {
          if (pattern.test(answer as string)) {
            isCorrect = false;
            runResults = [{
              input: "Code validation",
              expected: "Manual implementation",
              actual: `Used built-in method: ${name}`,
              passed: false,
              error: `❌ You used the built-in ${name} method! This challenge requires you to implement array reversal manually. Try using a for loop to iterate backwards through the array.`
            }];
            break;
          }
        }
      }
      
      // If no forbidden methods detected, run normal execution
      if (!runResults) {
        const result = executeCode(answer as string, testCases, forbiddenMethods);
        isCorrect = result.success;
        runResults = result.results;
      }
    } else {
      // For MCQ and true/false
      isCorrect = answer === (challenge as any).content.correctAnswer;
    }

    const prevBadges: string[] = ((user as any).badges || []).slice();
    if (isCorrect) {
      xpEarned = calculateXP((challenge as any).difficulty);
      
      // Update user XP and level
      await updateUserXP(userId, xpEarned);
      
      // Update streak
      await updateStreak(userId);
      
      // Add to completed challenges
      (user as any).completedChallenges.push(slug);
      await user.save();
      
      // Check for badge unlocks
      await checkAndUnlockBadges(userId);
      
      // Add streak bonus if applicable
      if ((user as any).currentStreak >= 5) {
        const streakBonus = 20;
        await updateUserXP(userId, streakBonus);
        xpEarned += streakBonus;
      }
    }

    // Record attempt
    const attempt = new Attempt({
      userId,
      challengeSlug: slug,
      isCorrect,
      xpEarned
    });
    await attempt.save();

    logger.info(`Challenge submission: ${slug} by user ${(user as any).username}, correct: ${isCorrect}`);

    // Reload user to capture updated badges/completions
    const updatedUser = await User.findById(userId);
    const updatedBadges: string[] = (updatedUser as any)?.badges || [];
    const updatedCompleted: string[] = (updatedUser as any)?.completedChallenges || [];
    const badgesUnlocked = updatedBadges.filter(b => !prevBadges.includes(b));

    return res.json({
      success: true,
      message: isCorrect ? 'Challenge completed successfully!' : 'Incorrect answer',
      data: {
        isCorrect,
        xpEarned,
        streak: (user as any).currentStreak,
        totalXP: (user as any).totalXP + (isCorrect ? xpEarned : 0),
        runResults,
        badgesUnlocked,
        badges: updatedBadges,
        completedChallenges: updatedCompleted
      }
    });
  } catch (error) {
    logger.error('Submit challenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const runCodeForChallenge = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;
    const { code, language } = req.body as { code: string; language?: string };

    const challenge = await Challenge.findOne({ slug, isActive: true });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if ((challenge as any).type !== 'code') {
      return res.status(400).json({ success: false, message: 'Challenge is not a code challenge' });
    }

    const testCases = Array.isArray((challenge as any).content?.testCases) ? (challenge as any).content.testCases : [];
    const forbiddenMethods = Array.isArray((challenge as any).content?.forbiddenMethods) ? (challenge as any).content.forbiddenMethods : [];
    logger.info(`Challenge ${slug} test cases:`, testCases);
    logger.info(`Challenge ${slug} forbidden methods:`, forbiddenMethods);

    // Check for forbidden methods first (before any execution)
    for (const method of forbiddenMethods) {
      if (code.includes(method)) {
        return res.json({
          success: false,
          message: 'Forbidden method detected',
          data: {
            success: false,
            results: [{
              input: "Code validation",
              expected: "Manual implementation",
              actual: `Used built-in method: ${method}`,
              passed: false,
              error: `❌ You used the built-in ${method} method! This challenge requires you to implement the solution manually. Try using a loop or other approach instead.`
            }],
            error: `❌ You used the built-in ${method} method! This challenge requires you to implement the solution manually. Try using a loop or other approach instead.`
          }
        });
      }
    }

    // Additional check for reverse method variations
    if (forbiddenMethods.some((m: string) => m.includes('reverse'))) {
      const reversePatterns = [
        { pattern: /\.reverse\s*\(/g, name: ".reverse()" },
        { pattern: /arr\.reverse\s*\(/g, name: "arr.reverse()" },
        { pattern: /array\.reverse\s*\(/g, name: "array.reverse()" },
        { pattern: /\.reverse\s*\(\s*\)/g, name: ".reverse()" },
        { pattern: /reverse\s*\(/g, name: "reverse()" }
      ];
      
      for (const { pattern, name } of reversePatterns) {
        if (pattern.test(code)) {
          return res.json({
            success: false,
            message: 'Forbidden method detected',
            data: {
              success: false,
              results: [{
                input: "Code validation",
                expected: "Manual implementation",
                actual: `Used built-in method: ${name}`,
                passed: false,
                error: `❌ You used the built-in ${name} method! This challenge requires you to implement array reversal manually. Try using a for loop to iterate backwards through the array.`
              }],
              error: `❌ You used the built-in ${name} method! This challenge requires you to implement array reversal manually. Try using a for loop to iterate backwards through the array.`
            }
          });
        }
      }
    }

    // If language provided or non-empty, prefer Judge0; fallback to local vm2
    if (language) {
      // Build a harness depending on language
      const lang = String(language).toLowerCase();
      let wrapped = '';
      if (lang === 'python') {
        wrapped = `
${code}
__tests__ = ${JSON.stringify(testCases)}
import json

def __run():
    results = []
    for t in __tests__:
        try:
            if 'solution' in globals() and callable(solution):
                out = solution(t.get('input'))
            else:
                raise Exception('No solution function found')
            passed = json.dumps(out, sort_keys=True) == json.dumps(t.get('expected'), sort_keys=True)
            results.append({ 'input': t.get('input'), 'expected': t.get('expected'), 'actual': out, 'passed': passed })
        except Exception as e:
            results.append({ 'input': t.get('input'), 'expected': t.get('expected'), 'actual': None, 'passed': False, 'error': str(e) })
    return results

print(json.dumps({ '__results__': __run() }))
`;
      } else if (lang === 'javascript') {
        wrapped = `
${code}
const __tests__ = ${JSON.stringify(testCases)};
function __run() {
  const results = [];
  for (const t of __tests__) {
    try {
      const out = typeof solution === 'function' ? solution(t.input) : (function(){ throw new Error('No solution function found'); })();
      const passed = JSON.stringify(out) === JSON.stringify(t.expected);
      results.push({ input: t.input, expected: t.expected, actual: out, passed });
    } catch (e) {
      results.push({ input: t.input, expected: t.expected, actual: null, passed: false, error: (e && e.message) || 'Error' });
    }
  }
  return results;
}
console.log(JSON.stringify({ __results__: __run() }));
`;
      } else {
        // For C/C++/Java: run per test via stdin/out parsing
        // We'll execute user's code once per test with stdin = JSON of input and expect stdout = JSON.stringify(actual)
        const perTestResults: any[] = [];
        try {
          for (const t of testCases) {
            const inputJson = JSON.stringify(t.input);
            const j0 = await runOnJudge0(code, language, inputJson);
            let actual: any = null;
            let err: string | undefined;
            try {
              actual = j0.stdout ? JSON.parse(j0.stdout.trim()) : j0.stdout;
            } catch (_) {
              // leave as raw
              actual = j0.stdout ? j0.stdout.trim() : j0.stdout;
            }
            if (j0.stderr || j0.compile_output) {
              err = j0.compile_output ? j0.compile_output.toString() : (j0.stderr ? j0.stderr.toString() : undefined);
            }
            const passed = JSON.stringify(actual) === JSON.stringify(t.expected);
            perTestResults.push({ input: t.input, expected: t.expected, actual, passed, error: err });
          }
          const success = perTestResults.length > 0 && perTestResults.every(r => r.passed);
          return res.json({ success: true, message: 'Code executed', data: { success, results: perTestResults } });
        } catch (judge0Error: any) {
          logger.error('Judge0 execution error for C/C++/Java:', judge0Error);
          return res.json({ 
            success: false, 
            message: 'Code execution failed', 
            data: { 
              success: false, 
              results: [], 
              error: judge0Error.message || 'Execution failed',
              stderr: judge0Error.message
            } 
          });
        }
      }

      try {
        const j0 = await runOnJudge0(wrapped, language);
        let results: any[] = [];
        try {
          const parsed = j0.stdout ? JSON.parse(j0.stdout) : {};
          results = parsed.__results__ || [];
        } catch (e) {
          // ignore parse error
        }
        const success = results.length > 0 && results.every(r => r.passed);
        return res.json({ success: true, message: 'Code executed', data: { success, results, stderr: j0.stderr, compile_output: j0.compile_output } });
      } catch (judge0Error: any) {
        logger.error('Judge0 execution error:', judge0Error);
        return res.json({ 
          success: false, 
          message: 'Code execution failed', 
          data: { 
            success: false, 
            results: [], 
            error: judge0Error.message || 'Execution failed',
            stderr: judge0Error.message
          } 
        });
      }
    }

    const result = executeCode(code, testCases, forbiddenMethods);

    return res.json({
      success: true,
      message: 'Code executed',
      data: result
    });
  } catch (error) {
    logger.error('Run code error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const runGenericCode = async (req: Request, res: Response) => {
  try {
    const { code, testCases = [], language } = req.body as any;
    
    if (language) {
      const lang = String(language).toLowerCase();
      let wrapped = '';
      if (lang === 'python') {
        wrapped = `
${code}
__tests__ = ${JSON.stringify(testCases)}
import json

def __run():
    results = []
    for t in __tests__:
        try:
            if 'solution' in globals() and callable(solution):
                out = solution(t.get('input'))
            else:
                raise Exception('No solution function found')
            passed = json.dumps(out, sort_keys=True) == json.dumps(t.get('expected'), sort_keys=True)
            results.append({ 'input': t.get('input'), 'expected': t.get('expected'), 'actual': out, 'passed': passed })
        except Exception as e:
            results.append({ 'input': t.get('input'), 'expected': t.get('expected'), 'actual': None, 'passed': False, 'error': str(e) })
    return results

print(json.dumps({ '__results__': __run() }))
`;
      } else if (lang === 'javascript') {
        wrapped = `
${code}
const __tests__ = ${JSON.stringify(testCases)};
function __run() {
  const results = [];
  for (const t of __tests__) {
    try {
      const out = typeof solution === 'function' ? solution(t.input) : (function(){ throw new Error('No solution function found'); })();
      const passed = JSON.stringify(out) === JSON.stringify(t.expected);
      results.push({ input: t.input, expected: t.expected, actual: out, passed });
    } catch (e) {
      results.push({ input: t.input, expected: t.expected, actual: null, passed: false, error: (e && e.message) || 'Error' });
    }
  }
  return results;
}
console.log(JSON.stringify({ __results__: __run() }));
`;
      } else {
        const perTestResults: any[] = [];
        for (const t of testCases) {
          const inputJson = JSON.stringify(t.input);
          const j0 = await runOnJudge0(code, language, inputJson);
          let actual: any = null;
          let err: string | undefined;
          try {
            actual = j0.stdout ? JSON.parse(j0.stdout.trim()) : j0.stdout;
          } catch (_) {
            actual = j0.stdout ? j0.stdout.trim() : j0.stdout;
          }
          if (j0.stderr || j0.compile_output) {
            err = j0.compile_output ? j0.compile_output.toString() : (j0.stderr ? j0.stderr.toString() : undefined);
          }
          const passed = JSON.stringify(actual) === JSON.stringify(t.expected);
          perTestResults.push({ input: t.input, expected: t.expected, actual, passed, error: err });
        }
        const success = perTestResults.length > 0 && perTestResults.every(r => r.passed);
        return res.json({ success: true, message: 'Code executed', data: { success, results: perTestResults } });
      }

      const j0 = await runOnJudge0(wrapped, language);
      let results: any[] = [];
      try {
        const parsed = j0.stdout ? JSON.parse(j0.stdout) : {};
        results = parsed.__results__ || [];
      } catch (e) {
        // ignore parse error
      }
      const success = results.length > 0 && results.every(r => r.passed);
      return res.json({ success: true, message: 'Code executed', data: { success, results, stderr: j0.stderr, compile_output: j0.compile_output } });
    }
    
    const result = executeCode(code, testCases);
    return res.json({ success: true, message: 'Code executed', data: result });
  } catch (error) {
    logger.error('Run generic code error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
