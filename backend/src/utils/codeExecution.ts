import { VM } from 'vm2';
import logger from '../config/logger';

export const executeCode = (code: string, testCases: any[], forbiddenMethods: string[] = []): { success: boolean; results: any[]; error?: string } => {
  try {
    // Check for forbidden methods in the code
    for (const method of forbiddenMethods) {
      if (code.includes(method)) {
        return {
          success: false,
          results: [{
            input: "Code validation",
            expected: "Manual implementation",
            actual: `Used built-in method: ${method}`,
            passed: false,
            error: `❌ You used the built-in ${method} method! This challenge requires you to implement the solution manually. Try using a loop or other approach instead.`
          }],
          error: `❌ You used the built-in ${method} method! This challenge requires you to implement the solution manually. Try using a loop or other approach instead.`
        };
      }
    }

    // Additional check for reverse method variations
    if (forbiddenMethods.some(m => m.includes('reverse'))) {
      // Check for various reverse method patterns
      const reversePatterns = [
        { pattern: /\.reverse\s*\(/g, name: ".reverse()" },
        { pattern: /arr\.reverse\s*\(/g, name: "arr.reverse()" },
        { pattern: /array\.reverse\s*\(/g, name: "array.reverse()" },
        { pattern: /\.reverse\s*\(\s*\)/g, name: ".reverse()" },
        { pattern: /reverse\s*\(/g, name: "reverse()" }
      ];
      
      for (const { pattern, name } of reversePatterns) {
        if (pattern.test(code)) {
          return {
            success: false,
            results: [{
              input: "Code validation",
              expected: "Manual implementation",
              actual: `Used built-in method: ${name}`,
              passed: false,
              error: `❌ You used the built-in ${name} method! This challenge requires you to implement array reversal manually. Try using a for loop to iterate backwards through the array.`
            }],
            error: `❌ You used the built-in ${name} method! This challenge requires you to implement array reversal manually. Try using a for loop to iterate backwards through the array.`
          };
        }
      }
    }

    const vm = new VM({
      timeout: 5000, // 5 second timeout
      sandbox: {
        console: {
          log: (...args: any[]) => {
            // Capture console.log output if needed
            return args.join(' ');
          }
        }
      }
    });

    const results: any[] = [];
    
    for (const testCase of testCases) {
      try {
        // Execute the user's code with the test case
        const result = vm.run(`
          ${code}
          
          // Assume the function is named 'solution' or similar
          if (typeof solution === 'function') {
            solution(${JSON.stringify(testCase.input)});
          } else {
            throw new Error('No solution function found');
          }
        `);
        
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: result,
          passed: result === testCase.expected
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const allPassed = results.every(r => r.passed);
    
    return {
      success: allPassed,
      results
    };
  } catch (error) {
    logger.error('Code execution error:', error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Code execution failed'
    };
  }
};
