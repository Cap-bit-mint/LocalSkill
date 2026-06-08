import { createClient } from '@supabase/supabase-js'

/**
 * Admin Client - 用于后端 API（Edge Functions, API Routes）
 * 使用 service_role key，绕过 RLS 策略
 * ⚠️ 仅限服务端使用，切勿暴露到客户端
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
