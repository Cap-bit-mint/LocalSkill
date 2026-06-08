/**
 * Supabase Client Exports
 * 
 * 使用场景：
 * - 浏览器端：import { createClient } from '@/lib/supabase/client'
 * - Server Components / Route Handlers：import { createClient } from '@/lib/supabase/server'
 * - 后端 API / Edge Functions：import { createAdminClient } from '@/lib/supabase/admin'
 */

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { createAdminClient } from './admin'
