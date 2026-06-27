import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if it exists
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect app routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');
  const isAppPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                    request.nextUrl.pathname.startsWith('/leads') ||
                    request.nextUrl.pathname.startsWith('/properties') ||
                    request.nextUrl.pathname.startsWith('/followups') ||
                    request.nextUrl.pathname.startsWith('/more');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isWebhook = request.nextUrl.pathname.startsWith('/api/webhooks/') ||
                    request.nextUrl.pathname.startsWith('/api/twilio/');
  const isPublicShare = request.nextUrl.pathname.startsWith('/share/');

  // Allow webhooks, Twilio callbacks, and public share pages without auth
  if (isWebhook || isPublicShare) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user && isAppPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Redirect root to dashboard if authenticated
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Redirect root to login if not authenticated
  if (!user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
