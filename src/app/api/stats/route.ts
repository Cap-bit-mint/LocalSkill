import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 获取总商家数
    const { count: totalMerchants } = await supabase
      .from('merchants')
      .select('*', { count: 'exact', head: true })

    // 获取已发布商家数
    const { count: publishedMerchants } = await supabase
      .from('merchants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'archived')

    // 获取总 Skills 数
    const { count: totalSkills } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })

    // 获取今日新增商家数
    const today = new Date().toISOString().split('T')[0]
    const { count: todayMerchants } = await supabase
      .from('merchants')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)

    // 获取解析成功率
    const { data: tasks } = await supabase
      .from('parse_tasks')
      .select('status')
      .gte('created_at', today)

    const successCount = tasks?.filter(t => t.status === 'completed').length || 0
    const totalCount = tasks?.length || 0
    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0

    return NextResponse.json({
      total_merchants: totalMerchants || 0,
      published_merchants: publishedMerchants || 0,
      total_skills: totalSkills || 0,
      today_merchants: todayMerchants || 0,
      parse_success_rate: successRate,
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
