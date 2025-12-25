import { z } from 'zod';

/**
 * Strong password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Username validation schema
 */
export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .max(50, 'Username must be less than 50 characters')
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    'Username can only contain letters, numbers, dots, dashes and underscores'
  );

/**
 * Alert condition expression validation
 * Validates that the condition follows expected patterns
 */
export const alertConditionSchema = z
  .string()
  .min(1, 'Condition is required')
  .max(500, 'Condition must be less than 500 characters')
  .refine(
    (value) => {
      // Basic validation for alert condition expressions
      // Should contain a comparison operator
      const hasOperator = /[><=!]+/.test(value);
      // Should not contain potentially dangerous characters
      const hasDangerousChars = /[;`${}]/.test(value);
      // Should not start with operators
      const startsWithOperator = /^[><=!]/.test(value);

      return hasOperator && !hasDangerousChars && !startsWithOperator;
    },
    {
      message:
        'Invalid condition format. Use expressions like "error_count > 10" or "level == error"',
    }
  );

/**
 * Duration format validation (e.g., "5m", "1h", "30s")
 */
export const durationSchema = z
  .string()
  .min(1, 'Duration is required')
  .regex(
    /^\d+[smhd]$/,
    'Duration must be a number followed by s (seconds), m (minutes), h (hours), or d (days)'
  );

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Rate limiter utility for preventing rapid repeated actions
 */
export class RateLimiter {
  private attempts: number[] = [];
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number, windowMs: number) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if an action is allowed
   * @returns true if allowed, false if rate limited
   */
  isAllowed(): boolean {
    const now = Date.now();
    // Remove old attempts outside the window
    this.attempts = this.attempts.filter((timestamp) => now - timestamp < this.windowMs);

    if (this.attempts.length >= this.maxAttempts) {
      return false;
    }

    this.attempts.push(now);
    return true;
  }

  /**
   * Get time until next allowed attempt (in ms)
   */
  getRetryAfter(): number {
    if (this.attempts.length === 0) return 0;

    const now = Date.now();
    const oldestAttempt = Math.min(...this.attempts);
    const timeUntilExpiry = this.windowMs - (now - oldestAttempt);

    return Math.max(0, timeUntilExpiry);
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.attempts = [];
  }
}

// Singleton login rate limiter: max 5 attempts per 60 seconds
export const loginRateLimiter = new RateLimiter(5, 60000);
