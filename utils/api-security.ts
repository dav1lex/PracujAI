/**
 * API Security wrapper for Next.js API routes
 * @file utils/api-security.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AdvancedValidator, ValidationSchema, CSRFProtection, APIKeyValidator, getSecurityHeaders } from './security';
import { POLISH_CONTENT } from './polish-content';

export interface APISecurityOptions {
  requireAuth?: boolean;
  requireCSRF?: boolean;
  allowDesktopAPI?: boolean;
  validation?: ValidationSchema;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
}

export interface SecureAPIContext {
  user?: any;
  session?: any;
  validatedData?: Record<string, any>;
  isDesktopRequest?: boolean;
}

export type SecureAPIHandler = (
  request: NextRequest,
  context: SecureAPIContext
) => Promise<NextResponse>;

// Rate limiting store (in production, use Redis)
const apiRateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of apiRateLimitStore.entries()) {
    if (now > record.resetTime) {
      apiRateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkAPIRateLimit(key: string, limit: { requests: number; windowMs: number }): boolean {
  const now = Date.now();
  const record = apiRateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    apiRateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs
    });
    return true;
  }
  
  if (record.count >= limit.requests) {
    return false;
  }
  
  record.count++;
  apiRateLimitStore.set(key, record);
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.headers.get('x-forwarded-for') || 'unknown';
}

export function createSecureAPIRoute(
  handler: SecureAPIHandler,
  options: APISecurityOptions = {}
) {
  return async function secureHandler(request: NextRequest) {
    try {
      // Apply security headers
      const headers = getSecurityHeaders();
      
      // Rate limiting
      if (options.rateLimit) {
        const clientIP = getClientIP(request);
        const rateLimitKey = `${clientIP}:${request.nextUrl.pathname}`;
        
        if (!checkAPIRateLimit(rateLimitKey, options.rateLimit)) {
          return NextResponse.json(
            {
              error: 'Zbyt wiele żądań. Spróbuj ponownie później.',
              code: 'RATE_LIMIT_EXCEEDED'
            },
            {
              status: 429,
              headers: {
                ...headers,
                'Retry-After': Math.ceil(options.rateLimit.windowMs / 1000).toString()
              }
            }
          );
        }
      }
      
      const context: SecureAPIContext = {};
      
      // Authentication check
      if (options.requireAuth || options.allowDesktopAPI) {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Check for desktop API key first
        const apiKey = request.headers.get('x-api-key');
        if (apiKey && options.allowDesktopAPI) {
          const apiValidation = APIKeyValidator.validateAPIKey(apiKey);
          if (apiValidation.isValid && apiValidation.userId) {
            // Get user data for desktop API request
            const { data: user, error } = await supabase.auth.admin.getUserById(apiValidation.userId);
            if (!error && user) {
              context.user = user.user;
              context.isDesktopRequest = true;
            } else if (options.requireAuth) {
              return NextResponse.json(
                {
                  error: 'Nieprawidłowy klucz API',
                  code: 'INVALID_API_KEY'
                },
                { status: 401, headers }
              );
            }
          } else if (options.requireAuth) {
            return NextResponse.json(
              {
                error: 'Nieprawidłowy klucz API',
                code: 'INVALID_API_KEY'
              },
              { status: 401, headers }
            );
          }
        } else {
          // Regular session-based authentication
          const { data: { session }, error: authError } = await supabase.auth.getSession();
          
          if (options.requireAuth && (authError || !session)) {
            return NextResponse.json(
              {
                error: 'Wymagane uwierzytelnienie',
                code: 'AUTHENTICATION_REQUIRED'
              },
              { status: 401, headers }
            );
          }
          
          if (session) {
            context.session = session;
            context.user = session.user;
          }
        }
      }
      
      // CSRF protection for state-changing operations
      if (options.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token');
        const sessionId = context.session?.access_token || context.user?.id;
        
        if (!csrfToken || !sessionId || !CSRFProtection.validateToken(csrfToken, sessionId)) {
          return NextResponse.json(
            {
              error: 'Nieprawidłowy token CSRF',
              code: 'INVALID_CSRF_TOKEN'
            },
            { status: 403, headers }
          );
        }
      }
      
      // Input validation and sanitization
      if (options.validation && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json();
          const validation = AdvancedValidator.validate(body, options.validation);
          
          if (!validation.isValid) {
            return NextResponse.json(
              {
                error: 'Błędy walidacji',
                code: 'VALIDATION_ERROR',
                details: validation.errors
              },
              { status: 400, headers }
            );
          }
          
          context.validatedData = validation.sanitizedData;
        } catch (error) {
          return NextResponse.json(
            {
              error: 'Nieprawidłowy format JSON',
              code: 'INVALID_JSON'
            },
            { status: 400, headers }
          );
        }
      }
      
      // Call the actual handler
      const response = await handler(request, context);
      
      // Apply security headers to response
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
      
      return response;
      
    } catch (error) {
      console.error('API Security Error:', error);
      
      return NextResponse.json(
        {
          error: 'Błąd serwera',
          code: 'INTERNAL_SERVER_ERROR'
        },
        {
          status: 500,
          headers: getSecurityHeaders()
        }
      );
    }
  };
}

// Utility function to create CSRF token endpoint
export function createCSRFTokenEndpoint() {
  return createSecureAPIRoute(
    async (request, context) => {
      if (!context.session && !context.user) {
        return NextResponse.json(
          {
            error: 'Wymagane uwierzytelnienie',
            code: 'AUTHENTICATION_REQUIRED'
          },
          { status: 401 }
        );
      }
      
      const sessionId = context.session?.access_token || context.user?.id;
      const csrfToken = CSRFProtection.generateToken(sessionId);
      
      return NextResponse.json({
        success: true,
        data: {
          csrfToken,
          expiresIn: 3600 // 1 hour
        }
      });
    },
    {
      requireAuth: true,
      rateLimit: { requests: 10, windowMs: 60 * 1000 } // 10 requests per minute
    }
  );
}

// Utility function to create API key endpoint for desktop app
export function createAPIKeyEndpoint() {
  return createSecureAPIRoute(
    async (request, context) => {
      if (!context.user) {
        return NextResponse.json(
          {
            error: 'Wymagane uwierzytelnienie',
            code: 'AUTHENTICATION_REQUIRED'
          },
          { status: 401 }
        );
      }
      
      const apiKey = APIKeyValidator.generateAPIKey(context.user.id);
      
      return NextResponse.json({
        success: true,
        data: {
          apiKey,
          userId: context.user.id,
          expiresIn: null // API keys don't expire
        }
      });
    },
    {
      requireAuth: true,
      requireCSRF: true,
      rateLimit: { requests: 5, windowMs: 60 * 60 * 1000 } // 5 requests per hour
    }
  );
}

// Error response helper
export function createErrorResponse(
  message: string,
  code: string,
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(details && { details })
    },
    {
      status,
      headers: getSecurityHeaders()
    }
  );
}

// Success response helper
export function createSuccessResponse(
  data: any,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      data
    },
    {
      status,
      headers: getSecurityHeaders()
    }
  );
}