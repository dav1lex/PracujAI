import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
  auth: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes for auth
  api: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes for general API
  payment: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 requests per hour for payments
  desktop: { requests: 1000, windowMs: 15 * 60 * 1000 }, // 1000 requests per 15 minutes for desktop app
};

// Get client IP address
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

// Rate limiting function
function checkRateLimit(key: string, limit: { requests: number; windowMs: number }): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs
    });
    return true;
  }
  
  if (record.count >= limit.requests) {
    return false; // Rate limit exceeded
  }
  
  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  return true;
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  
  // Apply security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HTTPS redirect in production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${pathname}`, 301);
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    let rateLimitKey = `${clientIP}:general`;
    let limit = RATE_LIMITS.api;
    
    // Apply specific rate limits based on endpoint
    if (pathname.startsWith('/api/auth/')) {
      rateLimitKey = `${clientIP}:auth`;
      limit = RATE_LIMITS.auth;
    } else if (pathname.startsWith('/api/payments/')) {
      rateLimitKey = `${clientIP}:payment`;
      limit = RATE_LIMITS.payment;
    } else if (pathname.startsWith('/api/desktop/')) {
      // For desktop app, use user-based rate limiting if possible
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        rateLimitKey = `${authHeader}:desktop`;
      } else {
        rateLimitKey = `${clientIP}:desktop`;
      }
      limit = RATE_LIMITS.desktop;
    }
    
    // Check rate limit
    if (!checkRateLimit(rateLimitKey, limit)) {
      return NextResponse.json(
        { 
          error: 'Zbyt wiele żądań. Spróbuj ponownie później.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(limit.windowMs / 1000).toString(),
            'X-RateLimit-Limit': limit.requests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + limit.windowMs) / 1000).toString()
          }
        }
      );
    }
    
    // Add rate limit headers to successful responses
    const record = rateLimitStore.get(rateLimitKey);
    if (record) {
      response.headers.set('X-RateLimit-Limit', limit.requests.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, limit.requests - record.count).toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());
    }
  }
  
  // CSRF protection for state-changing operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Allow same-origin requests
    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        // Check for CSRF token in custom header for API requests
        if (pathname.startsWith('/api/') && !request.headers.get('x-csrf-token')) {
          return NextResponse.json(
            { 
              error: 'Brak tokenu CSRF',
              code: 'CSRF_TOKEN_MISSING'
            },
            { status: 403 }
          );
        }
      }
    }
    
    // Validate content type for API requests
    if (pathname.startsWith('/api/') && contentType && !contentType.includes('application/json')) {
      // Allow form data for file uploads and webhooks
      const allowedContentTypes = [
        'multipart/form-data',
        'application/x-www-form-urlencoded',
        'text/plain' // For Stripe webhooks
      ];
      
      if (!allowedContentTypes.some(type => contentType.includes(type))) {
        return NextResponse.json(
          { 
            error: 'Nieprawidłowy typ zawartości',
            code: 'INVALID_CONTENT_TYPE'
          },
          { status: 400 }
        );
      }
    }
  }
  
  // Authentication check for protected routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/profile') || 
      pathname.startsWith('/api/user') ||
      pathname.startsWith('/api/credits') ||
      pathname.startsWith('/api/payments') ||
      pathname.startsWith('/api/downloads')) {
    
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            error: 'Wymagane uwierzytelnienie',
            code: 'AUTHENTICATION_REQUIRED'
          },
          { status: 401 }
        );
      } else {
        // Redirect to login for web pages
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};