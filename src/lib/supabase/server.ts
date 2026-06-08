import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server Client - 用于 Server Components 和 Route Handlers
 * 使用 cookies() API 访问，适配 Next.js App Router
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中调用 setAll 时的错误可忽略
            // Route Handler 中需要手动处理
          }
        },
      },
    }
  )
}
