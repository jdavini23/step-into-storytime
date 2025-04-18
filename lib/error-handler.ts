import { AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export class AuthenticationError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export const handleAuthError = (
  error: unknown,
  defaultMessage: string
): AuthenticationError => {
  console.error(`[Auth] Error - ${defaultMessage}:`, error);

  let message: string;
  let code: string | undefined;

  if (error instanceof AuthError) {
    message = error.message;
    code = error.status?.toString();
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = defaultMessage;
  }

  // Map common error messages to user-friendly versions
  const userFriendlyMessage = mapErrorToUserMessage(message);

  // Show toast notification
  toast.error('Authentication Error', {
    description: userFriendlyMessage,
  });

  return new AuthenticationError(userFriendlyMessage, code);
};

const mapErrorToUserMessage = (errorMessage: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed':
      'Please verify your email address before logging in.',
    'Password should be at least 6 characters':
      'Password must be at least 6 characters long.',
    'User already registered':
      'This email is already registered. Please try logging in instead.',
    'Rate limit exceeded':
      'Too many attempts. Please try again in a few minutes.',
    // Add more mappings as needed
  };

  // Check if we have a specific mapping for this error
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // Return a generic message if no specific mapping exists
  return 'An unexpected error occurred. Please try again later.';
};
