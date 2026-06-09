import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Auth Callback Route
 * 处理 Supabase Auth 的 OAuth/邮箱验证回调
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 验证成功，重定向到目标页面
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // 验证失败，返回登录页并显示错误
  return NextResponse.redirect(
    new URL(`/auth/login?error=callback_failed`, requestUrl.origin)
  )
}
