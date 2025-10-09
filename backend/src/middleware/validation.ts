import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../config/logger';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`🔍 Validating ${req.method} ${req.path}`);
      
      // Log schema details for debugging
      logger.info(`📋 Schema validation:`, {
        schema: schema._def,
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      logger.info('✅ Validation passed');
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`❌ Validation failed for ${req.method} ${req.path}:`, {
          schema: schema._def,
          errors: error.errors,
          body: req.body,
          query: req.query,
          params: req.params
        });
        
        // Format validation errors for better user experience
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          data: formattedErrors
        });
      }
      return next(error);
    }
  };
};

// Validation schemas
export const signupSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username must be no more than 30 characters long')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string()
      .email('Please provide a valid email address')
      .max(100, 'Email must be no more than 100 characters long'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password must be no more than 100 characters long')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Please provide a valid email address')
      .max(100, 'Email must be no more than 100 characters long'),
    password: z.string()
      .min(1, 'Password is required')
      .max(100, 'Password must be no more than 100 characters long')
  })
});

export const challengeSubmissionSchema = z.object({
  body: z.object({
    answer: z.union([
      z.string().min(1, 'Answer cannot be empty'),
      z.number().finite('Answer must be a valid number')
    ], {
      errorMap: () => ({ message: 'Answer must be a string or number' })
    })
  })
});

export const codeRunSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code cannot be empty'),
    language: z.string().optional()
  })
});

export const genericCodeRunSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code cannot be empty'),
    language: z.string().optional(),
    testCases: z.array(z.object({
      input: z.any(),
      expected: z.any(),
    })).optional()
  })
});

export const userUpdateSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username must be no more than 30 characters long')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .optional(),
    email: z.string()
      .email('Please provide a valid email address')
      .max(100, 'Email must be no more than 100 characters long')
      .optional()
  })
});
