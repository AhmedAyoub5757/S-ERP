/**
 * Centralized Error Message Mapping Utility
 *
 * UX Requirement: Users should see understandable messages, never raw technical errors.
 * Technical errors must be safely logged on the server and never exposed to the client.
 */

export interface ErrorMappingResult {
  message: string
  code?: string
  field?: string
}

/**
 * Standard user-facing error messages mapped to domain scenarios.
 */
export const ERROR_MESSAGES = {
  SUPABASE_DB_ERROR: 'Something went wrong while loading this information. Please try again.',
  NETWORK_FAILURE: 'Unable to connect. Check your internet connection.',
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  PERMISSION_DENIED: "You don't have permission to perform this action.",
  DUPLICATE_RECORD: 'This record already exists.',
  MISSING_REQUIRED_DATA: 'Please complete all required fields.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  SERVER_FAILURE: "We couldn't complete your request. Please try again later.",
  NOT_FOUND: 'The requested record could not be found.',
  VALIDATION_ERROR: 'Please check the entered information and try again.',
} as const

/**
 * Maps any error (string, Error object, Supabase PostgrestError, or AuthError)
 * to a friendly, safe user-facing message.
 */
export function mapErrorMessage(error: unknown, fallback?: string): string {
  if (!error) {
    return fallback ?? ERROR_MESSAGES.SERVER_FAILURE
  }

  const rawMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof (error as any)?.message === 'string'
          ? (error as any).message
          : ''

  const errorCode =
    typeof (error as any)?.code === 'string'
      ? (error as any).code
      : typeof (error as any)?.status === 'string' || typeof (error as any)?.status === 'number'
        ? String((error as any).status)
        : ''

  const normalized = rawMessage.toLowerCase()

  // 1. Invalid credentials
  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid_grant') ||
    normalized.includes('invalid password') ||
    normalized.includes('wrong password') ||
    normalized.includes('user not found') ||
    normalized.includes('bad credentials')
  ) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS
  }

  // 2. Session expired
  if (
    normalized.includes('jwt expired') ||
    normalized.includes('token expired') ||
    normalized.includes('session expired') ||
    normalized.includes('session_not_found') ||
    normalized.includes('refresh_token_not_found')
  ) {
    return ERROR_MESSAGES.SESSION_EXPIRED
  }

  // 3. Permission denied
  if (
    normalized.includes('permission denied') ||
    normalized.includes('row-level security') ||
    normalized.includes('not authorized') ||
    normalized.includes('unauthorized') ||
    normalized.includes('forbidden') ||
    errorCode === '42501' ||
    errorCode === '403' ||
    errorCode === '401'
  ) {
    return ERROR_MESSAGES.PERMISSION_DENIED
  }

  // 4. Duplicate record
  if (
    normalized.includes('duplicate key') ||
    normalized.includes('unique constraint') ||
    normalized.includes('already exists') ||
    errorCode === '23505'
  ) {
    return ERROR_MESSAGES.DUPLICATE_RECORD
  }

  // 5. Missing required data
  if (
    normalized.includes('violates not-null') ||
    normalized.includes('missing required') ||
    normalized.includes('cannot be null') ||
    errorCode === '23502'
  ) {
    return ERROR_MESSAGES.MISSING_REQUIRED_DATA
  }

  // 6. Network failure
  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network') ||
    normalized.includes('econnrefused') ||
    normalized.includes('enotfound') ||
    normalized.includes('timed out') ||
    normalized.includes('offline')
  ) {
    return ERROR_MESSAGES.NETWORK_FAILURE
  }

  // 7. Supabase Database error
  if (
    errorCode.startsWith('PGRST') ||
    errorCode.startsWith('22') ||
    errorCode.startsWith('23') ||
    errorCode.startsWith('42') ||
    normalized.includes('supabase') ||
    normalized.includes('postgrest') ||
    normalized.includes('relation') ||
    normalized.includes('column') ||
    normalized.includes('syntax error')
  ) {
    return ERROR_MESSAGES.SUPABASE_DB_ERROR
  }

  // 8. Not found
  if (normalized.includes('not found') || errorCode === 'PGRST116' || errorCode === '404') {
    return ERROR_MESSAGES.NOT_FOUND
  }

  // Return fallback or safe generic message
  return fallback ?? ERROR_MESSAGES.SERVER_FAILURE
}

/**
 * Safely logs technical errors on the server for debugging without exposing
 * internal details to client responses.
 */
export function logTechnicalError(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[TECHNICAL ERROR] Context: ${context}`, error)
  } else {
    // In production, log without leaking sensitive credentials
    const summary =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : String(error)
    console.error(`[SERVER_ERROR] [${new Date().toISOString()}] Context: ${context} | Details:`, summary)
  }
}
