import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Disable all middleware for now
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
} 