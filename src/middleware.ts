import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 保护 /dashboard 路由
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // 临时：允许所有访问，后续添加完整认证
    // TODO: 添加 Supabase Auth 验证
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
