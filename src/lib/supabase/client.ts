import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Client - 用于客户端组件（Client Components）
 * 每次请求创建新实例，不使用缓存
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
