import { VM } from 'vm2';
import logger from '../config/logger';

export const executeCode = (code: string, testCases: any[]): { success: boolean; results: any[]; error?: string } => {
  try {
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
