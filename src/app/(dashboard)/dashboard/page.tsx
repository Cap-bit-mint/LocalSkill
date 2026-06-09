import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 获取统计数据
  const { count: totalMerchants } = await supabase
    .from('merchants')
    .select('*', { count: 'exact', head: true })
    .eq('auth_user_id', user?.id)

  const { count: completedMerchants } = await supabase
    .from('merchants')
    .select('*', { count: 'exact', head: true })
    .eq('auth_user_id', user?.id)
    .eq('status', 'completed')

  const { count: publishedMerchants } = await supabase
    .from('merchants')
    .select('*', { count: 'exact', head: true })
    .eq('auth_user_id', user?.id)
    .eq('status', 'archived')

  const { count: totalSkills } = await supabase
    .from('skills')
    .select('*', { count: 'exact', head: true })

  const stats = {
    totalMerchants: totalMerchants || 0,
    publishedMerchants: publishedMerchants || 0,
    pendingMerchants: Math.max(0, (totalMerchants || 0) - (completedMerchants || 0) - (publishedMerchants || 0)),
    totalSkills: totalSkills || 0,
  }

  return <DashboardClient stats={stats} />
}
