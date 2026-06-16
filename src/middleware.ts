import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/about', '/timeline', '/register', '/login', '/verify', '/auth/callback']
const ADMIN_SENIOR_ROUTES = ['/admin/payments', '/admin/users', '/admin/export']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/auth/'))
}

// Helper: query DB using Service Role key to bypass RLS
async function getRoleFromDB(request: NextRequest, userId: string) {
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    }
  )

  // Combined single query using PostgREST relation join to fetch both role and user info in a single fetch
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('payment_status, role_id, user_roles(permissions_level, name)')
    .eq('id', userId)
    .limit(1)
    .maybeSingle() as any

  if (userError || !userData) {
    console.log(`[DB] User join query failed: ${userError?.message}`)
    return { roleLevel: 1, paymentStatus: 'pending' }
  }

  const roleData = userData.user_roles
  console.log(`[DB] role_id=${userData.role_id} name=${roleData?.name} permissions_level=${roleData?.permissions_level} roleError=none`)

  return {
    roleLevel: roleData?.permissions_level ?? 1,
    paymentStatus: userData.payment_status ?? 'pending',
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // Skip middleware for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js)$/)
  ) {
    return response
  }

  // --- COMING SOON OVERRIDE ---
  // Only the root landing page is accessible; everything else shows coming-soon
  // if (pathname !== '/' && pathname !== '/coming-soon' && !pathname.startsWith('/api')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/coming-soon'
  //   return NextResponse.rewrite(url)
  // }
  // if (pathname === '/coming-soon') {
  //   return response
  // }
  // --- END COMING SOON OVERRIDE ---

  // Regular anon client for cookie management & auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verify session — getUser() is the secure way (validates with Supabase servers)
  const { data: { user } } = await supabase.auth.getUser()

  // No session → allow public, redirect others to login
  if (!user) {
    if (isPublicRoute(pathname)) return response
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check cached role/payment in cookies to bypass DB requests on active browsing
  const cachedRole = request.cookies.get('user-role-level')?.value
  const cachedPayment = request.cookies.get('user-payment-status')?.value

  let roleLevel = 1
  let paymentStatus = 'pending'

  if (cachedRole !== undefined && cachedPayment !== undefined) {
    roleLevel = parseInt(cachedRole, 10)
    paymentStatus = cachedPayment
  } else {
    const dbResult = await getRoleFromDB(request, user.id)
    roleLevel = dbResult.roleLevel
    paymentStatus = dbResult.paymentStatus

    // Cache the values in cookies for 90 seconds to speed up navigations
    response.cookies.set('user-role-level', roleLevel.toString(), { maxAge: 90, path: '/' })
    response.cookies.set('user-payment-status', paymentStatus, { maxAge: 90, path: '/' })
  }

  // DIAGNOSTIC LOG — check your terminal to see these values
  console.log(`[MIDDLEWARE] user=${user.email} path=${pathname} roleLevel=${roleLevel} paymentStatus=${paymentStatus} cached=${cachedRole !== undefined}`)

  const redirect = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy cache cookies to redirect response if they were freshly queried
    if (cachedRole === undefined || cachedPayment === undefined) {
      redirectResponse.cookies.set('user-role-level', roleLevel.toString(), { maxAge: 90, path: '/' })
      redirectResponse.cookies.set('user-payment-status', paymentStatus, { maxAge: 90, path: '/' })
    }
    
    return redirectResponse
  }

  // Login/Register Lockout for authenticated users
  if (pathname === '/login' || pathname === '/register') {
    if (request.nextUrl.searchParams.has('error')) {
      return response
    }
    return roleLevel >= 4 ? redirect('/admin') : redirect('/dashboard')
  }

  // ─── Level 4+: Admin / Super Admin — full access ─────────────────────────
  if (roleLevel >= 4) {
    // Total freedom. No forced redirects.
    return response
  }

  // ─── Level 3: OC Team — admin access except senior routes ────────────────
  if (roleLevel === 3) {
    const blocked = ADMIN_SENIOR_ROUTES.some(r => pathname.startsWith(r))
    if (blocked) return redirect('/admin')
    return response
  }

  // ─── Level 2: Volunteer — scanner only ───────────────────────────────────
  if (roleLevel === 2) {
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/scanner')) {
      return redirect('/admin/scanner')
    }
    return response
  }

  // ─── Level 1: Student ─────────────────────────────────────
  // All allowed users are pre-approved now, no payment lock needed.
  
  if (pathname.startsWith('/admin')) return redirect('/dashboard')
  
  // Allow other public routes (like /about, /timeline) for authenticated users
  if (isPublicRoute(pathname)) return response
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
